import React from 'react';
export const Input = React.forwardRef(({ className = "", ...props }: any, ref) => {
  return (
    <input ref={ref} className={`flex h-10 w-full rounded-md border border-outline-variant bg-surface px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
  );
});
export const Textarea = React.forwardRef(({ className = "", ...props }: any, ref) => {
  return (
    <textarea ref={ref} className={`flex min-h-[80px] w-full rounded-md border border-outline-variant bg-surface px-3 py-2 text-sm ring-offset-background placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
  );
});
export const Field = ({ label, children, error, className = "" }: any) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="text-sm font-medium leading-none text-on-background peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>}
      {children}
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
};
export default Field;
