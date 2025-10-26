import React from 'react';

// Image optimization utilities
export class ImageOptimizer {
  private static instance: ImageOptimizer;
  private imageCache: Map<string, HTMLImageElement> = new Map();
  private loadingPromises: Map<string, Promise<HTMLImageElement>> = new Map();

  static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer();
    }
    return ImageOptimizer.instance;
  }

  // Preload images with caching
  async preloadImage(src: string): Promise<HTMLImageElement> {
    // Return cached image if available
    if (this.imageCache.has(src)) {
      return this.imageCache.get(src)!;
    }

    // Return existing loading promise if available
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    // Create new loading promise
    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.imageCache.set(src, img);
        this.loadingPromises.delete(src);
        resolve(img);
      };
      img.onerror = () => {
        this.loadingPromises.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });

    this.loadingPromises.set(src, promise);
    return promise;
  }

  // Lazy load images with intersection observer
  observeImage(img: HTMLImageElement, src: string): void {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.preloadImage(src).then(() => {
                img.src = src;
                observer.unobserve(img);
              });
            }
          });
        },
        { rootMargin: '50px' }
      );
      observer.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      img.src = src;
    }
  }

  // Generate responsive image sources
  generateResponsiveSources(baseSrc: string, sizes: number[]): string[] {
    return sizes.map(size => {
      const url = new URL(baseSrc);
      url.searchParams.set('w', size.toString());
      url.searchParams.set('q', '80'); // Quality
      return url.toString();
    });
  }

  // Optimize image URLs for different devices
  getOptimizedImageUrl(src: string, devicePixelRatio: number = 1): string {
    const url = new URL(src);
    
    // Add optimization parameters
    url.searchParams.set('auto', 'format'); // Auto format selection
    url.searchParams.set('q', '80'); // Quality
    url.searchParams.set('dpr', devicePixelRatio.toString()); // Device pixel ratio
    
    return url.toString();
  }

  // Clear cache
  clearCache(): void {
    this.imageCache.clear();
    this.loadingPromises.clear();
  }

  // Get cache size
  getCacheSize(): number {
    return this.imageCache.size;
  }
}

// React hook for optimized image loading
export const useOptimizedImage = (src: string) => {
  const [image, setImage] = React.useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const optimizer = ImageOptimizer.getInstance();
    
    setLoading(true);
    setError(null);

    optimizer.preloadImage(src)
      .then((img) => {
        setImage(img);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [src]);

  return { image, loading, error };
};

// Lazy image component
export const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}> = ({ src, alt, className, placeholder, onLoad, onError }) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    if (imgRef.current) {
      const optimizer = ImageOptimizer.getInstance();
      optimizer.observeImage(imgRef.current, src);
    }
  }, [src]);

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    onError?.();
  };

  return React.createElement('div', { className: `relative overflow-hidden ${className}` }, [
    !loaded && !error && placeholder && React.createElement('div', { 
      key: 'placeholder',
      className: 'absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center' 
    }, React.createElement('span', { className: 'text-gray-400' }, 'Loading...')),
    React.createElement('img', {
      key: 'image',
      ref: imgRef,
      alt: alt,
      className: `transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`,
      onLoad: handleLoad,
      onError: handleError
    }),
    error && React.createElement('div', { 
      key: 'error',
      className: 'absolute inset-0 bg-gray-200 flex items-center justify-center' 
    }, React.createElement('span', { className: 'text-gray-400' }, 'Failed to load'))
  ].filter(Boolean));
};
