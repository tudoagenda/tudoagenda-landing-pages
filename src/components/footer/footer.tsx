export const FooterComponent = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-white text-slate-900 p-8 text-center">
      © {year} Tudo Agenda
    </footer>
  );
};
