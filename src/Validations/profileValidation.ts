import * as yup from "yup";

export const profileValidationSchema = yup.object({
  firstName: yup
    .string()
    .min(2, "Enter a valid name (min 2 letters)")
    .required("First name is required"),

  lastName: yup
    .string()
    .min(2, "Enter a valid name")
    .required("Last name is required"),

  phoneNumber: yup
    .string()
    .matches(/^\d{10}$/, "Please Provide a valid 10-digit phone number")
    .required("Phone number is required"),

  whatsappNumber: yup
    .string()
    .matches(/^\d{10}$/, "Please Provide a valid 10-digit WhatsApp number")
    .required("WhatsApp number is required"),

   address: yup.string()
  .trim()  
  .required("Address is required"),

  passportStatus: yup.string(),

  passportNumber: yup.string().when("passportStatus", {
    is: "having",
    then: (schema) =>
      schema
        .required("Passport number is required")
        .matches(
          /^[A-Z][0-9]{7}$/,
          "Format: 1 Letter + 7 Digits (e.g., Z1234567)",
        ),
    otherwise: (schema) => schema.notRequired(),
  }),
});
