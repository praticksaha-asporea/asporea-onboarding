"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { IActivityLog } from "@/Types/Frontend_Payload/leadLog.types";
import { getActivityLogs } from "@/Services/APIs/leadLogs/leadLogs.actions";
import { useSelector } from "react-redux";
import { extractId } from "@/Module/TAC_Dashboard/components/CandidateDetail/LeadLogsCard";

const PAGE_SIZE = 5;
interface UseActivityLogReturn {
    logs: IActivityLog[];
    loading: boolean; // initial fetch only
    loadingMore: boolean; // subsequent "load more" fetches
    hasMore: boolean;
    loadMore: () => void;
    currentUserId: string;
}

export const useActivityLog = (leadId?: string): UseActivityLogReturn => {
    const [logs, setLogs] = useState<IActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);

    const currentUser = useSelector(
        (state: any) => state?.userSlice?.userData || state?.user?.userData
    );
    const currentUserId = extractId(currentUser?._id || currentUser?.id || currentUser?.user);

    // Cursor lives in a ref, not state: updating it should never itself
    // trigger a re-render, only the fetch it feeds.
    const cursorRef = useRef<string | null>(null);

    const fetchPage = useCallback(
        async (isInitial: boolean) => {
            if (!leadId) return;

            if (isInitial) setLoading(true);
            else setLoadingMore(true);

            const res = await getActivityLogs({
                leadId,
                cursor: isInitial ? null : cursorRef.current,
                limit: PAGE_SIZE,
                bycandidate: true
            });

            setLogs((prev: any) => (isInitial ? res?.data?.data : [...prev, ...res?.data?.data]));

            cursorRef.current = res?.data?.nextCursor;
            setHasMore(res?.data?.hasMore);

            if (isInitial) setLoading(false);
            else setLoadingMore(false);
        },
        [leadId],
    );

    useEffect(() => {
        cursorRef.current = null;
        setLogs([]);

        if (leadId) fetchPage(true);
        else setLoading(false);

    }, [leadId]);

    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore) fetchPage(false);
    }, [fetchPage, hasMore, loadingMore]);

    return { logs, loading, loadingMore, hasMore, loadMore, currentUserId };
};
