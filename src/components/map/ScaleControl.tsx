import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export function ScaleControl() {
  const map = useMap();
  
  useEffect(() => {
    const control = L.control.scale({ 
      metric: true, 
      imperial: false, 
      position: 'bottomleft' 
    });
    
    control.addTo(map);
    
    return () => { 
      try { 
        control.remove(); 
      } catch { 
        // Ignore error if control is already removed
      } 
    };
  }, [map]);
  
  return null;
}

export default ScaleControl;
