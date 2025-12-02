import * as d3 from "d3";
import { isNil } from "es-toolkit";
import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";

/**
 * D3 zoom transform containing scale and translation.
 */
export interface ZoomTransform {
  x: number;
  y: number;
  k: number; // scale factor
}

/**
 * Custom hook for managing D3 zoom and pan behavior on an SVG element.
 *
 * This hook:
 * - Sets up D3 zoom behavior with scale limits
 * - Tracks current zoom transform state
 * - Provides programmatic zoom controls (zoom in, out, reset)
 *
 * @param svgRef - React ref to the SVG element
 * @param width - SVG width for centering calculations
 * @param height - SVG height for centering calculations
 * @returns Object containing current transform and zoom control functions
 */
export function useGraphZoom(
  svgRef: RefObject<SVGSVGElement | null>,
  _w: number,
  _h: number,
) {
  const [transform, setTransform] = useState<ZoomTransform>({
    x: 0,
    y: 0,
    k: 1,
  });
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<
    SVGSVGElement,
    unknown
  > | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: We only want to initialize zoom once on mount
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const svgElement = svgRef.current;

    // Create zoom behavior with scale limits
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .filter((event: Event) => {
        // Filter out wheel events without modifier keys - we'll handle them separately
        if (event instanceof WheelEvent) {
          return event.ctrlKey || event.metaKey;
        }
        // Allow all other events (mouse drag, touch gestures)
        return true;
      })
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        const { x, y, k } = event.transform;
        setTransform({ x, y, k });
      });

    // Apply zoom behavior to SVG
    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Handle trackpad panning with wheel events (without modifier keys)
    const handleWheel = (event: WheelEvent) => {
      // Only handle wheel events without modifier keys (for panning)
      if (event.ctrlKey || event.metaKey) return;

      event.preventDefault();

      // Get current transform
      const currentTransform = d3.zoomTransform(svgElement);

      // Apply translation based on wheel delta
      const newTransform = currentTransform.translate(-event.deltaX, -event.deltaY);

      // Apply the new transform
      svg
        .transition()
        .duration(0)
        .call(zoom.transform, newTransform);
    };

    svgElement.addEventListener("wheel", handleWheel, { passive: false });

    // Cleanup
    return () => {
      svg.on(".zoom", null);
      svgElement.removeEventListener("wheel", handleWheel);
      zoomBehaviorRef.current = null;
    };
  }, []);

  /**
   * Zoom in by a fixed factor (1.2x).
   */
  const zoomIn = () => {
    if (isNil(svgRef.current) || isNil(zoomBehaviorRef.current)) {
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.2);
  };

  /**
   * Zoom out by a fixed factor (0.8x).
   */
  const zoomOut = () => {
    if (isNil(svgRef.current) || isNil(zoomBehaviorRef.current)) {
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.8);
  };

  /**
   * Reset zoom to default (1x scale, centered).
   */
  const resetZoom = () => {
    if (isNil(svgRef.current) || isNil(zoomBehaviorRef.current)) {
      return;
    }

    const svg = d3.select(svgRef.current);
    svg
      .transition()
      .duration(500)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  return {
    transform,
    zoomIn,
    zoomOut,
    resetZoom,
  };
}
