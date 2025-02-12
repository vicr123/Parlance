import { DependencyList, useEffect, useState } from "react";
import UserManager from "./UserManager";

export function useForceUpdate() {
    const [, setValue] = useState(0);
    return () => setValue(value => value + 1);
}

export function useForceUpdateOnUserChange() {
    const forceUpdate = useForceUpdate();
    UserManager.on("currentUserChanged", forceUpdate);
}

export function useUserUpdateEffect(
    callback: () => void,
    deps: DependencyList,
) {
    useEffect(() => {
        UserManager.on("currentUserChanged", callback);

        return () => {
            UserManager.off("currentUserChanged", callback);
        };
    }, deps);
}

export function useMediaQuery(mediaQuery: string) {
    const [mediaQueryMatches, setMediaQueryMatches] = useState(false);

    useEffect(() => {
        const mediaQueryList = matchMedia(mediaQuery);

        const updateMediaQueryState = () => {
            setMediaQueryMatches(mediaQueryList.matches);
        };

        mediaQueryList.addEventListener("change", updateMediaQueryState);
        updateMediaQueryState();

        return () => {
            mediaQueryList.removeEventListener("change", updateMediaQueryState);
        };
    }, [mediaQuery]);

    return mediaQueryMatches;
}
