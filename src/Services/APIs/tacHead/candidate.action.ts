import axiosClient from "@/Services/AxiosConfig/axiosClient";
import { AxiosResponse } from "axios";
import { TacHeadCandidatesPayload } from "@/Types/Frontend_Payload/tacHead.types";
import { AllCandidatesTacHeadResponse } from "@/Types/ApiResponse/tacHeadRes.types";

export const getAllCandidatesAction = async (
  payload: TacHeadCandidatesPayload
): Promise<AxiosResponse<AllCandidatesTacHeadResponse>> => {

  const { page = 1, limit = 10, branchId = "", tacId = "", search = "" } = payload;

  let url = `/tac/tachead/candidates/all?page=${page}&limit=${limit}`;

  if (branchId) {
    url += `&branchId=${encodeURIComponent(branchId)}`;
  }

  if (tacId) {
    url += `&tacId=${encodeURIComponent(tacId)}`;
  }

  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }


  const response = await axiosClient.get(url);
  return response;
};