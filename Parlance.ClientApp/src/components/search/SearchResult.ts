interface BaseSearchResult {
    name: string;
    href: string;
}

export interface ProjectSearchResult extends BaseSearchResult {
    type: "project";
}

export interface SubprojectSearchResult extends BaseSearchResult {
    languages: string[];
    parentProjectName: string;
    type: "subproject";
}

export type SearchResult = ProjectSearchResult | SubprojectSearchResult;
