export function product(ns: readonly number[], o = 1): number {
    return ns.reduce((a, b) => a * b, o);
}
export function range(end: number): readonly number[]
export function range(start: number, end: number): readonly number[]
export function range(start: number, end?: number): readonly number[] {
    if (end == null) {
        end = start
        return [...Array(end).keys()]
    }
    return [...Array(end - start).keys()].map(n => n + start)
}

export function factorial(n: number): number {
    return product(range(1, n + 1));
}