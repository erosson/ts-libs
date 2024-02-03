import { browser } from "$app/environment";
import * as RD from "../../count/[persist]/remotedata.js";
import { State, StateString } from "../../count/state.js";
import type { PageLoad } from "./$types.js";
import { clientSubmit, noopSubmit, serverSubmit } from "./form.js";

export const load: PageLoad = ({ params, data }) => {
    const persist = data?.persist || params.persist
    const noopSubmits = { incr: noopSubmit<State>(), decr: noopSubmit<State>(), reset: noopSubmit<State>(), persist }
    switch (persist) {
        case 'server': {
            const state = RD.success(data.state!)
            const incr = serverSubmit<State>((s) => ({ ...s, count: s.count + 1 }))
            const decr = serverSubmit<State>((s) => ({ ...s, count: s.count - 1 }))
            const reset = serverSubmit<State>(() => ({ count: 0 }))
            return { state, incr, decr, reset, persist }
        }
        case 'client': {
            if (browser) {
                const result = StateString.safeParse(window.localStorage.getItem(STORAGE_KEY));
                const state = RD.success(result.success ? result.data : { count: 0 });
                const incr = clientSubmit<State>(push, (s) => ({ ...s, count: s.count + 1 }))
                const decr = clientSubmit<State>(push, (s) => ({ ...s, count: s.count - 1 }))
                const reset = clientSubmit<State>(push, () => ({ count: 0 }))
                return { state, incr, decr, reset, persist }
            } else {
                const state = RD.loading()
                return { state, ...noopSubmits }
            }
        }
        default: {
            const state = RD.failure(`no such persist method: ${persist}`)
            return { state, ...noopSubmits }
        }
    }
}

const STORAGE_KEY = 'svelte-persist:count'
function push(s: State) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}