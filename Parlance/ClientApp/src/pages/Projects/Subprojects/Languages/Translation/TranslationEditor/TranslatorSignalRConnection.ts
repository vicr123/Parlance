import {HubConnection, HubConnectionBuilder, LogLevel} from "@microsoft/signalr";
import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {TranslationWithPluralType} from "../../../../../../interfaces/translation";

type OnTranslationUpdatedCallback = (hash: string, data: Record<string, TranslationWithPluralType[]>) => void;

interface TranslatorSignalR {
    connected: ConnectionState
    connection: HubConnection | undefined;
}

enum ConnectionState {
    Disconnected,
    Connecting,
    Connected
}

export default function useTranslatorSignalRConnection(onTranslationUpdated: OnTranslationUpdatedCallback): TranslatorSignalR {
    const {project, subproject, language} = useParams();
    const [connected, setConnected] = useState<ConnectionState>(ConnectionState.Disconnected);
    const [signalRConnection, setSignalRConnection] = useState<HubConnection>();

    useEffect(() => {
        (async () => {
            const connection = new HubConnectionBuilder().withUrl("/api/signalr/translator").build();
            
            connection.onreconnected(async err => {
                await connection.invoke("Subscribe");
                setConnected(ConnectionState.Connected);
            })
            connection.onreconnecting(err => {
                setConnected(ConnectionState.Connecting);
            })
            connection.onclose(err => {
                setConnected(ConnectionState.Disconnected);
            });

            connection.on("TranslationUpdated", (hash, data) => {
                onTranslationUpdated(hash, data);
            });
            
            setSignalRConnection(connection);
            
            try {
                setConnected(ConnectionState.Connecting);

                await connection.start();
                await connection.invoke("Subscribe", project, subproject, language);

                setConnected(ConnectionState.Connected);
            } catch {
                setConnected(ConnectionState.Disconnected);
            }
        })();
    }, []);
    
    return {
        connected,
        connection: signalRConnection
    };
}
