'use client';

interface StarProps {
  filled: boolean;
  half?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function Star({ filled, half, onClick, className = "" }: StarProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-2xl transition-colors ${className} ${
        onClick ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
      }`}
      disabled={!onClick}
    >
      {half ? (
        <span className="relative inline-block">
          <span className="text-gray-300">★</span>
          <span className="absolute inset-0 w-1/2 overflow-hidden text-yellow-400">★</span>
        </span>
      ) : (
        <span className={filled ? 'text-yellow-400' : 'text-gray-300'}>★</span>
      )}
    </button>
  );
}
