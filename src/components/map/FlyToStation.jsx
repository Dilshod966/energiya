import { useEffect } from "react";
import { useMap } from "react-leaflet";

/**
 * Invisible component that lives inside <MapContainer>.
 * Flies the map to the selected station whenever it changes.
 */
export default function FlyToStation({ station }) {
  const map = useMap();

  useEffect(() => {
    if (station) {
      map.flyTo([station.lat, station.lng], 14, { duration: 1.2 });
    }
  }, [station, map]);

  return null;
}
