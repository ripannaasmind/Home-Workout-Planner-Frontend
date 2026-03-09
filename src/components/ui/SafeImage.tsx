'use client';

import { useState } from 'react';
import NextImage, { ImageProps } from 'next/image';

const DEFAULT_PLACEHOLDER = '/Images/placeholder.svg';
const AVATAR_PLACEHOLDER = '/Images/placeholder-avatar.svg';

export type SafeImageVariant = 'default' | 'avatar';

type SafeImageProps = Omit<ImageProps, 'onError'> & {
  fallbackSrc?: string;
  variant?: SafeImageVariant;
};

const SafeImage = ({
  src,
  fallbackSrc,
  variant = 'default',
  alt,
  ...props
}: SafeImageProps) => {
  const resolvedFallback =
    fallbackSrc ??
    (variant === 'avatar' ? AVATAR_PLACEHOLDER : DEFAULT_PLACEHOLDER);

  const [prevSrc, setPrevSrc] = useState(src);
  const [imgSrc, setImgSrc] = useState<ImageProps['src']>(src || resolvedFallback);
  const [hasError, setHasError] = useState(false);

  // Reset when src prop changes (during render - avoids setState-in-effect)
  if (prevSrc !== src && src) {
    setPrevSrc(src);
    setImgSrc(src);
    setHasError(false);
  }

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(resolvedFallback);
    }
  };

  return (
    <NextImage
      {...props}
      src={imgSrc}
      alt={alt}
      onError={handleError}
      unoptimized={
        (props as { unoptimized?: boolean }).unoptimized ??
        (typeof imgSrc === 'string' &&
          (imgSrc.startsWith('http') || imgSrc.startsWith('/Images/placeholder')))
      }
    />
  );
};

export default SafeImage;
