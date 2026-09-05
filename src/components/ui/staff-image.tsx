import type { ImgHTMLAttributes } from 'react';
import { DEFAULT_STAFF_IMAGE } from '../../data/mentors';

interface StaffImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'onError'> {
  src?: string;
  alt: string;
}

const StaffImage = ({ src, alt, ...props }: StaffImageProps) => (
  <img
    {...props}
    src={src ?? DEFAULT_STAFF_IMAGE}
    alt={alt}
    onError={({ currentTarget }) => {
      currentTarget.onerror = null;
      currentTarget.src = DEFAULT_STAFF_IMAGE;
    }}
  />
);

export default StaffImage;
