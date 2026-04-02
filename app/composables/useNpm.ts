import type {
  NpmDownloadPoint,
  NpmDownloadRange,
  NpmPackage,
  NpmPackageFull,
  NpmSearchResponse,
} from "~/types/npm";

const REGISTRY = "https://registry.npmjs.org";
const DOWNLOADS_API = "https://api.npmjs.org/downloads";

export function useNpm() {
  /**
   * Search packages on the npm registry
   */
  async function searchPackages(
    query: string,
    size: number = 20,
    from: number = 0,
    sort?: "quality" | "popularity" | "maintenance",
  ): Promise<NpmSearchResponse> {
    const params: Record<string, string | number> = { text: query, size, from };
    if (sort) {
      params.quality = sort === "quality" ? "1" : "0";
      params.popularity = sort === "popularity" ? "1" : "0";
      params.maintenance = sort === "maintenance" ? "1" : "0";
    }
    return $fetch<NpmSearchResponse>(`${REGISTRY}/-/v1/search`, { params });
  }

  /**
   * Get the latest version of a package (lightweight response)
   */
  async function getPackage(name: string): Promise<NpmPackage> {
    return $fetch<NpmPackage>(`${REGISTRY}/${name}/latest`);
  }

  /**
   * Get a specific version of a package
   */
  async function getPackageVersion(name: string, version: string): Promise<NpmPackage> {
    return $fetch<NpmPackage>(`${REGISTRY}/${name}/${version}`);
  }

  /**
   * Get download stats for a specific period
   */
  async function getDownloads(
    pkg: string,
    period: "last-day" | "last-week" | "last-month" = "last-month",
  ): Promise<NpmDownloadPoint> {
    return $fetch<NpmDownloadPoint>(`${DOWNLOADS_API}/point/${period}/${pkg}`);
  }

  /**
   * Get download stats for a date range (for trends)
   */
  async function getDownloadRange(
    pkg: string,
    start: string,
    end: string,
  ): Promise<NpmDownloadRange> {
    return $fetch<NpmDownloadRange>(`${DOWNLOADS_API}/range/${start}/${end}/${pkg}`);
  }

  /**
   * Get full package metadata (versions, time, dist-tags, etc.)
   */
  async function getFullMetadata(name: string): Promise<NpmPackageFull> {
    return $fetch<NpmPackageFull>(`${REGISTRY}/${name}`);
  }

  /**
   * Get the authoritative list of packages for an npm user
   * Returns a map of package name → permission
   */
  async function getUserPackages(username: string): Promise<Record<string, string>> {
    return $fetch<Record<string, string>>(`${REGISTRY}/-/user/${username}/package`);
  }

  /**
   * Get the list of packages for an npm org/scope via nexus CDN
   * Returns a map of package name → latest version
   */
  async function getOrgPackages(org: string): Promise<Record<string, string>> {
    const data = await $fetch<{ packages: string[] }>(`https://nexus.funish.net/cdn/npm/@${org}`);
    return Object.fromEntries(data.packages.map((name) => [name, "latest"]));
  }

  /**
   * Check if an npm org/scope exists
   * Returns the package count if exists, 0 otherwise
   */
  async function checkOrgExists(org: string): Promise<number> {
    try {
      const data = await $fetch<{ packages: string[] }>(`https://nexus.funish.net/cdn/npm/@${org}`);
      return data.packages.length;
    } catch {
      return 0;
    }
  }

  return {
    searchPackages,
    getPackage,
    getPackageVersion,
    getDownloads,
    getDownloadRange,
    getFullMetadata,
    getUserPackages,
    getOrgPackages,
    checkOrgExists,
  };
}
