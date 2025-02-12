import Image, { ImageProps } from "next/image";

type LogoComponentProps = Omit<ImageProps, "src" | "alt"> & {
  color?: "normal" | "white";
};

export const LogoComponent = ({
  color = "normal",
  ...image
}: LogoComponentProps) => (
  <figure className="inline-flex items-center justify-center">
    <Image
      {...image}
      alt="Tudo Agenda logo"
      src={
        color === "normal"
          ? "/tudoagenda_logo.svg"
          : "/tudoagenda_logo_white.svg"
      }
    />
  </figure>
);
