import dynamic from 'next/dynamic'

 
const Assessment = dynamic(() => import('@/Module/Candidate_Dashboard/Assessment'));

export default function AssessmentPage() {
  return <Assessment/>
}