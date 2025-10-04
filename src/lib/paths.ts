const ensureTrailingSlash = (value: string) => (value.endsWith('/') ? value : `${value}/`);

const stripLeadingSlash = (value: string) => (value.startsWith('/') ? value.slice(1) : value);

/**
 * Prefix a relative asset path with the configured Vite base path.
 */
export const withBase = (path: string) => {
  const base = ensureTrailingSlash(import.meta.env.BASE_URL ?? '/');
  const normalizedPath = stripLeadingSlash(path);
  return `${base}${normalizedPath}`;
};

/**
 * Resolve an asset path to an absolute URL at runtime. Falls back to the base-prefixed path
 * when running in non-browser environments (e.g. during build-time evaluation).
 */
export const resolveAssetUrl = (path: string) => {
  if (typeof window === 'undefined') {
    return withBase(path);
  }

  return new URL(withBase(path), window.location.origin).toString();
};

