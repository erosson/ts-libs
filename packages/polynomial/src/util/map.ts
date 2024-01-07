function groupEntries<K, V>(es: Iterable<[K, V]>): ReadonlyMap<K, readonly V[]> {
    const r = new Map<K, V[]>();
    for (const [k, v] of es) {
        if (!r.has(k)) {
            r.set(k, []);
        }
        // above guarantees `r.get(k)` will be nonnull below
        r.get(k)?.push(v);
    }
    return r;
}
export function groupBy<K, V>(vs: readonly V[], fnK: (v: V) => K): ReadonlyMap<K, readonly V[]> {
    return groupEntries(vs.map((v) => [fnK(v), v]));
}

export function map<K, V1, V2>(m: ReadonlyMap<K, V1>, fn: (v: V1, k: K) => V2): ReadonlyMap<K, V2> {
    return new Map(Array.from(m.entries()).map(([k, v]) => [k, fn(v, k)]));
}