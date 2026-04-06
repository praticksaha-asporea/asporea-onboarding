import dynamic from 'next/dynamic'

const DocumentUpload = dynamic(() => import('@/Module/Candidate_Dashboard/DocumentUpload'), )

export default function Page() {
  return <DocumentUpload />
}