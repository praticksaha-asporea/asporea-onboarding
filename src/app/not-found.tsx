"use client";

import Link from "next/link";
import { useLottie } from "lottie-react";

import notFoundAnim from "@/assets/404 Page not found.json";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import Logo from "@/Components_Theme/layout/shared/Logo";
import Illustrations from "@/Components/Illustrations";

export default function NotFound() {
  const options = {
    animationData: notFoundAnim,
    loop: true,
    autoplay: true,
  };

  const { View } = useLottie(options);

  return (
    <div className="flex flex-col justify-center items-center min-bs-[100dvh] relative p-6">
      <Card className="flex flex-col sm:is-[450px] z-[1]">
        <CardContent className="p-6 sm:!p-12 flex flex-col items-center text-center">
          <Link href="/" className="flex justify-center items-center mbe-6">
            <Logo />
          </Link>

          <div className="w-48 h-48 md:w-56 md:h-56 flex items-center justify-center mbe-4">
            {View}
          </div>

          {/* Texts */}
          <Typography variant="h4" className="mbe-2 font-medium text-slate-700">
            Oops! Page Not Found
          </Typography>
          <Typography className="mbe-6 text-slate-500 text-sm leading-relaxed">
            The page you are looking for might have been removed or does not
            exist.
          </Typography>

          <Button
            component={Link}
            href="/"
            fullWidth
            variant="contained"
            className=" text-base shadow-md"
          >
            <i className="ri-home-4-line mr-2 text-lg" />
            Go Home
          </Button>
        </CardContent>
      </Card>

      <Illustrations
        maskImg={{ src: "/images/pages/auth-v1-mask-light.png" }}
      />
    </div>
  );
}
