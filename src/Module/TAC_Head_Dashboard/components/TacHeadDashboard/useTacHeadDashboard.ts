import { getTacHeadCandidatesAction } from "@/Services/APIs/tacHead/dashboard.action";
import { useCallback, useEffect, useState } from "react";

export interface TacHeadKpiTypes {
    pendingEscalations?: number;
    documentsAwaiting?: number;
    pendingTechnical?: number;
    candidatesSupervised?: number;
}

type KpiColor = "primary" | "info" | "warning" | "error" | "success";

interface KpiCardConfig {
    title: string;
    value: number | string;
    desc: string;
    icon: string;
    color: KpiColor;
}

const resolveFileSrc = (path?: string | null) => {
    if (!path) return "/images/avatars/avatar.png";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
    const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:3000";
    return `${BACKEND_BASE}${path.startsWith("/") ? path : `/${path}`}`;
};
export const useTacHeadDashboard = () => {
    // const theme = useTheme();
    const [kpis, setKpis] = useState<TacHeadKpiTypes | null>(null);
    const [data, setData] = useState<any>(null);

    const fetchDashboardItems = useCallback(async () => {
        try {
            const res = await getTacHeadCandidatesAction();
            // setTotal(res?.data?.data?.pagination.total);
            if (res?.data?.data?.kpis) setKpis(res?.data?.data?.kpis);
            if (res?.data?.data) setData(res?.data?.data);

        } catch (err: any) {
            console.log(err?.response?.data?.message ?? "Failed to load candidates");
        }
    }, []);

    useEffect(() => {
        fetchDashboardItems();
    }, [fetchDashboardItems]);

    const escalations = data?.recentEscalations?.escalations;

    const technicalReviews = data?.technicalReviews?.technicalRequestedLeads;

    // GET /tac-head/team-overview
    const teamOverview = data?.teamOverview;
    // { name: "Pratik Deshmukh", cases: 3, capacity: 10 },
    const kpiCards: KpiCardConfig[] = [
        {
            title: "Pending Escalations",
            value: kpis?.pendingEscalations ?? "—",
            desc: "Awaiting your approval",
            icon: "ri-shield-flash-line",
            color: "error",
        },
        {
            title: "Pending Documents",
            value: kpis?.documentsAwaiting ?? "—",
            desc: "Submitted by TACs for review",
            icon: "ri-file-list-3-line",
            color: "warning",
        },
        {
            title: "Technicals Pending Review",
            value: kpis?.pendingTechnical ?? "—",
            desc: "Referred assessments to review",
            icon: "ri-computer-line",
            color: "info",
        },
        {
            title: "Candidates Supervised",
            value: kpis?.candidatesSupervised ?? "—",
            desc: "Across all assigned branches",
            icon: "ri-team-line",
            color: "primary",
        },
    ];

    return {
        kpiCards, escalations, technicalReviews, teamOverview, resolveFileSrc
    }
};