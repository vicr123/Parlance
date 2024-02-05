declare global {
    interface ObjectConstructor {
        groupBy<TSource, TKey extends string>(array: TSource[], keyGetter: (val: TSource) => TKey): Record<TKey, TSource[]>
    }
}

export {};