import { redirect } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types.js";

export const load: LayoutLoad = ({ url }) => {
    // localhost subdomains Just Work on every computer I've tried, and it's useful to isolate cookies
    if (url.hostname === "localhost") {
        url.hostname = "svelte-persist.localhost"
        redirect(303, url)
    }
}