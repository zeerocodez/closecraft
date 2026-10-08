export const Card = ({ children, className = "", ...props }: any) => {
  return (
    <div className={`rounded-xl border border-outline-variant bg-surface-container text-on-background shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
};
export default Card;
