import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface WaveformProps {
  data?: number[];
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  className?: string;
}

export function Waveform({
  data = [],
  width = 400,
  height = 100,
  color = '#06b6d4',
  backgroundColor = 'transparent',
  className,
}: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Clear background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Draw waveform
    if (data.length > 0) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      const step = width / (data.length - 1);
      const mid = height / 2;

      for (let i = 0; i < data.length; i++) {
        const x = i * step;
        const y = mid - (data[i] * mid) / 100;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
    } else {
      // Draw placeholder sine wave
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const y = height / 2 + (height / 4) * Math.sin((x / width) * Math.PI * 4);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
  }, [data, width, height, color, backgroundColor]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('rounded-lg', className)}
      style={{ width, height }}
    />
  );
}
