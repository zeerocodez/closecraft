import { redirect } from 'next/navigation';

export default async function RevenueEngineRedirect({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolved = searchParams ? await searchParams : {};
  const tab = resolved?.tab;
  redirect(tab ? `/dashboard?tab=${tab}` : '/dashboard');
}
