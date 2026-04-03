import type { FetchError } from "ofetch";

import type {
  WingetApiResponse,
  WingetInstallerData,
  WingetLocaleData,
  WingetLocaleInfo,
  WingetMatchType,
  WingetPackageData,
  WingetSearchRequest,
  WingetSearchResponse,
  WingetVersionData,
} from "~/types/winget";

const API = "https://nexus.funish.net/api/winget";

export function useWinget() {
  /**
   * Search Winget packages via manifestSearch endpoint (POST)
   */
  async function searchPackages(
    query: string,
    maximumResults: number = 20,
    matchType: WingetMatchType = "CaseInsensitive",
  ): Promise<WingetSearchResponse> {
    const body: WingetSearchRequest = {
      MaximumResults: maximumResults,
      Query: {
        KeyWord: query,
        MatchType: matchType,
      },
    };
    try {
      const data = await $fetch<WingetSearchResponse>(`${API}/manifestSearch`, {
        method: "POST",
        body,
      });
      // ofetch may return null for 204 empty body
      return data ?? { Data: [] };
    } catch (err: unknown) {
      // WinGet REST API returns 204 No Content when no results found;
      // ofetch may throw a JSON parse error for the empty response body.
      const fetchError = err as FetchError;
      if (fetchError?.response?.status === 204) {
        return { Data: [] };
      }
      throw err;
    }
  }

  /**
   * Get Winget package detail (minimal: only identifier)
   */
  async function getPackage(id: string): Promise<WingetPackageData> {
    const res = await $fetch<WingetApiResponse<WingetPackageData>>(`${API}/packages/${id}`);
    return res.Data;
  }

  /**
   * Get all versions of a Winget package
   */
  async function getVersions(id: string): Promise<WingetVersionData[]> {
    const res = await $fetch<WingetApiResponse<WingetVersionData[]>>(
      `${API}/packages/${id}/versions`,
    );
    return res.Data;
  }

  /**
   * Get a specific version of a Winget package
   */
  async function getVersion(id: string, version: string): Promise<WingetVersionData> {
    const res = await $fetch<WingetApiResponse<WingetVersionData>>(
      `${API}/packages/${id}/versions/${version}`,
    );
    return res.Data;
  }

  /**
   * Get installers for a specific version
   */
  async function getInstallers(id: string, version: string): Promise<WingetInstallerData[]> {
    const res = await $fetch<WingetApiResponse<WingetInstallerData[]>>(
      `${API}/packages/${id}/versions/${version}/installers`,
    );
    return res.Data;
  }

  /**
   * Get available locales for a specific version
   */
  async function getLocales(id: string, version: string): Promise<WingetLocaleInfo[]> {
    const res = await $fetch<WingetApiResponse<WingetLocaleInfo[]>>(
      `${API}/packages/${id}/versions/${version}/locales`,
    );
    return res.Data;
  }

  /**
   * Get locale info for a specific version (contains full description)
   */
  async function getLocale(
    id: string,
    version: string,
    locale: string = "en-US",
  ): Promise<WingetLocaleData> {
    const res = await $fetch<WingetApiResponse<WingetLocaleData>>(
      `${API}/packages/${id}/versions/${version}/locales/${locale}`,
    );
    return res.Data;
  }

  return {
    searchPackages,
    getPackage,
    getVersions,
    getVersion,
    getInstallers,
    getLocales,
    getLocale,
  };
}
