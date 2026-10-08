import React from 'react';
export const Toast = ({ message, type = "default" }: any) => {
  const bg = type === "error" ? "bg-error text-on-error" : "bg-inverse-surface text-inverse-on-surface";
  return <div className={`rounded-md px-4 py-3 shadow-lg text-sm font-medium ${bg}`}>{message}</div>;
};
export const useToast = () => {
  return { toast: (message: string, type?: string) => alert(message) }; // Stub implementation
};
export const ToastProvider = ({ children }: any) => <>{children}</>;
