import { AppShell } from '@/components/layout/app-shell'

interface PoolPageProps {
  params: Promise<{ id: string }>
}

export default async function PoolPage({ params }: PoolPageProps) {
  const { id } = await params

  return (
    <AppShell
      header={{
        backButton: true,
        title: 'Pool Details',
      }}
    >
      <h1>{`PoolPage id: ${id}`}</h1>
    </AppShell>
  )
}
