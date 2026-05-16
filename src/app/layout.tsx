import "react-perfect-scrollbar/dist/css/styles.css";
import { Toaster } from "react-hot-toast";
import GlobalAlertProvider from "@/Components/GlobalAlertProvider/GlobalAlertProvider";

import type { ChildrenType } from "@core/types";

import "./globals.css";

import "@assets/iconify-icons/generated-icons.css";

import NextAuthProvider from "@/Components_Theme/NextAuthProvider";
import MainLayout from "@/Components/Layouts/MainLayout/MainLayout";

import Providers from "@/Components_Theme/Providers";

export const metadata = {
  title: "Asporea Candidate Onboarding",
  description: "Developed for future",
};

const RootLayout = ({ children }: ChildrenType) => {
  const direction = "ltr";

  return (
    <html id="__next" dir={direction}>
      <body className="flex is-full min-bs-full flex-auto flex-col">
        <Providers direction={direction}>
          <NextAuthProvider>
            <MainLayout>
              {children}
              <Toaster position="top-center" reverseOrder={false} />
              <GlobalAlertProvider />
            </MainLayout>
          </NextAuthProvider>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
