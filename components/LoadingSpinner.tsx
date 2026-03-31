interface LoadingSpinnerProps {
  color?: string,
  size?: number
}
const LoadingSpinner = ({ color, size = 5 }: LoadingSpinnerProps) => {
  return (
    <div className={`h-${size} w-${size} animate-spin rounded-full border-3 border-${color || 'foreground'} border-t-transparent`} />
  );
};

export default LoadingSpinner;
