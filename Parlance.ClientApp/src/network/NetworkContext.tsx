import { createContext, ReactNode, useRef } from "react";
import { EventEmitter } from "eventemitter3";

class NetworkCache {
    private cache: Map<string, NetworkCacheEntry<any>>;

    constructor() {
        this.cache = new Map();
    }

    public entry<T>(method: string, url: string): NetworkCacheEntry<T> {
        const cacheKey = JSON.stringify({ method, url });
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey) as NetworkCacheEntry<T>;
        } else {
            const cacheEntry = new NetworkCacheEntry<T>();
            this.cache.set(cacheKey, cacheEntry);
            return cacheEntry;
        }
    }
}

interface NetworkCacheEntryEvents<T> {
    valueUpdated: (value: T | undefined) => void;
    lockedChanged: (locked: boolean) => void;
    errorChanged: (error: any) => void;
}

class NetworkCacheEntry<T> extends EventEmitter<NetworkCacheEntryEvents<T>> {
    private value: T | undefined;
    private error: any | undefined;
    private locked: boolean = false;
    private newFlag: boolean = true;

    constructor() {
        super();
    }

    public lock() {
        if (this.locked) {
            return false;
        }

        this.locked = true;
        this.newFlag = false;
        this.emit("lockedChanged", true);

        return {
            set: (value: T) => {
                this.error = undefined;
                this.value = value;
                this.locked = false;
                this.emit("errorChanged", undefined);
                this.emit("valueUpdated", value);
                this.emit("lockedChanged", false);
            },
            error: (error: any, value?: T) => {
                this.error = error;
                this.locked = false;
                this.emit("errorChanged", undefined);

                if (value) {
                    this.value = value;
                    this.emit("valueUpdated", value);
                }

                this.emit("lockedChanged", false);
            },
            rollback: () => {
                this.locked = false;
                this.emit("lockedChanged", false);
            },
        };
    }

    public get() {
        return this.value;
    }

    public getError() {
        return this.error;
    }

    public isLocked() {
        return this.locked;
    }

    public isNew() {
        return this.newFlag;
    }

    public shouldRefetch() {
        // TODO: Set a TTL for cache entries
        return true;
    }
}

export const NetworkContextObject = createContext<NetworkCache>(
    new NetworkCache(),
);

export function NetworkContext({ children }: { children: ReactNode }) {
    const cache = useRef(new NetworkCache());

    return (
        <NetworkContextObject value={cache.current}>
            {children}
        </NetworkContextObject>
    );
}
