export const Badge = ({ children, variant = "default", className = "", ...props }: any) => {
  const baseStyle = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2";
  const variants = {
    default: "border-transparent bg-primary text-on-primary",
    secondary: "border-transparent bg-surface-variant text-on-surface-variant",
    outline: "text-on-background border-outline-variant",
    destructive: "border-transparent bg-error text-on-error"
  };
  return <div className={`${baseStyle} ${(variants as any)[variant]} ${className}`} {...props}>{children}</div>;
};
export default Badge;
