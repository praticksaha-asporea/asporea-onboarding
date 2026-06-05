import { useState } from "react";

import { useFormik } from "formik";

import { useImageVariant } from "@core/hooks/useImageVariant";
import { Mode } from "@/@core/types";
import { getGuestValidationSchema } from "@/Validations/guestValidation";
import { createBranchTokenAction } from "@/Services/APIs/Guest/guest.actions";

export function useGuestToken({ mode }: { mode: Mode }) {


  const darkImg = "/images/pages/auth-v1-mask-dark.png";
  const lightImg = "/images/pages/auth-v1-mask-light.png";
  const authBackground = useImageVariant(mode, lightImg, darkImg);


  const formik = useFormik({
    initialValues: {
      identity: "",
    },
    enableReinitialize: true,

    validateOnBlur: false,
    validationSchema: getGuestValidationSchema,
    onSubmit: async (values) => {
      const res = await createBranchTokenAction(values);
      console.log(res,22);
    },
  });


  return {
    formik,
    authBackground
  };
}
