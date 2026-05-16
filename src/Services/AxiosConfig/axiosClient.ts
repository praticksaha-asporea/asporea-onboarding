import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const axiosClient = axios.create({
  baseURL: "/api",
});

// ===== Request Interceptor =====
axiosClient.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");

  if (
    config.method?.toLowerCase() === "put" &&
    /^https?:\/\//i.test(config.url || "")
  ) {
    if (config.headers?.Authorization) {
      delete config.headers.Authorization;
    }
    return config;
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ===== Refresh Token Logic =====
let isRefreshing = false;
let failedQueue: {
  resolve: (_value?: unknown) => void;
  reject: (_reason?: unknown) => void;
}[] = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ===== Response Interceptor =====
axiosClient.interceptors.response.use(
  (response) => response,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const isUnauthorized = error.response?.status === 401;
    const errorMessage = error.response?.data?.message?.toLowerCase() || "";
    const isDuplicateError = 
      errorMessage.includes("already exists") || 
      errorMessage.includes("in use");
     const tokenExpired = error.response?.data?.error?.isTokenValid === false || error.response?.data?.message === "Invalid / expired token";

    if (isUnauthorized && tokenExpired && !originalRequest?._retry) {
      if (isRefreshing) {
        // Queue the request until refresh finishes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest?.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosClient(originalRequest!);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest!._retry = true;
      isRefreshing = true;

      const refreshToken = Cookies.get("refreshToken");
      if (!refreshToken) {
        toast.error("No refresh token found. Please login again.");
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post("/api/auth/refresh-token", {
          refreshToken: refreshToken,
        });
       const responseData = refreshResponse.data?.data || refreshResponse.data;

      
        const newAccessToken = responseData?.accessToken || responseData?.tokens?.accessToken || responseData?.access?.token;
        const newRefreshToken = responseData?.refreshToken || responseData?.tokens?.refreshToken || responseData?.refresh?.token;

       
        if (newAccessToken && newRefreshToken) {
          Cookies.set("accessToken", newAccessToken);
          Cookies.set("refreshToken", newRefreshToken);
          
          processQueue(null, newAccessToken);

          if (originalRequest?.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return axiosClient(originalRequest!);
        } else {
       
          throw new Error("Missing tokens in response");
        }
      } catch (refreshError) {
        
        processQueue(refreshError, null);
        toast.error("Session expired. Please login again.");

        const allCookies = Cookies.get();
        Object.keys(allCookies).forEach((cookieName) => {
          if (cookieName !== "remEmail" && cookieName !== "remPass") {
            Cookies.remove(cookieName);
          }
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    } else {
      if (isUnauthorized && !isDuplicateError) {
        Object.keys(Cookies.get()).forEach((cookieName) => {
          if (cookieName !== "remEmail" && cookieName !== "remPass") {
            Cookies.remove(cookieName);
          }
        });
      }
    }

    // === General error handling ===
    toast.dismiss();

    if (
      error.response?.status &&
      error.response.status >= 400 &&
      error.response.status < 500
    ) {
      toast.error(error.response.data?.message || "Something went wrong!");
    } else if (error.response?.status === 500) {
      toast.error(error.response?.data?.message || "Something went wrong!");
    } else {
      toast.error("An unexpected error occurred.");
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
