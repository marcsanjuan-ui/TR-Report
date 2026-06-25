import { fetchDocument } from '@/lib/actions'
import { notFound } from 'next/navigation'
import EditFormContainer from '@/components/forms/EditFormContainer'

interface Props { params: Promise<{ id: string }> }

export default async function EditDocumentPage({ params }: Props) {
  const { id } = await params
  const doc = await fetchDocument(id)
  if (!doc) notFound()

  return <EditFormContainer doc={doc} />
}
