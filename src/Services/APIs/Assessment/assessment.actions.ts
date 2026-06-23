import axiosClient from "@/Services/AxiosConfig/axiosClient";

export const getJourneyTimelineAction = async (
  leadId: string,
): Promise<any> => {
  try {
    const response = await axiosClient.get(
      `/tracking/journey?leadId=${leadId}`,
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to fetch journey timeline",
    };
  }
};

export const scheduleAssessmentAction = async (data: {
  leadId: string;
  date: string;
  slotTime: string;
  method: "on" | "off";
}): Promise<any> => {
  try {
    const response = await axiosClient.post(`/assessment/schedule`, data);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to schedule assessment",
    };
  }
};

export const getTechnicalResultAction = async (leadId: string) => {
  try {
    const res = await axiosClient.get(`/assessments/technical-result?leadId=${leadId}`);
    return res.data;
  } catch (err) {
    return { success: false, message: "Network Error" };
  }
};

export const getAssessmentResultAction = async (leadId: string) => {
  try {
    const res = await axiosClient.get(`/assessments/result?leadId=${leadId}`);
    return res.data;
  } catch (err) {
    return { success: false, message: "Network Error" };
  }
};
