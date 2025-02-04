import { useEffect, useRef, useState, KeyboardEvent } from "react";
import Styles from "./GlobalSearch.module.css";
import { useTranslation } from "react-i18next";
import Fetch from "@/helpers/Fetch";
import PageHeading from "@/components/PageHeading";
import { useNavigate } from "react-router-dom";

interface SearchResult {
    name: string;
    href: string;
    type: "project" | "subproject";
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
    const { t } = useTranslation();
    const navigate = useNavigate();
    const searchBoxRef = useRef<HTMLInputElement>(null);

    const activateSearchResult = (result: SearchResult) => {
        navigate(result.href);
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

    if (!open) return null;

    const keyPress = (event: KeyboardEvent<HTMLInputElement>) => {
        switch (event.key) {
            case "ArrowUp":
                setSelected(x =>
                    x == undefined
                        ? searchResults.length - 1
                        : (x - 1 + searchResults.length) % searchResults.length,
                );
                event.preventDefault();
                break;
            case "ArrowDown":
                setSelected(x =>
                    x == undefined ? 0 : (x + 1) % searchResults.length,
                );
                event.preventDefault();
                break;
            case "Enter":
                if (searchResults.length != 0) {
                    activateSearchResult(searchResults[selected ?? 0]);
                }
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
                                        ...(i == selected
                                            ? [Styles.selectedSearchResult]
                                            : []),
                                    ].join(" ")}
                                    onClick={() => activateSearchResult(result)}
                                    onMouseEnter={() => setSelected(undefined)}
                                >
                                    {result.name}
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
