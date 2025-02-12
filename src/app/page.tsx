import { FooterComponent } from "@/components/footer";
import { HeroComponent } from "@/components/hero";
import { ProductsComponent } from "@/components/products";
import { AboutComponent } from "@/components/about";
export default function Home() {
  return (
    <>
      <HeroComponent />
      <AboutComponent />
      <ProductsComponent />
      <FooterComponent />
    </>
  )
}
