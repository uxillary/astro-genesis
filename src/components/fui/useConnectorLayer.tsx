import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';

type AnchorSide = 'top' | 'right' | 'bottom' | 'left';

type AnchorRecord = {
  id: string;
  element: HTMLElement;
  rect: DOMRect;
  anchors: AnchorSide[];
  observer?: ResizeObserver;
};

type AnchorSnapshot = {
  rect: DOMRect;
  anchors: AnchorSide[];
};

type ConnectorLayerApi = {
  registerAnchor: (id: string, element: HTMLElement, anchors?: AnchorSide[]) => void;
  unregisterAnchor: (id: string) => void;
  getAnchorSnapshot: (id: string) => AnchorSnapshot | null;
  getAnchorPoint: (id: string, preferred?: AnchorSide) => { x: number; y: number } | null;
  subscribe: (listener: () => void) => () => void;
  requestRender: () => void;
  layerRef: React.RefObject<SVGSVGElement>;
};

const defaultAnchors: AnchorSide[] = ['top', 'right', 'bottom', 'left'];

const ConnectorLayerContext = createContext<ConnectorLayerApi | null>(null);

const computePoint = (rect: DOMRect, side: AnchorSide) => {
  switch (side) {
    case 'top':
      return { x: rect.left + rect.width / 2, y: rect.top };
    case 'right':
      return { x: rect.right, y: rect.top + rect.height / 2 };
    case 'bottom':
      return { x: rect.left + rect.width / 2, y: rect.bottom };
    case 'left':
    default:
      return { x: rect.left, y: rect.top + rect.height / 2 };
  }
};

const useConnectorLayerInternal = (): ConnectorLayerApi => {
  const layerRef = useRef<SVGSVGElement>(null);
  const anchors = useRef(new Map<string, AnchorRecord>());
  const listeners = useRef(new Set<() => void>());

  const notify = useCallback(() => {
    listeners.current.forEach((listener) => listener());
  }, []);

  const updateViewport = useCallback(() => {
    const svg = layerRef.current;
    if (!svg) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
  }, []);

  const refreshAnchors = useCallback(() => {
    anchors.current.forEach((record) => {
      record.rect = record.element.getBoundingClientRect();
    });
    updateViewport();
    notify();
  }, [notify, updateViewport]);

  const registerAnchor = useCallback(
    (id: string, element: HTMLElement, sides?: AnchorSide[]) => {
      if (!id || !element) return;
      const existing = anchors.current.get(id);
      if (existing?.element !== element) {
        existing?.observer?.disconnect();
      }

      const record: AnchorRecord = {
        id,
        element,
        rect: element.getBoundingClientRect(),
        anchors: sides && sides.length > 0 ? [...sides] : [...defaultAnchors],
      };

      if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(() => {
          record.rect = element.getBoundingClientRect();
          notify();
        });
        observer.observe(element);
        record.observer = observer;
      }

      anchors.current.set(id, record);
      refreshAnchors();
    },
    [notify, refreshAnchors],
  );

  const unregisterAnchor = useCallback((id: string) => {
    const record = anchors.current.get(id);
    if (record?.observer) {
      record.observer.disconnect();
    }
    anchors.current.delete(id);
    notify();
  }, [notify]);

  const getAnchorSnapshot = useCallback((id: string): AnchorSnapshot | null => {
    const record = anchors.current.get(id);
    if (!record) return null;
    record.rect = record.element.getBoundingClientRect();
    return { rect: record.rect, anchors: [...record.anchors] };
  }, []);

  const getAnchorPoint = useCallback(
    (id: string, preferred?: AnchorSide) => {
      const snapshot = getAnchorSnapshot(id);
      if (!snapshot) return null;
      const side = preferred ?? snapshot.anchors[0] ?? 'left';
      return computePoint(snapshot.rect, side);
    },
    [getAnchorSnapshot],
  );

  const subscribe = useCallback((listener: () => void) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);

  const requestRender = useCallback(() => {
    refreshAnchors();
  }, [refreshAnchors]);

  useEffect(() => {
    refreshAnchors();
    const handle = () => refreshAnchors();
    window.addEventListener('resize', handle);
    window.addEventListener('scroll', handle, true);
    return () => {
      window.removeEventListener('resize', handle);
      window.removeEventListener('scroll', handle, true);
      anchors.current.forEach((record) => record.observer?.disconnect());
      anchors.current.clear();
      listeners.current.clear();
    };
  }, [refreshAnchors]);

  return useMemo(
    () => ({
      registerAnchor,
      unregisterAnchor,
      getAnchorSnapshot,
      getAnchorPoint,
      subscribe,
      requestRender,
      layerRef,
    }),
    [getAnchorPoint, getAnchorSnapshot, registerAnchor, requestRender, subscribe],
  );
};

export const FuiConnectorLayer = ({ children }: { children: ReactNode }) => {
  const api = useConnectorLayerInternal();

  return (
    <ConnectorLayerContext.Provider value={api}>
      <svg ref={api.layerRef} className="fui-connector-layer" aria-hidden="true" focusable="false">
        <g />
      </svg>
      {children}
    </ConnectorLayerContext.Provider>
  );
};

export const useConnectorLayer = () => useContext(ConnectorLayerContext);

export type { AnchorSide, AnchorSnapshot, ConnectorLayerApi };
