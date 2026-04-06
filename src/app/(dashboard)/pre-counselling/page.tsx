import dynamic from "next/dynamic"

const PreCounselling = dynamic(()=> import("@/Module/Candidate_Dashboard/Pre-Counselling"))

const PreCounsellingPage =() => {
    return <PreCounselling/>
}

export default PreCounsellingPage