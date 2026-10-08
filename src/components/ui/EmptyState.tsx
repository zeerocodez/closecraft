import Icon from "./Icon";
export const EmptyState = ({ title, description, icon = "inbox", className = "" }: any) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50 duration-500 ${className}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-highest mb-4">
        <Icon name={icon} className="text-on-surface-variant" size={24} />
      </div>
      <h3 className="text-lg font-semibold text-on-background">{title}</h3>
      {description && <p className="text-sm text-on-surface-variant max-w-sm mt-2">{description}</p>}
    </div>
  );
};
export default EmptyState;
