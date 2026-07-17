export const useDashboardTable = (isFoe: boolean) => {


    const getStatusBadge = (status: string) => {
        switch (status) {
            case "inquiry_submitted":
            case "doc_submitted":
            case "exp_submitted":
            case "assessment_submitted":
                return "bg-blue-500 text-white dark:bg-blue-500 dark:text-white";
            case "doc_verified":
            case "exp_verified":
            case "pre_completed":
            case "assess_completed":
                return "bg-green-500 text-white dark:bg-green-90 dark:text-white";
            case "pre_contacted":
            case "assess_contacted":
                return "bg-teal-500 text-white dark:bg-teal-95 dark:text-white";
            case "pre_queued":
            case "assess_queued":
                return "bg-orange-500 text-white dark:bg-orange-95 dark:text-white";
            case "pre_scheduled":
            case "assess_scheduled":
            case "assessment_scheduled":
                return "bg-amber-600 text-white dark:bg-amber-700 dark:text-white";
            case "pre_not_responded":
            case "assess_not_responded":
                return "bg-pink-500 text-white dark:bg-pink-96 dark:text-white";
            case "pre_rejected":
            case "assess_rejected":
            case "exp_rejected":
            case "doc_rejected":
                return "bg-red-600 text-white dark:bg-red-98 dark:text-white";
            case "exp_request_technical":
                return "bg-slate-400 text-white dark:bg-gray-400 dark:text-white";
            default:
                return "bg-slate-400 text-white dark:bg-gray-400 dark:text-white ";
        }
    };

    const getVisitChipColor = (
        v: string | null,
    ): "primary" | "secondary" | "default" =>
        v === "online" ? "primary" : v === "offline" ? "secondary" : "default";

    const getVisitLabel = (v: string | null) =>
        v === "online" ? "🌐 Online" : v === "offline" ? "🏢 In-Person" : "—";

    const responsiveTableSx = {
        "& .resp-thead": { "@media (max-width: 767px)": { display: "none" } },
        "& .resp-row": {
            "@media (max-width: 767px)": {
                display: "block",
                borderBottom: "2px solid",
                borderColor: "divider",
                mb: 1,
                borderRadius: 2,
                overflow: "hidden",
            },
        },
        "& .resp-cell": {
            "@media (max-width: 767px)": {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 2,
                py: 1,
                borderBottom: "1px solid",
                borderColor: "divider",
                "&:last-child": { borderBottom: "none" },
                "&::before": {
                    content: "attr(data-label)",
                    fontWeight: 600,
                    fontSize: "0.72rem",
                    color: "text.secondary",
                    flexShrink: 0,
                    mr: 2,
                    minWidth: 110,
                },
            },
        },

        "& table": {
            tableLayout: "auto",
            width: "100%",
        }
    };

    const preRescheduleStatuses = ["pre_scheduled", "pre_contacted", "pre_queued"];
    const assessScheduleStatuses = [
        "exp_submitted",
        "doc_verified",
        "exp_verified",
        "assess_scheduled",
        "assessment_scheduled",
        "assess_contacted",
        "assess_queued",
        "assess_not_responded",
    ];


    const getCols = () => {
        const base = ["Candidate Name", "Stage", "Visit Type"];
        if (isFoe) base.push("Assigned TAC");
        base.push("Token", "Status", "Last Activity", "Actions");
        return base;
    };

    const cols = getCols();

    return { getStatusBadge, getVisitChipColor, getVisitLabel, responsiveTableSx, preRescheduleStatuses, assessScheduleStatuses, cols }
}