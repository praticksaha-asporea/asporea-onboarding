import axiosClient from "@/Services/AxiosConfig/axiosClient";

export const getAllCandidatesAction = async (
  page = 1,
  limit = 10,
  branchId = "",
  tacId = "",
  search = ""
) => {
  try {
    
    let url = `/tac/tachead/candidates/all?page=${page}&limit=${limit}`;

     
    if (branchId) {
      url += `&branchId=${encodeURIComponent(branchId)}`;
    }

    if (tacId) {
      url += `&tacId=${encodeURIComponent(tacId)}`;
    }
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const response = await axiosClient.get(url);

    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to fetch all candidates",
    };
  }
};