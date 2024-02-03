import type { enhance } from '$app/forms'
import * as RD from '../../count/[persist]/remotedata.js'
export interface ReloadLens<T> {
    get: () => T
    set: (t: T) => void
    status?: (r: RD.RemoteData<null>) => void
}
export interface FormFns<T> {
    onsubmit: (lens: ReloadLens<T>) => (e: SubmitEvent) => void
    enhancer: (lens: ReloadLens<T>) => Parameters<typeof enhance>[1]
}
/**
 * Used with `<form use:enhance>` to create a loading indicator.
 */
const enhancer: <T>(lens: ReloadLens<T>) => Parameters<typeof enhance>[1] = (lens) => () => {
    lens.status && lens.status(RD.loading());
    return ({ result, update }) => {
        update();
        const { type } = result;
        switch (type) {
            case 'redirect':
            case 'success': {
                lens.status && lens.status(RD.success(null));
                return;
            }
            case 'failure': {
                lens.status && lens.status(RD.failure(`status-failure: ${result.status}`));
                return;
            }
            case 'error': {
                lens.status && lens.status(RD.failure(`status-error: ${result.status}`));
                return;
            }
            default: {
                lens.status && lens.status(RD.failure(`unknown form-enhance type: ${type}`));
                return;
            }
        }
    };
};
export function serverSubmit<T>(fn: (val: T) => T): FormFns<T> {
    return {
        onsubmit: lens => () => {
            lens.set(fn(lens.get()))
        },
        enhancer,
    }
}
export function clientSubmit<T>(push: (val: T) => void, fn: (val: T) => T): FormFns<T> {
    return {
        onsubmit: lens => e => {
            e.preventDefault();
            // this stops `use:enhance` from its server-form-submit. `stopPropagation()` doesn't, surprisingly
            e.stopImmediatePropagation();

            const val = fn(lens.get())
            lens.set(val)
            lens.status && lens.status(RD.loading())
            push(val)
            // setTimeout(() => {
            lens.status && lens.status(RD.success(null))
            // }, 1000)
        }, enhancer
    }
}
export function noopSubmit<T>(): FormFns<T> {
    return {
        onsubmit: () => () => { },
        enhancer,
    }
}