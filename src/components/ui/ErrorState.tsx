import Icon from "./Icon";
export const ErrorState = ({ title = "Error", message, className = "" }: any) => {
  return (
    <div className={`rounded-lg border border-error/50 bg-error-container/20 p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <Icon name="AlertCircle" className="text-error mt-0.5" size={20} />
        <div>
          <h3 className="text-sm font-semibold text-error">{title}</h3>
          {message && <p className="text-sm text-error/90 mt-1">{message}</p>}
        </div>
      </div>
    </div>
  );
};
export default ErrorState;
