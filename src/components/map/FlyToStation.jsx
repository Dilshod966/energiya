import { useEffect } from "react";
import { useMap } from "react-leaflet";

/**
 * Invisible component that lives inside <MapContainer>.
 * Flies the map to the selected station whenever it changes.
 */
const DEFAULT_CENTER = [41.35, 60.58];
const DEFAULT_ZOOM = 12;

export default function FlyToStation({ station, markerRefs }) {
  const map = useMap();

  useEffect(() => {
    if (station) {
      map.flyTo([station.lat, station.lng], 17, { duration: 1.2 });
      // Animatsiya tugagach tegishli marker popupini ochish
      map.once("moveend", () => {
        const marker = markerRefs?.current?.[station.id];
        if (marker) marker.openPopup();
      });
    } else {
      map.closePopup();
      map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 1.2 });
    }
  }, [station, map]);

  return null;
}
