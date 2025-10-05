import { useEffect, useRef } from 'react';

interface Props {
  authing: boolean;
  granted: boolean;
  reducedMotion?: boolean;
  onAuthenticate: () => void;
  titleId: string;
  subtitleId: string;
}

export default function CredentialPane({
  authing,
  granted,
  onAuthenticate,
  reducedMotion = false,
  titleId,
  subtitleId,
}: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    buttonRef.current?.focus({ preventScroll: true });
  }, []);

  const paneClasses = ['credential-pane'];
  if (authing) paneClasses.push('is-authing');
  if (granted) paneClasses.push('is-granted');
  if (reducedMotion) paneClasses.push('is-reduced');

  return (
    <div className={paneClasses.join(' ')}>
      <div className="credential-glass" aria-hidden="true" />
      <div className="credential-overlay" aria-hidden="true" />
      <div className="credential-frame" aria-hidden="true">
        <span className="frame-tick frame-tick-tl" />
        <span className="frame-tick frame-tick-tr" />
        <span className="frame-tick frame-tick-bl" />
        <span className="frame-tick frame-tick-br" />
      </div>
      <div className={`credential-scan${reducedMotion ? ' is-paused' : ''}`} aria-hidden="true" />
      <div className="credential-content" aria-live="polite">
        <header className="credential-header">
          <span className="credential-eyebrow">SUBMIT SECURITY CREDENTIALS</span>
          <span className="credential-caption">CLASSIFIED PERSONNEL ONLY</span>
        </header>
        <div className="credential-status">
          {!granted ? (
            <>
              <p className="credential-title" id={titleId}>
                IDENTITY SCAN REQUIRED
              </p>
              <p className="credential-sub" id={subtitleId}>
                ACCESS LEVEL: ALPHA
              </p>
            </>
          ) : (
            <>
              <p className="credential-title success" id={titleId}>
                ACCESS GRANTED
              </p>
              <p className="credential-sub success" id={subtitleId}>
                IDENTITY CONFIRMED // CHANNEL OPEN
              </p>
            </>
          )}
        </div>
        <div className="credential-meta" aria-hidden="true">
          <span>NODE: AG-223</span>
          <span>QUANT REF: 492-A</span>
        </div>
        <button
          ref={buttonRef}
          type="button"
          className="credential-button"
          onClick={onAuthenticate}
          aria-label="Authenticate and enter"
          aria-describedby={`${titleId} ${subtitleId}`}
          disabled={authing}
        >
          {authing && !granted ? 'VERIFYING…' : granted ? 'AUTHENTICATED' : 'AUTHENTICATE'}
        </button>
        <p className="credential-hint">Press ENTER</p>
      </div>
    </div>
  );
}
