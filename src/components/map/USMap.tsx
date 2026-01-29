'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import * as topojson from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import { useStore } from '@/store';
import { getRatingColor, cn } from '@/lib/utils';
import { MapTooltip } from './MapTooltip';
import { MapLegend } from './MapLegend';
import type { Rating } from '@/types';
import statesData from '@/data/states.json';

// US TopoJSON URL (using jsdelivr CDN for reliable access)
const US_TOPO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

interface USMapProps {
  width?: number;
  height?: number;
  className?: string;
}

interface TopoJSONData extends Topology {
  objects: {
    states: GeometryCollection;
    nation?: GeometryCollection;
  };
}

interface StateFeature {
  type: 'Feature';
  id: string;
  properties: { name: string };
  geometry: GeoJSON.Geometry;
}

export function USMap({ width = 960, height = 600, className }: USMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [topoData, setTopoData] = useState<TopoJSONData | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [dimensions, setDimensions] = useState({ width, height });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [tooltipData, setTooltipData] = useState<{
    stateId: string;
    stateName: string;
    x: number;
    y: number;
    rating?: Rating;
  } | null>(null);

  // Detect touch device
  useEffect(() => {
    const onTouch = () => {
      setIsTouchDevice(true);
      window.removeEventListener('touchstart', onTouch);
    };
    window.addEventListener('touchstart', onTouch, { passive: true });
    return () => window.removeEventListener('touchstart', onTouch);
  }, []);

  const {
    layer,
    selectedState,
    hoveredState,
    showHistoricalMargins,
    historicalYear,
    scenarios,
    currentScenarioId,
    settings,
    selectState,
    setHoveredState,
  } = useStore();

  const currentScenario = scenarios[currentScenarioId];

  // Load TopoJSON data
  const loadMapData = useCallback(() => {
    setLoadError(false);
    fetch(US_TOPO_URL)
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then((data: TopoJSONData) => setTopoData(data))
      .catch((error) => {
        console.error('Failed to load US map data:', error);
        setLoadError(true);
      });
  }, []);

  useEffect(() => {
    loadMapData();
  }, [loadMapData]);

  // Handle responsive sizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: containerWidth } = entry.contentRect;
        const aspectRatio = 960 / 600;
        const newWidth = Math.min(containerWidth, 1200);
        const newHeight = newWidth / aspectRatio;
        setDimensions({ width: newWidth, height: newHeight });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // FIPS to state code mapping
  const fipsToState = useMemo(() => {
    const mapping: Record<string, string> = {};
    Object.entries(statesData.states).forEach(([code, info]) => {
      mapping[(info as { fips: string }).fips] = code;
    });
    return mapping;
  }, []);

  // Get state name from code
  const getStateName = useCallback(
    (stateId: string): string => {
      const state = (statesData.states as Record<string, { name: string }>)[stateId];
      return state?.name || stateId;
    },
    []
  );

  // Get rating for a state
  const getRating = useCallback(
    (stateId: string): Rating | undefined => {
      if (!currentScenario) return undefined;
      const layerKey = layer as 'presidential' | 'senate' | 'governor';
      return currentScenario.ratings[layerKey]?.[stateId];
    },
    [currentScenario, layer]
  );

  // Handle state click
  const handleStateClick = useCallback(
    (stateId: string) => {
      selectState(selectedState === stateId ? null : stateId);
    },
    [selectState, selectedState]
  );

  // Handle state hover
  const handleStateHover = useCallback(
    (stateId: string | null, event?: React.MouseEvent) => {
      setHoveredState(stateId);

      if (stateId && event) {
        const rating = getRating(stateId);
        const rect = (event.target as SVGElement).getBoundingClientRect();
        setTooltipData({
          stateId,
          stateName: getStateName(stateId),
          x: rect.left + rect.width / 2,
          y: rect.top,
          rating,
        });
      } else {
        setTooltipData(null);
      }
    },
    [setHoveredState, getRating, getStateName]
  );

  // Render map
  useEffect(() => {
    if (!svgRef.current || !topoData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const projection = geoAlbersUsa().fitSize(
      [dimensions.width, dimensions.height],
      topojson.feature(topoData, topoData.objects.states) as GeoJSON.FeatureCollection
    );

    const pathGenerator = geoPath().projection(projection);

    // Create main group
    const g = svg.append('g').attr('class', 'states-group');

    // Get states features
    const statesFeatures = topojson.feature(
      topoData,
      topoData.objects.states
    ) as GeoJSON.FeatureCollection;

    // Draw states
    g.selectAll('path')
      .data(statesFeatures.features)
      .join('path')
      .attr('d', (d) => pathGenerator(d) || '')
      .attr('class', 'state')
      .attr('data-state', (d) => {
        const fips = String(d.id).padStart(2, '0');
        return fipsToState[fips] || '';
      })
      .attr('fill', (d) => {
        const fips = String(d.id).padStart(2, '0');
        const stateId = fipsToState[fips];
        if (!stateId) return '#e4e4e7';

        const rating = getRating(stateId);
        const color = getRatingColor(rating, settings.colorblindMode);
        return color.fill;
      })
      .attr('stroke', (d) => {
        const fips = String(d.id).padStart(2, '0');
        const stateId = fipsToState[fips];
        if (!stateId) return '#a1a1aa';

        if (stateId === selectedState) return '#000000';
        if (stateId === hoveredState) return '#52525b';

        const rating = getRating(stateId);
        const color = getRatingColor(rating, settings.colorblindMode);
        return color.stroke;
      })
      .attr('stroke-width', (d) => {
        const fips = String(d.id).padStart(2, '0');
        const stateId = fipsToState[fips];
        if (stateId === selectedState) return 2.5;
        if (stateId === hoveredState) return 1.5;
        return 0.5;
      })
      .attr('cursor', 'pointer')
      .attr('tabindex', 0)
      .attr('role', 'button')
      .attr('aria-label', (d) => {
        const fips = String(d.id).padStart(2, '0');
        const stateId = fipsToState[fips];
        return `${getStateName(stateId)}, click to select`;
      })
      .on('click', function (event, d) {
        const fips = String(d.id).padStart(2, '0');
        const stateId = fipsToState[fips];
        if (stateId) handleStateClick(stateId);
      })
      .on('mouseenter', function (event, d) {
        const fips = String(d.id).padStart(2, '0');
        const stateId = fipsToState[fips];
        if (stateId) {
          d3.select(this).raise();
          handleStateHover(stateId, event as unknown as React.MouseEvent);
        }
      })
      .on('mouseleave', function () {
        handleStateHover(null);
      })
      .on('keydown', function (event, d) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          const fips = String(d.id).padStart(2, '0');
          const stateId = fipsToState[fips];
          if (stateId) handleStateClick(stateId);
        }
      });

    // Draw state borders (mesh)
    const stateMesh = topojson.mesh(topoData, topoData.objects.states, (a, b) => a !== b);
    g.append('path')
      .datum(stateMesh)
      .attr('class', 'state-borders')
      .attr('fill', 'none')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 0.5)
      .attr('stroke-linejoin', 'round')
      .attr('pointer-events', 'none');

    // Draw nation outline
    if (topoData.objects.nation) {
      const nationFeature = topojson.feature(topoData, topoData.objects.nation);
      g.append('path')
        .datum(nationFeature)
        .attr('class', 'nation-border')
        .attr('d', pathGenerator as any)
        .attr('fill', 'none')
        .attr('stroke', '#27272a')
        .attr('stroke-width', 1)
        .attr('pointer-events', 'none');
    }
  }, [
    topoData,
    dimensions,
    fipsToState,
    selectedState,
    hoveredState,
    layer,
    currentScenario,
    settings.colorblindMode,
    getRating,
    getStateName,
    handleStateClick,
    handleStateHover,
  ]);

  return (
    <div ref={containerRef} className={cn('relative w-full map-container', className)}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="block mx-auto"
        role="img"
        aria-label={`US map showing ${layer} ratings`}
      >
        <title>US Election Map - {layer.charAt(0).toUpperCase() + layer.slice(1)}</title>
      </svg>

      <MapLegend colorblindMode={settings.colorblindMode} />

      {tooltipData && !isTouchDevice && (
        <MapTooltip
          stateId={tooltipData.stateId}
          stateName={tooltipData.stateName}
          rating={tooltipData.rating}
          x={tooltipData.x}
          y={tooltipData.y}
          colorblindMode={settings.colorblindMode}
        />
      )}

      {/* Loading state */}
      {!topoData && !loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-100/80 dark:bg-surface-900/80">
          <svg className="w-10 h-10 text-blue-500 mb-3" style={{ animation: 'map-loading-spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <div className="text-surface-600 dark:text-surface-400 font-medium">Loading map data...</div>
          <div className="text-xs text-surface-400 dark:text-surface-500 mt-1">Fetching US geography</div>
        </div>
      )}

      {/* Error state */}
      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-100/90 dark:bg-surface-900/90">
          <svg className="w-12 h-12 text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="text-surface-700 dark:text-surface-300 font-medium mb-1">Failed to load map</div>
          <div className="text-sm text-surface-500 dark:text-surface-400 mb-3">Check your internet connection</div>
          <button
            onClick={loadMapData}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
