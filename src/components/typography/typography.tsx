import { twMerge } from "tailwind-merge";

type HeadingProps = {
  children: React.ReactNode;
  as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";
  className?: string;
};

const TYPOGRAPHY_CLASS: Record<HeadingProps["as"], string> = {
  h1: "sm:text-6xl text-4xl font-bold text-slate-100 leading-tight",
  h2: "sm:text-5xl text-3xl font-bold text-slate-100 leading-tight",
  h3: "sm:text-4xl text-2xl font-bold text-slate-100 leading-tight",
  h4: "sm:text-3xl text-xl font-bold text-slate-100 leading-tight",
  h5: "sm:text-2xl text-lg font-bold text-slate-100 leading-tight",
  h6: "sm:text-xl text-md font-bold text-slate-100 leading-tight",
  p: "sm:text-lg text-sm text-slate-100 leading-tight",
};

export const Typography = ({
  children,
  as = "h1",
  className,
}: HeadingProps) => {
  const Element = as;
  return (
    <Element className={twMerge(TYPOGRAPHY_CLASS[as], className)}>
      {children}
    </Element>
  );
};
