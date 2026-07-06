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

/* ── Mock data (replace with real API calls) ──────────────────────────── */
const MOCK_COUNTERS: CounterData[] = [
  {
    id: "c1",
    number: 1,
    currentToken: "A012",
    upcomingTokens: ["A013", "A014", "A015"],
    isActive: true,
  },
  {
    id: "c2",
    number: 2,
    currentToken: "C005",
    upcomingTokens: ["C006", "C007"],
    isActive: true,
  },
  {
    id: "c3",
    number: 3,
    currentToken: "T021",
    upcomingTokens: ["T022", "T023", "T024"],
    isActive: true,
  },
  {
    id: "c4",
    number: 4,
    currentToken: "A016",
    upcomingTokens: ["A017"],
    isActive: true,
  },
  {
    id: "c5",
    number: 5,
    currentToken: null,
    upcomingTokens: [],
    isActive: false,
  },
];

/* ── Hook ──────────────────────────────────────────────────────────────── */
export function useTokenQueue({ mode }: { mode: Mode }) {
  const [counters, setCounters] = useState<CounterData[]>(MOCK_COUNTERS);
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
      await fetchCounterTokens(branchId, result?.data);
    } catch (error) {
      console.error("Token fetch error:", error);
    }
  };


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
      console.log(result, 154515);

      setCounters(result?.data || []);
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

  // /────────────────────────────────────────────────────────────────────
  // TODO: Replace the mock data above with a real API call.
  // Example:
  useEffect(() => {
    const fetchQueue = async () => {
      // const res = await getTokenQueueAction();
      // if (res?.success) setCounters(res.data);
    };
    fetchQueue();
    const pollId = setInterval(fetchQueue, 5000); // poll every 5s
    return () => clearInterval(pollId);
  }, []);
  // ────────────────────────────────────────────────────────────────────

  return { counters, currentTime, branches, tokenBranch, handleBranchChange };
}
