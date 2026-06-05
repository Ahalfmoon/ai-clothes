import * as React from 'react';
import { cn } from '@/lib/utils';

type NativeImgProps = React.ComponentPropsWithoutRef<'img'>;

export interface ImageProps extends NativeImgProps {
  fallback?: React.ReactNode;
}

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      className,
      loading = 'lazy',
      decoding = 'async',
      alt,
      ...rest
    },
    ref,
  ) => {
    return (
      <img
        {...rest}
        ref={ref}
        alt={alt ?? ''}
        className={cn(
          'bg-linear-to-b from-gray-50/20 to-gray-200/20',
          className,
        )}
        loading={loading}
        decoding={decoding}
      />
    );
  },
);

Image.displayName = 'Image';

export default Image;
