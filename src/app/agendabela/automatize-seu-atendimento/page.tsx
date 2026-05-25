import { HeroComponent } from "./components/hero";
import dynamic from "next/dynamic";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://tudoagenda.com.br/#organization",
      name: "Tudo Agenda",
      url: "https://tudoagenda.com.br",
      logo: "https://tudoagenda.com.br/brand/tudo-agenda/favicon.png",
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://tudoagenda.com.br/agendabela/automatize-seu-atendimento#software",
      name: "Agenda Bela",
      alternateName: "AgendaBela",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, iOS, Android",
      url: "https://tudoagenda.com.br/agendabela/automatize-seu-atendimento",
      image: "https://tudoagenda.com.br/brand/agenda-bela/social-preview.png",
      description:
        "Secretária digital para salões de beleza que confirma agendamentos no WhatsApp, envia lembretes e organiza a agenda do dia.",
      featureList: [
        "Confirmação automática de agendamentos no WhatsApp",
        "Lembretes automáticos para clientes",
        "Agenda diária enviada para a profissional",
        "Cadastro de profissionais, serviços e horários",
        "Relatórios de faturamento e serviços",
      ],
      audience: {
        "@type": "Audience",
        audienceType:
          "Profissionais de beleza feminina, manicures, cabeleireiras, esteticistas e salões pequenos",
      },
      brand: {
        "@type": "Brand",
        name: "Agenda Bela",
      },
      publisher: {
        "@id": "https://tudoagenda.com.br/#organization",
      },
      offers: {
        "@type": "Offer",
        price: "59.90",
        priceCurrency: "BRL",
        availability: "https://schema.org/InStock",
        url: "https://tudoagenda.com.br/agendabela/automatize-seu-atendimento",
      },
    },
  ],
};

const HowItWorksComponent = dynamic(
  () =>
    import("./components/how-it-works").then((mod) => ({
      default: mod.HowItWorksComponent,
    })),
  { loading: () => <div className="h-64 bg-surface-subtle animate-pulse" /> },
);

const FeaturesComponent = dynamic(
  () =>
    import("./components/features").then((mod) => ({
      default: mod.FeaturesComponent,
    })),
  { loading: () => <div className="h-64 bg-brand-creme-soft animate-pulse" /> },
);

const TestimonialsComponent = dynamic(
  () =>
    import("./components/testimonials").then((mod) => ({
      default: mod.TestimonialsComponent,
    })),
  { loading: () => <div className="h-64 bg-surface-subtle animate-pulse" /> },
);

const TrustComponent = dynamic(
  () =>
    import("./components/trust").then((mod) => ({
      default: mod.TrustComponent,
    })),
  { loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded" /> },
);

const FooterComponent = dynamic(
  () =>
    import("./components/footer").then((mod) => ({
      default: mod.FooterComponent,
    })),
  { loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded" /> },
);

const AutomatizeSeuAtendimento = () => {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <HeroComponent />
      <HowItWorksComponent />
      <FeaturesComponent />
      <TestimonialsComponent />
      {/* About / Testimonial / Step legacy — removidos do orquestrador.
          Arquivos ficam no repo até cleanup final (V5). */}
      <TrustComponent />
      <FooterComponent />
    </>
  );
};

export default AutomatizeSeuAtendimento;
