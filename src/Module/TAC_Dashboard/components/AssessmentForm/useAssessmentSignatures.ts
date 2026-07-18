import React, { useState, useEffect, useRef } from "react";

export const useAssessmentSignature = ({ assessmentForm }: { assessmentForm: any }) => {
    const [previews, setPreviews] = useState<Record<string, string>>({});
    const previewsRef = useRef<Record<string, string>>({});
    const [previewDialogFile, setPreviewDialogFile] = useState<{ name: string; url: string; isImage: boolean } | null>(null);

    const handleOpenPreview = (name: string, url: string, isImg: boolean) => {
        setPreviewDialogFile({ name, url, isImage: isImg });
    };

    const handleClosePreview = () => {
        setPreviewDialogFile(null);
    };

    useEffect(() => {
        previewsRef.current = previews;
    }, [previews]);

    useEffect(() => {
        if (assessmentForm.submitCount > 0 && Object.keys(assessmentForm.errors).length > 0) {
            const firstErrorField = Object.keys(assessmentForm.errors)[0];
            const errorElement =
                document.getElementById(firstErrorField) ||
                document.getElementsByName(firstErrorField)[0];
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
                errorElement.focus();
            }
        }
    }, [assessmentForm.submitCount, assessmentForm.errors]);

    useEffect(() => {
        return () => {
            Object.values(previewsRef.current).forEach(url => {
                if (url.startsWith("blob:")) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, []);
    return {
        handleClosePreview, handleOpenPreview, previews, previewDialogFile, assessmentForm, setPreviews
    }
}