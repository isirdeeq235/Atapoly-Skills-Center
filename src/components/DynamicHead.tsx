import { useEffect } from "react";
import { useSiteConfig } from "@/hooks/useSiteConfig";

export function DynamicHead() {
  const { data: siteConfig } = useSiteConfig();

  useEffect(() => {
    if (siteConfig) {
      // Update document title
      document.title = siteConfig.site_name || "TrainHub";

      // Update favicon
      if (siteConfig.favicon_url) {
        let faviconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement;
        if (!faviconLink) {
          faviconLink = document.createElement("link");
          faviconLink.rel = "icon";
          document.head.appendChild(faviconLink);
        }
        faviconLink.href = siteConfig.favicon_url;
      }

      // Update meta tags
      const metaOgTitle = document.querySelector("meta[property='og:title']");
      if (metaOgTitle) {
        metaOgTitle.setAttribute("content", siteConfig.site_name || "TrainHub");
      }

      const metaDescription = document.querySelector("meta[name='description']");
      if (metaDescription) {
        metaDescription.setAttribute(
          "content",
          `${siteConfig.site_name} - Professional Training Platform`
        );
      }
    }
  }, [siteConfig]);

  return null;
}
