import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  RotateCcw,
  Check,
  Undo2,
  MapPin,
  ZoomIn,
  ZoomOut,
  Compass,
  Square,
  PenTool,
  Layers,
  Code2,
  X,
} from 'lucide-react';
import mapboxgl, {
  getMapStyle,
  calculateAreaHectares,
  calculatePerimeterKm,
  getCoordinatesBounds,
  BASEMAP_STYLES,
} from '../utils/mapbox.js';

const PRESETS = [
  {
    name: 'Valley Basin',
    points: [
      [76.640, 11.440],
      [76.710, 11.440],
      [76.710, 11.490],
      [76.640, 11.490],
      [76.640, 11.440],
    ],
  },
  {
    name: 'Forest Parcel',
    points: [
      [76.630, 11.430],
      [76.700, 11.435],
      [76.725, 11.480],
      [76.670, 11.510],
      [76.620, 11.470],
      [76.630, 11.430],
    ],
  },
  {
    name: 'Ridge Contour',
    points: [
      [76.650, 11.450],
      [76.690, 11.445],
      [76.715, 11.475],
      [76.685, 11.505],
      [76.645, 11.485],
      [76.650, 11.450],
    ],
  },
  {
    name: 'Rectangular Plot',
    points: [
      [76.660, 11.455],
      [76.695, 11.455],
      [76.695, 11.485],
      [76.660, 11.485],
      [76.660, 11.455],
    ],
  },
];

// Helper to construct GeoJSON for the MapLibre source
function makePolygonGeoJSON(pts) {
  if (!pts || pts.length === 0) {
    return { type: 'FeatureCollection', features: [] };
  }

  const features = [];

  if (pts.length >= 2) {
    const isClosed =
      pts.length >= 4 &&
      pts[0][0] === pts[pts.length - 1][0] &&
      pts[0][1] === pts[pts.length - 1][1];

    features.push({
      type: 'Feature',
      properties: { role: 'boundary' },
      geometry: {
        type: 'LineString',
        coordinates: isClosed ? pts : [...pts],
      },
    });

    if (pts.length >= 3) {
      const ring = isClosed ? pts : [...pts, pts[0]];
      features.push({
        type: 'Feature',
        properties: { role: 'fill' },
        geometry: {
          type: 'Polygon',
          coordinates: [ring],
        },
      });
    }
  }

  return { type: 'FeatureCollection', features };
}

export default function PolygonMapEditor({
  initialPoints = [],
  onChange,
  height = 360,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const midMarkersRef = useRef([]);
  const isDraggingRef = useRef(false);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeLayer, setActiveLayer] = useState('satellite');
  const [showJsonDrawer, setShowJsonDrawer] = useState(false);

  // Points state
  const [points, setPoints] = useState(() => {
    if (initialPoints && initialPoints.length >= 3) {
      return initialPoints;
    }
    return [];
  });

  const [isDrawingMode, setIsDrawingMode] = useState(() => {
    return !initialPoints || initialPoints.length < 3;
  });

  const [coordsText, setCoordsText] = useState(() => {
    const pts = initialPoints && initialPoints.length >= 3 ? initialPoints : [];
    return JSON.stringify(pts, null, 2);
  });

  const [coordError, setCoordError] = useState('');
  const [cursorPos, setCursorPos] = useState(null);

  // Projected screen coordinates for direct SVG overlay over the map
  const [projectedPoints, setProjectedPoints] = useState([]);

  // Refs for current state to avoid stale closures
  const pointsRef = useRef(points);
  pointsRef.current = points;

  const isDrawingModeRef = useRef(isDrawingMode);
  isDrawingModeRef.current = isDrawingMode;

  // Check if polygon is closed
  const isClosed = useMemo(() => {
    return (
      points.length >= 4 &&
      points[0][0] === points[points.length - 1][0] &&
      points[0][1] === points[points.length - 1][1]
    );
  }, [points]);

  const isClosedRef = useRef(isClosed);
  isClosedRef.current = isClosed;

  // Sync projected screen coordinates for the SVG boundary overlay
  const syncSvgProjection = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const currentPts = pointsRef.current;
    if (!currentPts || currentPts.length === 0) {
      setProjectedPoints([]);
      return;
    }
    const projected = currentPts
      .map(([lng, lat]) => {
        try {
          const p = map.project([lng, lat]);
          return { x: p.x, y: p.y };
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    setProjectedPoints(projected);
  }, []);

  // Sync points state, coords text, and notify parent
  const updatePoints = useCallback(
    (newPoints, updateText = true) => {
      setPoints(newPoints);
      pointsRef.current = newPoints;
      if (updateText) {
        setCoordsText(JSON.stringify(newPoints, null, 2));
      }
      setCoordError('');
      syncSvgProjection();
      onChange?.(newPoints);
    },
    [onChange, syncSvgProjection]
  );

  // Rubberband preview GeoJSON (for MapLibre)
  const rubberbandGeojson = useMemo(() => {
    if (!isDrawingMode || points.length === 0 || isClosed || !cursorPos) {
      return { type: 'FeatureCollection', features: [] };
    }
    const lastPt = points[points.length - 1];
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [lastPt, cursorPos],
          },
        },
      ],
    };
  }, [isDrawingMode, points, isClosed, cursorPos]);

  // Projected screen coordinate for rubberband cursor line (for SVG overlay)
  const projectedCursor = useMemo(() => {
    if (!isDrawingMode || points.length === 0 || isClosed || !cursorPos || !mapRef.current) {
      return null;
    }
    try {
      const p = mapRef.current.project(cursorPos);
      return { x: p.x, y: p.y };
    } catch {
      return null;
    }
  }, [isDrawingMode, points.length, isClosed, cursorPos]);

  // Update MapLibre layers and ensure they are placed strictly on the top of the map layer stack
  const updatePolygonLayers = useCallback(
    (map, ptsToUse = null) => {
      if (!map || !map.isStyleLoaded()) return;

      const currentPts = ptsToUse || pointsRef.current;
      const geojsonData = makePolygonGeoJSON(currentPts);

      const source = map.getSource('editor-polygon-source');
      if (source) {
        source.setData(geojsonData);
      } else {
        map.addSource('editor-polygon-source', {
          type: 'geojson',
          data: geojsonData,
        });

        // 1. Semi-transparent polygon fill
        map.addLayer({
          id: 'editor-polygon-fill',
          type: 'fill',
          source: 'editor-polygon-source',
          filter: ['==', '$type', 'Polygon'],
          paint: {
            'fill-color': '#3B82F6',
            'fill-opacity': 0.25,
          },
        });

        // 2. Crisp dark outer casing halo for 100% boundary contrast
        map.addLayer({
          id: 'editor-polygon-casing',
          type: 'line',
          source: 'editor-polygon-source',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#0F1117',
            'line-width': 6.5,
            'line-opacity': 0.95,
          },
        });

        // 3. Bold solid primary boundary border line
        map.addLayer({
          id: 'editor-polygon-line',
          type: 'line',
          source: 'editor-polygon-source',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#38BDF8',
            'line-width': 3.5,
          },
        });
      }

      // Rubberband preview line
      const rubberbandSource = map.getSource('editor-rubberband-source');
      if (rubberbandSource) {
        rubberbandSource.setData(rubberbandGeojson);
      } else {
        map.addSource('editor-rubberband-source', {
          type: 'geojson',
          data: rubberbandGeojson,
        });

        map.addLayer({
          id: 'editor-rubberband-casing',
          type: 'line',
          source: 'editor-rubberband-source',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#0F1117',
            'line-width': 4.5,
            'line-opacity': 0.9,
          },
        });

        map.addLayer({
          id: 'editor-rubberband-line',
          type: 'line',
          source: 'editor-rubberband-source',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#38BDF8',
            'line-width': 2.5,
            'line-dasharray': [3, 2],
          },
        });
      }

      // Crucial: Explicitly move polygon boundary layers to the very top of all map layers
      try {
        if (map.getLayer('editor-polygon-fill')) map.moveLayer('editor-polygon-fill');
        if (map.getLayer('editor-polygon-casing')) map.moveLayer('editor-polygon-casing');
        if (map.getLayer('editor-polygon-line')) map.moveLayer('editor-polygon-line');
        if (map.getLayer('editor-rubberband-casing')) map.moveLayer('editor-rubberband-casing');
        if (map.getLayer('editor-rubberband-line')) map.moveLayer('editor-rubberband-line');
      } catch {
        // Safe catch if layer moving in flight
      }
    },
    [rubberbandGeojson]
  );

  // Fit bounds helper
  const fitBoundsToPoints = useCallback((map, pts) => {
    if (!map || !pts || pts.length === 0) return;
    const bounds = getCoordinatesBounds(pts);
    if (!bounds) return;
    try {
      map.fitBounds(bounds, {
        padding: { top: 60, bottom: 60, left: 60, right: 60 },
        maxZoom: 16,
        duration: 500,
      });
    } catch {
      map.setCenter(pts[0]);
    }
  }, []);

  // Initialize Mapbox / MapLibre map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCenter = points.length > 0 ? points[0] : [76.680, 11.460];

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: getMapStyle(activeLayer),
      center: initialCenter,
      zoom: 12,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on('load', () => {
      setMapLoaded(true);
      updatePolygonLayers(map);
      syncSvgProjection();
      if (pointsRef.current.length >= 3) {
        fitBoundsToPoints(map, pointsRef.current);
      }
    });

    map.on('style.load', () => {
      updatePolygonLayers(map);
      syncSvgProjection();
    });

    // Sync SVG boundary overlay on every map pan, zoom, render, and resize
    map.on('move', syncSvgProjection);
    map.on('zoom', syncSvgProjection);
    map.on('resize', syncSvgProjection);
    map.on('render', syncSvgProjection);

    // Mousemove tracker for live rubberband preview line
    map.on('mousemove', (e) => {
      if (isDrawingModeRef.current && pointsRef.current.length > 0) {
        setCursorPos([
          Number(e.lngLat.lng.toFixed(5)),
          Number(e.lngLat.lat.toFixed(5)),
        ]);
      }
    });

    // Map click: adds a new point
    map.on('click', (e) => {
      // Ignore click if clicking directly on a marker handle
      if (e.originalEvent?.target?.closest('.polygon-handle')) return;

      const newCoord = [
        Number(e.lngLat.lng.toFixed(5)),
        Number(e.lngLat.lat.toFixed(5)),
      ];

      const current = pointsRef.current;

      if (current.length === 0) {
        updatePoints([newCoord]);
        setIsDrawingMode(true);
        return;
      }

      const closed =
        current.length >= 4 &&
        current[0][0] === current[current.length - 1][0] &&
        current[0][1] === current[current.length - 1][1];

      if (closed) {
        const open = current.slice(0, -1);
        open.push(newCoord);
        open.push(open[0]);
        updatePoints(open);
      } else {
        updatePoints([...current, newCoord]);
      }
    });

    // Double click completes and closes boundary
    map.on('dblclick', (e) => {
      e.preventDefault();
      const current = pointsRef.current;
      if (current.length >= 3) {
        const first = current[0];
        const last = current[current.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
          updatePoints([...current, [first[0], first[1]]]);
        }
        setIsDrawingMode(false);
      }
    });

    // Resize observer
    let resizeTimer = null;
    const resizeObserver = new ResizeObserver(() => {
      if (resizeTimer) cancelAnimationFrame(resizeTimer);
      resizeTimer = requestAnimationFrame(() => {
        map.resize();
        syncSvgProjection();
      });
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      if (resizeTimer) cancelAnimationFrame(resizeTimer);
      resizeObserver.disconnect();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      midMarkersRef.current.forEach((m) => m.remove());
      midMarkersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update polygon layers whenever points change
  useEffect(() => {
    if (mapRef.current && mapLoaded) {
      updatePolygonLayers(mapRef.current);
      syncSvgProjection();
    }
  }, [points, rubberbandGeojson, mapLoaded, updatePolygonLayers, syncSvgProjection]);

  // Sync interactive Corner Markers & Midpoint Insertion Handles
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (isDraggingRef.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    midMarkersRef.current.forEach((m) => m.remove());
    midMarkersRef.current = [];

    const currentPoints = points;
    if (currentPoints.length === 0) return;

    const closed =
      currentPoints.length >= 4 &&
      currentPoints[0][0] === currentPoints[currentPoints.length - 1][0] &&
      currentPoints[0][1] === currentPoints[currentPoints.length - 1][1];

    const activePoints = closed ? currentPoints.slice(0, -1) : currentPoints;

    // 1. Draggable corner vertex handles
    activePoints.forEach(([lng, lat], idx) => {
      const isFirst = idx === 0;
      const el = document.createElement('div');
      el.className = 'polygon-handle cursor-grab active:cursor-grabbing';

      if (isFirst && !closed && currentPoints.length >= 3) {
        el.innerHTML = `
          <div class="w-7 h-7 -m-1.5 flex items-center justify-center">
            <div class="w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0F1117] shadow-md transition-transform hover:scale-125"></div>
          </div>
        `;
        el.onclick = (e) => {
          e.stopPropagation();
          updatePoints([...currentPoints, [currentPoints[0][0], currentPoints[0][1]]]);
          setIsDrawingMode(false);
        };
      } else {
        el.innerHTML = `
          <div class="w-7 h-7 -m-1.5 flex items-center justify-center">
            <div class="w-3.5 h-3.5 rounded-full bg-[#38BDF8] border-2 border-[#0F1117] shadow-md transition-transform hover:scale-125"></div>
          </div>
        `;
      }

      el.oncontextmenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (activePoints.length <= 3) return;
        const updated = activePoints.filter((_, i) => i !== idx);
        if (closed) {
          updated.push(updated[0]);
        }
        updatePoints(updated);
      };

      const marker = new mapboxgl.Marker({
        element: el,
        draggable: true,
      })
        .setLngLat([lng, lat])
        .addTo(map);

      marker.on('dragstart', () => {
        isDraggingRef.current = true;
        midMarkersRef.current.forEach((m) => m.getElement().classList.add('hidden'));
      });

      marker.on('drag', () => {
        const lngLat = marker.getLngLat();
        const newCoord = [
          Number(lngLat.lng.toFixed(5)),
          Number(lngLat.lat.toFixed(5)),
        ];

        const updated = [...pointsRef.current];
        updated[idx] = newCoord;

        if (isClosedRef.current && idx === 0) {
          updated[updated.length - 1] = newCoord;
        }

        pointsRef.current = updated;

        // Update MapLibre source
        const liveGeojson = makePolygonGeoJSON(updated);
        map.getSource('editor-polygon-source')?.setData(liveGeojson);

        // Live update SVG projection overlay
        syncSvgProjection();
      });

      marker.on('dragend', () => {
        isDraggingRef.current = false;
        midMarkersRef.current.forEach((m) => m.getElement().classList.remove('hidden'));
        updatePoints([...pointsRef.current], true);
      });

      markersRef.current.push(marker);
    });

    // 2. Midpoint edge insert handles
    if (activePoints.length >= 2) {
      const edgesCount = closed ? activePoints.length : activePoints.length - 1;
      for (let i = 0; i < edgesCount; i++) {
        const p1 = activePoints[i];
        const p2 = activePoints[(i + 1) % activePoints.length];
        const midLng = Number(((p1[0] + p2[0]) / 2).toFixed(5));
        const midLat = Number(((p1[1] + p2[1]) / 2).toFixed(5));

        const midEl = document.createElement('div');
        midEl.className = 'polygon-handle flex items-center justify-center cursor-pointer';
        midEl.innerHTML = `
          <div class="w-6 h-6 -m-1 flex items-center justify-center">
            <div class="w-2.5 h-2.5 rounded-full bg-[#38BDF8] border border-[#0F1117] shadow-xs hover:scale-150 transition-transform"></div>
          </div>
        `;

        midEl.onclick = (e) => {
          e.stopPropagation();
          const updated = [...activePoints];
          updated.splice(i + 1, 0, [midLng, midLat]);
          if (closed) {
            updated.push(updated[0]);
          }
          updatePoints(updated);
        };

        const midMarker = new mapboxgl.Marker({
          element: midEl,
        })
          .setLngLat([midLng, midLat])
          .addTo(map);

        midMarkersRef.current.push(midMarker);
      }
    }
  }, [points, mapLoaded, updatePoints, syncSvgProjection]);

  // Basemap style switcher
  const handleLayerChange = (layerKey) => {
    setActiveLayer(layerKey);
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(getMapStyle(layerKey));
  };

  // Close polygon
  const handleClosePolygon = () => {
    if (points.length < 3) return;
    if (isClosed) {
      setIsDrawingMode(false);
      return;
    }
    updatePoints([...points, [points[0][0], points[0][1]]]);
    setIsDrawingMode(false);
  };

  // Undo last point
  const handleUndo = () => {
    if (points.length <= 1) {
      updatePoints([]);
      setIsDrawingMode(true);
      return;
    }
    if (isClosed) {
      updatePoints(points.slice(0, -2));
      setIsDrawingMode(true);
    } else {
      updatePoints(points.slice(0, -1));
    }
  };

  // Clear & Start drawing from scratch
  const handleClear = () => {
    updatePoints([]);
    setIsDrawingMode(true);
  };

  // "Drop Box at Center" tool
  const handleDropBoxAtCenter = () => {
    const map = mapRef.current;
    if (!map) return;
    const center = map.getCenter();
    const zoom = map.getZoom();

    const offset = 0.015 * Math.pow(2, 12 - zoom);

    const minLng = Number((center.lng - offset).toFixed(5));
    const maxLng = Number((center.lng + offset).toFixed(5));
    const minLat = Number((center.lat - offset * 0.75).toFixed(5));
    const maxLat = Number((center.lat + offset * 0.75).toFixed(5));

    const boxPoints = [
      [minLng, minLat],
      [maxLng, minLat],
      [maxLng, maxLat],
      [minLng, maxLat],
      [minLng, minLat],
    ];

    updatePoints(boxPoints);
    setIsDrawingMode(false);
    fitBoundsToPoints(map, boxPoints);
  };

  // Select Preset
  const handleSelectPreset = (presetPoints) => {
    updatePoints(presetPoints);
    setIsDrawingMode(false);
    if (mapRef.current) {
      fitBoundsToPoints(mapRef.current, presetPoints);
    }
  };

  // Textarea input
  const handleTextChange = (e) => {
    const val = e.target.value;
    setCoordsText(val);
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed) && parsed.every((p) => Array.isArray(p) && p.length >= 2)) {
        updatePoints(parsed, false);
        setCoordError('');
        if (mapRef.current) {
          fitBoundsToPoints(mapRef.current, parsed);
        }
      }
    } catch {
      // Ignore invalid JSON while typing
    }
  };

  const area = useMemo(() => calculateAreaHectares(points), [points]);
  const perimeter = useMemo(() => calculatePerimeterKm(points), [points]);

  // Construct SVG path strings for the overlay laid directly OVER the map canvas
  const svgBoundaryPath = useMemo(() => {
    if (!projectedPoints || projectedPoints.length < 2) return '';
    const d = projectedPoints
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');
    return isClosed ? `${d} Z` : d;
  }, [projectedPoints, isClosed]);

  const svgFillPath = useMemo(() => {
    if (!projectedPoints || projectedPoints.length < 3) return '';
    const d = projectedPoints
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');
    return `${d} Z`;
  }, [projectedPoints]);

  return (
    <div
      className="relative w-full rounded-2xl border border-[#2D3139]/70 overflow-hidden select-none shadow-2xl stitch-card-shadow group bg-transparent"
      style={{ height: `${height}px` }}
    >
      {/* 1. Underlying Mapbox / MapLibre Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* 2. Direct SVG Polygon Boundary Overlay (GUARANTEED 100% OVER THE MAP CANVAS) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        style={{ zIndex: 4 }}
      >
        {/* Semi-transparent Polygon Fill */}
        {svgFillPath && (
          <path
            d={svgFillPath}
            fill="#3B82F6"
            fillOpacity={0.25}
          />
        )}

        {/* Crisp Dark Outer Halo Casing */}
        {svgBoundaryPath && (
          <path
            d={svgBoundaryPath}
            stroke="#0F1117"
            strokeWidth={7}
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
            opacity={0.96}
          />
        )}

        {/* Bold Blue Primary Boundary Stroke */}
        {svgBoundaryPath && (
          <path
            d={svgBoundaryPath}
            stroke="#38BDF8"
            strokeWidth={3.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Live Rubberband Line (connecting last point to active cursor while drawing) */}
        {projectedCursor && projectedPoints.length > 0 && !isClosed && (
          <>
            <line
              x1={projectedPoints[projectedPoints.length - 1].x}
              y1={projectedPoints[projectedPoints.length - 1].y}
              x2={projectedCursor.x}
              y2={projectedCursor.y}
              stroke="#0F1117"
              strokeWidth={5}
              strokeLinecap="round"
              opacity={0.9}
            />
            <line
              x1={projectedPoints[projectedPoints.length - 1].x}
              y1={projectedPoints[projectedPoints.length - 1].y}
              x2={projectedCursor.x}
              y2={projectedCursor.y}
              stroke="#38BDF8"
              strokeWidth={2.5}
              strokeDasharray="5,4"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>

      {/* 3. Top Floating Overlay Toolbar (LAID OVER THE MAP) */}
      <div className="absolute top-2.5 inset-x-2.5 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        {/* Left: Draw Tools & Presets */}
        <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-xl p-1 rounded-xl border border-[#2D3139]/80 shadow-2xl stitch-card-shadow">
          <button
            type="button"
            onClick={() => {
              setIsDrawingMode(true);
              if (isClosed) {
                updatePoints(points.slice(0, -1));
              }
            }}
            className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
              isDrawingMode
                ? 'btn-crystal-blue font-semibold'
                : 'text-[#9CA3AF] hover:bg-white/[0.08] hover:text-[#F3F4F6]'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            Draw
          </button>

          <button
            type="button"
            onClick={handleDropBoxAtCenter}
            className="text-xs px-2 py-1 rounded-lg text-[#9CA3AF] hover:bg-white/[0.08] hover:text-[#F3F4F6] flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 text-blue-400" />
            Drop box
          </button>

          <div className="h-4 w-px bg-[#2D3139] mx-0.5" />

          {/* Quick Presets */}
          <div className="hidden sm:flex items-center gap-1">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleSelectPreset(p.points)}
                className="text-[11px] px-2 py-0.5 rounded-lg text-[#9CA3AF] hover:text-blue-400 hover:bg-white/[0.08] transition-colors cursor-pointer font-medium"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Basemap switcher & Undo / Reset */}
        <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-xl p-1 rounded-xl border border-[#2D3139]/80 shadow-2xl stitch-card-shadow">
          {/* Basemap Switcher */}
          <div className="flex items-center">
            {Object.values(BASEMAP_STYLES).map((layer) => (
              <button
                key={layer.id}
                type="button"
                onClick={() => handleLayerChange(layer.id)}
                className={`text-[11px] px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                  activeLayer === layer.id
                    ? 'bg-black/90 text-blue-400 border border-blue-500/40 font-medium'
                    : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
                }`}
              >
                {layer.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-[#2D3139] mx-0.5" />

          <button
            type="button"
            onClick={handleUndo}
            disabled={points.length === 0}
            title="Undo last point"
            className="text-xs px-1.5 py-1 text-[#9CA3AF] hover:text-[#F3F4F6] disabled:opacity-30 flex items-center gap-1 cursor-pointer font-medium rounded-lg hover:bg-white/[0.08]"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleClear}
            title="Clear and start over"
            className="text-xs px-1.5 py-1 text-[#9CA3AF] hover:text-[#EF4444] flex items-center gap-1 cursor-pointer font-medium rounded-lg hover:bg-white/[0.08]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Bottom Floating Overlay HUD (LAID OVER THE MAP) */}
      <div className="absolute bottom-2.5 inset-x-2.5 z-20 flex items-center justify-between pointer-events-none">
        {/* Boundary Live Measurements Badge */}
        <div className="bg-black/75 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-[#2D3139]/80 shadow-2xl text-xs text-[#F3F4F6] flex items-center gap-2.5 font-mono pointer-events-auto">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>
              Area: <strong className="text-blue-400 font-semibold">{area} ha</strong>
            </span>
          </span>
          <span className="text-[#2D3139]">•</span>
          <span>Perimeter: <strong className="text-[#F3F4F6]">{perimeter} km</strong></span>
          <span className="text-[#2D3139]">•</span>
          <span className="text-[#9CA3AF]">{isClosed ? points.length - 1 : points.length} vertices</span>
        </div>

        {/* Floating Actions: Complete Boundary / Toggle JSON Coords */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => setShowJsonDrawer(!showJsonDrawer)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 border shadow-2xl transition-colors cursor-pointer ${
              showJsonDrawer
                ? 'btn-crystal-blue font-semibold'
                : 'bg-black/75 backdrop-blur-xl text-[#F3F4F6] border-[#2D3139]/80 hover:bg-white/[0.08] hover:text-blue-400'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            JSON
          </button>

          {points.length >= 3 && !isClosed && (
            <button
              type="button"
              onClick={handleClosePolygon}
              className="btn-crystal-blue px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/20 cursor-pointer active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              Complete boundary
            </button>
          )}
        </div>
      </div>

      {/* 5. Floating Zoom & Compass Controls */}
      <div className="absolute top-16 right-2.5 z-20 flex flex-col gap-1 pointer-events-auto">
        <button
          type="button"
          title="Zoom in"
          onClick={() => mapRef.current?.zoomIn()}
          className="w-7 h-7 flex items-center justify-center bg-black/75 backdrop-blur-xl text-[#F3F4F6] rounded-xl border border-[#2D3139]/80 hover:bg-white/[0.08] hover:text-blue-400 transition-colors shadow-2xl cursor-pointer"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Zoom out"
          onClick={() => mapRef.current?.zoomOut()}
          className="w-7 h-7 flex items-center justify-center bg-black/75 backdrop-blur-xl text-[#F3F4F6] rounded-xl border border-[#2D3139]/80 hover:bg-white/[0.08] hover:text-blue-400 transition-colors shadow-2xl cursor-pointer"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Fit to boundary"
          onClick={() => fitBoundsToPoints(mapRef.current, points)}
          className="w-7 h-7 flex items-center justify-center bg-black/75 backdrop-blur-xl text-[#F3F4F6] rounded-xl border border-[#2D3139]/80 hover:bg-white/[0.08] hover:text-blue-400 transition-colors shadow-2xl cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 6. Floating JSON Coordinates Drawer (LAID DIRECTLY OVER THE MAP) */}
      {showJsonDrawer && (
        <div className="absolute bottom-12 right-2.5 z-30 w-80 max-w-[calc(100%-20px)] bg-black/85 backdrop-blur-2xl rounded-2xl border border-[#2D3139]/80 p-3.5 shadow-2xl stitch-card-shadow pointer-events-auto transition-all animate-in fade-in">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2D3139]">
            <span className="text-xs font-semibold text-[#F3F4F6] flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              Manual coordinates (JSON)
            </span>
            <button
              type="button"
              onClick={() => setShowJsonDrawer(false)}
              className="text-[#9CA3AF] hover:text-[#F3F4F6] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <textarea
            id="polygon-live-coords-input"
            rows={4}
            value={coordsText}
            onChange={handleTextChange}
            className={`w-full font-mono text-[11px] px-2.5 py-1.5 bg-black/60 text-[#F3F4F6] rounded-xl border outline-none transition-colors ${
              coordError
                ? 'border-[#EF4444] focus:border-[#EF4444]'
                : 'border-[#2D3139]/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15'
            }`}
          />
          {coordError && (
            <p className="text-[11px] text-[#EF4444] mt-1 font-medium">{coordError}</p>
          )}
          <p className="text-[10px] text-[#9CA3AF] font-medium mt-1.5">
            Tip: Edit or paste [[lng, lat], ...] to update boundary points live.
          </p>
        </div>
      )}
    </div>
  );
}
