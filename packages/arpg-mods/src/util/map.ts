/**
 * Construct a map from the given `values`, where each key is the result of `fnK`.
 * 
 * Keys must be unique. See {@link groupBy} for non-unique keys.
 * 
 *     const values = [
 *         {id: 'foo', text: 'bar'},
 *         {id: 'baz', text: 'quux'},
 *     ]
 *     keyBy(values, v => v.id)
 *     // => new Map([['foo', {id: 'foo', text: 'bar'}], ['baz', {id: 'baz', text: 'quux'}]])
 * 
 *     keyBy([...values, values[0]], v => v.id)
 *     // => Uncaught Error: keyBy has 1 duplicate keys
 */
export function keyBy<K, V>(values: readonly V[], fnK: (v: V) => K): ReadonlyMap<K, V> {
    const r = new Map(values.map((v) => [fnK(v), v]));
    if (r.size !== values.length) {
        throw new Error(`keyBy has ${Math.abs(r.size - values.length)} duplicate keys: ${Array.from(r.keys())}`);
    }
    return r;
}

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

/**
 * Construct a map from the given `values`, where each key is the result of `fnK`.
 * 
 * Keys need not be unique. See {@link keyBy} if your keys are unique.
 * 
 * Each value must have exactly one key. See {@link tagBy} to group your values by 2+ keys, or to remove some from the result by returning no keys.
 * 
 *     const values = [
 *         {id: 'foo', text: 'bar'},
 *         {id: 'baz', text: 'quux'},
 *         {id: 'foo', text: 'hoge'},
 *     ]
 *     keyBy(values, v => v.id)
 *     // => new Map([['foo', [{id: 'foo', text: 'bar'}, {id: 'foo', text: 'hoge'}]], ['baz', [{id: 'baz', text: 'quux'}]]])
 */
export function groupBy<K, V>(values: readonly V[], fnK: (v: V) => K): ReadonlyMap<K, readonly V[]> {
    return groupEntries(values.map((v) => [fnK(v), v]));
}

/**
 * Construct a map from the given `values`, where each key is the result of `fnK`.
 * 
 * A value may have any number of keys/tags. Zero keys, `[]`, removes that value from the results.
 * See {@link groupBy} if your values have exactly one key.
 * 
 *     const values = [
 *         {id: 'foo', text: 'bar'},
 *         {id: 'foo', text: 'hoge'},
 *     ]
 *     tagBy(values, v => [v.id, v.text])
 *     // => new Map([['foo', [{id: 'foo', text: 'bar'}, {id: 'foo', text: 'hoge'}]], ['bar', [{id: 'foo', text: 'bar'}]], ['hoge', {id: 'foo', text: 'hoge'}]]])
 */
export function tagBy<K, V>(values: readonly V[], fnKs: (v: V) => Iterable<K>): ReadonlyMap<K, readonly V[]> {
    return groupEntries(values.flatMap((v) => Array.from(fnKs(v)).map((k) => [k, v] as [K, V])));
}