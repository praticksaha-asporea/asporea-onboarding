import * as yup from "yup";

export const completeProfileValidationSchema = yup.object({
  firstName: yup
    .string()
    .matches(/^[A-Za-z\s]+$/, "Only alphabets allowed (no numbers)")
    .min(2, "Min 2 characters required")
    .required("First name is required"),

  lastName: yup
    .string()
    .matches(/^[A-Za-z\s]+$/, "Only alphabets allowed (no numbers)")
    .required("Last name is required"),

  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),

  phoneNumber: yup
    .string()
    .matches(/^[0-9]{10}$/, "Enter exactly 10 digits (no words/letters)")
    .required("Phone number is required"),

  whatsappNumber: yup
    .string()
    .trim()
    .matches(/^[0-9]{10}$/, "Enter exactly 10 digits")
    .required("WhatsApp number is required"),

  passportStatus: yup.string(),

  passportNumber: yup.string().when("passportStatus", {
    is: "having",
    then: (schema) =>
      schema
        .matches(
          /^[A-Z][0-9]{7}$/,
          "Format: 1 Letter + 7 Digits (e.g., Z1234567)",
        )
        .required("Passport number is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  address: yup.string().required("Address is required"),
});
