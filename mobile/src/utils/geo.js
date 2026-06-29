const toRadians = (degrees) => degrees * (Math.PI / 180);

// Haversine distance in kilometres between two { x, y } lat/lng points, or null
// when either point is missing. Lives here so any screen can rank by distance.
export const distanceInKm = (from, to) => {
  if (!from || !to) return null;

  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(to.x - from.x);
  const longitudeDelta = toRadians(to.y - from.y);
  const haversine = (
    Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(toRadians(from.x)) * Math.cos(toRadians(to.x)) * Math.sin(longitudeDelta / 2) ** 2
  );

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};
