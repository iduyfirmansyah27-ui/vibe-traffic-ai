import React from 'react';
import { ZoomIn, ZoomOut, Compass, RefreshCw } from 'lucide-react';

type LayerType = 'traffic' | 'incidents' | 'cameras';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onRefresh: () => void;
  onToggleLayer: (layer: LayerType) => void;
  activeLayers: LayerType[];
  className?: string;
}

interface Layer {
  id: LayerType;
  label: string;
  icon: string;
}

export const MapControls = ({
  onZoomIn,
  onZoomOut,
  onResetView,
  onRefresh,
  onToggleLayer,
  activeLayers,
  className = '',
}: MapControlsProps) => {
  const layers: Layer[] = [
    { id: 'traffic', label: 'Lalu Lintas', icon: '🚗' },
    { id: 'incidents', label: 'Insiden', icon: '⚠️' },
    { id: 'cameras', label: 'Kamera', icon: '📷' },
  ] as const;

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <button
        onClick={onZoomIn}
        className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Zoom In"
      >
        <ZoomIn className="w-5 h-5 text-gray-700 dark:text-gray-200" />
      </button>
      <button
        onClick={onZoomOut}
        className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Zoom Out"
      >
        <ZoomOut className="w-5 h-5 text-gray-700 dark:text-gray-200" />
      </button>
      <button
        onClick={onResetView}
        className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Reset View"
      >
        <Compass className="w-5 h-5 text-gray-700 dark:text-gray-200" />
      </button>
      <button
        onClick={onRefresh}
        className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Refresh Data"
      >
        <RefreshCw className="w-5 h-5 text-gray-700 dark:text-gray-200" />
      </button>
      
      <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
      
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-1">Layers</div>
      {layers.map((layer) => (
        <button
          key={layer.id}
          onClick={() => onToggleLayer(layer.id as LayerType)}
          className={`flex items-center p-2 rounded-lg transition-colors ${
            activeLayers.includes(layer.id)
              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
              : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
          }`}
          aria-label={`Toggle ${layer.label} layer`}
        >
          <span className="mr-2">{layer.icon}</span>
          <span className="text-sm">{layer.label}</span>
        </button>
      ))}
    </div>
  );
};

export default MapControls;
