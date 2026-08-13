import mongoose from "mongoose";
import { Country } from "@/lib/models/Country.model";
import { ApiError } from "@/lib/error/api.error";
 

// ── GET ALL COUNTRIES (Tera banaya hua logic) ──
export const getCountriesService = async (onlyActive: boolean = false) => {
  const query = onlyActive ? { isActive: true } : {};
  return await Country.find(query).sort({ name: 1 }).lean();
};
 