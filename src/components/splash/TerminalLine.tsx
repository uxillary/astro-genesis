import { ChangeEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';

export type TerminalLineProps = {
  label?: string;
  demo?: string;
  speedMs?: number;
  onSubmit?: () => void;
  disabled?: boolean;
};

const DEFAULT_LABEL = 'ID //';
const DEFAULT_DEMO = 'SPARTAN-117|';
const DEFAULT_SPEED = 90;

export default function TerminalLine({
  label = DEFAULT_LABEL,
  demo = DEFAULT_DEMO,
  speedMs = DEFAULT_SPEED,
  onSubmit,
  disabled,
}: TerminalLineProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [typed, setTyped] = useState('');
  const [isDemoActive, setDemoActive] = useState(true);
  const [demoIndex, setDemoIndex] = useState(0);

  const demoChars = useMemo(() => demo.split(''), [demo]);

  useEffect(() => {
    if (!isDemoActive || disabled) {
      return;
    }

    if (demoIndex >= demoChars.length) {
      return;
    }

    const timer = window.setTimeout(() => {
      setTyped((prev) => prev + demoChars[demoIndex]);
      setDemoIndex((prev) => prev + 1);
    }, Math.max(20, speedMs));

    return () => window.clearTimeout(timer);
  }, [demoChars, demoIndex, isDemoActive, speedMs, disabled]);

  useEffect(() => {
    if (!disabled && !isDemoActive && typeof window !== 'undefined') {
      const node = inputRef.current;
      if (node && document.activeElement === node) {
        return;
      }
      node?.focus();
    }
  }, [isDemoActive, disabled]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (!disabled) {
        onSubmit?.();
      }
      return;
    }

    if (isDemoActive) {
      setDemoActive(false);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isDemoActive) {
      setDemoActive(false);
    }
    setTyped(event.target.value.toUpperCase());
  };

  const handleFocus = () => {
    if (disabled) {
      inputRef.current?.blur();
    }
  };

  return (
    <div className="terminal-line">
      <span className="terminal-line__label" aria-hidden="true">
        {label}
      </span>
      <div className="terminal-line__field" onClick={() => inputRef.current?.focus()}>
        <input
          ref={inputRef}
          type="text"
          className="terminal-line__input"
          value={typed}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          aria-label="Identification credential"
          disabled={disabled}
        />
        <div className="terminal-line__display" aria-hidden="true">
          <span className="terminal-line__text">{typed || '\u00A0'}</span>
          <span className="terminal-line__caret">_</span>
        </div>
      </div>
    </div>
  );
}
