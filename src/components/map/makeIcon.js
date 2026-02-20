import L from "leaflet";

/**
 * Creates a custom Leaflet DivIcon with an SVG pin shape.
 * @param {string} color  – hex color for the pin
 * @param {string} status – "active" | "maintenance" | "construction"
 */
export default function makeIcon(color, status) {
  const opacity =
    status === "active"       ? 1 :
    status === "maintenance"  ? 0.6 : 0.4;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <filter id="shadow">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.4"/>
      </filter>
      <path
        d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.06 27.94 0 18 0z"
        fill="${color}" opacity="${opacity}" filter="url(#shadow)"
      />
      <circle cx="18" cy="18" r="9" fill="white" opacity="0.9"/>
      <circle cx="18" cy="18" r="6"  fill="${color}" opacity="${opacity}"/>
    </svg>`;

  return L.divIcon({
    html:         svg,
    className:    "",
    iconSize:     [36, 44],
    iconAnchor:   [18, 44],
    popupAnchor:  [0, -44],
  });
}
