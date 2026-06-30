import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { changePasswordApi } from "@/Services/APIs/auth/auth.actions";
import { useSelector } from "react-redux";
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
export const useChangePassword = (onClose: () => void) => {
  const reduxUser = useSelector(
    (state: any) => state.userSlice?.userData || state.user?.userData,
  );

  const formik = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      oldPassword: Yup.string().required("Old password is required"),
      newPassword: Yup.string()
        .matches(
          passwordRegex,
          "Password must be at least 8 characters and include uppercase, lowercase, number and special character"
        )
        .required("New password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword")], "Passwords must match")
        .required("Confirm password is required"),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const payload = {
          userId: reduxUser?._id || reduxUser?.id,
          ...values,
        };

        const res: any = await changePasswordApi(payload);

        if (res.data?.success !== false) {
          toast.success("Password changed successfully");
          resetForm();
          onClose();
        }
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Failed to change password",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  return { formik };
};
