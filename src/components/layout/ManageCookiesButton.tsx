'use client';

export default function ManageCookiesButton() {
  const handleOpenPreferences = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('closecraft_cookie_consent');
      window.dispatchEvent(new Event('closecraft-reopen-consent'));
    }
  };

  return (
    <button
      type="button"
      onClick={handleOpenPreferences}
      className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline text-xs font-bold text-on-surface transition-colors shadow-sm cursor-pointer"
    >
      Manage Cookie Preferences &rarr;
    </button>
  );
}
