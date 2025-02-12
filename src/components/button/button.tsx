import { twMerge } from "tailwind-merge";

type Variant = "primary" | "secondary" | "text";

type ButtonProps = {
  children: React.ReactNode;
  href: string;
  variant?: Variant;
  target?: "_blank" | "_self" | "_parent" | "_top";
};

const buttonClassNames: Record<Variant, string> = {
  primary: "bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold rounded",
  secondary:
    "bg-indigo-500 hover:bg-indigo-600 text-indigo-950 font-bold rounded text-white",
  text: "bg-indigo-500 hover:bg-indigo-600 text-indigo-950 font-bold rounded",
};

export const Button = ({
  children,
  href,
  variant = "primary",
  target = "_self",
}: ButtonProps) => {
  return (
    <a
      href={href}
      className={twMerge(
        "py-2 px-4 transition-all duration-150 ease-in-out",
        buttonClassNames[variant]
      )}
      target={target}
    >
      {children}
    </a>
  );
};
