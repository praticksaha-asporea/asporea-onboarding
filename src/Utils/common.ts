import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const respectiveDashboard = (
  user: { role: string },
  router: AppRouterInstance,
) => {
  if (user.role === "tac") {
    router.push("/dashboard");
  } else if (user.role === "user") {
    router.push("/inquiry");
  }
};

export const CamelCase = (text: string) => {
  return text
    ?.replace(/_/g, " ")
    ?.replace(/\b\w/g, (char) => char.toUpperCase())
}


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


export const currentFy = () => {
  const now = new Date();
  return now.getMonth() >= 3
    ? `${now.getFullYear()}-${String(now.getFullYear() + 1).slice(-2)}`
    : `${now.getFullYear() - 1}-${String(now.getFullYear()).slice(-2)}`;

}