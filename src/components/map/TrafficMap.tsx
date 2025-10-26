import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapControls } from './MapControls';
import { TrafficIncident } from '../traffic/TrafficIncident';

type IncidentType = 'accident' | 'congestion' | 'hazard' | 'construction' | 'event';
type SeverityType = 'low' | 'medium' | 'high';
type LayerType = 'traffic' | 'incidents' | 'cameras';

interface TrafficIncidentData {
  id: string;
  type: IncidentType;
  title: string;
  description: string;
  location: string;
  timestamp: Date;
  severity: SeverityType;
}

export const TrafficMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [activeLayers, setActiveLayers] = useState<LayerType[]>(['traffic', 'incidents']);
  const [incidents, setIncidents] = useState<TrafficIncidentData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  const mockIncidents: TrafficIncidentData[] = [
    {
      id: '1',
      type: 'accident',
      title: 'Kecelakaan Lalu Lintas',
      description: 'Tabrakan antara mobil dan motor',
      location: 'Jalan Sudirman KM 12',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      severity: 'high',
    },
    {
      id: '2',
      type: 'congestion',
      title: 'Kemacetan Parah',
      description: 'Kemacetan sepanjang 2 km',
      location: 'Jalan Thamrin',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      severity: 'medium',
    },
    {
      id: '3',
      type: 'construction',
      title: 'Pembangunan Jalan',
      description: 'Pembangunan flyover',
      location: 'Jalan Gatot Subroto',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      severity: 'low',
    },
  ];

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // In a real app, you would initialize your map library here (e.g., Google Maps, Mapbox, Leaflet)
    // For now, we'll just set a loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIncidents(mockIncidents);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Handle layer toggling
  const handleToggleLayer = useCallback((layerId: LayerType) => {
    setActiveLayers((prev: LayerType[]) => 
      prev.includes(layerId)
        ? prev.filter((id: LayerType) => id !== layerId)
        : [...prev, layerId]
    );
  }, []);

  // Handle map controls
  const handleZoomIn = useCallback(() => {
    // Implement zoom in logic
    console.log('Zooming in');
  }, []);

  const handleZoomOut = useCallback(() => {
    // Implement zoom out logic
    console.log('Zooming out');
  }, []);

  const handleResetView = useCallback(() => {
    // Implement reset view logic
    console.log('Resetting view');
  }, []);

  const handleRefresh = useCallback(() => {
    // Implement refresh logic
    setIsLoading(true);
    setTimeout(() => {
      setIncidents([...mockIncidents]);
      setIsLoading(false);
    }, 500);
  }, []);

  // Handle incident dismissal
  const handleDismissIncident = useCallback((incidentId: string) => {
    setIncidents((prev: TrafficIncidentData[]) => 
      prev.filter((incident: TrafficIncidentData) => incident.id !== incidentId)
    );
  }, []);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-red-50 dark:bg-red-900/10 p-4 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Gagal Memuat Peta</h3>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm font-medium transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden">
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 dark:bg-white/5 backdrop-blur-sm z-10">
            <div className="animate-pulse text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-500/20"></div>
              <p className="text-sm text-gray-700 dark:text-gray-300">Memuat peta...</p>
            </div>
          </div>
        )}

        {/* Map content would be rendered here */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Peta Lalu Lintas</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {activeLayers.includes('traffic') ? 'Menampilkan data lalu lintas' : 'Data lalu lintas dinonaktifkan'}
            </p>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10">
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetView={handleResetView}
          onRefresh={handleRefresh}
          onToggleLayer={handleToggleLayer}
          activeLayers={activeLayers}
        />
      </div>

      {/* Incidents Panel */}
      <div className="absolute bottom-4 left-4 right-4 z-10 max-h-1/3 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 space-y-3 max-w-md mx-auto">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-900 dark:text-white">Insiden Lalu Lintas</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
              {incidents.length} Insiden
            </span>
          </div>
          
          {incidents.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Tidak ada insiden dilaporkan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {incidents.map((incident: TrafficIncidentData) => (
                <TrafficIncident
                  key={incident.id}
                  id={incident.id}
                  type={incident.type}
                  title={incident.title}
                  description={incident.description}
                  location={incident.location}
                  timestamp={incident.timestamp}
                  severity={incident.severity}
                  onDismiss={handleDismissIncident}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrafficMap;
