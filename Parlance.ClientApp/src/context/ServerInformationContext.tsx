import {ReactNode, createContext, useEffect, useState } from "react";
import Fetch from "@/helpers/Fetch";

export interface ServerInformation {
    serverName: string
    accountName: string
}

export const ServerInformationContext = createContext<ServerInformation>({
    serverName: "",
    accountName: ""
});

export function ServerInformationProvider({children}: {
    children: ReactNode
}) {
    // @ts-ignore
    const [serverInformation, setServerInformation] = useState<ServerInformation>(null)

    useEffect(() => {
        (async () => {
            setServerInformation(await Fetch.get<ServerInformation>("/api/serverinformation"));
        })();
    }, []);
    
    if (!serverInformation) {
        return null;
    }
    
    return <ServerInformationContext.Provider value={serverInformation}>
        {children}
    </ServerInformationContext.Provider>
}
