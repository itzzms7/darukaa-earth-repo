import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { MousePointerClick, RotateCcw, Check, Undo2, Layers, MapPin } from 'lucide-react';

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
];

// Calculate approximate area in hectares for polygon in degrees
function calculatePolygonAreaHectares(coords) {
  if (!coords || coords.length < 3) return 0;
  let area = 0;
  const rad = Math.PI / 180;
  const R = 6378137; // Earth radius in meters
  for (let i = 0; i < coords.length - 1; i++) {
    const p1 = coords[i];
    const p2 = coords[i + 1];
    area += (p2[0] - p1[0]) * rad * (2 + Math.sin(p1[1] * rad) + Math.sin(p2[1] * rad));
  }
  area = Math.abs((area * R * R) / 4);
  return (area / 10000).toFixed(1); // 1 ha = 10,000 m²
}

// Calculate perimeter in kilometers
function calculatePerimeterKm(coords) {
  if (!coords || coords.length < 2) return 0;
  let dist = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const dLat = (p2[1] - p1[1]) * 111.32;
    const dLng = (p2[0] - p1[0]) * 111.32 * Math.cos(((p1[1] + p2[1]) / 2) * (Math.PI / 180));
    dist += Math.sqrt(dLat * dLat + dLng * dLng);
  }
  return dist.toFixed(2);
}

export default function PolygonMapEditor({
  initialPoints = [],
  onChange,
  height = 320,
}) {
  const [points, setPoints] = useState(() => {
    if (initialPoints && initialPoints.length >= 3) {
      return initialPoints;
    }
    return PRESETS[0].points;
  });

  const [coordsText, setCoordsText] = useState(() => {
    const pts = initialPoints && initialPoints.length >= 3 ? initialPoints : PRESETS[0].points;
    return JSON.stringify(pts, null, 2);
  });

  const [mapLayer, setMapLayer] = useState('satellite'); // 'satellite' | 'streets' | 'grid'
  const [coordError, setCoordError] = useState('');
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const svgRef = useRef(null);

  // Compute bounding box around points with dynamic padding
  const bbox = useMemo(() => {
    if (!points || points.length === 0) {
      return { minLng: 76.60, maxLng: 76.75, minLat: 11.40, maxLat: 11.55 };
    }
    const lngs = points.map((p) => p[0]);
    const lats = points.map((p) => p[1]);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    const padLng = Math.max(0.015, (maxLng - minLng) * 0.3 || 0.02);
    const padLat = Math.max(0.015, (maxLat - minLat) * 0.3 || 0.02);

    return {
      minLng: minLng - padLng,
      maxLng: maxLng + padLng,
      minLat: minLat - padLat,
      maxLat: maxLat + padLat,
    };
  }, [points]);

  // Sync state without animation
  const updatePoints = useCallback((newPoints) => {
    setPoints(newPoints);
    setCoordsText(JSON.stringify(newPoints, null, 2));
    setCoordError('');
    onChange?.(newPoints);
  }, [onChange]);

  // Coordinate conversion
  const getGeoCoordsFromEvent = useCallback((e) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const lngRatio = x / rect.width;
    const latRatio = 1 - (y / rect.height);

    const lng = Number((bbox.minLng + lngRatio * (bbox.maxLng - bbox.minLng)).toFixed(5));
    const lat = Number((bbox.minLat + latRatio * (bbox.maxLat - bbox.minLat)).toFixed(5));

    return [lng, lat];
  }, [bbox]);

  // Vertex Dragging
  const handleVertexMouseDown = (e, index) => {
    e.stopPropagation();
    setDraggingIndex(index);
  };

  const handleMouseMove = (e) => {
    if (draggingIndex === null) return;
    const geo = getGeoCoordsFromEvent(e);
    if (!geo) return;

    const nextPoints = [...points];
    const isFirstPoint = draggingIndex === 0;
    const isLastPoint = draggingIndex === points.length - 1;
    const isClosed = points.length >= 4 &&
      points[0][0] === points[points.length - 1][0] &&
      points[0][1] === points[points.length - 1][1];

    nextPoints[draggingIndex] = geo;

    if (isClosed) {
      if (isFirstPoint) {
        nextPoints[nextPoints.length - 1] = geo;
      } else if (isLastPoint) {
        nextPoints[0] = geo;
      }
    }

    // Direct synchronous live update without animation
    updatePoints(nextPoints);
  };

  const handleMouseUp = () => {
    setDraggingIndex(null);
  };

  // Add vertex on canvas click
  const handleSvgClick = (e) => {
    if (draggingIndex !== null) return;
    const geo = getGeoCoordsFromEvent(e);
    if (!geo) return;

    if (points.length === 0) {
      updatePoints([geo]);
      return;
    }

    const isClosed = points.length >= 4 &&
      points[0][0] === points[points.length - 1][0] &&
      points[0][1] === points[points.length - 1][1];

    if (isClosed) {
      const openPoints = points.slice(0, -1);
      openPoints.push(geo);
      openPoints.push(openPoints[0]);
      updatePoints(openPoints);
    } else {
      updatePoints([...points, geo]);
    }
  };

  // Close polygon
  const handleClosePolygon = () => {
    if (points.length < 3) return;
    if (
      points[0][0] === points[points.length - 1][0] &&
      points[0][1] === points[points.length - 1][1]
    ) {
      return;
    }
    updatePoints([...points, [points[0][0], points[0][1]]]);
  };

  // Undo last vertex
  const handleUndo = () => {
    if (points.length <= 1) {
      updatePoints([]);
      return;
    }
    const isClosed = points.length >= 4 &&
      points[0][0] === points[points.length - 1][0] &&
      points[0][1] === points[points.length - 1][1];

    if (isClosed) {
      updatePoints(points.slice(0, -2));
    } else {
      updatePoints(points.slice(0, -1));
    }
  };

  // Clear
  const handleClear = () => {
    updatePoints([]);
  };

  // Manual text changes
  const handleTextChange = (e) => {
    const val = e.target.value;
    setCoordsText(val);
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed) && parsed.every((p) => Array.isArray(p) && p.length >= 2)) {
        setPoints(parsed);
        setCoordError('');
        onChange?.(parsed);
      }
    } catch {
      // User is typing
    }
  };

  // SVG Projections
  const svgWidth = 600;
  const svgHeight = height;

  const projectToSvg = useCallback(([lng, lat]) => {
    const x = ((lng - bbox.minLng) / (bbox.maxLng - bbox.minLng)) * svgWidth;
    const y = (1 - (lat - bbox.minLat) / (bbox.maxLat - bbox.minLat)) * svgHeight;
    return [Math.round(x), Math.round(y)];
  }, [bbox, svgHeight]);

  const svgCoords = useMemo(() => {
    return points.map(projectToSvg);
  }, [points, projectToSvg]);

  const polygonPath = useMemo(() => {
    if (svgCoords.length === 0) return '';
    return svgCoords.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt[0]} ${pt[1]}`).join(' ');
  }, [svgCoords]);

  const area = useMemo(() => calculatePolygonAreaHectares(points), [points]);
  const perimeter = useMemo(() => calculatePerimeterKm(points), [points]);

  useEffect(() => {
    const handleGlobalMouseUp = () => setDraggingIndex(null);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div className="space-y-4">
      {/* Top Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF5F7] p-2.5 rounded-lg border border-[#F0E2EA]">
        {/* Basemap Switcher (Satellite / Topo / Grid) */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-[#756770] font-medium flex items-center gap-1 mr-1">
            <Layers className="w-3.5 h-3.5 text-[#D65D80]" />
            Map layer:
          </span>
          {[
            { id: 'satellite', label: 'Satellite' },
            { id: 'streets', label: 'Terrain' },
            { id: 'grid', label: 'Grid' },
          ].map((layer) => (
            <button
              key={layer.id}
              type="button"
              onClick={() => setMapLayer(layer.id)}
              className={`text-xs px-2.5 py-1 rounded transition-colors cursor-pointer ${
                mapLayer === layer.id
                  ? 'bg-white text-[#D65D80] font-medium shadow-xs border border-[#EBD0DC]'
                  : 'text-[#756770] hover:text-[#231C20]'
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>

        {/* Quick Shape Presets & Actions */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#756770]">Presets:</span>
          {PRESETS.map((p, idx) => (
            <button
              key={p.name}
              type="button"
              onClick={() => updatePoints(p.points)}
              className="text-xs px-2 py-0.5 rounded bg-white border border-[#E6D8DF] text-[#231C20] hover:border-[#D65D80] hover:text-[#D65D80] transition-colors cursor-pointer"
            >
              {p.name}
            </button>
          ))}
          <span className="text-[#E6D8DF]">|</span>
          <button
            type="button"
            onClick={handleUndo}
            disabled={points.length === 0}
            className="text-xs text-[#756770] hover:text-[#231C20] disabled:opacity-40 flex items-center gap-1 cursor-pointer"
            title="Undo last point"
          >
            <Undo2 className="w-3.5 h-3.5" />
            Undo
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-[#756770] hover:text-[#E03137] flex items-center gap-0.5 cursor-pointer"
            title="Clear canvas"
          >
            <RotateCcw className="w-3 h-3" />
            Clear
          </button>
        </div>
      </div>

      {/* Interactive Drawing Canvas */}
      <div
        className="relative rounded-lg border border-[#E6D8DF] overflow-hidden select-none shadow-xs"
        style={{ height: `${height}px` }}
      >
        {/* Real Aerial / Satellite Imagery or Topo Layer */}
        {mapLayer === 'satellite' ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80")',
              filter: 'brightness(0.85) contrast(1.1)',
            }}
          >
            <div className="absolute inset-0 bg-black/20" />
          </div>
        ) : mapLayer === 'streets' ? (
          <div
            className="absolute inset-0 bg-[#EBF2EA] bg-cover bg-center"
            style={{
              backgroundImage:
                'radial-gradient(#D6E5D4 1.5px, transparent 1.5px), radial-gradient(#CCDDC8 1.5px, #EBF2EA 1.5px)',
              backgroundSize: '30px 30px',
              backgroundPosition: '0 0, 15px 15px',
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-[#FAF5F7]" />
        )}

        {/* SVG Drawing Layer */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className={`relative z-10 w-full h-full ${
            draggingIndex !== null ? 'cursor-grabbing' : 'cursor-crosshair'
          }`}
          onClick={handleSvgClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Grid lines for precision */}
          {mapLayer === 'grid' && (
            <>
              <defs>
                <pattern id="editorGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#F0E2EA" strokeWidth="0.75" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#editorGrid)" />
            </>
          )}

          {/* Polygon Fill and Boundary Stroke */}
          {polygonPath && (
            <path
              d={polygonPath + ' Z'}
              fill={mapLayer === 'satellite' ? 'rgba(214, 93, 128, 0.32)' : 'rgba(214, 93, 128, 0.18)'}
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
          )}
          {polygonPath && (
            <path
              d={polygonPath + ' Z'}
              fill="none"
              stroke="#D65D80"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
          )}

          {/* Connecting dashed construction line if polygon is open */}
          {svgCoords.length >= 2 && (
            <line
              x1={svgCoords[svgCoords.length - 1][0]}
              y1={svgCoords[svgCoords.length - 1][1]}
              x2={svgCoords[0][0]}
              y2={svgCoords[0][1]}
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.8"
            />
          )}

          {/* Big, easy-to-grab interactive vertex handles */}
          {svgCoords.map((pt, idx) => {
            const isDragging = draggingIndex === idx;
            const isHovered = hoveredIndex === idx;
            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Larger invisible hit circle for easy mouse click/drag */}
                <circle
                  cx={pt[0]}
                  cy={pt[1]}
                  r={14}
                  fill="transparent"
                  className="cursor-grab active:cursor-grabbing"
                  onMouseDown={(e) => handleVertexMouseDown(e, idx)}
                />
                {/* Visible handle */}
                <circle
                  cx={pt[0]}
                  cy={pt[1]}
                  r={isDragging ? 8 : isHovered ? 7 : 5.5}
                  fill="#FFFFFF"
                  stroke="#D65D80"
                  strokeWidth={isDragging ? 3.5 : 2.5}
                  className="transition-all"
                  style={{ filter: 'drop-shadow(0px 1px 3px rgba(0,0,0,0.35))' }}
                  onMouseDown={(e) => handleVertexMouseDown(e, idx)}
                />
                {/* Vertex Label */}
                <text
                  x={pt[0] + 9}
                  y={pt[1] - 9}
                  className="text-[10px] font-mono font-bold fill-white pointer-events-none select-none"
                  style={{
                    textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.9)',
                  }}
                >
                  {idx + 1}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Common-User Instructions Banner */}
        <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-xs text-[#231C20] px-3 py-1.5 rounded-md border border-[#F0E2EA] shadow-xs text-xs font-medium flex items-center gap-2">
            <MousePointerClick className="w-3.5 h-3.5 text-[#D65D80]" />
            <span>Click map to add point • Drag circles to move boundary</span>
          </div>
        </div>

        {/* Floating Measurements Overlay (Area & Perimeter) */}
        <div className="absolute bottom-2.5 left-2.5 z-20 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-md border border-[#F0E2EA] shadow-xs text-xs text-[#231C20] flex items-center gap-3 font-mono">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#D65D80]" />
              <span>Area: <strong>{area} ha</strong></span>
            </span>
            <span>Perimeter: <strong>{perimeter} km</strong></span>
          </div>
        </div>

        {/* Close Polygon button floating on map */}
        {points.length >= 3 && (
          <div className="absolute bottom-2.5 right-2.5 z-20">
            <button
              type="button"
              onClick={handleClosePolygon}
              className="bg-white hover:bg-[#FAF0F4] text-[#D65D80] px-3 py-1.5 rounded-md border border-[#D65D80] text-xs font-medium flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-transform"
            >
              <Check className="w-3.5 h-3.5" />
              Close shape
            </button>
          </div>
        )}
      </div>

      {/* Live Coordinates Editor Section: Updates synchronously in real time */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="polygon-live-coords-input" className="block text-xs font-medium text-[#231C20]">
            Edit coordinates [longitude, latitude]
          </label>
          <span className="text-[11px] text-[#756770] font-mono">
            {points.length} coordinate points • Live sync
          </span>
        </div>
        <textarea
          id="polygon-live-coords-input"
          rows={5}
          value={coordsText}
          onChange={handleTextChange}
          className={`w-full font-mono text-xs px-3 py-2 bg-[#FAF6F8] rounded border outline-none transition-colors ${
            coordError
              ? 'border-[#E03137] focus:border-[#E03137]'
              : 'border-[#E6D8DF] focus:border-[#D65D80]'
          }`}
        />
        {coordError && (
          <p className="text-xs text-[#E03137] mt-1 font-medium">{coordError}</p>
        )}
      </div>
    </div>
  );
}
