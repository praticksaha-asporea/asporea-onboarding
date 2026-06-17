import axiosClient from "@/Services/AxiosConfig/axiosClient";

export const getPositionsListAction = async () => {
  try {
    const response = await axiosClient.get("/document/positions");
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch positions",
    };
  }
};

export const getPositionDetailsAction = async (positionId: string) => {
  try {
    const response = await axiosClient.get(
      `/document/position-details?id=${positionId}`,
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Failed to fetch document requirements",
    };
  }
};

export const uploadFileAction = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosClient.post("/upload/local", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Upload failed",
    };
  }
};

export const saveMappedDocumentsAction = async (payload: any) => {
  try {
    const response = await axiosClient.post("/document/save", payload);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Save failed",
    };
  }
};

export const checkDocumentStatusAction = async (leadId: string): Promise<any> => {
  try {
    const response = await axiosClient.get(`/document/status?leadId=${leadId}`);
    return response.data;
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to check status" };
  }
};



export const getCandidateDocumentsAction = async (leadId: string): Promise<any> => {
  try {
    const response = await axiosClient.get(`/tac/candidate/${leadId}`);
    return response?.data;
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to check status" };
  }
};