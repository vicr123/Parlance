import { useEffect, useRef, useState, KeyboardEvent, useMemo } from "react";
import Styles from "./GlobalSearch.module.css";
import { useTranslation } from "react-i18next";
import Fetch from "@/helpers/Fetch";
import PageHeading from "@/components/PageHeading";
import { useNavigate } from "react-router-dom";
import { SearchResult, SubprojectSearchResult } from "./SearchResult";
import UserManager from "@/helpers/UserManager";
import i18n from "@/helpers/i18n";

function filterUserLanguages(languages: string[]) {
    return languages.filter(lang =>
        UserManager.currentUser?.languagePermissions?.includes(lang),
    );
}

export function GlobalSearch({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [selected, setSelected] = useState<number>();
    const [innerSelected, setInnerSelected] = useState<number>();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const searchBoxRef = useRef<HTMLInputElement>(null);

    const activateSearchResult = (
        result: SearchResult,
        innerSelection?: number,
    ) => {
        if (result.type == "subproject" && innerSelection != undefined) {
            navigate(
                `${result.href}/${filterUserLanguages(result.languages)[innerSelection]}`,
            );
        } else {
            navigate(result.href);
        }
        onClose();
    };

    useEffect(() => {
        (async () => {
            const query = searchQuery;
            const response = await Fetch.post<SearchResult[]>("/api/search", {
                query: query,
            });

            if (searchQuery == query) {
                setSelected(undefined);
                setInnerSelected(undefined);
                setSearchResults(response);
            }
        })();
    }, [searchQuery]);

    useEffect(() => {
        if (open) {
            searchBoxRef.current?.focus();
            searchBoxRef.current?.select();
        }
    }, [open]);

    const innerSelectionLength = useMemo(() => {
        if (!selected) return 0;
        if (searchResults[selected].type != "subproject") return 0;
        return filterUserLanguages(searchResults[selected].languages).length;
    }, [selected, searchResults]);

    if (!open) return null;

    const keyPress = (event: KeyboardEvent<HTMLInputElement>) => {
        switch (event.key) {
            case "ArrowUp":
                setSelected(x =>
                    x == undefined
                        ? searchResults.length - 1
                        : x == 0
                          ? undefined
                          : (x - 1 + searchResults.length) %
                            searchResults.length,
                );
                setInnerSelected(undefined);
                event.preventDefault();
                break;
            case "ArrowDown":
                setSelected(x =>
                    x == undefined
                        ? 0
                        : x == searchResults.length - 1
                          ? undefined
                          : (x + 1) % searchResults.length,
                );
                setInnerSelected(undefined);
                event.preventDefault();
                break;
            case "ArrowRight":
                if (selected && innerSelectionLength > 0) {
                    setInnerSelected(x =>
                        x == undefined
                            ? 0
                            : x == innerSelectionLength - 1
                              ? undefined
                              : (x + 1) % innerSelectionLength,
                    );
                    event.preventDefault();
                }
                break;
            case "ArrowLeft":
                if (selected && innerSelectionLength > 0) {
                    setInnerSelected(x =>
                        x == undefined
                            ? innerSelectionLength - 1
                            : x == 0
                              ? undefined
                              : (x - 1 + innerSelectionLength) %
                                innerSelectionLength,
                    );
                    event.preventDefault();
                }
                break;
            case "Enter":
                if (searchResults.length != 0) {
                    activateSearchResult(
                        searchResults[selected ?? 0],
                        innerSelected,
                    );
                }
                break;
            case "Escape":
                onClose();
                event.preventDefault();
                break;
        }
    };

    return (
        <div>
            <div className={Styles.scrim} onClick={onClose} />
            <div className={Styles.searchContainer}>
                <div className={Styles.searchBoxContainer}>
                    <input
                        type={"text"}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className={Styles.searchBox}
                        placeholder={t("Search for anything")}
                        ref={searchBoxRef}
                        onKeyDown={keyPress}
                        spellCheck={false}
                    />
                </div>
                <div className={Styles.searchResultsContainer}>
                    {searchResults.length > 0 && (
                        <>
                            <PageHeading
                                level={3}
                                className={Styles.searchTitle}
                            >
                                {t("Search Results")}
                            </PageHeading>
                            {searchResults.map((result, i) => (
                                <div
                                    className={[
                                        Styles.searchResult,
                                        ...(result.type == "subproject"
                                            ? [Styles.subprojectSearchResult]
                                            : []),
                                        ...(i == selected &&
                                        innerSelected == undefined
                                            ? [Styles.selectedSearchResult]
                                            : []),
                                    ].join(" ")}
                                    onClick={() => activateSearchResult(result)}
                                    onMouseEnter={() => setSelected(undefined)}
                                >
                                    {result.type == "project" && (
                                        <>{result.name}</>
                                    )}
                                    {result.type == "subproject" && (
                                        <SubprojectMenuItemContent
                                            subproject={result}
                                            index={i}
                                            onClose={onClose}
                                            selected={selected}
                                            innerSelected={innerSelected}
                                        />
                                    )}
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function SubprojectMenuItemContent({
    subproject,
    index,
    onClose,
    selected,
    innerSelected,
}: {
    subproject: SubprojectSearchResult;
    index: number;
    onClose: () => void;
    selected: number | undefined;
    innerSelected: number | undefined;
}) {
    const navigate = useNavigate();

    const { t } = useTranslation();
    const languages = filterUserLanguages(subproject.languages);

    return (
        <>
            <span className={Styles.searchResultName}>{subproject.name}</span>
            {languages.length > 0 && (
                <div className={Styles.searchResultLanguages}>
                    {languages.map((lang, i) => (
                        <div
                            className={[
                                Styles.searchResultLanguage,
                                ...(selected == index && innerSelected == i
                                    ? [Styles.searchResultLanguageSelected]
                                    : []),
                            ].join(" ")}
                            onClick={e => {
                                e.stopPropagation();
                                navigate(`${subproject.href}/${lang}`);
                                onClose();
                            }}
                        >
                            {languages.length == 1
                                ? t("Jump to {{language}}", {
                                      language: i18n.humanReadableLocale(lang),
                                  })
                                : lang}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
