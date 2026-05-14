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
          token: refreshToken,
        });
        const { access, refresh } = refreshResponse.data.data || {};
        // console.log(access, refresh);

        const accessToken = access.token;
        const newRefreshToken = refresh.token;
        if (accessToken && newRefreshToken) {
          Cookies.set("accessToken", accessToken);
          Cookies.set("refreshToken", newRefreshToken);
          processQueue(null, accessToken);

          if (originalRequest?.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return axiosClient(originalRequest!);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        toast.error("Session expired. Please login again.");

        const allCookies = Cookies.get();

        // Loop through and remove each cookie
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
      if (isUnauthorized) {
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
// import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
// import Cookies from 'js-cookie';
// import toast from 'react-hot-toast';

// const axiosClient = axios.create({
//   baseURL: '/api', // Ensure tera base URL yahi hai
// });

// // ===== Request Interceptor =====
// axiosClient.interceptors.request.use((config) => {
//   const token = Cookies.get('accessToken');

//   if (config.method?.toLowerCase() === 'put' && /^https?:\/\//i.test(config.url || '')) {
//     if (config.headers?.Authorization) {
//       delete config.headers.Authorization;
//     }
//     return config;
//   }

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// // ===== Refresh Token Logic =====
// let isRefreshing = false;
// let failedQueue: {
//   resolve: (_value?: unknown) => void;
//   reject: (_reason?: unknown) => void;
// }[] = [];

// const processQueue = (error: any, token: string | null = null) => {
//   failedQueue.forEach((prom) => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });
//   failedQueue = [];
// };
//  // ===== Response Interceptor =====
// axiosClient.interceptors.response.use(
//   (response) => {
//     // Agar API success ho gayi, toh yahan log aayega
//     console.log("🟢 API SUCCESS:", response.config.url, "Status:", response.status);
//     return response;
//   },
//   async (error: AxiosError<any>) => {
//     const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

//     // 🚨 YE LOG SAB BATA DEGA: Backend ne kya bheja hai fail hone par!
//     console.error("🔴 API FAILED:", originalRequest?.url);
//     console.error("🔴 STATUS CODE:", error.response?.status);
//     console.error("🔴 BACKEND MESSAGE:", error.response?.data);

//     // Maine 401 aur 403 dono add kar diye hain, in case backend 403 bhej raha ho
//     const isUnauthorized = error.response?.status === 401 || error.response?.status === 403;

//     if (isUnauthorized && !originalRequest?._retry) {
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         })
//           .then((token) => {
//             if (originalRequest?.headers) {
//               originalRequest.headers.Authorization = `Bearer ${token}`;
//             }
//             return axiosClient(originalRequest!);
//           })
//           .catch((err) => Promise.reject(err));
//       }

//       originalRequest!._retry = true;
//       isRefreshing = true;

//       const refreshToken = Cookies.get('refreshToken');
//       if (!refreshToken) {
//         console.log("❌ Refresh token hi nahi hai cookies mein!");
//         toast.error('Session expired. Please login again.');
//         setTimeout(() => { window.location.href = '/login'; }, 1000);
//         return Promise.reject(error);
//       }

//       console.warn("⚠️ Access Token Expired! Trying to refresh...");

//       try {
//         const refreshResponse = await axios.post('/api/auth/refresh-token', {
//           token: refreshToken,
//         });

//         console.log("🟡 REFRESH API RESPONSE:", refreshResponse.data);

//         const newAccessToken = refreshResponse.data?.data?.tokens?.access?.token || refreshResponse.data?.data?.tokens?.accessToken || refreshResponse.data?.data?.accessToken;
//         const newRefreshToken = refreshResponse.data?.data?.tokens?.refresh?.token || refreshResponse.data?.data?.tokens?.refreshToken || refreshResponse.data?.data?.refreshToken;

//         if (newAccessToken) {
//           console.log("✅ Token successfully refreshed!");
//           Cookies.set('accessToken', newAccessToken);
//           if (newRefreshToken) Cookies.set('refreshToken', newRefreshToken);
          
//           processQueue(null, newAccessToken);

//           if (originalRequest?.headers) {
//             originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//           }
//           return axiosClient(originalRequest!);
//         } else {
//            console.log("❌ Naya token object mein mila hi nahi!");
//            throw new Error("Tokens missing in refresh response");
//         }
//       } catch (refreshError) {
//         console.error("❌ Failed to refresh token API:", refreshError);
//         processQueue(refreshError, null);
//         toast.error('Session expired. Please login again.');

//         const allCookies = Cookies.get();
//         Object.keys(allCookies).forEach((cookieName) => {
//           if (cookieName !== 'remEmail' && cookieName !== 'remPass') {
//             Cookies.remove(cookieName);
//           }
//         });
//         setTimeout(() => {
//           window.location.href = '/login';
//         }, 1000);
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     toast.dismiss();
//     return Promise.reject(error);
//   }
// );

// export default axiosClient;