import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { uploadResponse } from "@/Types/ApiResponse/uploadRes.types";
import { AxiosResponse } from "axios";
import dayjs from "dayjs";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const respectiveDashboard = (
  user: { role: string },
  router: AppRouterInstance,
) => {
  if (user.role === "tac" || user.role === "foe") {
    router.push("/dashboard");
  } else if (user.role === "tac_head") {
    router.push("/tac-head/dashboard");
  } else if (user.role === "user") {
    router.push("/inquiry");
  }
};

export const CamelCase = (text: string) => {
  return text
    ?.replace(/_/g, " ")
    ?.replace(/\b\w/g, (char) => char.toUpperCase());
};

export const uploadFileAction = async (file: File): Promise<AxiosResponse<uploadResponse>> => {
  // try {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosClient.post("/upload/local", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response
  // .data;
  // } catch (error: any) {
  //   return {
  //     success: false,
  //     message: error.response?.data?.message || "Upload failed",
  //   };
  // }
};

export const currentFy = () => {
  const now = new Date();
  return now.getMonth() >= 3
    ? `${now.getFullYear()}-${String(now.getFullYear() + 1).slice(-2)}`
    : `${now.getFullYear() - 1}-${String(now.getFullYear()).slice(-2)}`;
};

export const isWithinSchedule = (assign: any): boolean => {
  if (!assign?.schedule?.date || !assign?.schedule?.from) return false;
  const base = dayjs(assign.schedule.date).format("YYYY-MM-DD");
  const start = dayjs(`${base} ${assign.schedule.from}`, "YYYY-MM-DD hh:mm A");
  // const start = dayjs(`${base} 00:00:00`, "YYYY-MM-DD HH:mm:ss");

  const end = assign.schedule.to
    ? dayjs(`${base} ${assign.schedule.to}`, "YYYY-MM-DD hh:mm A")
    : start.add(30, "minute");
  const now = dayjs();
  return now.isAfter(start) && now.isBefore(end);
};



export const formatToDDMMYY = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};
