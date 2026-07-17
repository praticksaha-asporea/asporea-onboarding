import { useRef, useState } from "react";
import toast from "react-hot-toast";

export const useExperienceUploadCard = ({ allowedFormats, multiple, onFilesChange }: { allowedFormats?: string[], multiple?: boolean, onFilesChange?: (files: File[]) => void }) => {

    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isValidFile = (file: File, allowedFormats: string[]) => {
        if (!allowedFormats || allowedFormats.length === 0) return true;
        const fileExtension = file.name.split(".").pop()?.toLowerCase();
        return fileExtension && allowedFormats.map((ext) => ext.toLowerCase()).includes(fileExtension);
    };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };

    const processFiles = (fileList: FileList) => {
        const validFiles: File[] = [];
        for (let i = 0; i < fileList.length; i++) {
            const currentFile = fileList[i];
            if (allowedFormats && !isValidFile(currentFile, allowedFormats)) {
                toast.error(`Invalid file type: ${currentFile.name}`);
                continue;
            }
            validFiles.push(currentFile);
        }
        if (validFiles.length > 0) {
            const newArray = multiple ? [...files, ...validFiles] : [validFiles[0]];
            setFiles(newArray);
            if (onFilesChange) onFilesChange(newArray);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setIsDragging(false);
        if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) processFiles(e.target.files);
    };

    const handleReset = (e: React.MouseEvent, indexToRemove?: number) => {
        e.stopPropagation();
        if (indexToRemove !== undefined) {
            const newArray = files.filter((_, i) => i !== indexToRemove);
            setFiles(newArray);
            if (onFilesChange) onFilesChange(newArray);
        } else {
            setFiles([]);
            if (fileInputRef.current) fileInputRef.current.value = "";
            if (onFilesChange) onFilesChange([]);
        }
    };
    return {
        files,
        isDragging,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleFileChange,
        handleReset,
        fileInputRef
    }
}