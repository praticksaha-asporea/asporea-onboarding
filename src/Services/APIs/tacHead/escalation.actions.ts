import axiosClient from "@/Services/AxiosConfig/axiosClient";

export const getEscalationListAction =async (page = 1, limit = 10, search = "", tacId = "") => {
  try {
  const response = await axiosClient.get(
      `/tac/tachead/escalation/list?page=${page}&limit=${limit}&search=${search}&tacId=${tacId}`,
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
      `/tac/tachead/escalation/view?id=${id}`,
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
      "/tac/tachead/escalation/action",
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
