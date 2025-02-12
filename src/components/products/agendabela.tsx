import { ProductItemComponent, ProductItemProps } from "./product-item";

const agendabelaContent: ProductItemProps = {
  imgUrl: "/agendabela_print.png",
  title: "Agenda Bela",
  description: `
  ✓ Automatize seus agendamentos \n
  ✓ Atendimento virtual para seus clientes 24/7 no WhatsApp \n
  ✓ Gerencie a sua agenda e a agenda de todos os profissionais do seu salão \n
  ✓ Gerencie seus fornecedores e produtos \n
  ✓ Dashboard completo com todos os indicativos principais do seu salão \n
  ✓ Configure seu salão e comece usar em 5 minutos \n
  `,
  subtitle: "Organize e automatize a rotina do seu salão de beleza",
  product: "agendabela",
  link: "/agendabela",
};

export const AgendabelaComponent = () => {
  return <ProductItemComponent {...agendabelaContent} />;
};
