#!/usr/bin/env python3
"""Summarize NASA bioscience experiment JSON files."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Dict, Iterable, List

from openai import OpenAI, OpenAIError


PROMPT_TEMPLATE = (
    "You are summarizing NASA bioscience experiment data.\n"
    "Write a concise, human-readable summary (100–150 words) combining the abstract, results, and conclusion.\n"
    "Focus on what was studied, the main finding, and why it matters.\n"
    "Do not repeat the title.\n"
    "Return only the summary text, no formatting or commentary.\n\n"
    "Title: {title}\n"
    "Abstract: {abstract}\n\n"
    "Results: {results}\n\n"
    "Conclusion: {conclusion}"
)


TEMPERATURE = 0.4
PRIMARY_MODEL = "gpt-4o-mini"
FALLBACK_MODEL = "gpt-3.5-turbo"
MAX_BATCH = 2


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
        raise RuntimeError("OPENAI_API_KEY environment variable is not set.")
    return api_key


def collect_section_text(sections: Dict, key: str) -> str:
    value = sections.get(key, "") if isinstance(sections, dict) else ""
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    return str(value)


def word_count(text: str) -> int:
    return len(text.split()) if text else 0


def request_summary(client: OpenAI, payload: Dict[str, str]) -> str:
    prompt = PROMPT_TEMPLATE.format(**payload)
    try:
        response = client.chat.completions.create(
            model=PRIMARY_MODEL,
            temperature=TEMPERATURE,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content.strip()
    except OpenAIError as primary_error:
        try:
            response = client.chat.completions.create(
                model=FALLBACK_MODEL,
                temperature=TEMPERATURE,
                messages=[{"role": "user", "content": prompt}],
            )
            return response.choices[0].message.content.strip()
        except OpenAIError as fallback_error:
            raise RuntimeError(
                f"Primary model failed with: {primary_error}. Fallback failed with: {fallback_error}"
            ) from fallback_error


def process_file(path: Path, data: Dict, client: OpenAI) -> bool:
    if "summary_short" in data or "metrics" in data:
        return False

    sections_data = data.get("sections")
    sections = sections_data if isinstance(sections_data, dict) else {}

    payload = {
        "title": data.get("title", ""),
        "abstract": collect_section_text(sections, "abstract"),
        "results": collect_section_text(sections, "results"),
        "conclusion": collect_section_text(sections, "conclusion"),
    }

    try:
        summary = request_summary(client, payload)
    except Exception as exc:  # pylint: disable=broad-except
        print(f"Error summarizing {path}: {exc}")
        return False

    keywords = data.get("keywords") or []
    if isinstance(keywords, list):
        keyword_count = len(keywords)
    else:
        keyword_count = 1 if keywords else 0

    metrics = {
        "year": data.get("year"),
        "keyword_count": keyword_count,
        "section_lengths": {
            "abstract": word_count(payload["abstract"]),
            "results": word_count(payload["results"]),
            "conclusion": word_count(payload["conclusion"]),
        },
    }

    data["summary_short"] = summary
    data["metrics"] = metrics

    save_json(path, data)
    return True


def main() -> None:
    repo_root = Path(__file__).resolve().parent.parent
    data_dir = repo_root / "data" / "papers"
    log_path = repo_root / "summarized.log"

    if not data_dir.exists():
        raise FileNotFoundError(f"Data directory not found: {data_dir}")

    processed_log = load_log(log_path)
    files = sorted(data_dir.glob("*.json"))

    _ = ensure_api_key()
    client = OpenAI()

    processed_files: List[str] = []
    updates = 0

    for json_path in files:
        if updates >= MAX_BATCH:
            break
        rel_name = json_path.relative_to(repo_root).as_posix()
        if rel_name in processed_log:
            continue

        if not json_path.is_file():
            continue

        try:
            data = load_json(json_path)
        except Exception as exc:  # pylint: disable=broad-except
            print(f"Error reading {json_path}: {exc}")
            continue

        if "summary_short" in data or "metrics" in data:
            continue

        print(f"Summarizing: {rel_name}")
        if process_file(json_path, data, client):
            processed_files.append(rel_name)
            updates += 1

    append_log(log_path, processed_files)
    print("✅ Summarization complete. New summaries saved to /data/papers/")


if __name__ == "__main__":
    main()
