import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { updateLeadAction } from "@/Services/APIs/tac/tac.actions";
import { CandidateLead } from "@/Types/Frontend_Payload/Candidate.types";
import { CategoryOption } from "@/Module/Candidate_Dashboard/Inquiry/useInquiry";
import { IPathway } from "@/lib/models/Pathway.model";
import { useEffect, useMemo, useState } from "react";
import { getPathwayPositionsAction, getPathwayTopLevelAction } from "@/Services/APIs/Pathway/pathway.action";
import { positionDBData } from "@/Types/object.types";


export const useInquiryDetails = (candidate: CandidateLead) => {
    const contact = candidate.contact ?? { phone: "", whatsapp: "", email: "" };
    const passport = candidate.passport ?? { status: "no", no: "" };
    const preferences = candidate.preferences ?? { visitType: "" };
    const notifPrefs = candidate.notificationPreference || { email: false, sms: false, whatsapp: false };
    const [categories, setCategories] = useState<IPathway[]>([]);

    const [positionData, setPositionData] = useState<positionDBData[] | null>(
        null,
    );
    const user = candidate?.user;
    // console.log(candidate, 2222);

    const inquiryForm = useFormik({
        initialValues: {
            fullName: candidate.name ?? candidate.fullName ?? "",
            email: contact.email ?? "",
            phone: contact.phone ?? "",
            whatsapp: contact.whatsapp ?? "",
            // address: candidate.address ?? "",
            passportStatus: passport.status ?? "no",
            passportNo: passport.no ?? "",
            inqForType: candidate?.inqForType ?? "",
            inqForPosition: candidate?.inqForPosition ?? "",

            nationality: user?.candidateProfile?.nationality ?? "",
            latestAcademic: user?.candidateProfile?.academic ?? "",
            latestTechnical: user?.candidateProfile?.technicalQualification ?? "",
            workExperience: user?.candidateProfile?.workExp ?? ""
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            fullName: Yup.string().trim().required("Full name is required"),
            email: Yup.string().email("Invalid email").required("Email is required"),
            phone: Yup.string().matches(/^[0-9]{10}$/, "Must be exactly 10 digits").required("Phone is required"),
            whatsapp: Yup.string().matches(/^[0-9]{10}$/, "Must be exactly 10 digits").required("WhatsApp is required"),
            // address: Yup.string().trim().required("Address is required"),
            passportStatus: Yup.string().required(),
            passportNo: Yup.string().when("passportStatus", {
                is: "having", then: (s) => s.trim().required("Passport number is required"), otherwise: (s) => s.optional(),
            }),
            nationality: Yup.string().trim().required("Nationality is required"),
            latestAcademic: Yup.string().trim().required("Latest Academic is required"),
            latestTechnical: Yup.string().trim().required("Latest Technical is required"),
            workExperience: Yup.string().trim().required("Work Experience is required"),
        }),
        onSubmit: async (values, { setSubmitting }) => {
            try {
                await updateLeadAction({ id: candidate._id, ...values });
                toast.success("Inquiry details updated");
            } catch (err: any) {
                toast.error(err?.response?.data?.message ?? "Update failed");
            } finally {
                setSubmitting(false);
            }
        },
    });

    const fe = (field: string) => !!(inquiryForm.touched[field as keyof typeof inquiryForm.touched] && inquiryForm.errors[field as keyof typeof inquiryForm.errors]);
    const fh = (field: string) => inquiryForm.touched[field as keyof typeof inquiryForm.touched] ? (inquiryForm.errors[field as keyof typeof inquiryForm.errors] as string) : undefined;

    const getChipStyle = (isActive: boolean) => isActive ? "!bg-[var(--mui-palette-success-dark)] !text-white !font-bold !border-green-700" : "!bg-[var(--mui-palette-primary)] !text-gray-400 !border-gray-300";



    const fetchCategories = async () => {
        try {
            const response = await getPathwayTopLevelAction();
            if (response?.data?.success) setCategories(response?.data?.data);
            inquiryForm.setFieldValue("inqForType", candidate?.inqForType)
            // console.log(candidate?.inqForType, 5444);

        } catch (err) {
            console.error("Category fetch error:", err);
        }
    };

    const fetchPositions = async (categoryId: string) => {
        if (!categoryId) {
            setPositionData(null);
            return;
        }
        try {
            const response = await getPathwayPositionsAction({
                pathwayId: categoryId,
            });


            const rawData = response?.data?.data;
            if (Array.isArray(rawData)) {
                setPositionData(rawData);
                inquiryForm.setFieldValue("inqForPosition", candidate?.inqForPosition);

            } else if (rawData && Array.isArray((rawData as any).data)) {
                setPositionData((rawData as any).data);
                inquiryForm.setFieldValue("inqForPosition", candidate?.inqForPosition);
            } else {
                setPositionData([]);
            }
        } catch (err) {
            console.error("Position fetch error:", err);
            setPositionData([]);
        }
    };


    function buildCategoryOptions(
        categories: IPathway[]
    ): CategoryOption[] {
        const activeCategories = (categories || []).filter((c) => c.isActive);
        const roots = activeCategories.filter(
            (c) => !c.underPathway || String(c.underPathway) === "",
        );
        const getChildren = (parentId: string) =>
            activeCategories.filter((c) => String(c.underPathway) === parentId);

        const renderNode = (parent: IPathway, level = 0): CategoryOption[] => {
            const parentIdStr = String(parent._id);
            const children = getChildren(parentIdStr);

            if (children.length === 0) {
                return [
                    {
                        kind: "item",
                        key: parentIdStr,
                        value: parentIdStr,
                        label: parent.title,
                        level,
                    },
                ];
            }

            const items: CategoryOption[] = [
                {
                    kind: "header",
                    key: `header-${parentIdStr}`,
                    label: parent.title,
                    level,
                },
            ];
            children.forEach((child) => {
                items.push(...renderNode(child, level + 1));
            });
            return items;
        };

        return roots.flatMap((root) => renderNode(root));
    }

    const categoryOptions = useMemo(
        () => buildCategoryOptions(categories),
        [categories],
    );

    useEffect(() => {
        fetchCategories();
    }, []);


    useEffect(() => {
        fetchPositions(inquiryForm.values.inqForType);
    }, [inquiryForm.values.inqForType]);

    return { inquiryForm, fe, fh, getChipStyle, preferences, notifPrefs, categoryOptions, positionData };
};