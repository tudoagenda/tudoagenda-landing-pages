import { HeroComponent } from "./components/hero";
import dynamic from "next/dynamic";

const AboutComponent = dynamic(() => import("./components/about").then(mod => ({ default: mod.AboutComponent })), {
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded" />
});

const TrustComponent = dynamic(() => import("./components/trust").then(mod => ({ default: mod.TrustComponent })), {
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded" />
});

const TestimonialComponent = dynamic(() => import("./components/testimonial").then(mod => ({ default: mod.TestimonialComponent })), {
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded" />
});

const FooterComponent = dynamic(() => import("./components/footer").then(mod => ({ default: mod.FooterComponent })), {
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded" />
});

const AutomatizeSeuAtendimento = () => {
  return (
    <>
      <HeroComponent />
      <AboutComponent />
      <TrustComponent />
      <TestimonialComponent />
      <FooterComponent />
    </>
  );
};

export default AutomatizeSeuAtendimento;
