// NPM registry search result object
export interface NpmSearchObject {
  package: NpmSearchPackage;
  score: {
    final: number;
    detail: { quality: number; popularity: number; maintenance: number };
  };
  searchScore: number;
  downloads: { monthly: number; weekly: number };
  dependents: string;
  flags: { insecure: number };
}

export interface NpmSearchPackage {
  name: string;
  scope: string;
  version: string;
  description: string;
  keywords: string[];
  date: string;
  license?: string;
  links: {
    npm: string;
    homepage?: string;
    repository?: string;
    bugs?: string;
  };
  author: { name: string; email?: string; url?: string } | null;
  publisher: {
    actor?: { name: string; type: string; email?: string };
    username: string;
    email: string;
  };
  maintainers: { username: string; email: string }[];
}

export interface NpmSearchResponse {
  objects: NpmSearchObject[];
  total: number;
  time: string;
}

// NPM package metadata (from /{package}/latest or /{package}/{version})
export interface NpmPackage {
  name: string;
  version: string;
  description: string;
  main?: string;
  module?: string;
  types?: string;
  exports?: Record<string, unknown>;
  homepage?: string;
  repository?: { type: string; url: string };
  bugs?: { url: string };
  license?: string;
  author?: { name: string; email?: string; url?: string } | string;
  maintainers?: { name: string; email: string }[];
  keywords?: string[];
  readme?: string;
  bin?: Record<string, string> | string;
  scripts?: Record<string, string>;
  engines?: { node?: string };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
  dist: {
    tarball: string;
    shasum: string;
    integrity: string;
    unpackedSize?: number;
    fileCount?: number;
  };
  _npmUser?: { name: string; email: string };
  _nodeVersion?: string;
}

// NPM full metadata (from /{package})
export interface NpmPackageFull extends NpmPackage {
  "dist-tags": Record<string, string>;
  versions: Record<string, NpmPackage>;
  time: Record<string, string>;
  users: Record<string, boolean>;
}

// NPM download stats
export interface NpmDownloadPoint {
  downloads: number;
  package: string;
  start: string;
  end: string;
}

export interface NpmDownloadRange {
  package: string;
  start: string;
  end: string;
  downloads: { day: string; downloads: number }[];
}

// jsdelivr file list (nested tree structure)
export interface JsdelivrFileNode {
  type: "file" | "directory";
  name: string;
  hash?: string;
  time?: string;
  size?: number;
  files?: JsdelivrFileNode[];
}

export interface JsdelivrFileList {
  default: string;
  files: JsdelivrFileNode[];
}
