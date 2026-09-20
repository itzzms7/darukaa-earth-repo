import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair, Layers, Edit3, Maximize2 } from 'lucide-react';
import mapboxgl, {
  getMapStyle,
  calculateAreaHectares,
  calculatePerimeterKm,
  getCoordinatesBounds,
  BASEMAP_STYLES,
} from '../utils/mapbox.js';

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
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const popupRef = useRef(null);
  const [activeLayer, setActiveLayer] = useState('satellite');
  const [currentCoords, setCurrentCoords] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Normalize site geometries
  const sitesList = useMemo(() => {
    if (sites && Array.isArray(sites) && sites.length > 0) {
      return sites
        .filter((s) => s.geometry?.type === 'Polygon' && Array.isArray(s.geometry.coordinates))
        .map((s) => ({
          id: s.id,
          name: s.name,
          rawSite: s,
          coordinates: s.geometry.coordinates,
          firstRing: s.geometry.coordinates[0] || [],
          areaHa: calculateAreaHectares(s.geometry.coordinates[0]),
          perimeterKm: calculatePerimeterKm(s.geometry.coordinates[0]),
        }));
    }
    if (geometry?.type === 'Polygon' && Array.isArray(geometry.coordinates)) {
      return [
        {
          id: 'single-site',
          name: 'Site Parcel',
          rawSite: null,
          coordinates: geometry.coordinates,
          firstRing: geometry.coordinates[0] || [],
          areaHa: calculateAreaHectares(geometry.coordinates[0]),
          perimeterKm: calculatePerimeterKm(geometry.coordinates[0]),
        },
      ];
    }
    return [];
  }, [sites, geometry]);

  // Aggregate all coordinates for bounds calculation
  const allCoords = useMemo(() => {
    const list = [];
    sitesList.forEach((s) => {
      s.firstRing.forEach((pt) => {
        if (Array.isArray(pt) && pt.length >= 2) list.push(pt);
      });
    });
    return list;
  }, [sitesList]);

  // GeoJSON FeatureCollection for polygons
  const geojsonData = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: sitesList.map((s) => ({
        type: 'Feature',
        id: s.id,
        properties: {
          id: s.id,
          name: s.name,
          areaHa: s.areaHa,
          perimeterKm: s.perimeterKm,
        },
        geometry: {
          type: 'Polygon',
          coordinates: s.coordinates,
        },
      })),
    };
  }, [sitesList]);

  // Vertices GeoJSON (prominent corner pins for all polygon boundaries)
  const verticesGeojson = useMemo(() => {
    const features = [];
    sitesList.forEach((s) => {
      if (!s.firstRing) return;
      s.firstRing.forEach(([lng, lat], idx) => {
        features.push({
          type: 'Feature',
          properties: { index: idx + 1, siteId: s.id },
          geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
        });
      });
    });
    return {
      type: 'FeatureCollection',
      features,
    };
  }, [sitesList]);

  // Safe layer and source updater
  const updateMapSourcesAndLayers = useCallback((map) => {
    if (!map || !map.isStyleLoaded()) return;

    // 1. Sites Polygon Source
    const source = map.getSource('sites-source');
    if (source) {
      source.setData(geojsonData);
    } else {
      map.addSource('sites-source', {
        type: 'geojson',
        data: geojsonData,
      });

      // Fill layer
      map.addLayer({
        id: 'sites-fill',
        type: 'fill',
        source: 'sites-source',
        paint: {
          'fill-color': '#3B82F6',
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.38,
            0.22,
          ],
        },
      });

      // 1. Crisp dark outer casing halo for 100% contrast against any background
      map.addLayer({
        id: 'sites-outline-casing',
        type: 'line',
        source: 'sites-source',
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

      // 2. Bold solid primary boundary border
      map.addLayer({
        id: 'sites-outline',
        type: 'line',
        source: 'sites-source',
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

    // 2. Vertices corner nodes for crisp geometric boundary marking
    const verticesSource = map.getSource('vertices-source');
    if (verticesSource) {
      verticesSource.setData(verticesGeojson);
    } else if (verticesGeojson.features.length > 0) {
      map.addSource('vertices-source', {
        type: 'geojson',
        data: verticesGeojson,
      });

      map.addLayer({
        id: 'vertices-halo',
        type: 'circle',
        source: 'vertices-source',
        paint: {
          'circle-radius': 5.5,
          'circle-color': '#0F1117',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#38BDF8',
        },
      });

      map.addLayer({
        id: 'vertices-center',
        type: 'circle',
        source: 'vertices-source',
        paint: {
          'circle-radius': 2.5,
          'circle-color': '#38BDF8',
        },
      });
    }

    // Crucial: Explicitly move polygon boundary layers to the very top of the map layer stack
    try {
      if (map.getLayer('sites-fill')) map.moveLayer('sites-fill');
      if (map.getLayer('sites-outline-casing')) map.moveLayer('sites-outline-casing');
      if (map.getLayer('sites-outline')) map.moveLayer('sites-outline');
      if (map.getLayer('vertices-halo')) map.moveLayer('vertices-halo');
      if (map.getLayer('vertices-center')) map.moveLayer('vertices-center');
    } catch {
      // Ignore if layers in transition
    }
  }, [geojsonData, verticesGeojson]);

  // Projected screen coordinates for direct SVG overlay strictly OVER the map
  const [projectedSites, setProjectedSites] = useState([]);

  const syncSvgProjections = useCallback(() => {
    const map = mapRef.current;
    if (!map || sitesList.length === 0) {
      setProjectedSites([]);
      return;
    }
    const computed = sitesList
      .map((s) => {
        if (!s.firstRing || s.firstRing.length < 2) return null;
        const pts = s.firstRing
          .map(([lng, lat]) => {
            try {
              const p = map.project([lng, lat]);
              return { x: p.x, y: p.y };
            } catch {
              return null;
            }
          })
          .filter(Boolean);
        if (pts.length < 2) return null;
        const d =
          pts
            .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
            .join(' ') + ' Z';
        return { id: s.id, d, points: pts };
      })
      .filter(Boolean);
    setProjectedSites(computed);
  }, [sitesList]);

  // Fit map to coordinates bounding box
  const fitToCurrentBounds = useCallback((map, animate = true) => {
    if (!map || allCoords.length === 0) return;
    const bounds = getCoordinatesBounds(allCoords);
    if (!bounds) return;

    try {
      map.fitBounds(bounds, {
        padding: { top: 40, bottom: 40, left: 40, right: 40 },
        maxZoom: 16,
        duration: animate ? 1000 : 0,
      });
    } catch {
      // Fallback
      map.setCenter(bounds[0]);
    }
  }, [allCoords]);

  // Initialize Mapbox GL JS map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCenter = allCoords.length > 0 ? allCoords[0] : [76.680, 11.460];
    const initialBounds = getCoordinatesBounds(allCoords);

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: getMapStyle(activeLayer),
      center: initialCenter,
      zoom: 12,
      attributionControl: false,
      interactive: interactive,
      cooperativeGestures: false,
    });

    mapRef.current = map;

    // Compact attribution
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

    map.on('load', () => {
      setMapLoaded(true);
      updateMapSourcesAndLayers(map);
      syncSvgProjections();
      if (initialBounds) {
        map.fitBounds(initialBounds, {
          padding: { top: 45, bottom: 45, left: 45, right: 45 },
          maxZoom: 16,
          duration: 0,
        });
      }
    });

    // Re-apply sources and layers whenever style changes
    map.on('style.load', () => {
      updateMapSourcesAndLayers(map);
      syncSvgProjections();
    });

    // Synchronize SVG boundary overlay with map camera
    map.on('move', syncSvgProjections);
    map.on('zoom', syncSvgProjections);
    map.on('resize', syncSvgProjections);
    map.on('render', syncSvgProjections);

    // Cursor coordinates tracker
    map.on('mousemove', (e) => {
      setCurrentCoords([Number(e.lngLat.lng.toFixed(5)), Number(e.lngLat.lat.toFixed(5))]);
    });

    // Interactive site click & hover handlers
    let hoveredFeatureId = null;

    map.on('mousemove', 'sites-fill', (e) => {
      if (!interactive) return;
      map.getCanvas().style.cursor = 'pointer';
      if (e.features.length > 0) {
        if (hoveredFeatureId !== null) {
          map.setFeatureState(
            { source: 'sites-source', id: hoveredFeatureId },
            { hover: false }
          );
        }
        hoveredFeatureId = e.features[0].id;
        map.setFeatureState(
          { source: 'sites-source', id: hoveredFeatureId },
          { hover: true }
        );
      }
    });

    map.on('mouseleave', 'sites-fill', () => {
      if (!interactive) return;
      map.getCanvas().style.cursor = '';
      if (hoveredFeatureId !== null) {
        map.setFeatureState(
          { source: 'sites-source', id: hoveredFeatureId },
          { hover: false }
        );
      }
      hoveredFeatureId = null;
    });

    map.on('click', 'sites-fill', (e) => {
      if (!interactive) return;
      if (!e.features.length) return;
      const feat = e.features[0];
      const siteId = feat.properties.id;

      if (onSelectSite && sites) {
        const found = sites.find((s) => String(s.id) === String(siteId));
        if (found) {
          onSelectSite(found);
          return;
        }
      }

      if (onOpenSite) {
        onOpenSite();
      }
    });

    // Resize observer to maintain canvas aspect ratio smoothly without thrashing
    let resizeTimer = null;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Ignore zero or near-zero heights during accordion animations
        if (entry.contentRect.height < 40) return;
      }
      if (resizeTimer) cancelAnimationFrame(resizeTimer);
      resizeTimer = requestAnimationFrame(() => {
        if (mapRef.current) {
          mapRef.current.resize();
        }
      });
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      if (resizeTimer) cancelAnimationFrame(resizeTimer);
      resizeObserver.disconnect();
      if (popupRef.current) popupRef.current.remove();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []); // Mount once

  // Update layers when geojsonData changes
  useEffect(() => {
    if (mapRef.current && mapLoaded) {
      updateMapSourcesAndLayers(mapRef.current);
      syncSvgProjections();
      fitToCurrentBounds(mapRef.current, true);
    }
  }, [geojsonData, verticesGeojson, mapLoaded, updateMapSourcesAndLayers, syncSvgProjections, fitToCurrentBounds]);

  // Update HTML Markers for multi-site overview
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Clean old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (sitesList.length > 1) {
      sitesList.forEach((site) => {
        const ring = site.firstRing;
        if (!ring || ring.length < 3) return;

        // Centroid
        let sumLng = 0;
        let sumLat = 0;
        ring.forEach(([lng, lat]) => {
          sumLng += lng;
          sumLat += lat;
        });
        const center = [sumLng / ring.length, sumLat / ring.length];

        const el = document.createElement('div');
        el.className = 'site-mapbox-marker group cursor-pointer';
        el.innerHTML = `
          <div class="px-2.5 py-1 rounded-full bg-white/95 text-[#231C20] border border-[#D65D80] shadow-md flex items-center gap-1.5 text-[11px] font-semibold tracking-tight group-hover:scale-105 group-hover:bg-[#FAF0F4] transition-all">
            <span class="w-2 h-2 rounded-full bg-[#D65D80]"></span>
            <span>${site.name}</span>
            <span class="text-[#756770] font-normal text-[10px]">(${site.areaHa} ha)</span>
          </div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          if (onSelectSite && site.rawSite) {
            onSelectSite(site.rawSite);
          } else if (onOpenSite) {
            onOpenSite();
          }
        });

        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat(center)
          .addTo(map);

        markersRef.current.push(marker);
      });
    }
  }, [sitesList, mapLoaded, onSelectSite, onOpenSite]);

  // Change Mapbox layer style
  const handleLayerChange = (layerKey) => {
    setActiveLayer(layerKey);
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(getMapStyle(layerKey));
  };

  const handleZoomIn = (e) => {
    e?.stopPropagation();
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = (e) => {
    e?.stopPropagation();
    mapRef.current?.zoomOut();
  };

  const handleReset = (e) => {
    e?.stopPropagation();
    fitToCurrentBounds(mapRef.current, true);
  };

  // Compute total project area
  const totalAreaHa = useMemo(() => {
    return sitesList.reduce((sum, s) => sum + parseFloat(s.areaHa || 0), 0).toFixed(1);
  }, [sitesList]);

  return (
    <div
      id="map-container"
      className="relative w-full overflow-hidden rounded-lg bg-transparent border border-[#2D3139]/70 select-none shadow-xs group"
      style={{ height: `${height}px`, contain: 'paint layout', transform: 'translateZ(0)' }}
    >
      {/* Real Mapbox GL JS Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Direct SVG Polygon Boundary Overlay (GUARANTEED 100% OVER THE MAP CANVAS) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        style={{ zIndex: 4 }}
      >
        {projectedSites.map((site) => (
          <g key={site.id}>
            {/* Semi-transparent Polygon Fill */}
            <path d={site.d} fill="#3B82F6" fillOpacity={0.25} />

            {/* Crisp High-Contrast Outer Dark Halo Casing */}
            <path
              d={site.d}
              stroke="#0F1117"
              strokeWidth={7}
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="none"
              opacity={0.96}
            />

            {/* Bold Vivid Cyan/Sky Primary Boundary Stroke */}
            <path
              d={site.d}
              stroke="#38BDF8"
              strokeWidth={3.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="none"
            />

            {/* High-visibility corner vertex nodes */}
            {site.points.map((pt, pIdx) => (
              <g key={pIdx}>
                <circle cx={pt.x} cy={pt.y} r={5.5} fill="#0F1117" stroke="#38BDF8" strokeWidth={2} />
                <circle cx={pt.x} cy={pt.y} r={2.5} fill="#38BDF8" />
              </g>
            ))}
          </g>
        ))}
      </svg>

      {/* Top Left Layer Switcher */}
      {showControls && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-black/75 backdrop-blur-xl p-1 rounded-xl border border-[#2D3139]/80 shadow-2xl stitch-card-shadow">
          <span className="text-[11px] text-[#9CA3AF] px-1.5 font-medium flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
          </span>
          {Object.values(BASEMAP_STYLES).map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleLayerChange(l.id);
              }}
              className={`text-[11px] px-2.5 py-1 rounded-lg transition-all font-medium cursor-pointer ${
                activeLayer === l.id
                  ? 'bg-black/90 text-blue-400 border border-blue-500/40 shadow-xs'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-white/[0.08]'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}

      {/* Real Coordinates & Telemetry Floating Bar */}
      <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2 text-xs text-[#F3F4F6] pointer-events-none font-mono z-10">
        <div className="flex items-center gap-2 bg-black/75 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-[#2D3139]/80 shadow-2xl stitch-card-shadow">
          <Crosshair className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[#F3F4F6]">
            {currentCoords
              ? `${currentCoords[1]}°N, ${currentCoords[0]}°E`
              : allCoords.length > 0
              ? `${allCoords[0][1]}°N, ${allCoords[0][0]}°E`
              : 'WGS 84'}
          </span>
          {sitesList.length === 1 && (
            <>
              <span className="text-[#2D3139]">|</span>
              <span className="text-blue-400 font-semibold">{sitesList[0].areaHa} ha</span>
              <span className="text-[#9CA3AF]">({sitesList[0].perimeterKm} km)</span>
            </>
          )}
          {sitesList.length > 1 && (
            <>
              <span className="text-[#2D3139]">|</span>
              <span className="text-blue-400 font-semibold">{totalAreaHa} ha total</span>
              <span className="text-[#9CA3AF]">({sitesList.length} parcels)</span>
            </>
          )}
        </div>
      </div>

      {/* Map Controls */}
      {showControls && (
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          {onEditPolygon && (
            <button
              id="map-edit-trigger"
              type="button"
              title="Edit parcel boundary"
              onClick={(e) => {
                e.stopPropagation();
                onEditPolygon();
              }}
              className="w-8 h-8 flex items-center justify-center bg-black/75 backdrop-blur-xl text-blue-400 rounded-xl border border-[#2D3139]/80 hover:bg-white/[0.08] hover:border-blue-500/50 hover:text-blue-300 transition-all shadow-2xl stitch-card-shadow cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          <button
            id="map-zoom-in"
            type="button"
            title="Zoom in"
            onClick={handleZoomIn}
            className="w-8 h-8 flex items-center justify-center bg-black/75 backdrop-blur-xl text-[#F3F4F6] rounded-xl border border-[#2D3139]/80 hover:bg-white/[0.08] hover:text-blue-400 hover:border-blue-500/50 transition-all shadow-2xl stitch-card-shadow cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            id="map-zoom-out"
            type="button"
            title="Zoom out"
            onClick={handleZoomOut}
            className="w-8 h-8 flex items-center justify-center bg-black/75 backdrop-blur-xl text-[#F3F4F6] rounded-xl border border-[#2D3139]/80 hover:bg-white/[0.08] hover:text-blue-400 hover:border-blue-500/50 transition-all shadow-2xl stitch-card-shadow cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            id="map-reset-view"
            type="button"
            title="Fit to bounds"
            onClick={handleReset}
            className="w-8 h-8 flex items-center justify-center bg-black/75 backdrop-blur-xl text-[#F3F4F6] rounded-xl border border-[#2D3139]/80 hover:bg-white/[0.08] hover:text-blue-400 hover:border-blue-500/50 transition-all shadow-2xl stitch-card-shadow cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
