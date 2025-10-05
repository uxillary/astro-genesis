import TerminalLine from './TerminalLine';

export type CredentialPaneProps = {
  authing: boolean;
  granted: boolean;
  reducedMotion: boolean;
  onAuthenticate: () => void;
  titleId: string;
  subtitleId: string;
};

export default function CredentialPane({
  authing,
  granted,
  reducedMotion,
  onAuthenticate,
  titleId,
  subtitleId,
}: CredentialPaneProps) {
  return (
    <section
      className={`credential-pane${authing ? ' is-authing' : ''}${granted ? ' is-granted' : ''}`}
      aria-live="polite"
      aria-labelledby={titleId}
      aria-describedby={subtitleId}
    >
      <div className="credential-pane__frame" />
      {!reducedMotion && <div className="credential-pane__scan" aria-hidden="true" />}
      <header className="credential-pane__header">
        <p className="credential-pane__eyebrow">SUBMIT SECURITY CREDENTIALS // CLASSIFIED PERSONNEL ONLY</p>
        <h1 className="credential-pane__title" id={titleId}>
          {granted ? 'ACCESS GRANTED' : 'IDENTITY SCAN REQUIRED'}
        </h1>
        <p className="credential-pane__subtitle" id={subtitleId}>
          {granted ? 'IDENTITY CONFIRMED' : 'CHANNEL: SECNET-03'}
        </p>
      </header>
      <div className="credential-pane__body">
        <TerminalLine onSubmit={onAuthenticate} disabled={authing || granted} />
        <button
          type="button"
          className="credential-pane__button"
          onClick={onAuthenticate}
          disabled={authing || granted}
          aria-label="Authenticate and proceed"
        >
          AUTHENTICATE
        </button>
        <p className="credential-pane__status">
          ACCESS LEVEL: ALPHA // CHANNEL: SECNET-03 // INTEGRITY: 100%
        </p>
      </div>
    </section>
  );
}
