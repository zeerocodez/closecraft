import * as LucideIcons from "lucide-react";
export const Icon = ({ name, icon: IconComponent, size = 24, className = "" }: { name?: string, icon?: any, size?: number | string, className?: string }) => {
  if (IconComponent) return <IconComponent size={size} className={className} />;
  if (!name) return null;
  const LucideIcon = (LucideIcons as any)[name];
  if (!LucideIcon) return null;
  return <LucideIcon size={size} className={className} />;
};
export default Icon;
