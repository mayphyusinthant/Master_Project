import { ImageOverlay, MapContainer } from 'react-leaflet';

function Map({ zoom, map }) {
  return (
    <MapContainer
      center={[0, 0]} // Centered at (0,0) since it's an indoor map
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height: '500px', width: '90%', border: '2px solid black' }}
    >
      {/* Overlay the SVG Image on Leaflet */}
      <ImageOverlay
        url={map}
        bounds={[
          [-50, -50], // Top-left
          [50, 50], // Bottom-right
        ]}
      />
    </MapContainer>
  );
}

export default Map;
