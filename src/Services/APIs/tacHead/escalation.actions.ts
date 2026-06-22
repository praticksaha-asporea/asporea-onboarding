import axiosClient from "@/Services/AxiosConfig/axiosClient";

export const getEscalationListAction = async (page = 1, limit = 10) => {
  try {
    const response = await axiosClient.get(
      `/tac/tacHead/escalation/list?page=${page}&limit=${limit}`,
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch escalations",
    };
  }
};

export const getEscalationViewAction = async (id: string) => {
  try {
    const response = await axiosClient.get(
      `/tac/tacHead/escalation/view?id=${id}`,
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to view escalation",
    };
  }
};

export const approveRejectEscalationAction = async (payload: any) => {
  try {
    const response = await axiosClient.post(
      "/tac/tacHead/escalation/action",
      payload,
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Action failed",
    };
  }
};
