import Fetch from "@/helpers/Fetch";
import { useContext, useEffect, useState } from "react";
import { NetworkContextObject } from "@/network/NetworkContext";

export type RefetchFunction = () => Promise<void>;

export function useNetworkGet<TResponse>(
    url: string,
): [TResponse | undefined, boolean, RefetchFunction, any];
export function useNetworkGet<TResponse, TTransformed>(
    url: string,
    transform: (response: TResponse) => TTransformed,
): [TTransformed | undefined, boolean, RefetchFunction, any];

export function useNetworkGet<TResponse, TTransformed>(
    url: string,
    transform?: (response: TResponse) => TTransformed,
) {
    const networkContext = useContext(NetworkContextObject);
    const cacheEntry = networkContext.entry<TResponse>("GET", url);

    const transformResponse = (response: TResponse) => {
        if (transform) {
            return transform(response);
        } else {
            return response as unknown as TTransformed;
        }
    };

    const [transformedResponse, setTransformedResponse] = useState<
        TTransformed | undefined
    >(() => {
        const currentEntry = cacheEntry.get();
        if (currentEntry) {
            return transformResponse(currentEntry);
        } else {
            return undefined;
        }
    });
    const [error, setError] = useState(cacheEntry.getError());
    const [loading, setLoading] = useState(
        cacheEntry.isLocked() || cacheEntry.isNew(),
    );

    const refetch = async () => {
        const lock = cacheEntry.lock();
        if (!lock) {
            return;
        }

        try {
            const response = await Fetch.get<TResponse>(url);
            lock.set(response);
        } catch (error: any) {
            if ("jsonBody" in error) {
                lock.error(error, error.jsonBody);
            } else {
                lock.error(error);
            }
        }
    };

    useEffect(() => {
        (async () => {
            if (cacheEntry.shouldRefetch()) {
                await refetch();
            }
        })();
    }, []);

    useEffect(() => {
        const updateLoading = (locked: boolean) => {
            setLoading(locked);
        };

        cacheEntry.on("lockedChanged", updateLoading);
        return () => {
            cacheEntry.off("lockedChanged", updateLoading);
        };
    }, []);

    useEffect(() => {
        const updateValue = (value: TResponse | undefined) => {
            if (value) {
                setTransformedResponse(transformResponse(value));
            } else {
                setTransformedResponse(undefined);
            }
        };

        cacheEntry.on("valueUpdated", updateValue);
        return () => {
            cacheEntry.off("valueUpdated", updateValue);
        };
    }, []);

    useEffect(() => {
        const updateError = (error: any) => {
            setError(error);
        };

        cacheEntry.on("errorChanged", updateError);
        return () => {
            cacheEntry.off("errorChanged", updateError);
        };
    });

    return [transformedResponse, loading, refetch, error];
}
