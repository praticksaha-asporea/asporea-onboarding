import axiosClient from "@/Services/AxiosConfig/axiosClient";

export const getAwaitingDocumentsAction = async (
  page = 1,
  limit = 10,
  search = "",
) => {
  try {
    let url = `/tac/tacHead/document/awaiting?page=${page}&limit=${limit}`;

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    const response = await axiosClient.get(url);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to fetch awaiting documents",
    };
  }
};
