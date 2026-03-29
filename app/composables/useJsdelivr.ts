import type { JsdelivrFileList } from "~/types/npm";

const API = "https://data.jsdelivr.com/v1";
const CDN = "https://cdn.jsdelivr.net/npm";

export function useJsdelivr() {
  /**
   * Get nested file tree for an npm package version
   */
  async function getFiles(pkg: string, version: string): Promise<JsdelivrFileList> {
    return $fetch<JsdelivrFileList>(`${API}/package/npm/${pkg}@${version}`);
  }

  /**
   * Get file content from jsdelivr CDN
   */
  async function getFileContent(pkg: string, version: string, path: string): Promise<string> {
    return $fetch<string>(`${CDN}/${pkg}@${version}/${path}`, {
      responseType: "text",
    });
  }

  /**
   * Get README content, trying common filename variants
   */
  async function getReadme(pkg: string, version: string): Promise<string | null> {
    const candidates = ["README.md", "Readme.md", "readme.md", "README"];
    for (const name of candidates) {
      try {
        return await getFileContent(pkg, version, name);
      } catch {}
    }
    // Fallback: find any readme file in the tree
    try {
      const tree = await getFiles(pkg, version);
      const readmeFile = tree.files?.find(
        (f) => f.type === "file" && f.name.toLowerCase().startsWith("readme"),
      );
      if (readmeFile) {
        return await getFileContent(pkg, version, readmeFile.name);
      }
    } catch {}
    return null;
  }

  return { getFiles, getFileContent, getReadme };
}
