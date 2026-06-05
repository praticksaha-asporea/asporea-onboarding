import axiosClient from "@/Services/AxiosConfig/axiosClient";

export const createBranchTokenAction = async (payload: {
  identity: string;
}) => {
  try {
    const response = await axiosClient.post("/branch-token/create", payload);
    return response.data;
  } catch (error: any) {
    console.log(error,2944);
    
    return {
      success: false,
      message: error.response?.data?.message || "Failed to save experience",
    };
  }
};
