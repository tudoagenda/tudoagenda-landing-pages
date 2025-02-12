import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/agendabela",
        destination: "/agendabela/automatize-seu-atendimento",
        permanent: true,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
