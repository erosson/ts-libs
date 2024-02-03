import { browser } from "$app/environment";
import { enhance } from "$app/forms";
import { invalidateAll } from "$app/navigation";
import { readable, writable } from "svelte/store";
import { State, StateString } from "../state.js";
import type { PageLoad } from "./$types.js";
import { failure, loading } from "./remotedata.js";
import { storeLocalStorage, storeZodParse } from "./store.js";

export const load: PageLoad = ({ params, data }) => {
    const persist = data?.persist || params.persist
    switch (persist) {
        case 'server': {
            const state = storeZodParse<State, State>(writable(data.state!), State, st => st)
            const incr = (el: HTMLFormElement) => enhance(el, () => state.write.update(s => ({ ...s, count: s.count + 1 })))
            const decr = (el: HTMLFormElement) => enhance(el, () => state.write.update(s => ({ ...s, count: s.count - 1 })))
            return { state, incr, decr, persist }
        }
        case 'client': {
            if (browser) {
                const state = storeZodParse<string | null, State>(storeLocalStorage(STORAGE_KEY, window.localStorage), StateString, JSON.stringify)
                const incr = clientSubmitAction(() => state.write.update(s => ({ ...s, count: s.count + 1 })))
                const decr = clientSubmitAction(() => state.write.update(s => ({ ...s, count: s.count - 1 })))
                return { state, incr, decr, persist }
            } else {
                const state = readable(loading())
                return { state, persist, }
            }
        }
        default: {
            const state = readable(failure(`no such persist method: ${persist}`))
            return { state, persist }
        }
    }
}

//const _load0: PageLoad = ({ params, data }) => {
//    const persist = data?.persist || params.persist
//    const timer = timerAnimationFrame(() => new Date())
//    switch (persist) {
//        case 'server': {
//            const state = data.state!
//            const incr = enhance
//            const decr = enhance
//            return { state, incr, decr, timer, persist, status: 'success' as const }
//        }
//        case 'client': {
//            if (browser) {
//                const state = getStateStorage(window.localStorage)
//                const incr = clientSubmitAction(storageIncr)
//                const decr = clientSubmitAction(storageDecr)
//                return { state, incr, decr, timer, persist, status: 'success' as const }
//            } else {
//                return { persist, timer, status: 'loading' as const }
//            }
//        }
//        default: {
//            return { status: 'failure' as const, timer, persist, message: `no such persist method: ${persist}` }
//        }
//    }
//}

const STORAGE_KEY = 'svelte-persist:count'
// function getStateStorage(storage: Storage): State {
//     const parsed = StateString.safeParse(storage.getItem(STORAGE_KEY))
//     console.log('localstorage read')
//     return parsed.success ? parsed.data : { count: 0 }
// }
// function setStateStorage(storage: Storage, state: State): void {
//     storage.setItem(STORAGE_KEY, JSON.stringify(state))
//     console.log('localstorage write')
// }
// function transformStateStorage(storage: Storage, fn: (state: State) => State): void {
//     const state0 = getStateStorage(storage)
//     const state = fn(state0)
//     setStateStorage(storage, state)
// }

// function clientSubmitAction(fn: (e: SubmitEvent) => (void | Promise<void>)): Action<HTMLFormElement> {
function clientSubmitAction(fn: (e: SubmitEvent) => (void | Promise<void>)): typeof enhance {
    const handler = clientSubmitHandler(fn)
    return (node) => {
        node.addEventListener('submit', handler)
        return {
            destroy() {
                node.removeEventListener('submit', handler)
            }
        }
    }
}
function clientSubmitHandler(fn: (e: SubmitEvent) => (void | Promise<void>)): (e: SubmitEvent) => Promise<void> {
    return async (e) => {
        e.preventDefault()
        fn(e)
        await invalidateAll()
    }
}
// async function storageIncr(): Promise<void> {
//     transformStateStorage(window.localStorage, st => ({ ...st, count: st.count + 1 }))
// }
// async function storageDecr(): Promise<void> {
//     transformStateStorage(window.localStorage, st => ({ ...st, count: st.count - 1 }))
// }