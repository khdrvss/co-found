/**
 * Image component with lazy loading support
 * Improves performance by deferring off-screen image loading
 */

import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string; // Fallback image if load fails
  threshold?: number; // Intersection observer threshold
  showSkeleton?: boolean; // Show skeleton while loading
  skeletonClassName?: string;
  onLoadingComplete?: () => void;
}

/**
 * LazyImage component using Intersection Observer API
 * Only loads images when they come into view
 */
export function LazyImage({
  src,
  alt,
  fallback,
  threshold = 0.1,
  showSkeleton = true,
  skeletonClassName = 'w-full h-full',
  onLoadingComplete,
  className,
  ...props
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Check if IntersectionObserver is supported
    if (!window.IntersectionObserver) {
      // Fallback: load image immediately
      setImageSrc(src);
      return;
    }

    // Create intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Image is in view, load it
            setImageSrc(src);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, threshold]);

  const handleLoad = () => {
    setLoading(false);
    onLoadingComplete?.();
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    if (fallback) {
      setImageSrc(fallback);
    }
  };

  return (
    <div className="relative">
      {loading && showSkeleton && (
        <Skeleton className={skeletonClassName} />
      )}
      <img
        ref={imgRef}
        src={imageSrc || undefined}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`${className} ${loading && showSkeleton ? 'absolute inset-0 opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading="lazy"
        {...props}
      />
    </div>
  );
}

/**
 * Avatar component with lazy loading
 */
export function LazyAvatar({
  src,
  alt,
  fallback,
  className = 'w-10 h-10 rounded-full',
  ...props
}: LazyImageProps) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      fallback={fallback}
      showSkeleton={true}
      skeletonClassName="rounded-full w-10 h-10"
      className={className}
      {...props}
    />
  );
}

/**
 * ProjectCard image with lazy loading
 */
export function LazyProjectImage({
  src,
  alt,
  fallback,
  className = 'w-full h-48 object-cover',
  ...props
}: LazyImageProps) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      fallback={fallback}
      showSkeleton={true}
      skeletonClassName="w-full h-48"
      className={className}
      {...props}
    />
  );
}

/**
 * Batch image loading utility
 * Prefetch multiple images for better performance
 */
export function prefetchImages(srcList: string[]): void {
  if (!window.IntersectionObserver) return;

  srcList.forEach((src) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = src;
    link.as = 'image';
    document.head.appendChild(link);
  });
}

/**
 * Hook to track image loading state
 */
export function useImageLoading(initialSrc: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => setIsLoading(false);
  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  return {
    isLoading,
    error,
    onLoad: handleLoad,
    onError: handleError,
  };
}

/**
 * Image gallery component with lazy loading for each image
 */
export function LazyImageGallery({
  images,
  alt = 'Gallery image',
  className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
}: {
  images: string[];
  alt?: string;
  className?: string;
}) {
  // Prefetch all images on mount for faster scrolling
  useEffect(() => {
    prefetchImages(images);
  }, [images]);

  return (
    <div className={className}>
      {images.map((src, index) => (
        <LazyImage
          key={`${src}-${index}`}
          src={src}
          alt={`${alt} ${index + 1}`}
          showSkeleton={true}
          className="w-full h-64 object-cover rounded-lg"
        />
      ))}
    </div>
  );
}
