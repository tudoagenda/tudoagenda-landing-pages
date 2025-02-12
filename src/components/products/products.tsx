import { Typography } from "../typography";
import { AgendabelaComponent } from "./agendabela";

export const ProductsComponent = () => {
  return (
    <main className="flex flex-col bg-slate-200">
      <div className="p-8 sm:p-11">
        <Typography as="h2" className="text-slate-950 text-center">
          Nossas soluções
        </Typography>
      </div>

      <div className="flex flex-col">
        <AgendabelaComponent />
      </div>
    </main>
  );
};
