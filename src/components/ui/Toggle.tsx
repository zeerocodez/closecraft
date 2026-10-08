export const Toggle = ({ checked, onChange, className = "", ...props }: any) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`${checked ? 'bg-primary' : 'bg-surface-container-highest'} relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 ${className}`}
      {...props}
    >
      <span
        aria-hidden="true"
        className={`${checked ? 'translate-x-[20px]' : 'translate-x-0'} pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );
};
export default Toggle;
