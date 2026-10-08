export const Button = ({ children, variant = "primary", className = "", ...props }: any) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none ring-offset-background px-4 py-2";
  const variants = {
    primary: "bg-primary text-on-primary hover:bg-primary/90 shadow-sm",
    secondary: "bg-surface-variant text-on-surface-variant hover:bg-surface-variant/80",
    outline: "border border-outline bg-transparent hover:bg-surface-variant text-on-background",
    ghost: "bg-transparent hover:bg-surface-variant text-on-background"
  };
  return <button className={`${baseStyle} ${(variants as any)[variant]} ${className}`} {...props}>{children}</button>;
};
export default Button;
