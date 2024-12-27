import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/automatize-seu-atendimento",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
