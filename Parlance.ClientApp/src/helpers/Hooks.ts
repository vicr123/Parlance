import { DependencyList, useEffect, useState } from "react";
import UserManager from "./UserManager";

function useForceUpdate() {
    const [, setValue] = useState(0);
    return () => setValue(value => value + 1);
}

function useForceUpdateOnUserChange() {
    const forceUpdate = useForceUpdate();
    UserManager.on("currentUserChanged", forceUpdate);
}

function useUserUpdateEffect(callback: () => void, deps: DependencyList) {
    useEffect(() => {
        UserManager.on("currentUserChanged", callback);

        return () => {
            UserManager.off("currentUserChanged", callback);
        };
    }, deps);
}

export { useForceUpdate, useForceUpdateOnUserChange, useUserUpdateEffect };
