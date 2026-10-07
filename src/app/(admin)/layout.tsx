import { requirePlatformAdmin } from '@/lib/access';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePlatformAdmin();
  return (
    <div className="admin-layout">
      {children}
    </div>
  );
}
