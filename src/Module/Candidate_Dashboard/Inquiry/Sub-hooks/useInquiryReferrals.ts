import { useState } from "react";
import { getExternalSourcesAction } from "@/Services/APIs/Inquiry/inquiry.action";
import { externalSourceObj } from "@/Types/object.types";

export const useInquiryReferrals = () => {
  const [externalSources, setExternalSources] = useState<externalSourceObj[]>(
    [],
  );
  const [loadingSources, setLoadingSources] = useState(false);

  const fetchExternalSources = async (
    referedType: string,
    setFieldValue?: (field: string, value: string) => void,
  ) => {
    if (!referedType) {
      setExternalSources([]);
      return;
    }
    if (referedType === "other") {
      setExternalSources([]);
      if (setFieldValue) {
        setFieldValue("referedBy", "other");
      }
      return;
    }
    setLoadingSources(true);
    try {
      const response = await getExternalSourcesAction({ type: referedType });
      if (response.data.success) {
        setExternalSources(response.data.data);
      }
    } catch (err) {
      console.error("External sources fetch error:", err);
    } finally {
      setLoadingSources(false);
    }
  };

  return {
    externalSources,
    loadingSources,
    fetchExternalSources,
  };
};