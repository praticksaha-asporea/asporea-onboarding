import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { branchListingApi } from "@/Services/APIs/branch/branch.actions";
import { confirmToast } from "@/Utils/confirmToast";

export interface Branch {
  _id: string;
  title: string;
  city?: string;
  address?: string;
  distanceKm?: number;
}

const DEFAULT_LAT = 26.7271;
const DEFAULT_LNG = 88.3953;

export const useBranchSelection = (reduxUser: any) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");

  useEffect(() => {
    const userBranch = reduxUser?.preferences?.branchId || reduxUser?.branchId;
    if (userBranch && !selectedBranchId) {
      setSelectedBranchId(userBranch.toString());
    }
  }, [reduxUser, selectedBranchId]);

  const fetchBranches = useCallback(
    async (lat: number, lng: number) => {
      setLoadingBranches(true);
      try {
        const response = await branchListingApi({ lat, lng });
        const list = response?.data?.data?.data || [];
        setBranches(list);

        if (list.length > 0) {
          setSelectedBranchId((prev) => {
            if (prev) return prev;
            const userPrefBranch =
              reduxUser?.preferences?.branchId || reduxUser?.branchId;
            const matched = list.find(
              (b: Branch) => b._id.toString() === userPrefBranch?.toString(),
            );
            return matched ? matched._id : list[0]._id;
          });
        }
      } catch (error) {
        console.error("Branch fetch error:", error);
        toast.error("Failed to fetch nearby branches");
      } finally {
        setLoadingBranches(false);
      }
    },
    [reduxUser],
  );

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationDenied(true);
      fetchBranches(DEFAULT_LAT, DEFAULT_LNG);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchBranches(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setLocationDenied(true);
        fetchBranches(DEFAULT_LAT, DEFAULT_LNG);
      },
      { timeout: 8000 },
    );
  }, [fetchBranches]);

  const handleBranchSelect = async (newBranchId: string): Promise<boolean> => {
    if (selectedBranchId && selectedBranchId !== newBranchId) {
      const confirmed = await confirmToast(
        "Are you sure you want to change the branch?",
      );
      if (!confirmed) return false;
    }
    setSelectedBranchId(newBranchId);
    return true;
  };

  return {
    branches,
    loadingBranches,
    locationDenied,
    selectedBranchId,
    setSelectedBranchId,
    handleBranchSelect,
  };
};
