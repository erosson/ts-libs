import type { z } from "zod"

export interface Loading {
    readonly status: 'loading'
    readonly loadingStarted: Date
}
export interface Success<T> {
    readonly status: 'success'
    readonly value: T
}
export interface Failure<E = string> {
    readonly status: 'failure'
    readonly error: E
}
export interface ReloadLoading<T> {
    readonly status: 'reload-loading'
    readonly value: T
    readonly loadingStarted: Date
}
export interface ReloadFailure<T, E = string> {
    readonly status: 'reload-failure'
    readonly value: T
    readonly error: E
}

export type Result<T, E = string> = Failure<E> | Success<T>
export type RemoteData<T, E = string> = Loading | Failure<E> | Success<T>
export type ReloadableData<T, E = string> = Loading | Failure<E> | Success<T> | ReloadLoading<T> | ReloadFailure<T, E>
export type Successish<T, E = string> = Success<T> | ReloadLoading<T> | ReloadFailure<T, E>

export function loading(loadingStarted?: Date): Loading {
    loadingStarted = loadingStarted || new Date()
    return { status: 'loading', loadingStarted }
}
export function failure<E>(error: E): Failure<E> {
    return { status: 'failure', error }
}
export function success<T>(value: T): Success<T> {
    return { status: 'success', value }
}
export function reloadLoading<T>(value: T, loadingStarted?: Date): ReloadLoading<T> {
    loadingStarted = loadingStarted || new Date()
    return { status: 'reload-loading', value, loadingStarted }
}
export function reloadFailure<T, E>(value: T, error: E): ReloadFailure<T, E> {
    return { status: 'reload-failure', value, error }
}
export function reloadable<T, E>(st: RemoteData<T, E>): ReloadableData<T, E> {
    return st
}
export function reload<T, E>(st: ReloadableData<T, E>, result: RemoteData<unknown, E>): ReloadableData<T, E> {
    const { status: status1 } = st
    switch (status1) {
        case 'reload-loading':
        case 'reload-failure':
        case 'success': {
            const { value } = st
            const { status: status2 } = result
            switch (status2) {
                case 'loading': {
                    return reloadLoading(value)
                }
                case 'failure': {
                    return reloadFailure(value, result.error)
                }
                case 'success': {
                    return success(value)
                }
                default: {
                    const _exhaustive: never = status2
                    throw new Error(`unknown remotedata.status: ${_exhaustive}`)
                }
            }
        }
        case 'loading':
        case 'failure':
        default: {
            return st
        }
    }
}
export function fromZod<I, O>(result: z.SafeParseReturnType<I, O>): Result<O, z.ZodError<I>> {
    return result.success ? success(result.data) : failure(result.error)
}