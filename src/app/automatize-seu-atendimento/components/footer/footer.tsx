import { Button } from "@/components/ui/button";

export const FooterComponent = () => {
  return (
    <footer className="flex w-full p-8 justify-center md:justify-end">
      <Button variant="link">Termos de serviço</Button>
      <Button variant="link">Política de privacidade</Button>
    </footer>
  );
};
