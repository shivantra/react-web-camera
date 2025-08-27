import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const isProd = process.env.NODE_ENV === "production";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: !isProd,
  scope: "/react-web-camera/",
});

const config: NextConfig = {
  output: "export",

  basePath: "/react-web-camera",

  assetPrefix: isProd ? "/react-web-camera/" : undefined,

  trailingSlash: true,

  images: { unoptimized: true },
};

export default withPWA(config);
