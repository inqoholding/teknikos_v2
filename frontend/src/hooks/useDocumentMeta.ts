import { useEffect } from "react";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "../lib/site";

type DocumentMetaOptions = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
};

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element!.setAttribute(key, value);
  });
}

export function useDocumentMeta(options: DocumentMetaOptions = {}) {
  useEffect(() => {
    const title = options.title ?? SITE_TITLE;
    const description = options.description ?? SITE_DESCRIPTION;
    const url = `${SITE_URL}${options.path ?? ""}`;
    const image = options.image ?? `${SITE_URL}/teknikos-dashboard-mockup.png`;

    document.title = title;

    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: url });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: image });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: image });
  }, [options.description, options.image, options.path, options.title]);
}
