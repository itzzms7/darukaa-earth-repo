import * as maplibregl from 'maplibre-gl';

export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

// High-fidelity basemap styles (Open & Esri raster tiles - zero token needed)
export const BASEMAP_STYLES = {
  dark: {
    id: 'dark',
    label: 'Dark',
    style: {
      version: 8,
      name: 'Esri Dark Canvas',
      sources: {
        'esri-dark-base': {
          type: 'raster',
          tiles: [
            'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          maxzoom: 19,
          attribution: 'Esri, Garmin, &copy; OpenStreetMap contributors',
        },
        'esri-dark-ref': {
          type: 'raster',
          tiles: [
            'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          maxzoom: 19,
          attribution: '',
        },
      },
      layers: [
        {
          id: 'esri-dark-base-layer',
          type: 'raster',
          source: 'esri-dark-base',
          minzoom: 0,
          maxzoom: 22,
        },
        {
          id: 'esri-dark-ref-layer',
          type: 'raster',
          source: 'esri-dark-ref',
          minzoom: 0,
          maxzoom: 22,
        },
      ],
    },
    mapboxStyle: 'mapbox://styles/mapbox/dark-v11',
  },
  satellite: {
    id: 'satellite',
    label: 'Satellite',
    style: {
      version: 8,
      name: 'Satellite Aerial',
      sources: {
        'esri-satellite': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          maxzoom: 19,
          attribution: 'Esri, Maxar, Earthstar Geographics',
        },
      },
      layers: [
        {
          id: 'esri-satellite-layer',
          type: 'raster',
          source: 'esri-satellite',
          minzoom: 0,
          maxzoom: 22,
        },
      ],
    },
    mapboxStyle: 'mapbox://styles/mapbox/satellite-streets-v12',
  },
  terrain: {
    id: 'terrain',
    label: 'Terrain',
    style: {
      version: 8,
      name: 'World Topo',
      sources: {
        'esri-topo': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          maxzoom: 19,
          attribution: 'Esri, HERE, Garmin, Intermap',
        },
      },
      layers: [
        {
          id: 'esri-topo-layer',
          type: 'raster',
          source: 'esri-topo',
          minzoom: 0,
          maxzoom: 22,
        },
      ],
    },
    mapboxStyle: 'mapbox://styles/mapbox/outdoors-v12',
  },
  streets: {
    id: 'streets',
    label: 'Streets',
    style: {
      version: 8,
      name: 'OpenStreetMap',
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: [
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
          maxzoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        },
      },
      layers: [
        {
          id: 'osm-layer',
          type: 'raster',
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },
    mapboxStyle: 'mapbox://styles/mapbox/streets-v12',
  },
};

/**
 * Returns either the custom Mapbox Studio style URI or the high-fidelity raster style
 */
export function getMapStyle(layerType = 'satellite') {
  const target = BASEMAP_STYLES[layerType] || BASEMAP_STYLES.satellite;
  return target.style;
}

/**
 * Calculate approximate geodesic area in hectares for coordinates [ [lng, lat], ... ]
 */
export function calculateAreaHectares(coords) {
  if (!coords || coords.length < 3) return '0.0';
  let area = 0;
  const rad = Math.PI / 180;
  const R = 6378137; // Earth radius in meters
  for (let i = 0; i < coords.length - 1; i++) {
    const p1 = coords[i];
    const p2 = coords[i + 1];
    area += (p2[0] - p1[0]) * rad * (2 + Math.sin(p1[1] * rad) + Math.sin(p2[1] * rad));
  }
  area = Math.abs((area * R * R) / 4);
  return (area / 10000).toFixed(1);
}

/**
 * Calculate approximate perimeter in kilometers for coordinates [ [lng, lat], ... ]
 */
export function calculatePerimeterKm(coords) {
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

/**
 * Calculate bounding box [ [minLng, minLat], [maxLng, maxLat] ]
 */
export function getCoordinatesBounds(coords) {
  if (!coords || coords.length === 0) return null;
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  coords.forEach(([lng, lat]) => {
    if (typeof lng === 'number' && typeof lat === 'number') {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  });

  if (minLng === Infinity || minLat === Infinity) return null;

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

export { maplibregl, maplibregl as mapboxgl };
export default maplibregl;

