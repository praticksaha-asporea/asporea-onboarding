import { useState, useEffect, ChangeEvent } from "react";
import { useFormik } from "formik";
import { useSelector, useDispatch } from "react-redux";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

import { profileValidationSchema } from "@/Validations/profileValidation";
import { updateUserData } from "@/Redux/Auth/user.slice";
import axiosClient from "@/Services/AxiosConfig/axiosClient";

export const useAccount = () => {
  const dispatch = useDispatch(); 

  const reduxUser = useSelector(
    (state: any) => state.userSlice?.userData || state.user?.userData,
  );

  const [fileInput, setFileInput] = useState<string>("");
  const [imgSrc, setImgSrc] = useState<string>("/images/avatars/1.png");

  const [fetching, setFetching] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (reduxUser?.profilePic?.path) {
      setImgSrc(reduxUser.profilePic.path);
    } else {
      setImgSrc("/images/avatars/1.png");
    }
  }, [reduxUser]);
  useEffect(() => {
    const fetchAndSetData = async () => {
      if (reduxUser && (reduxUser.firstName || reduxUser.verifiedIdentity)) {
        setFetching(false);
        return;
      }

      try {
        const token = Cookies.get("accessToken");
        if (!token) {
          setFetching(false);
          return;
        }

        const payloadBase64 = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        const userId = decodedPayload.userId || decodedPayload.id;

        const res = await axiosClient.get(`/user/details?id=${userId}`);

        if (res.data?.success) {
          const fullUserData = res.data.data.user;
          dispatch(updateUserData(fullUserData));
        }
      } catch (error) {
        console.error("Profile Fetch Error:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchAndSetData();
  }, [reduxUser, dispatch]);

  const formik = useFormik({
    initialValues: {
      firstName: reduxUser?.firstName || "",
      lastName: reduxUser?.lastName || "",
      email:
        (reduxUser?.channel === "email"
          ? reduxUser.verifiedIdentity
          : reduxUser?.email) || "",
      organization: reduxUser?.organization || "",
      phoneNumber:
        (reduxUser?.channel === "sms"
          ? reduxUser.verifiedIdentity
          : reduxUser?.phoneNumber) || "",
      whatsappNumber: reduxUser?.whatsappNumber || "",
      address: reduxUser?.address || "",
      state: reduxUser?.state || "",
      zipCode: reduxUser?.zipCode || "",
      country: reduxUser?.country || "india",
      language: reduxUser?.language || "english",
      timezone: reduxUser?.timezone || "gmt-0530",
      currency: reduxUser?.currency || "inr",
      passportStatus: reduxUser?.passportStatus || "not",
      passportNumber: reduxUser?.passportNo || reduxUser?.passportNumber || "",
      experienceInMonths: reduxUser?.experienceInMonths || "",
      bio: reduxUser?.bio || "",
    },
    enableReinitialize: true,
    validationSchema: profileValidationSchema,
    onSubmit: async (values) => {
      setUpdating(true);
      try {
        const userId = reduxUser?.id || reduxUser?._id;

        if (!userId) {
          toast.error("Session expired. Please login again.");
          return;
        }

        const payload = {
          id: userId,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phoneNumber: String(values.phoneNumber),
          whatsappNumber: String(values.whatsappNumber),
          address: values.address,
          passportStatus: values.passportStatus,
          passportNo:
            values.passportStatus === "having" ? values.passportNumber : "",
          enquired: "yes",
          experienceInMonths: values?.experienceInMonths,
          bio: values?.bio,
          profilePicData: fileInput || "",
        };

        const res = await axiosClient.patch(`/user/profile-update`, payload);

        if (res.data?.success) {
          toast.success("Profile Updated Successfully!", {
            duration: 3000,
          });
          dispatch(updateUserData(res.data.data));
          setFileInput("");
        }
      } catch (error: any) {
        console.error("Update Profile Error:", error);
      } finally {
        setUpdating(false);
      }
    },
  });

  const handleFileInputChange = (file: ChangeEvent) => {
    const { files } = file.target as HTMLInputElement;

    if (files && files.length !== 0) {
      const selectedFile = files[0];

      if (selectedFile.size > 800 * 1024) {
        toast.error(
          "File size is too large! Please select an image under 800KB.",
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result as string;
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleFileInputReset = () => {
    setFileInput("REMOVE");
    setImgSrc("/images/avatars/1.png");
    toast.success("Photo removed! Click 'Save Changes' to persist.");
  };

  useEffect(() => {
    const fetchAndSetData = async () => {
      if (reduxUser && (reduxUser.firstName || reduxUser.verifiedIdentity)) {
        setFetching(false);
        return;
      }

      try {
        const token = Cookies.get("accessToken");
        if (!token) {
          setFetching(false);
          return;
        }

        const payloadBase64 = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        const userId = decodedPayload.userId || decodedPayload.id;

        const res = await axiosClient.get(`/user/details?id=${userId}`);

        if (res.data?.success) {
          const fullUserData = res.data.data.user;
          dispatch(updateUserData(fullUserData));
        }
      } catch (error) {
        console.error("Profile Fetch Error:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchAndSetData();
  }, [reduxUser, dispatch]);

  return {
    formik,
    fileInput,
    setFileInput,
    imgSrc,
    setImgSrc,
    fetching,
    updating,
    handleFileInputChange,
    handleFileInputReset,
    reduxUser,
  };
};
