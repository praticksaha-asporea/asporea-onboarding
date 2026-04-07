import dynamic from "next/dynamic";

const Experience = dynamic(() => import('@/Module/Candidate_Dashboard/Experience'),)

export default function ExperiencePage() {
    return <Experience/>
}