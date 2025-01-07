import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/agendabela",
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/agendabela/automatize-seu-atendimento",
        permanent: true,
        basePath: false,
      },
      {
        source: "/automatize-seu-atendimento",
        destination: "/agendabela/automatize-seu-atendimento",
        permanent: true,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
