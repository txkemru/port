import React, { useEffect, useRef, useState } from 'react';

interface StaticGifProps {
  src: string;
  alt?: string;
  style?: React.CSSProperties;
  className?: string;
}

function isGif(url: string) {
  return url.toLowerCase().endsWith('.gif') || url.toLowerCase().includes('.gif?');
}

const StaticGif: React.FC<StaticGifProps> = ({ src, alt = '', style, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isGif(src)) return;
    setError(false);
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      try {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.drawImage(img, 0, 0);
        }
      } catch (e) {
        setError(true);
      }
    };
    img.onerror = () => setError(true);
  }, [src]);

  if (!isGif(src)) {
    return <img src={src} alt={alt} style={style} className={className} />;
  }
  if (error) {
    // Fallback: если не удалось отрисовать, показываем обычную гифку
    return <img src={src} alt={alt} style={style} className={className} />;
  }
  return <canvas ref={canvasRef} style={{ ...style, display: 'block' }} className={className} aria-label={alt} />;
};

export default StaticGif; 