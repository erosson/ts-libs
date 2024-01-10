export function range(end: number): readonly number[]
export function range(start: number, end: number): readonly number[]
export function range(start: number, end?: number): readonly number[] {
    if (end == null) {
        end = start
        return [...Array(end).keys()]
    }
    return [...Array(end - start).keys()].map(n => n + start)
}

export function zip<A, B>(a: readonly A[], b: readonly B[]): readonly (readonly [A | null, B | null])[] {
    if (a.length >= b.length) {
        return a.map((el, i) => [el, b[i] ?? null])
    } else {
        return b.map((el, i) => [a[i] ?? null, el])
    }
}
export function unzip<A, B>(ab: readonly (readonly [A, B])[]): readonly [readonly A[], readonly B[]] {
    return [
        ab.map(([a, _]) => a),
        ab.map(([_, b]) => b),
    ]
}