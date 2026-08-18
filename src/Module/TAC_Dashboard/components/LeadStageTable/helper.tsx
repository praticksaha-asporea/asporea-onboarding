import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

 
export const getPendingStageLabel = (inquiryStages?: {
  stage1?: string;
  stage2?: string;
  stage3?: string;
}) => {
  if (!inquiryStages) return "N/A";
  if (inquiryStages.stage1 === "pending") return "Step 1 Pending";
  if (inquiryStages.stage2 === "pending") return "Step 2 Pending";
  if (inquiryStages.stage3 === "pending") return "Step 3 Pending";
  return "All Completed";
};

 
export const getPendingDuration = (createdAt: string | Date) => {
  if (!createdAt) return "—";
  return dayjs(createdAt).fromNow();  
};
