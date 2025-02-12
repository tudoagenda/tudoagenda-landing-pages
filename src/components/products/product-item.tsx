import { twMerge } from "tailwind-merge";
import { Typography } from "../typography";
import Image from "next/image";
import { Button } from "../button";
import { Spacer } from "../spacer";

type Product =
  | "agendabela"
  | "agendabarber"
  | "agendamed"
  | "agendapet"
  | "agendavet"
  | "agendacar";

export type ProductItemProps = {
  imgUrl: string;
  title: string;
  subtitle: string;
  description: string;
  direction?: "left" | "right";
  product: Product;
  link?: string;
};

const productStyling: Record<
  Product,
  { bg1: string; bg2: string; font: string }
> = {
  agendabela: {
    bg1: "bg-purple-50",
    bg2: "bg-purple-200",
    font: "text-purple-800",
  },
  agendamed: {
    bg1: "bg-green-100",
    bg2: "bg-green-200",
    font: "text-green-800",
  },
  agendabarber: {
    bg1: "bg-blue-100",
    bg2: "bg-blue-200",
    font: "text-blue-800",
  },
  agendapet: {
    bg1: "bg-yellow-100",
    bg2: "bg-yellow-200",
    font: "text-yellow-800",
  },
  agendavet: {
    bg1: "bg-red-100",
    bg2: "bg-red-200",
    font: "text-red-800",
  },
  agendacar: {
    bg1: "bg-gray-100",
    bg2: "bg-gray-200",
    font: "text-gray-800",
  },
};

export const ProductItemComponent = ({
  imgUrl,
  title,
  subtitle,
  product,
  description,
  direction = "left",
  link,
}: ProductItemProps) => {
  return direction === "left" ? (
    <article className="flex flex-col md:flex-row w-full min-h-80">
      <div className="relative flex w-full max-w-2xl items-center justify-center">
        <figure className="w-full max-w-2xl">
          <Image
            src={imgUrl}
            alt={title}
            width={1200}
            height={897}
            layout="responsive"
          />
        </figure>
      </div>
      <div
        className={twMerge(
          "flex flex-col items-start gap-2 p-8 w-full",
          productStyling[product].bg1
        )}
      >
        <Typography as="h3" className={productStyling[product].font}>
          {title}
        </Typography>
        <Typography
          as="h4"
          className={twMerge(
            productStyling[product].font,
            "text-lg sm:text-lg font-normal"
          )}
        >
          {subtitle}
        </Typography>
        <div
          className={twMerge(
            productStyling[product].font,
            "mt-4 whitespace-pre-line text-base sm:text-base !leading-none"
          )}
        >
          {description}
        </div>

        <Spacer height={4} />

        {link && (
          <Button href={link} variant="secondary" target="_blank">
            Conheça agora
          </Button>
        )}
      </div>
    </article>
  ) : (
    <article className="flex w-full min-h-80">
      <div
        className={twMerge(
          "flex flex-col items-start gap-2 p-8 w-full",
          productStyling[product].bg1
        )}
      >
        <Typography as="h3" className={productStyling[product].font}>
          {title}
        </Typography>
        <Typography
          as="h4"
          className={twMerge(
            productStyling[product].font,
            "text-lg sm:text-lg font-normal"
          )}
        >
          {subtitle}
        </Typography>
        <div
          className={twMerge(
            productStyling[product].font,
            "mt-4 whitespace-pre-line text-base sm:text-base !leading-none"
          )}
        >
          {description}
        </div>

        <Spacer height={4} />

        {link && (
          <Button href={link} variant="secondary" target="_blank">
            Conheça agora
          </Button>
        )}
      </div>
      <div className="relative flex w-full max-w-2xl items-center">
        <figure>
          <Image
            src={imgUrl}
            alt={title}
            width={1200}
            height={897}
            layout="responsive"
          />
        </figure>
      </div>
    </article>
  );
};
