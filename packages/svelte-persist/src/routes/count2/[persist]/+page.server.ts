import type { Cookies } from "@sveltejs/kit";
import { StateString, type State } from "../../count/state.js";
import type { Actions, PageServerLoad } from "./$types.js";

export const load: PageServerLoad = ({ cookies, params }) => {
    const { persist } = params
    switch (persist) {
        case 'server': {
            const state = getStateCookie(cookies)
            return { persist, state }
        }
        case 'client': {
            return { persist }
        }
        default: {
            throw new Error(`no such persist method: ${params.persist}`)
        }
    }
}
export const actions = {
    async incr({ cookies, url }) {
        // await new Promise(resolve => setTimeout(resolve, 1000));
        transformStateCookie(cookies, url, state => ({ ...state, count: state.count + 1 }))
        return { success: true }
    },
    async decr({ cookies, url }) {
        transformStateCookie(cookies, url, state => ({ ...state, count: state.count - 1 }))
        return { success: true }
    },
    async reset({ cookies, url }) {
        transformStateCookie(cookies, url, () => ({ count: 0 }))
        return { success: true }
    }
} satisfies Actions

const COOKIE_KEY = 'svelte-persist:count'
function getStateCookie(cookies: Cookies): State {
    const parsed = StateString.safeParse(cookies.get(COOKIE_KEY))
    return parsed.success ? parsed.data : { count: 0 }
}
function setStateCookie(cookies: Cookies, url: URL, state: State): void {
    cookies.set(COOKIE_KEY, JSON.stringify(state), { path: '/', domain: url.hostname })
}
function transformStateCookie(cookies: Cookies, url: URL, fn: (state: State) => State): void {
    const state0 = getStateCookie(cookies)
    const state = fn(state0)
    setStateCookie(cookies, url, state)
}
