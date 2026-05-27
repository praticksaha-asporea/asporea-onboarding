import axiosClient from "@/Services/AxiosConfig/axiosClient";

export const saveExperienceTypeAction = async (payload: {
  leadId: string;
  experienceType: string;
}) => {
  try {
    const response = await axiosClient.post("/experience/save", payload);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to save experience",
    };
  }
};
