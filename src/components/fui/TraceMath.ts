export type Point = { x: number; y: number };
export type Vector = { x: number; y: number };

export type PathOptions = {
  fromDirection?: Vector;
  toDirection?: Vector;
  radius?: number;
  preferAxis?: 'horizontal' | 'vertical';
  lead?: number;
};

type RouteMeta = {
  points: Point[];
  radius: number;
};

const pathRegistry = new Map<string, RouteMeta>();
const DEFAULT_RADIUS = 12;
const DEFAULT_LEAD = 18;

const isSamePoint = (a: Point, b: Point) => Math.abs(a.x - b.x) < 0.01 && Math.abs(a.y - b.y) < 0.01;

const addPoint = (points: Point[], point: Point) => {
  if (points.length === 0 || !isSamePoint(points[points.length - 1], point)) {
    points.push(point);
  }
};

const normalise = (vector: Vector): Vector => {
  const length = Math.hypot(vector.x, vector.y);
  if (length === 0) return { x: 0, y: 0 };
  return { x: vector.x / length, y: vector.y / length };
};

const scale = (vector: Vector, by: number): Vector => ({ x: vector.x * by, y: vector.y * by });

const sum = (vectors: Vector[]): Vector => vectors.reduce((acc, vec) => ({ x: acc.x + vec.x, y: acc.y + vec.y }), { x: 0, y: 0 });

const orthogonalRoute = (
  from: Point,
  to: Point,
  opts: PathOptions
): Point[] => {
  const points: Point[] = [from];
  const lead = opts.lead ?? DEFAULT_LEAD;
  const preferAxis = opts.preferAxis;

  const prependOffset = opts.fromDirection ? scale(normalise(opts.fromDirection), lead) : undefined;
  if (prependOffset && (prependOffset.x !== 0 || prependOffset.y !== 0)) {
    addPoint(points, { x: from.x + prependOffset.x, y: from.y + prependOffset.y });
  }

  const approachVector = opts.toDirection ? scale(normalise(opts.toDirection), lead) : undefined;
  const approachPoint = approachVector
    ? { x: to.x + approachVector.x, y: to.y + approachVector.y }
    : undefined;

  const target = approachPoint ?? to;

  const connectOrthogonally = (next: Point) => {
    const current = points[points.length - 1];
    if (!current) {
      addPoint(points, next);
      return;
    }

    const horizontalFirst =
      preferAxis === 'horizontal'
        ? true
        : preferAxis === 'vertical'
        ? false
        : Math.abs(next.x - current.x) >= Math.abs(next.y - current.y);

    if (horizontalFirst) {
      if (next.x !== current.x) {
        addPoint(points, { x: next.x, y: current.y });
      }
      if (next.y !== current.y) {
        addPoint(points, { x: next.x, y: next.y });
      }
    } else {
      if (next.y !== current.y) {
        addPoint(points, { x: current.x, y: next.y });
      }
      if (next.x !== current.x) {
        addPoint(points, { x: next.x, y: next.y });
      }
    }
  };

  connectOrthogonally(target);

  if (approachPoint) {
    connectOrthogonally(to);
  }

  addPoint(points, to);

  return points;
};

const toPath = (points: Point[], radius: number): string => {
  if (points.length < 2) {
    return '';
  }

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i += 1) {
    const previous = points[i - 1];
    const current = points[i];
    const next = points[i + 1];

    if (!next) {
      if (!isSamePoint(previous, current)) {
        d += ` L ${current.x} ${current.y}`;
      }
      continue;
    }

    const seg1 = { x: current.x - previous.x, y: current.y - previous.y };
    const seg2 = { x: next.x - current.x, y: next.y - current.y };

    const straight = (seg1.x === 0 && seg2.x === 0) || (seg1.y === 0 && seg2.y === 0);
    if (straight) {
      if (!isSamePoint(previous, current)) {
        d += ` L ${current.x} ${current.y}`;
      }
      continue;
    }

    const len1 = Math.hypot(seg1.x, seg1.y);
    const len2 = Math.hypot(seg2.x, seg2.y);
    const cornerRadius = Math.min(radius, len1 / 2, len2 / 2, 14);

    const start = {
      x: current.x - Math.sign(seg1.x) * cornerRadius,
      y: current.y - Math.sign(seg1.y) * cornerRadius
    };

    const end = {
      x: current.x + Math.sign(seg2.x) * cornerRadius,
      y: current.y + Math.sign(seg2.y) * cornerRadius
    };

    if (!isSamePoint(previous, start)) {
      d += ` L ${start.x} ${start.y}`;
    }
    d += ` Q ${current.x} ${current.y} ${end.x} ${end.y}`;
  }

  const last = points[points.length - 1];
  const secondLast = points[points.length - 2];
  if (last && secondLast && !isSamePoint(last, secondLast)) {
    d += ` L ${last.x} ${last.y}`;
  }

  return d;
};

const offsetPolyline = (points: Point[], offset: number): Point[] => {
  if (points.length < 2 || offset === 0) {
    return points.slice();
  }

  return points.map((point, index) => {
    if (index === 0) {
      const next = points[index + 1];
      const dir = normalise({ x: next.x - point.x, y: next.y - point.y });
      const normal = { x: -dir.y, y: dir.x };
      return { x: point.x + normal.x * offset, y: point.y + normal.y * offset };
    }

    if (index === points.length - 1) {
      const prev = points[index - 1];
      const dir = normalise({ x: point.x - prev.x, y: point.y - prev.y });
      const normal = { x: -dir.y, y: dir.x };
      return { x: point.x + normal.x * offset, y: point.y + normal.y * offset };
    }

    const prev = points[index - 1];
    const next = points[index + 1];
    const dirA = normalise({ x: point.x - prev.x, y: point.y - prev.y });
    const dirB = normalise({ x: next.x - point.x, y: next.y - point.y });
    const normalA = { x: -dirA.y, y: dirA.x };
    const normalB = { x: -dirB.y, y: dirB.x };
    const combined = sum([normalA, normalB]);
    const normal = normalise(combined);

    if (normal.x === 0 && normal.y === 0) {
      return { x: point.x + normalA.x * offset, y: point.y + normalA.y * offset };
    }

    return { x: point.x + normal.x * offset, y: point.y + normal.y * offset };
  });
};

export const makePath = (from: Point, to: Point, opts: PathOptions = {}): string => {
  const radius = opts.radius ?? DEFAULT_RADIUS;
  const route = orthogonalRoute(from, to, opts);
  const d = toPath(route, radius);
  pathRegistry.set(d, { points: route, radius });
  return d;
};

export const offsetPath = (d: string, offset: number): string => {
  const meta = pathRegistry.get(d);
  if (!meta) return d;
  const offsetPoints = offsetPolyline(meta.points, offset);
  return toPath(offsetPoints, meta.radius);
};

