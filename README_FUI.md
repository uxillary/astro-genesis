# FUI Accent Components

The `src/components/fui` directory now exposes opt-in HUD utilities that mirror the "elements-insp" moodboard without altering existing layouts. All utilities are namespaced with a `fui-` prefix and can be layered into existing screens as needed.

## Connector layer

```
import { FuiConnectorLayer } from '@/components/fui';

export default function Screen() {
  return (
    <FuiConnectorLayer>
      {/* page contents */}
    </FuiConnectorLayer>
  );
}
```

`FuiConnectorLayer` mounts a single fixed SVG sheet behind the page. Components that expose anchors (`FuiBadge`, manual refs, etc.) register with this layer so `FuiCallout` can draw connectors that follow scroll and resize events.

## Components

### `FuiBadge`

```
<FuiBadge id="filters-badge" label="FILTERS // 3" tone="cyan" size="sm" />
```

Small mono/cyan/amber/red pills that optionally register anchor points. Provide an `id` to make the badge addressable by `FuiCallout`. Use the `anchors` prop to constrain which sides can be targeted.

### `FuiCallout`

```
<FuiCallout from="search-execute" to="filters-badge" variant="dotted" tone="cyan" />
```

Draws orthogonal connectors between registered anchors or explicit coordinates. Dotted and solid variants are supported and respect `prefers-reduced-motion` when `animate` is `true` (default).

### `FuiFrame`

```
<FuiFrame grid="dots" notched tone="amber">
  <CardHeader>…</CardHeader>
</FuiFrame>
```

Adds a 1px dual border and optional micro-grids. `grid` accepts `"none" | "dots" | "tri" | "soft"`. `padding` controls internal spacing in pixels, while `notched` enables subtle clipped corners.

### `FuiDivider`

```
<FuiDivider label="TELEMETRY" side="right" tone="amber" />
```

Ruler-style section break with ticks and small-caps label. `side` positions the label bubble to the left, center, or right.

### `FuiReticle`

```
<FuiReticle mode="fine" tone="cyan" className="absolute inset-0" />
```

Overlay crosshair glyph with adjustable density (`"fine" | "coarse"`). Place inside relative containers to add subtle HUD texture.

### `FuiCorner`

```
<FuiCorner tone="cyan" mode="fine" inset={6} className="pointer-events-none" />
```

Minimal bracket corners sized to the parent bounds. `inset` trims the bracket inward for cards with large padding.

## Manual anchors

Any DOM node can join the connector layer by retrieving the hook from the context:

```
const connector = useConnectorLayer();
const ref = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!connector || !ref.current) return;
  connector.registerAnchor('panel-abstract', ref.current);
  return () => connector.unregisterAnchor('panel-abstract');
}, [connector]);
```

This is how dossier panels expose targets for callouts in the Paper route.
