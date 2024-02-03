import { get, writable, type Readable, type Writable, readonly } from "svelte/store";
import * as RD from './remotedata.js'
import type { z } from "zod";

export function writablePush<T>(value0: T | undefined, push: (val: T) => void): Writable<T> {
    return writableWithPush(writable(value0), push)
}
export function writableWithPush<T>(store0: Writable<T>, push: (val: T) => void): Writable<T> {
    const { subscribe, set } = store0
    return {
        subscribe,
        set(value) {
            set(value)
            push(value)
        },
        update(fn) {
            const value = fn(get(store0))
            set(value)
            push(value)
        }
    }
}

export function storeLocalStorage(key: string, storage: Storage = window?.localStorage): Writable<string | null> {
    if (!storage) return writable(null)
    return writablePush(storage.getItem(key), (value) => {
        if (value == null) {
            storage.removeItem(key)
        } else {
            storage.setItem(key, value)
        }
    })
}

export interface ParsedStore<T, E = string> extends Readable<RD.Result<T, E>> {
    write: Writable<T>
}
export function storeParse<A, B, E = string>(store0: Writable<A>, parse: (a: A) => RD.Result<B, E>, unparse: (b: B) => A): ParsedStore<B, E> {
    const parsed0 = parse(get(store0))
    const read = writable<RD.Result<B, E>>(parsed0)
    const write0 = writable<B>(parsed0.status === 'success' ? parsed0.value : undefined)
    const write = writableWithPush<B>(write0, val => {
        read.set(RD.success(val))
        store0.set(unparse(val))
    })
    store0.subscribe(value => {
        const result = parse(value)
        read.set(result)
        if (result.status === 'success') {
            write0.set(result.value)
        }
        // `write` is left unchanged on failure. not ideal, but I'm not sure what a better behavior would be!
    })
    return { ...readonly(read), write }
}
export function storeZodParse<A, B>(store0: Writable<A>, schema: z.ZodType<B, z.ZodTypeDef, A>, unparse: (b: B) => A): ParsedStore<B, z.ZodError<A>> {
    return storeParse(store0, a => RD.fromZod(schema.safeParse(a)), unparse)
}