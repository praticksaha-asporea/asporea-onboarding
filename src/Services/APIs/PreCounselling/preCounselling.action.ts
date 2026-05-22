import axiosClient from "@/Services/AxiosConfig/axiosClient";

export const getSlotsAction = async (consultantId: string, date: string) => {
  try {
    const response = await axiosClient.get(`/api/pre-counselling/slots?consultantId=${consultantId}&date=${date}`);
    return response.data;  
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to fetch slots" };
  }
};

export const bookSlotAction = async (payload: any) => {
  try {
    const response = await axiosClient.post("/api/pre-counselling/book-slot", payload);
    return response.data;
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Booking failed" };
  }
};