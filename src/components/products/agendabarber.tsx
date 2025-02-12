import { ProductItemComponent, ProductItemProps } from "./product-item";

const agendabarberContent: ProductItemProps = {
  imgUrl: "/agendabela_print.png",
  title: "Agenda Barber",
  description: `
  ✓ Automatize seus agendamentos \n
  ✓ Atendimento virtual para seus clientes 24/7 no WhatsApp \n
  ✓ Gerencie a sua agenda e a agenda de todos os profissionais da sua barbearia \n
  ✓ Gerencie seus fornecedores e produtos \n
  ✓ Dashboard completo com todos os indicativos principais da sua barbearia \n
  ✓ Configure sua barbearia e comece usar em 5 minutos \n
  `,
  subtitle: "Organize e automatize a rotina da sua barbearia",
  product: "agendabarber",
};

export const AgendabarberComponent = () => {
  return <ProductItemComponent {...agendabarberContent} />;
};
