export type AmbientChromeProps = {
  reducedMotion: boolean;
};

export default function AmbientChrome({ reducedMotion }: AmbientChromeProps) {
  return (
    <div className={`ambient-chrome${reducedMotion ? ' is-reduced' : ''}`} aria-hidden="true">
      <div className="ambient-chrome__gradient" />
      <div className="ambient-chrome__grid" />
      <div className="ambient-chrome__scanlines" />
      <div className="ambient-chrome__vignette" />
      <div className="ambient-chrome__bloom" />
    </div>
  );
}
