import { Mode } from "@/@core/types";
import { branchCountersApi, branchCounterTokensApi, branchListingApi } from "@/Services/APIs/branch/branch.actions";
import { branchDB, Counter } from "@/Types/object.types";
import { useState, useEffect, useCallback } from "react";

/* ── Hook ──────────────────────────────────────────────────────────────── */
export function useTokenQueue({ mode }: { mode: Mode }) {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [currentTime, setCurrentTime] = useState("");
  // ── Branches ────────────────────────────────────────────────────────────────
  const [branches, setBranches] = useState<branchDB[]>([]);
  const [tokenBranch, setTokenBranch] = useState("");

  /* ── colour map (by token prefix) ─────────────────────────────────────── */
  const prefixMeta: Record<string, { label: string; gradient: string; glow: string }> = {
    A: {
      label: "TAC",
      gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      glow: "rgba(99,102,241,.35)",
    },
    C: {
      label: "Coordinator",
      gradient: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)",
      glow: "rgba(14,165,233,.35)",
    },
    T: {
      label: "Employee",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
      glow: "rgba(245,158,11,.35)",
    },
  };

  const fallbackMeta = {
    label: "General",
    gradient: "linear-gradient(135deg, #64748b 0%, #475569 100%)",
    glow: "rgba(100,116,139,.35)",
  };

  const getMeta = (token: string) => {
    const prefix = token?.charAt(0)?.toUpperCase();
    return prefixMeta[prefix] ?? fallbackMeta;
  };

  const fetchBranches = async (lat: number, lng: number) => {
    try {
      const response = await branchListingApi({ lat, lng });
      setBranches(response?.data?.data?.data);
    } catch (error) {
      console.error("Branch fetch error:", error);
    }
  };
  const fetchTokens = async (branchId: string) => {
    try {
      const response = await branchCountersApi({ branchId, counters });
      setCounters(response?.data?.data || []);
    } catch (error) {
      console.error("Counters fetch error:", error);
    }
  };


  const handleBranchChange = useCallback((branchId: string) => {
    setTokenBranch(branchId);
    fetchTokens(branchId);
  }, []);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        fetchBranches(coords.latitude, coords.longitude);
      },
      (error) => {
        console.error(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
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

    const fetchCounterTokens = async (branchId: string, counters: Counter[]) => {
      try {
        const response = await branchCounterTokensApi({
          branchId,
          counters
        })

        setCounters(response?.data?.data || []);
      } catch (error) {
        console.error("Token fetch error:", error);
      }
    };
    const pollId = setInterval(() => { if (counters?.length > 0) { fetchCounterTokens(tokenBranch, counters) } }, 10000); // poll every 5s
    return () => clearInterval(pollId);
  }, [tokenBranch, counters]);

  return { counters, currentTime, branches, tokenBranch, handleBranchChange, getMeta, fallbackMeta };
}
