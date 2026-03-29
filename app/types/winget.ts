// Winget API response wrappers (all responses are wrapped in { Data: ... })
export interface WingetApiResponse<T> {
  Data: T;
}

// Winget package detail (minimal - only identifier)
export interface WingetPackageData {
  PackageIdentifier: string;
}

// Winget version info
export interface WingetVersionData {
  PackageVersion: string;
  DefaultLocale: string;
  Channel?: string;
}

// Winget available locale
export interface WingetLocaleInfo {
  PackageLocale: string;
}

// Winget installer (based on official OpenAPI spec)
export interface WingetInstallerData {
  InstallerIdentifier?: string;
  InstallerSha256?: string;
  InstallerUrl?: string;
  Architecture: string;
  InstallerLocale?: string;
  Platform?: string;
  MinimumOSVersion?: string;
  InstallerType: string;
  Scope?: string;
  SignatureSha256?: string;
  InstallModes?: string[];
  InstallerSwitches?: Record<string, string>;
  InstallerSuccessCodes?: number[];
  ExpectedReturnCodes?: {
    ReturnCode: number;
    ErrorResponse?: { ErrorMessage?: string; PassesFilters?: boolean };
  }[];
  UpgradeBehavior?: string;
  Commands?: string[];
  Protocols?: string[];
  FileExtensions?: string[];
  PackageFamilyName?: string;
  ProductCode?: string;
  Capabilities?: string[];
  RestrictedCapabilities?: string[];
  MSStoreProductIdentifier?: string;
  InstallerAbortsTerminal?: boolean;
  ReleaseDate?: string;
  InstallLocationRequired?: boolean;
  RequireExplicitUpgrade?: boolean;
  ElevationRequirement?: string;
  UnsupportedOSArchitectures?: string[];
  NestedInstallerType?: string;
  NestedInstallerFiles?: { RelativeFilePath: string; PortableCommandAlias?: string }[];
  DisplayInstallWarnings?: boolean;
  DownloadCommandProhibited?: boolean;
  RepairBehavior?: string;
  ArchiveBinariesDependOnPath?: boolean;
}

// Winget locale (contains full description)
export interface WingetLocaleData {
  PackageLocale: string;
  Publisher?: string;
  PublisherUrl?: string;
  PublisherSupportUrl?: string;
  PrivacyUrl?: string;
  Author?: string;
  PackageName?: string;
  PackageUrl?: string;
  License?: string;
  LicenseUrl?: string;
  Copyright?: string;
  CopyrightUrl?: string;
  ShortDescription?: string;
  Description?: string;
  Moniker?: string;
  Tags?: string[];
  ReleaseNotes?: string;
  ReleaseNotesUrl?: string;
  PurchaseUrl?: string;
  InstallationNotes?: string;
  Documentations?: { DocumentLabel: string; DocumentUrl: string }[];
}

// Winget manifest search result item (based on official ManifestSearchResponseSchema)
export interface WingetSearchItem {
  PackageIdentifier: string;
  PackageName: string;
  Publisher: string;
  Versions: WingetSearchVersionItem[];
}

export interface WingetSearchVersionItem {
  PackageVersion: string;
  Channel?: string;
  PackageFamilyNames?: string[];
  ProductCodes?: string[];
}

// Winget manifest search request body (based on official ManifestSearchRequestSchema)
export interface WingetSearchRequest {
  MaximumResults?: number;
  FetchAllManifests?: boolean;
  Query?: {
    KeyWord: string;
    MatchType?: WingetMatchType;
  };
  Inclusions?: WingetSearchFilter[];
  Filters?: WingetSearchFilter[];
}

export type WingetMatchType =
  | "Exact"
  | "CaseInsensitive"
  | "StartsWith"
  | "Substring"
  | "Wildcard"
  | "Fuzzy"
  | "FuzzySubstring";

export interface WingetSearchFilter {
  PackageMatchField?: string;
  RequestMatch?: {
    KeyWord: string;
    MatchType?: WingetMatchType;
  };
}

// Winget search response (based on official ManifestSearchResultSchema)
export interface WingetSearchResponse {
  Data: WingetSearchItem[];
  RequiredPackageMatchFields?: string[];
  UnsupportedPackageMatchFields?: string[];
}
