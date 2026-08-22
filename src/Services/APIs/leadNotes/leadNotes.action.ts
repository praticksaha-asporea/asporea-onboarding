import { AxiosResponse } from "axios";
import axiosClient from "@/Services/AxiosConfig/axiosClient";
import {
  CreateLeadNoteResponse,
  DeleteLeadNoteResponse,
  GetLeadNotesResponse,
} from "@/Types/ApiResponse/leadNoteRes.types";
import {
  CreateLeadNotePayload,
  DeleteLeadNoteParams,
  GetLeadNotesParams,
} from "@/Types/Frontend_Payload/leadNote.types";

export const getLeadNotesAction = async (
  bodyData: GetLeadNotesParams,
): Promise<AxiosResponse<GetLeadNotesResponse>> => {
  const res = await axiosClient.get(`/lead-notes?leadId=${bodyData.leadId}`);
  return res;
};

export const createLeadNoteAction = async (
  formData: CreateLeadNotePayload,
): Promise<AxiosResponse<CreateLeadNoteResponse>> => {
  const res = await axiosClient.post("/lead-notes", formData);
  return res;
};

export const deleteLeadNoteAction = async (
  bodyData: DeleteLeadNoteParams,
): Promise<AxiosResponse<DeleteLeadNoteResponse>> => {
  const res = await axiosClient.delete(`/lead-notes?noteId=${bodyData.noteId}`);
  return res;
};
