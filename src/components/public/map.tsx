'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Palermo, Buenos Aires — actualizar con dirección real
const COORDS: [number, number] = [-34.5883, -58.4166]

// SVG pin con color de marca — evita el problema de rutas de imagen de Webpack
const MARKER_ICON = L.divIcon({
  className: '',
  html: `<svg width="28" height="40" viewBox="0 0 28 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26S28 24.5 28 14C28 6.268 21.732 0 14 0z" fill="#B85C38"/>
    <circle cx="14" cy="14" r="6" fill="white" fill-opacity="0.9"/>
  </svg>`,
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -44],
})

export function Map({ className }: { className?: string }) {
  return (
    <MapContainer
      center={COORDS}
      zoom={15}
      scrollWheelZoom={false}
      className={className}
      style={{ height: '100%', width: '100%' }}
      aria-label="Mapa de ubicación del consultorio"
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={COORDS} icon={MARKER_ICON}>
        <Popup>
          <strong style={{ fontFamily: 'sans-serif', fontSize: '13px' }}>Therapy Kinesiología</strong>
          <br />
          <span style={{ fontFamily: 'sans-serif', fontSize: '12px', color: '#78716C' }}>
            Buenos Aires, Argentina
          </span>
        </Popup>
      </Marker>
    </MapContainer>
  )
}
