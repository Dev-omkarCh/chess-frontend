const LoadingSpinner = ({ color }: { color?: string }) => {
  return (
    <div className={`h-5 w-5 animate-spin rounded-full border-3 border-${color || 'foreground'} border-t-transparent`} />
  );
};

export default LoadingSpinner;
