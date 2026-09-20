import { useState, useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair, Layers, Edit3, MapPin } from 'lucide-react';

// Approximate area in hectares
function calculateArea(coords) {
  if (!coords || coords.length < 3) return '0.0';
  let area = 0;
  const rad = Math.PI / 180;
  const R = 6378137;
  for (let i = 0; i < coords.length - 1; i++) {
    const p1 = coords[i];
    const p2 = coords[i + 1];
    area += (p2[0] - p1[0]) * rad * (2 + Math.sin(p1[1] * rad) + Math.sin(p2[1] * rad));
  }
  area = Math.abs((area * R * R) / 4);
  return (area / 10000).toFixed(1);
}

function calculatePerimeter(coords) {
  if (!coords || coords.length < 2) return '0.0';
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

export default function MapView({
  geometry,
  sites, // Optional array of sites for multi-site project map view
  height = 360,
  interactive = true,
  onOpenSite,
  onSelectSite,
  showControls = true,
  onEditPolygon,
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mapLayer, setMapLayer] = useState('satellite'); // 'satellite' | 'terrain' | 'grid'
  const [hoveredSiteId, setHoveredSiteId] = useState(null);

  // Normalized list of site geometries
  const sitesList = useMemo(() => {
    if (sites && Array.isArray(sites) && sites.length > 0) {
      return sites.map((s) => ({
        id: s.id,
        name: s.name,
        coordinates:
          s.geometry?.type === 'Polygon' && Array.isArray(s.geometry.coordinates)
            ? s.geometry.coordinates[0] || []
            : [],
      }));
    }
    if (geometry) {
      const coords =
        geometry.type === 'Polygon' && Array.isArray(geometry.coordinates)
          ? geometry.coordinates[0] || []
          : [];
      return [{ id: 'single', name: 'Site', coordinates: coords }];
    }
    return [];
  }, [sites, geometry]);

  // Aggregate all coordinates
  const allCoordinates = useMemo(() => {
    const all = [];
    sitesList.forEach((s) => {
      s.coordinates.forEach((pt) => all.push(pt));
    });
    return all;
  }, [sitesList]);

  // Compute bounding box
  const bounds = useMemo(() => {
    if (!allCoordinates.length) return null;
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;

    allCoordinates.forEach(([lng, lat]) => {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    });

    const lngDiff = Math.max(maxLng - minLng, 0.005);
    const latDiff = Math.max(maxLat - minLat, 0.005);

    return {
      minLng: minLng - lngDiff * 0.25,
      maxLng: maxLng + lngDiff * 0.25,
      minLat: minLat - latDiff * 0.25,
      maxLat: maxLat + latDiff * 0.25,
      centerLng: (minLng + maxLng) / 2,
      centerLat: (minLat + maxLat) / 2,
    };
  }, [allCoordinates]);

  // Project lat/lng to SVG space
  const svgWidth = 800;
  const svgHeight = 500;

  // Process site SVG projections
  const projectedSites = useMemo(() => {
    if (!bounds || !sitesList.length) return [];
    const { minLng, maxLng, minLat, maxLat } = bounds;
    const lngSpan = maxLng - minLng || 1;
    const latSpan = maxLat - minLat || 1;

    return sitesList.map((s) => {
      const ptsString = s.coordinates
        .map(([lng, lat]) => {
          const x = ((lng - minLng) / lngSpan) * svgWidth;
          const y = svgHeight - ((lat - minLat) / latSpan) * svgHeight;
          return `${x},${y}`;
        })
        .join(' ');

      // Compute centroid
      let sumX = 0, sumY = 0;
      s.coordinates.forEach(([lng, lat]) => {
        sumX += ((lng - minLng) / lngSpan) * svgWidth;
        sumY += svgHeight - ((lat - minLat) / latSpan) * svgHeight;
      });
      const count = s.coordinates.length || 1;
      const centroid = { x: sumX / count, y: sumY / count };

      return {
        id: s.id,
        name: s.name,
        ptsString,
        centroid,
        areaHa: calculateArea(s.coordinates),
        perimeterKm: calculatePerimeter(s.coordinates),
        vertexPoints: s.coordinates.map(([lng, lat], idx) => ({
          x: ((lng - minLng) / lngSpan) * svgWidth,
          y: svgHeight - ((lat - minLat) / latSpan) * svgHeight,
          lng,
          lat,
          id: idx,
        })),
      };
    });
  }, [sitesList, bounds]);

  const handleZoomIn = (e) => {
    e?.stopPropagation();
    setZoom((prev) => Math.min(prev + 0.35, 3.5));
  };

  const handleZoomOut = (e) => {
    e?.stopPropagation();
    setZoom((prev) => Math.max(prev - 0.35, 0.6));
  };

  const handleReset = (e) => {
    e?.stopPropagation();
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (!interactive) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !interactive) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      id="map-container"
      className="relative w-full overflow-hidden rounded-lg bg-[#FAF5F7] border border-[#DEC8D4] select-none shadow-xs"
      style={{ height: `${height}px` }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Basemap Imagery / Background */}
      {mapLayer === 'satellite' ? (
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80")',
            filter: 'brightness(0.85) contrast(1.1)',
          }}
        >
          <div className="absolute inset-0 bg-black/15" />
        </div>
      ) : mapLayer === 'terrain' ? (
        <div
          className="absolute inset-0 bg-[#EBF2EA] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(#D6E5D4 1.5px, transparent 1.5px), radial-gradient(#CCDDC8 1.5px, #EBF2EA 1.5px)',
            backgroundSize: '30px 30px',
            backgroundPosition: '0 0, 15px 15px',
          }}
        />
      ) : (
        <div 
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(to right, #EEDEE5 1px, transparent 1px),
              linear-gradient(to bottom, #EEDEE5 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      )}

      {/* SVG Canvas with Zoom & Pan */}
      <svg
        className={`w-full h-full ${interactive ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} transition-transform duration-75 ease-out`}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
        }}
        onClick={onOpenSite}
      >
        <defs>
          <linearGradient id="rosePolygonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D65D80" stopOpacity={mapLayer === 'satellite' ? 0.38 : 0.22} />
            <stop offset="100%" stopColor="#C44E72" stopOpacity={mapLayer === 'satellite' ? 0.28 : 0.12} />
          </linearGradient>
        </defs>

        {/* Center Origin Crosshair */}
        <g stroke={mapLayer === 'satellite' ? 'rgba(255,255,255,0.4)' : '#E8D5DE'} strokeWidth="1" strokeDasharray="3 3">
          <line x1="0" y1={svgHeight / 2} x2={svgWidth} y2={svgHeight / 2} />
          <line x1={svgWidth / 2} y1="0" x2={svgWidth / 2} y2={svgHeight} />
        </g>

        {/* Render Sites Polygons */}
        {projectedSites.map((ps) => {
          const isHovered = hoveredSiteId === ps.id;
          return (
            <g
              key={ps.id}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredSiteId(ps.id)}
              onMouseLeave={() => setHoveredSiteId(null)}
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectSite) {
                  const matched = sites?.find((s) => s.id === ps.id);
                  if (matched) onSelectSite(matched);
                } else if (onOpenSite) {
                  onOpenSite();
                }
              }}
            >
              {/* White Back-Glow */}
              <polygon
                points={ps.ptsString}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={isHovered ? '6' : '4.5'}
                strokeLinejoin="round"
                opacity={isHovered ? '0.95' : '0.8'}
              />
              {/* Rose Fill & Stroke */}
              <polygon
                points={ps.ptsString}
                fill="url(#rosePolygonGrad)"
                stroke="#D65D80"
                strokeWidth={isHovered ? '3.5' : '2.5'}
                strokeLinejoin="round"
              />

              {/* Vertex Nodes for single site view */}
              {projectedSites.length === 1 &&
                ps.vertexPoints.map((pt) => (
                  <g key={pt.id} transform={`translate(${pt.x}, ${pt.y})`}>
                    <circle r="7" fill="#FFFFFF" stroke="#D65D80" strokeWidth="2.5" />
                    <circle r="3" fill="#D65D80" />
                  </g>
                ))}

              {/* Centroid Tag for Multi-Site Views */}
              {projectedSites.length > 1 && (
                <g transform={`translate(${ps.centroid.x}, ${ps.centroid.y})`}>
                  <rect
                    x="-55"
                    y="-22"
                    width="110"
                    height="20"
                    rx="10"
                    fill="#FFFFFF"
                    stroke="#D65D80"
                    strokeWidth="1.5"
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))"
                  />
                  <text
                    x="0"
                    y="-8"
                    textAnchor="middle"
                    fill="#231C20"
                    fontSize="10"
                    fontWeight="600"
                    fontFamily="sans-serif"
                  >
                    {ps.name}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Top Left Layer Switcher */}
      {showControls && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-white/95 backdrop-blur-xs p-1 rounded-md border border-[#DEC8D4] shadow-xs">
          <span className="text-[11px] text-[#756770] px-1 font-medium flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#D65D80]" />
          </span>
          {[
            { id: 'satellite', label: 'Satellite' },
            { id: 'terrain', label: 'Terrain' },
            { id: 'grid', label: 'Grid' },
          ].map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMapLayer(l.id);
              }}
              className={`text-[11px] px-2 py-0.5 rounded transition-colors cursor-pointer ${
                mapLayer === l.id
                  ? 'bg-[#FDF2F6] text-[#D65D80] font-medium border border-[#EBD0DC]'
                  : 'text-[#756770] hover:text-[#231C20]'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}

      {/* Coordinates & Metrics Overlay Footer */}
      {bounds && (
        <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2 text-xs text-[#231C20] pointer-events-none font-mono">
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md border border-[#DEC8D4] shadow-xs">
            <Crosshair className="w-3.5 h-3.5 text-[#D65D80]" />
            <span>
              {bounds.centerLat.toFixed(4)}°N, {bounds.centerLng.toFixed(4)}°E
            </span>
            {projectedSites.length === 1 && (
              <>
                <span className="text-[#E6D8DF]">|</span>
                <span className="text-[#D65D80] font-semibold">{projectedSites[0].areaHa} ha</span>
                <span className="text-[#756770]">({projectedSites[0].perimeterKm} km)</span>
              </>
            )}
            {projectedSites.length > 1 && (
              <>
                <span className="text-[#E6D8DF]">|</span>
                <span className="text-[#D65D80] font-semibold">{projectedSites.length} sites mapped</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Map Controls */}
      {showControls && (
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          {onEditPolygon && (
            <button
              id="map-edit-trigger"
              type="button"
              title="Edit map"
              onClick={(e) => {
                e.stopPropagation();
                onEditPolygon();
              }}
              className="w-8 h-8 flex items-center justify-center bg-white text-[#D65D80] rounded border border-[#DEC8D4] hover:bg-[#FDF2F6] hover:border-[#D65D80] transition-colors shadow-xs cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          <button
            id="map-zoom-in"
            type="button"
            title="Zoom in"
            onClick={handleZoomIn}
            className="w-8 h-8 flex items-center justify-center bg-white text-[#231C20] rounded border border-[#DEC8D4] hover:bg-[#FDF2F6] hover:text-[#D65D80] hover:border-[#D65D80] transition-colors shadow-xs cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            id="map-zoom-out"
            type="button"
            title="Zoom out"
            onClick={handleZoomOut}
            className="w-8 h-8 flex items-center justify-center bg-white text-[#231C20] rounded border border-[#DEC8D4] hover:bg-[#FDF2F6] hover:text-[#D65D80] hover:border-[#D65D80] transition-colors shadow-xs cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            id="map-reset-view"
            type="button"
            title="Reset view"
            onClick={handleReset}
            className="w-8 h-8 flex items-center justify-center bg-white text-[#231C20] rounded border border-[#DEC8D4] hover:bg-[#FDF2F6] hover:text-[#D65D80] hover:border-[#D65D80] transition-colors shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
