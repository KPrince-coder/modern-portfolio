export interface ProfileImageProps {
  imageUrl?: string;
  name?: string;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface ProfileImageContentProps {
  imageUrl?: string;
  name?: string;
}