import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

export const useInquiryLocation = () => {
  const [corordinates, setCorordinates] = useState<string[]>([]);
  const [locationPermissionRequired, setLocationPermissionRequired] =
    useState<boolean>(false);

  const permissionStatusRef = useRef<PermissionStatus | null>(null);

  const getLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Location is not supported by your browser.");
      return;
    }

    try {
      const permission = await navigator.permissions.query({
        name: "geolocation",
      });

      if (permission.state === "denied") {
        setLocationPermissionRequired(true);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setCorordinates([`${coords.latitude}`, `${coords.longitude}`]);
          setLocationPermissionRequired(false);
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setLocationPermissionRequired(true);
            return;
          }

          if (error.code === error.TIMEOUT) {
            toast.error("Location request timed out.");
            return;
          }

          toast.error("Unable to get your location.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    } catch (error) {
      console.error("Location error:", error);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (!navigator.geolocation) {
        toast.error("Location is not supported by your browser.");
        return;
      }

      try {
        const status = await navigator.permissions.query({
          name: "geolocation",
        });
        if (cancelled) return;

        permissionStatusRef.current = status;

        status.onchange = () => {
          if (status.state === "granted") {
            window.location.reload();
          } else if (status.state === "denied") {
            setLocationPermissionRequired(true);
          }
        };

        if (status.state === "denied") {
          setLocationPermissionRequired(true);
          return;
        }

        getLocation();
      } catch (error) {
        console.error("Permission query failed, falling back:", error);
        getLocation();
      }
    };

    init();

    return () => {
      cancelled = true;
      if (permissionStatusRef.current) {
        permissionStatusRef.current.onchange = null;
      }
    };
  }, []);

  return {
    corordinates,
    locationPermissionRequired,
    getLocation,
  };
};
