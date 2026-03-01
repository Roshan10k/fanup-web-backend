/**
 * HATEOAS (Hypermedia As The Engine Of Application State) helper utilities.
 * Generates _links objects for REST API responses per Richardson Maturity Model Level 3.
 *
 * @module helpers/hateoas
 */

/** Represents a single HATEOAS hypermedia link. */
export interface HateoasLink {
  href: string;
  method: string;
  description?: string;
}

/** A dictionary of named HATEOAS links. */
export type HateoasLinks = Record<string, HateoasLink>;

/**
 * Create a single HATEOAS link object.
 *
 * @param href - The URL for the linked resource
 * @param method - The HTTP method (GET, POST, PUT, PATCH, DELETE)
 * @param description - Optional human-readable description
 * @returns A HateoasLink object
 */
export function createLink(
  href: string,
  method: string,
  description?: string
): HateoasLink {
  return { href, method, ...(description && { description }) };
}

/**
 * Generate pagination HATEOAS links for list endpoints.
 *
 * @param basePath - The base URL path (e.g. "/api/matches")
 * @param page - Current page number
 * @param totalPages - Total number of pages
 * @param size - Page size
 * @param extraParams - Additional query parameters to preserve
 * @returns HateoasLinks object with self, first, last, prev, next links
 */
export function createPaginationLinks(
  basePath: string,
  page: number,
  totalPages: number,
  size: number,
  extraParams?: Record<string, string | undefined>
): HateoasLinks {
  const filteredParams = extraParams
    ? Object.entries(extraParams)
        .filter(([, v]) => v !== undefined && v !== "")
        .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
        .join("&")
    : "";

  const buildUrl = (p: number) => {
    const qs = `page=${p}&size=${size}${filteredParams ? `&${filteredParams}` : ""}`;
    return `${basePath}?${qs}`;
  };

  const links: HateoasLinks = {
    self: createLink(buildUrl(page), "GET"),
    first: createLink(buildUrl(1), "GET"),
    last: createLink(buildUrl(totalPages || 1), "GET"),
  };

  if (page > 1) {
    links.prev = createLink(buildUrl(page - 1), "GET");
  }
  if (page < totalPages) {
    links.next = createLink(buildUrl(page + 1), "GET");
  }

  return links;
}

/**
 * Build an RFC 5988 Link header string from pagination parameters.
 *
 * @param basePath - The base URL path
 * @param page - Current page number
 * @param totalPages - Total number of pages
 * @param size - Page size
 * @param extraParams - Additional query parameters to preserve
 * @returns A Link header string
 */
export function buildLinkHeader(
  basePath: string,
  page: number,
  totalPages: number,
  size: number,
  extraParams?: Record<string, string | undefined>
): string {
  const filteredParams = extraParams
    ? Object.entries(extraParams)
        .filter(([, v]) => v !== undefined && v !== "")
        .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
        .join("&")
    : "";

  const buildUrl = (p: number) => {
    const qs = `page=${p}&size=${size}${filteredParams ? `&${filteredParams}` : ""}`;
    return `${basePath}?${qs}`;
  };

  const parts: string[] = [
    `<${buildUrl(1)}>; rel="first"`,
    `<${buildUrl(totalPages || 1)}>; rel="last"`,
  ];

  if (page > 1) {
    parts.push(`<${buildUrl(page - 1)}>; rel="prev"`);
  }
  if (page < totalPages) {
    parts.push(`<${buildUrl(page + 1)}>; rel="next"`);
  }

  return parts.join(", ");
}
