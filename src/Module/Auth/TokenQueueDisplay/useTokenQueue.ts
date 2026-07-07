import { Mode } from "@/@core/types";
import { useState, useEffect, useCallback } from "react";

/* ── Types ────────────────────────────────────────────────────────────── */
export interface CounterData {
  id: string;
  number: number;
  currentToken: string | null;
  upcomingTokens: string[];
  isActive: boolean;
}


/* ── Hook ──────────────────────────────────────────────────────────────── */
export function useTokenQueue({ mode }: { mode: Mode }) {
  const [counters, setCounters] = useState<CounterData[]>([]);
  const [currentTime, setCurrentTime] = useState("");
  // ── Branches ────────────────────────────────────────────────────────────────
  const [branches, setBranches] = useState<any[]>([]);
  const [tokenBranch, setTokenBranch] = useState("");
  const fetchBranches = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `/api/branch/list?lat=${lat}&lng=${lng}&radiusKm=5000&limit=50`,
      );
      const result = await response.json();
      setBranches(result?.data?.data || []);
    } catch (error) {
      console.error("Branch fetch error:", error);
    }
  };
  const fetchTokens = async (branchId: string) => {
    try {
      const response = await fetch(
        `/api/branch-token/list-counters?branchId=${branchId}`,
      );
      const result = await response.json();
      setCounters(result?.data || []);
      // await fetchCounterTokens(branchId, result?.data);
    } catch (error) {
      console.error("Token fetch error:", error);
    }
  };


  const handleBranchChange = useCallback((branchId: string) => {
    setTokenBranch(branchId);
    fetchTokens(branchId);
  }, []);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchBranches(position.coords.latitude, position.coords.longitude);
      },
      () => {
        // toast.error("Please allow location access to get preferred branch list");
      },
    );
  }, []);

  /* live clock */
  const updateClock = useCallback(() => {
    const now = new Date();
    setCurrentTime(
      now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    );
  }, []);

  useEffect(() => {
    updateClock();
    const id = setInterval(updateClock, 1000);
    return () => clearInterval(id);
  }, [updateClock]);

  useEffect(() => {

    const fetchCounterTokens = async (branchId: string, counters: any) => {
      try {
        const response = await fetch(
          `/api/branch-token/list`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              branchId,
              counters
            }),
          }
        );
        const result = await response.json();
        setCounters(result?.data || []);
      } catch (error) {
        console.error("Token fetch error:", error);
      }
    };
    const pollId = setInterval(() => { if (counters?.length > 0) { fetchCounterTokens(tokenBranch, counters) } }, 10000); // poll every 5s
    return () => clearInterval(pollId);
  }, [tokenBranch, counters]);

  return { counters, currentTime, branches, tokenBranch, handleBranchChange };
}
