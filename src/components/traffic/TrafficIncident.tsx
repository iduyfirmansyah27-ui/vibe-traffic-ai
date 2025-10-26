import { AlertTriangle, Clock, MapPin, X } from 'lucide-react';

interface TrafficIncidentProps {
  id: string;
  type: 'accident' | 'congestion' | 'hazard' | 'construction' | 'event';
  title: string;
  description: string;
  location: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  onDismiss?: (id: string) => void;
  className?: string;
}

const severityColors = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
};

const incidentIcons = {
  accident: '🚗',
  congestion: '🚦',
  hazard: '⚠️',
  construction: '🚧',
  event: '🎪',
};

export const TrafficIncident = ({
  id,
  type,
  title,
  description,
  location,
  timestamp,
  severity,
  onDismiss,
  className = '',
}: TrafficIncidentProps) => {
  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    const intervals = {
      tahun: 31536000,
      bulan: 2592000,
      minggu: 604800,
      hari: 86400,
      jam: 3600,
      menit: 60,
      detik: 1,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit} yang lalu`;
      }
    }
    return 'Baru saja';
  };

  return (
    <div
      className={`relative p-4 rounded-lg shadow-md bg-white dark:bg-gray-800 border-l-4 ${
        severity === 'high'
          ? 'border-red-500'
          : severity === 'medium'
          ? 'border-yellow-500'
          : 'border-blue-500'
      } ${className}`}
    >
      {onDismiss && (
        <button
          onClick={() => onDismiss(id)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          aria-label="Tutup notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          <div className="text-2xl">{incidentIcons[type] || '⚠️'}</div>
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                severityColors[severity]
              }`}
            >
              {severity === 'high' ? 'Tinggi' : severity === 'medium' ? 'Sedang' : 'Rendah'}
            </span>
          </div>
          
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{description}</p>
          
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              <span>{location}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              <span>{timeAgo(timestamp)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficIncident;
