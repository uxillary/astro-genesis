import { RefObject, useEffect } from 'react';
import { useReducedMotion } from './useReducedMotion';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function useParallax<T extends HTMLElement>(ref: RefObject<T>, strength = 8) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (reduced) {
      node.style.removeProperty('--parallax-x');
      node.style.removeProperty('--parallax-y');
      node.style.removeProperty('--parallax-tilt-x');
      node.style.removeProperty('--parallax-tilt-y');
      return;
    }

    let frame = 0;

    const update = (x = 0, y = 0) => {
      node.style.setProperty('--parallax-x', x.toFixed(2));
      node.style.setProperty('--parallax-y', y.toFixed(2));
      node.style.setProperty('--parallax-tilt-x', (y * 0.7).toFixed(2));
      node.style.setProperty('--parallax-tilt-y', (x * -0.7).toFixed(2));
    };

    const handlePointer = (event: PointerEvent | MouseEvent) => {
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const relativeX = (event.clientX - rect.left) / rect.width;
      const relativeY = (event.clientY - rect.top) / rect.height;
      const px = clamp((relativeX - 0.5) * strength * 2, -strength, strength);
      const py = clamp((relativeY - 0.5) * strength * 2, -strength, strength);

      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => update(px, py));
    };

    const handleLeave = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => update(0, 0));
    };

    node.addEventListener('pointermove', handlePointer);
    node.addEventListener('mousemove', handlePointer);
    node.addEventListener('pointerleave', handleLeave);
    node.addEventListener('mouseleave', handleLeave);

    update(0, 0);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      node.removeEventListener('pointermove', handlePointer);
      node.removeEventListener('mousemove', handlePointer);
      node.removeEventListener('pointerleave', handleLeave);
      node.removeEventListener('mouseleave', handleLeave);
    };
  }, [ref, reduced, strength]);
}

export default useParallax;
