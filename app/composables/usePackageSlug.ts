/**
 * Parse catch-all route slug into package name, version, and scope info.
 * Handles both NPM (@scope/name) and Winget (Publisher.Name) formats.
 *
 * Examples:
 *   ['vue']                           -> { packageName: 'vue', version: null, isScoped: false }
 *   ['@vue', 'core']                  -> { packageName: '@vue/core', version: null, isScoped: true }
 *   ['vue', 'v', '3.5.31']            -> { packageName: 'vue', version: '3.5.31', isScoped: false }
 *   ['@vue', 'core', 'v', '3.5.31']   -> { packageName: '@vue/core', version: '3.5.31', isScoped: true }
 */
export function usePackageSlug(slug: string[]) {
  let version: string | null = null;
  let nameSegments: string[];

  // Check if the last two segments form a /v/{semver} pattern
  if (
    slug.length >= 3 &&
    slug[slug.length - 2] === "v" &&
    slug[slug.length - 1] &&
    /^\d/.test(slug[slug.length - 1]!)
  ) {
    version = slug[slug.length - 1]!;
    nameSegments = slug.slice(0, -2);
  } else {
    nameSegments = slug;
  }

  const packageName = nameSegments.join("/");
  const isScoped = nameSegments[0]?.startsWith("@") ?? false;

  return { packageName, version, isScoped };
}
