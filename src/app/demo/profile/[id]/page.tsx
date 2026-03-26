import { notFound } from 'next/navigation';

export default async function DemoProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  return notFound();
}
