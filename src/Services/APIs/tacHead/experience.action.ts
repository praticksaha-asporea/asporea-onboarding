import axiosClient from "@/Services/AxiosConfig/axiosClient";

export const getAwaitingExperienceAction = async (
  page = 1,
  limit = 10,
  search = "",
) => {
  try {
    let url = `/tac/tachead/technical/list?page=${page}&limit=${limit}`;

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    const response = await axiosClient.get(url);

    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to fetch awaiting technical round candidates",
    };
  }
};

export const approveRejectDocumentAction = async (payload: {
  leadId: string;
  status: "verified" | "rejected";
  remarks?: string;
}) => {
  try {
    const response = await axiosClient.post(
      "/tac/tachead/document/action",
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
