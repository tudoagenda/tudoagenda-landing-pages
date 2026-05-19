import { HeroComponent } from "./components/hero";
import dynamic from "next/dynamic";

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
