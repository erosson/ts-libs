import type { ZodType } from "zod"

export interface Persist<T> {
    get(): Promise<T>
    set(value: T): Promise<void>
    delete(): Promise<void>
}

export async function transform<T>(persist: Persist<T>, fn: (value: T) => T): Promise<T> {
    const value = fn(await persist.get())
    await persist.set(value)
    return value
}
export interface LocalStoragePersistArgs<T> {
    key: string
    parser: ZodType<T>
    serialize(val: T): string
    default(): T
    storage?: Storage
}
export function localStoragePersist<T>(args: LocalStoragePersistArgs<T>): Persist<T> {
    const { key, parser, serialize, default: default_ } = args
    const storage = args.storage || window.localStorage
    return {
        async get() {
            const parsed = parser.safeParse(storage.getItem(key))
            return parsed.success ? parsed.data : default_()
        },
        async set(value) {
            storage.setItem(key, serialize(value))
        },
        async delete() {
            storage.removeItem(key)
        }
    }
}