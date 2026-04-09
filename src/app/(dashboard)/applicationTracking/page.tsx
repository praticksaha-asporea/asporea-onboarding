import dynamic from 'next/dynamic'

 
const ApplicationTracking = dynamic(() => import('@/Module/Candidate_Dashboard/ApplicationTracking'));

export default function AssessmentPage() {
  return <ApplicationTracking />
}