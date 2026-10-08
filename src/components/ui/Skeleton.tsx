export const Skeleton = ({ className = "", ...props }: any) => {
  return <div className={`animate-pulse rounded-md bg-surface-container-highest ${className}`} {...props} />;
};
export default Skeleton;
