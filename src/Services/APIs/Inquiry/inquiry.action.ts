import axiosClient from "@/Services/AxiosConfig/axiosClient";

export const getTacListAction = async (branchId: string) => {
  const res = await axiosClient.get(`/inquiry/tac-list?branchId=${branchId}`);
  return res.data;
};

export const getExternalSourcesAction = async (type: string) => {
  const res = await axiosClient.get(`/inquiry/external-sources?type=${type}`);
  return res.data;
};

export const createInquiryAction = async (formData: any) => {
  const res = await axiosClient.post("/inquiry/create", formData);
  return res.data;
};
