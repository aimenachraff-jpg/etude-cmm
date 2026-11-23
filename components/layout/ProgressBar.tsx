import React from 'react';

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

export function CircularProgress({ value, size = 64, strokeWidth = 8, className = '', children }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-primary transition-all duration-300"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  color?: 'success' | 'warning' | 'error';
  className?: string;
}

export function ProgressBar({ value, color = 'primary', className = '' }: ProgressBarProps) {
  const colorClasses = {
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
    primary: 'bg-primary',
  };

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div
        className={`${colorClasses[color] || colorClasses.primary} h-2 rounded-full transition-all duration-300`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
