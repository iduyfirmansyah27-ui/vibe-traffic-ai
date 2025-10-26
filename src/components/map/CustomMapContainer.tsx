import { MapContainer as LeafletMapContainer } from 'react-leaflet';
import type { MapContainerProps } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Create a type that makes center and zoom required
interface CustomMapContainerProps extends Omit<MapContainerProps, 'center' | 'zoom' | 'children'> {
  center: [number, number];
  zoom: number;
  children: React.ReactNode;
}

export function CustomMapContainer({ 
  center, 
  zoom, 
  children, 
  ...props 
}: CustomMapContainerProps) {
  // Create a new props object that includes center and zoom at the root level
  const containerProps = {
    ...props,
    center,
    zoom,
    style: { height: '100%', width: '100%' },
    zoomControl: false,
    attributionControl: false
  };

  return (
    // @ts-ignore - Ignore TypeScript errors for now
    <LeafletMapContainer {...containerProps}>
      {children}
    </LeafletMapContainer>
  );
}

export default CustomMapContainer;
