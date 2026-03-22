function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isValidPoint(point) {
  return (
    Array.isArray(point)
    && point.length === 2
    && Number.isFinite(toNumber(point[0]))
    && Number.isFinite(toNumber(point[1]))
  );
}

async function fetchRouteSegment(start, end, signal) {
  const [startLat, startLng] = start;
  const [endLat, endLng] = end;

  const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error('Routing service unavailable');

  const payload = await response.json();
  const route = payload?.routes?.[0];
  const coordinates = Array.isArray(route?.geometry?.coordinates)
    ? route.geometry.coordinates
    : [];

  if (!coordinates.length) throw new Error('No route found');

  return {
    points: coordinates.map(([lng, lat]) => [lat, lng]),
    distanceMeters: Number(route.distance || 0),
    durationSeconds: Number(route.duration || 0),
  };
}

export async function getShortestRoute(points, signal) {
  const validPoints = (Array.isArray(points) ? points : [])
    .filter(isValidPoint)
    .map(([lat, lng]) => [toNumber(lat), toNumber(lng)]);

  if (validPoints.length < 2) {
    return {
      path: validPoints,
      distanceKm: 0,
      durationMin: 0,
      usedRouting: false,
    };
  }

  try {
    let fullPath = [];
    let totalDistance = 0;
    let totalDuration = 0;

    for (let i = 0; i < validPoints.length - 1; i += 1) {
      const start = validPoints[i];
      const end = validPoints[i + 1];
      const segment = await fetchRouteSegment(start, end, signal);

      totalDistance += segment.distanceMeters;
      totalDuration += segment.durationSeconds;

      if (!fullPath.length) {
        fullPath = segment.points;
      } else {
        fullPath = [...fullPath, ...segment.points.slice(1)];
      }
    }

    return {
      path: fullPath,
      distanceKm: Number((totalDistance / 1000).toFixed(1)),
      durationMin: Math.max(1, Math.round(totalDuration / 60)),
      usedRouting: true,
    };
  } catch {
    return {
      path: [],
      distanceKm: 0,
      durationMin: 0,
      usedRouting: false,
    };
  }
}
