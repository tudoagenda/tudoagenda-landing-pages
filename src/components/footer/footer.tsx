import Link from "next/link";

export const FooterComponent = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white px-8 py-8 text-center text-slate-700">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} Tudo Agenda</p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <Link href="/privacidade" className="underline-offset-4 hover:underline">
            Política de privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
};
