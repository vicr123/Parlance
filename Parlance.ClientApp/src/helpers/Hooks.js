import { useEffect, useState } from "react";
import UserManager from "./UserManager";

function useForceUpdate() {
    const [value, setValue] = useState(0);
    return () => setValue(value => value + 1);
}

function useForceUpdateOnUserChange() {
    const forceUpdate = useForceUpdate();
    UserManager.on("currentUserChanged", forceUpdate);
}

function useUserUpdateEffect(callback, deps) {
    useEffect(() => {
        UserManager.on("currentUserChanged", callback);

        return () => {
            UserManager.off("currentUserChanged", callback);
        };
    }, deps);
}

export { useForceUpdate, useForceUpdateOnUserChange, useUserUpdateEffect };
