import * as yup from "yup";
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const getLoginValidationSchema = (authMode: string) => {
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
      ),
    password:
      authMode === "password"
        ? yup.string().required("Password is required")
        : yup.string().notRequired(),
  });
};

export const passwordSetupSchema = yup.object({
  newPassword: yup
    .string()
    .required("Password is required")
    .matches(
      passwordRegex,
      "Password must be 8+ chars with uppercase, lowercase, number & special char"
    ),
  confirmPassword: yup
    .string()
    .required("Confirm Password is required")
    .oneOf([yup.ref("newPassword")], "Passwords do not match"),
});