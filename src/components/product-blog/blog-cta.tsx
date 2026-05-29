"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pushProductBlogEvent } from "@/lib/analytics/dataLayer";

type BlogCtaProps = {
  href: string;
  label: string;
  product: string;
  blogSlug: string;
  articleSlug: string;
  position: string;
  className?: string;
};

export function BlogCta({
  href,
  label,
  product,
  blogSlug,
  articleSlug,
  position,
  className,
}: BlogCtaProps) {
  return (
    <Button
      asChild
      variant="brand-primary"
      size="lg"
      className={className}
      onClick={() =>
        pushProductBlogEvent(
          {
            event: "blog_cta_clicked",
            article_slug: articleSlug,
            cta_position: position,
            cta_label: label,
          },
          {
            product,
            content_type: "blog",
            blog_slug: blogSlug,
          },
        )
      }
    >
      <Link href={href}>
        {label}
        <ArrowRight aria-hidden className="h-4 w-4" />
      </Link>
    </Button>
  );
}
