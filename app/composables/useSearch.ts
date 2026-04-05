import type { NpmSearchObject } from "~/types/npm";
import type { WingetSearchItem } from "~/types/winget";

export type SearchSource = "npm" | "winget";
export type NpmSort = "quality" | "popularity" | "maintenance";

export interface UnifiedSearchResult {
  source: SearchSource;
  name: string;
  description: string;
  version: string;
  url: string;
  // NPM specific
  downloads?: number;
  weeklyDownloads?: number;
  license?: string;
  lastPublish?: string;
  keywords?: string[];
  author?: string;
  authorUrl?: string;
  quality?: number;
  popularity?: number;
  maintenance?: number;
  // Winget specific
  publisher?: string;
}

export interface SearchOptions {
  query: string;
  source: SearchSource;
  size?: number;
  from?: number;
  sort?: NpmSort;
}

export function useSearch() {
  const { searchPackages: searchNpm } = useNpm();
  const { searchPackages: searchWinget } = useWinget();

  async function search(
    options: SearchOptions,
  ): Promise<{ results: UnifiedSearchResult[]; total: number }> {
    const { query, source, size = 20, from = 0, sort } = options;

    if (source === "npm") {
      const data = await searchNpm(query, size, from, sort);
      return {
        results: data.objects.map(normalizeNpmResult),
        total: data.total,
      };
    }

    const data = await searchWinget(query, size);
    const items: WingetSearchItem[] = data.Data ?? [];
    return {
      results: items.map(normalizeWingetResult),
      total: items.length,
    };
  }

  function normalizeNpmResult(obj: NpmSearchObject): UnifiedSearchResult {
    return {
      source: "npm",
      name: obj.package.name,
      description: obj.package.description,
      version: obj.package.version,
      url: `/npm/package/${obj.package.name}`,
      downloads: obj.downloads?.monthly,
      weeklyDownloads: obj.downloads?.weekly,
      license: obj.package.license,
      lastPublish: obj.package.date,
      keywords: obj.package.keywords,
      author: obj.package.publisher?.actor?.name ?? obj.package.publisher?.username,
      authorUrl: obj.package.publisher?.actor?.name
        ? `/npm/user/${obj.package.publisher.actor.name}`
        : undefined,
      quality: obj.score?.detail?.quality,
      popularity: obj.score?.detail?.popularity,
      maintenance: obj.score?.detail?.maintenance,
    };
  }

  function normalizeWingetResult(item: WingetSearchItem): UnifiedSearchResult {
    return {
      source: "winget",
      name: item.PackageIdentifier,
      description: item.PackageName ?? "",
      version: item.Versions?.[0]?.PackageVersion ?? "",
      url: `/winget/package/${item.PackageIdentifier}`,
      publisher: item.Publisher,
    };
  }

  return { search };
}
