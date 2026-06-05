import * as yup from "yup";

export const getGuestValidationSchema = () => {
    return yup.object({
        identity: yup
            .string()
            .trim()
            .required("Phone Number or Email is required")
            .test(
                "is-valid-identity",
                "Enter a valid email or 10-digit phone number",
                (value) => {
                    if (!value) return false;
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    const phoneRegex = /^\d{10}$/;
                    return emailRegex.test(value) || phoneRegex.test(value);
                },
            )
    })
};
