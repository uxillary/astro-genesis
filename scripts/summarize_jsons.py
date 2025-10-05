#!/usr/bin/env python3
"""Summarize NASA bioscience experiment JSON files with AI-generated synopses."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Dict, Iterable, List

from openai import OpenAI, OpenAIError


def log(message: str) -> None:
    """Print a consistently formatted status message."""

    print(f"[summarize_jsons] {message}")


PROMPT_TEMPLATE = (
    "You are summarizing NASA bioscience experiment data.\n"
    "Write a concise, digestible, descriptive summary (120–170 words) that captures the full study.\n"
    "Blend details from the abstract, introduction/background, methods, results, and conclusion where available.\n"
    "Highlight the scientific question, key findings, and why they matter for space biosciences.\n"
    "Avoid repeating the title verbatim and keep the tone informative yet approachable.\n"
    "Return only the summary text, no extra commentary.\n\n"
    "Title: {title}\n"
    "Authors: {authors}\n"
    "Abstract: {abstract}\n\n"
    "Background: {background}\n\n"
    "Methods: {methods}\n\n"
    "Results: {results}\n\n"
    "Conclusion: {conclusion}"
)


TEMPERATURE = 0.4
PRIMARY_MODEL = "gpt-4o-mini"
FALLBACK_MODEL = "gpt-3.5-turbo"
MAX_BATCH = 2


AI_SUMMARY_KEY = "ai_summary"


def load_json(path: Path) -> Dict:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: Path, data: Dict) -> None:
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def load_log(log_path: Path) -> set[str]:
    if not log_path.exists():
        return set()
    with log_path.open("r", encoding="utf-8") as f:
        return {line.strip() for line in f if line.strip()}


def append_log(log_path: Path, filenames: Iterable[str]) -> None:
    if not filenames:
        return
    with log_path.open("a", encoding="utf-8") as f:
        for name in filenames:
            f.write(f"{name}\n")


def ensure_api_key() -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "OPENAI_API_KEY environment variable is not set. "
            "Set it before running the summarizer."
        )
    return api_key


def collect_section_text(sections: Dict, key: str) -> str:
    value = sections.get(key, "") if isinstance(sections, dict) else ""
    if value is None:
        return ""
    if isinstance(value, list):
        return "\n".join(str(item) for item in value if item)
    if isinstance(value, str):
        return value
    return str(value)


def word_count(text: str) -> int:
    return len(text.split()) if text else 0


def compile_payload(data: Dict) -> Dict[str, str]:
    sections_data = data.get("sections")
    sections = sections_data if isinstance(sections_data, dict) else {}

    authors_value = data.get("authors", "")
    if isinstance(authors_value, list):
        authors_text = ", ".join(str(item) for item in authors_value if item)
    elif authors_value is None:
        authors_text = ""
    else:
        authors_text = str(authors_value)

    if not authors_text:
        authors_text = collect_section_text(sections, "authors")

    return {
        "title": data.get("title", ""),
        "authors": authors_text,
        "abstract": collect_section_text(sections, "abstract"),
        "background": collect_section_text(sections, "introduction")
        or collect_section_text(sections, "background")
        or data.get("summary", ""),
        "methods": collect_section_text(sections, "methods"),
        "results": collect_section_text(sections, "results"),
        "conclusion": collect_section_text(sections, "conclusion"),
    }


def request_summary(client: OpenAI, payload: Dict[str, str]) -> str:
    prompt = PROMPT_TEMPLATE.format(**payload)
    try:
        response = client.chat.completions.create(
            model=PRIMARY_MODEL,
            temperature=TEMPERATURE,
            messages=[{"role": "user", "content": prompt}],
        )
        log(f"Primary model {PRIMARY_MODEL} succeeded.")
        return response.choices[0].message.content.strip()
    except OpenAIError as primary_error:
        log(
            "Primary model %s failed with %s. Attempting fallback %s."
            % (PRIMARY_MODEL, primary_error, FALLBACK_MODEL)
        )
        try:
            response = client.chat.completions.create(
                model=FALLBACK_MODEL,
                temperature=TEMPERATURE,
                messages=[{"role": "user", "content": prompt}],
            )
            log(f"Fallback model {FALLBACK_MODEL} succeeded.")
            return response.choices[0].message.content.strip()
        except OpenAIError as fallback_error:
            raise RuntimeError(
                f"Primary model failed with: {primary_error}. Fallback failed with: {fallback_error}"
            ) from fallback_error


def process_file(path: Path, data: Dict, client: OpenAI) -> bool:
    if AI_SUMMARY_KEY in data:
        log(f"Skipping {path.name} (already contains {AI_SUMMARY_KEY})")
        return False

    payload = compile_payload(data)

    missing_sections = [key for key, value in payload.items() if not value]
    if missing_sections:
        log(
            "Warning: %s missing sections for prompt: %s"
            % (path.name, ", ".join(sorted(missing_sections)))
        )

    try:
        summary = request_summary(client, payload)
    except Exception as exc:  # pylint: disable=broad-except
        log(f"Error summarizing {path}: {exc}")
        return False

    summary_words = word_count(summary)
    data[AI_SUMMARY_KEY] = summary

    data.setdefault("metrics", {}).setdefault(
        "section_lengths",
        {},
    )
    section_lengths = data["metrics"]["section_lengths"]
    section_lengths.update(
        {
            "abstract": word_count(payload["abstract"]),
            "results": word_count(payload["results"]),
            "conclusion": word_count(payload["conclusion"]),
        }
    )

    log(
        "Saved %s with %s (%d words)."
        % (path.name, AI_SUMMARY_KEY, summary_words)
    )

    save_json(path, data)
    return True


def resolve_data_dir(repo_root: Path) -> Path:
    """Locate the directory that holds JSON dossiers."""

    candidates = [
        repo_root / "data" / "papers",
        repo_root / "data",
    ]

    for candidate in candidates:
        if candidate.exists() and any(candidate.glob("*.json")):
            return candidate

    searched = "\n  - ".join(str(path) for path in candidates)
    raise FileNotFoundError(
        "Could not locate a directory containing JSON dossiers.\n"
        "Searched:\n  - " + searched
    )


def main() -> None:
    repo_root = Path(__file__).resolve().parent.parent
    log_path = repo_root / "summarized.log"

    log(f"Repository root: {repo_root}")

    try:
        data_dir = resolve_data_dir(repo_root)
    except FileNotFoundError as exc:
        log(str(exc))
        return

    log(f"Using data directory: {data_dir}")

    processed_log = load_log(log_path)
    files = sorted(data_dir.glob("*.json"))

    if not files:
        log("No JSON files found to summarize. Nothing to do.")
        return

    log("Checking OPENAI_API_KEY...")
    _ = ensure_api_key()
    log("OPENAI_API_KEY found. Initializing OpenAI client.")
    client = OpenAI()

    processed_files: List[str] = []
    updates = 0

    for json_path in files:
        if updates >= MAX_BATCH:
            log(
                "Reached MAX_BATCH=%d limit; remaining files will be processed in a "
                "future run." % MAX_BATCH
            )
            break
        rel_name = json_path.relative_to(repo_root).as_posix()
        if rel_name in processed_log:
            log(f"Skipping {rel_name} (already listed in summarized.log)")
            continue

        if not json_path.is_file():
            log(f"Skipping {rel_name} (not a regular file)")
            continue

        try:
            data = load_json(json_path)
        except Exception as exc:  # pylint: disable=broad-except
            log(f"Error reading {json_path}: {exc}")
            continue

        log(f"Summarizing {rel_name}")
        if process_file(json_path, data, client):
            processed_files.append(rel_name)
            updates += 1

    append_log(log_path, processed_files)
    if updates:
        log(
            "✅ Summarization complete. %d file(s) updated. Latest output in %s"
            % (updates, data_dir)
        )
    else:
        log(
            "ℹ️ No files were updated. Check the log above for skip reasons "
            "or errors."
        )


if __name__ == "__main__":
    main()
