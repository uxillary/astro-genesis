import clsx from 'clsx';
import {
  type CSSProperties,
  type HTMLAttributes,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from 'react';

import '@/styles/fui.css';
import '@/styles/hud-accents.css';

const ACCENT_MAP = {
  cyan: {
    tone: 'var(--hud-cyan)',
    glow: 'rgba(85, 230, 165, 0.55)'
  },
  amber: {
    tone: 'var(--hud-amber)',
    glow: 'rgba(255, 176, 32, 0.55)'
  },
  red: {
    tone: 'var(--hud-red)',
    glow: 'rgba(255, 77, 79, 0.55)'
  },
  mono: {
    tone: 'var(--hud-dim)',
    glow: 'rgba(145, 163, 158, 0.48)'
  }
} as const;

const DEFAULT_SPACING = 12;
const DEFAULT_MAJOR_EVERY = 5;

type LegacyDividerProps = {
  side?: 'left' | 'right' | 'center';
  compact?: boolean;
};

export type RulerHeadingProps = {
  label: string;
  align?: 'start' | 'center' | 'end';
  accent?: 'cyan' | 'amber' | 'red' | 'mono';
  variant?: 'knockout' | 'pill' | 'underbar';
  ticks?: {
    spacing?: number;
    majorEvery?: number;
  };
  lanePadding?: number;
  elevate?: boolean;
  ariaLabel?: string;
} & LegacyDividerProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'aria-label'>;

type LayoutSnapshot = {
  containerWidth: number;
  labelWidth: number;
  labelLeft: number;
};

const initialLayout: LayoutSnapshot = {
  containerWidth: 0,
  labelWidth: 0,
  labelLeft: 0
};

const resolveAlign = (align?: RulerHeadingProps['align'], side?: LegacyDividerProps['side']) => {
  if (align) {
    return align;
  }

  switch (side) {
    case 'left':
      return 'start';
    case 'right':
      return 'end';
    default:
      return 'center';
  }
};

const HudDivider = ({
  label,
  align,
  accent = 'cyan',
  variant = 'knockout',
  ticks,
  lanePadding = 14,
  elevate = false,
  ariaLabel,
  className,
  side,
  compact,
  role,
  tabIndex,
  ...rest
}: RulerHeadingProps) => {
  const resolvedAlign = resolveAlign(align, side);
  const accentInfo = ACCENT_MAP[accent] ?? ACCENT_MAP.cyan;
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const maskId = useId();

  const [{ containerWidth, labelWidth, labelLeft }, setLayout] = useState<LayoutSnapshot>(initialLayout);

  useEffect(() => {
    if (!containerRef.current || !labelRef.current || typeof ResizeObserver === 'undefined') {
      return;
    }

    const containerNode = containerRef.current;
    const labelNode = labelRef.current;

    const updateLayout = () => {
      if (!containerNode || !labelNode) {
        return;
      }

      const containerRect = containerNode.getBoundingClientRect();
      const labelRect = labelNode.getBoundingClientRect();

      setLayout((prev) => {
        const next = {
          containerWidth: containerRect.width,
          labelWidth: labelRect.width,
          labelLeft: labelRect.left - containerRect.left
        } satisfies LayoutSnapshot;

        if (
          prev.containerWidth === next.containerWidth &&
          prev.labelWidth === next.labelWidth &&
          prev.labelLeft === next.labelLeft
        ) {
          return prev;
        }

        return next;
      });
    };

    updateLayout();

    const resizeObserver = new ResizeObserver(updateLayout);
    resizeObserver.observe(containerNode);
    resizeObserver.observe(labelNode);

    const mutationObserver = new MutationObserver(updateLayout);
    mutationObserver.observe(labelNode, { subtree: true, childList: true, characterData: true });

    window.addEventListener('resize', updateLayout);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('resize', updateLayout);
    };
  }, [label, lanePadding, resolvedAlign, variant]);

  const tickSpacing = Math.max(4, ticks?.spacing ?? DEFAULT_SPACING);
  const majorEvery = Math.max(1, ticks?.majorEvery ?? DEFAULT_MAJOR_EVERY);

  const laneWidth = Math.max(0, labelWidth + lanePadding * 2);
  const laneStart = Math.max(0, Math.min(labelLeft - lanePadding, Math.max(containerWidth - laneWidth, 0)));
  const maskedLaneWidth = Math.max(0, Math.min(laneWidth, Math.max(containerWidth - laneStart, 0)));

  const viewWidth = Math.max(containerWidth || 0, 1);
  const viewHeight = 28;

  const ticksMarkup = useMemo(() => {
    if (!containerWidth) {
      return null;
    }

    const segments = Math.ceil(containerWidth / tickSpacing) + 2;
    const lines = [] as JSX.Element[];

    for (let index = 0; index < segments; index++) {
      const x = index * tickSpacing;
      const length = index % majorEvery === 0 ? 12 : 6;
      const y1 = (viewHeight / 2) - length;
      const y2 = (viewHeight / 2) + length;

      lines.push(
        <line
          key={`tick-${index}`}
          x1={x}
          y1={y1}
          x2={x}
          y2={y2}
          className={clsx('fui-ruler__tick', {
            'fui-ruler__tick--major': index % majorEvery === 0
          })}
        />
      );
    }

    return lines;
  }, [containerWidth, majorEvery, tickSpacing]);

  const maskRectHeight = variant === 'underbar' ? 10 : viewHeight;
  const maskRectY = variant === 'underbar' ? viewHeight - maskRectHeight : 0;

  const ariaLabelText = ariaLabel ?? label;
  const computedTabIndex = tabIndex ?? (role === 'heading' ? 0 : undefined);

  const styleVariables: CSSProperties = {
    '--fui-accent': accentInfo.tone,
    '--fui-accent-glow': accentInfo.glow
  } as CSSProperties;

  return (
    <div
      ref={containerRef}
      className={clsx(
        'fui-ruler',
        compact && 'fui-ruler--compact',
        elevate && 'fui-ruler--elevated',
        `fui-ruler--${resolvedAlign}`,
        `fui-ruler--${variant}`,
        className
      )}
      data-accent={accent}
      data-variant={variant}
      role={role}
      tabIndex={computedTabIndex}
      aria-label={ariaLabelText}
      style={styleVariables}
      {...rest}
    >
      <svg
        className="fui-ruler__svg"
        width="100%"
        height={compact ? 24 : viewHeight}
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        preserveAspectRatio="none"
      >
        {variant !== 'pill' && maskedLaneWidth > 0 ? (
          <defs>
            <mask id={maskId}>
              <rect x={0} y={0} width="100%" height="100%" fill="white" />
              <rect
                x={laneStart}
                y={maskRectY}
                width={maskedLaneWidth}
                height={maskRectHeight}
                fill="black"
              />
            </mask>
          </defs>
        ) : null}

        <g
          className="fui-ruler__ticks"
          mask={variant !== 'pill' && maskedLaneWidth > 0 ? `url(#${maskId})` : undefined}
        >
          <line x1={0} y1={viewHeight / 2} x2={viewWidth} y2={viewHeight / 2} className="fui-ruler__baseline" />
          {ticksMarkup}
        </g>

        {variant === 'underbar' && maskedLaneWidth > 0 ? (
          <rect
            x={laneStart}
            y={viewHeight - 4}
            width={maskedLaneWidth}
            height={2}
            rx={1}
            className="fui-ruler__underbar"
          />
        ) : null}
      </svg>

      {variant === 'pill' && maskedLaneWidth > 0 ? (
        <div
          className={clsx('fui-pill', elevate && 'fui-pill--elevated')}
          data-accent={accent}
          style={{ left: `${laneStart}px`, width: `${maskedLaneWidth}px` }}
          aria-hidden="true"
        />
      ) : null}

      <div
        className={clsx('fui-ruler__label-layer', `fui-ruler__label-layer--${resolvedAlign}`)}
        style={{ '--lane-padding': `${lanePadding}px` } as CSSProperties}
        aria-hidden="true"
      >
        <span
          ref={labelRef}
          className={clsx('fui-ruler__label', elevate && 'fui-ruler__label--elevated')}
          data-accent={accent}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

export default HudDivider;
