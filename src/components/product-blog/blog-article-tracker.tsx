"use client";

import { useEffect, useRef } from "react";
import { pushProductBlogEvent } from "@/lib/analytics/dataLayer";

type BlogArticleTrackerProps = {
  product: string;
  blogSlug: string;
  articleSlug: string;
  articleTitle: string;
  category: string;
};

export function BlogArticleTracker({
  product,
  blogSlug,
  articleSlug,
  articleTitle,
  category,
}: BlogArticleTrackerProps) {
  const completedRef = useRef(false);

  useEffect(() => {
    pushProductBlogEvent(
      {
        event: "blog_view",
        article_slug: articleSlug,
        article_title: articleTitle,
        category,
      },
      {
        product,
        content_type: "blog",
        blog_slug: blogSlug,
      },
    );

    const handleScroll = () => {
      if (completedRef.current) return;
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollableHeight <= 0) return;

      const scrollDepth = Math.round(
        (window.scrollY / scrollableHeight) * 100,
      );

      if (scrollDepth >= 80) {
        completedRef.current = true;
        pushProductBlogEvent(
          {
            event: "blog_article_completed",
            article_slug: articleSlug,
            article_title: articleTitle,
            scroll_depth: scrollDepth,
          },
          {
            product,
            content_type: "blog",
            blog_slug: blogSlug,
          },
        );
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [articleSlug, articleTitle, blogSlug, category, product]);

  return null;
}
