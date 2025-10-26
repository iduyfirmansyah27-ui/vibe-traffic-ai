import { X } from 'lucide-react';

interface ChipProps {
  label: string;
  icon?: string;
  count?: number | string;
  onRemove?: () => void;
  className?: string;
}

export const Chip = ({
  label,
  icon,
  count,
  onRemove,
  className = '',
}: ChipProps) => {
  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 ${className}`}
    >
      {icon && <span className="mr-1.5">{icon}</span>}
      <span>{label}</span>
      {count !== undefined && (
        <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-600">
          {count}
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1.5 p-0.5 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label={`Remove ${label}`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

export default Chip;
