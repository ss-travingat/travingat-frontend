import { redirect } from 'next/navigation';

export default async function NewCountryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/profile/${id}?tab=countries&editor=country`);
}
