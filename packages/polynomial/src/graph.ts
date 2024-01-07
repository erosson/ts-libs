import toposort from "toposort";
import { groupBy } from "./util/map";

export interface GetEdge<V, E> {
    from: (edge: E) => V;
    to: (edge: E) => V;
}
export interface Path<V, E> {
    readonly from: V;
    readonly to: V;
    readonly path: E[];
}

// function nodes<V, E>(edges: readonly E[], fn: GetEdge<V, E>): ReadonlySet<V> {
// 	return new Set(edges.map((e) => [fn.from(e), fn.to(e)]).flat());
// }
// function reverse<V, E>(fn: GetEdge<V, E>): GetEdge<V, E> {
// 	return { from: fn.to, to: fn.from };
// }
function allPaths<V, E>(edges: readonly E[], fn: GetEdge<V, E>, incoming: boolean): Map<V, readonly Path<V, E>[]> {
    const [parent, child] = incoming ? (["to", "from"] as const) : (["from", "to"] as const);
    const edgesByNode = groupBy(edges, fn[parent]);
    // Fully populate *all* paths for this node paramenter, assuming its children have already been populated.
    function fold(accumPaths: Map<V, Path<V, E>[]>, node: V): Map<V, Path<V, E>[]> {
        // Find all immediate outgoing edges - that is, where `edge.from === node`.
        const outs = edgesByNode.get(node) ?? [];
        const pathsByNode: Path<V, E>[] = outs
            .map((edge) => {
                // For each edge, find all paths that start where this edge ends.
                const pathsByEdge = accumPaths.get(fn[child](edge)) ?? [];
                // For each of those paths, create a new extended path by adding this edge.
                return pathsByEdge.map((p) => ({ ...p, [parent]: node, path: [edge, ...p.path] }));
            })
            .flat();
        // add a zero-length path from this node to itself, because more often than not, it's really convenient
        // (it also initializes each path in this algorithm as written, but we could rewrite it to avoid that)
        const selfPath: Path<V, E> = { from: node, to: node, path: [] };
        accumPaths.set(node, [selfPath, ...pathsByNode]);
        return accumPaths;
    }
    // Order is important: `fold` requires that each node's children already be populated.
    // Topological sort guarantees children are populated first.
    const sorted: V[] = toposort<V>(edges.map((e) => [fn.from(e), fn.to(e)]));
    if (!incoming) sorted.reverse();
    return sorted.reduce(fold, new Map());
}

export function allOutgoingPaths<V, E extends { from: V; to: V }>(
    edges: readonly E[],
    nodes?: readonly V[]
): ReadonlyMap<V, readonly Path<V, E>[]>;
export function allOutgoingPaths<V, E>(
    edges: readonly E[],
    nodes: readonly V[],
    fn: GetEdge<V, E>
): ReadonlyMap<V, readonly Path<V, E>[]>;
export function allOutgoingPaths<V>(
    edges: readonly any[],
    nodes?: readonly V[],
    fn?: GetEdge<V, any>
): ReadonlyMap<V, readonly Path<V, any>[]> {
    return withNodes(allPaths(edges, fn ?? { from: (e) => e.from, to: (e) => e.to }, false), nodes ?? []);
}

export function allIncomingPaths<V, E extends { from: V; to: V }>(
    edges: readonly E[],
    nodes?: readonly V[]
): ReadonlyMap<V, readonly Path<V, E>[]>;
export function allIncomingPaths<V, E>(
    edges: readonly E[],
    nodes: readonly V[],
    fn: GetEdge<V, E>
): ReadonlyMap<V, readonly Path<V, E>[]>;
export function allIncomingPaths<V>(
    edges: readonly any[],
    nodes?: readonly V[],
    fn?: GetEdge<V, any>
): ReadonlyMap<V, readonly Path<V, any>[]> {
    return withNodes(allPaths(edges, fn ?? { from: (e) => e.from, to: (e) => e.to }, true), nodes ?? []);
}

export function withNodes<V, E>(
    paths: Map<V, readonly Path<V, E>[]>,
    nodes: readonly V[]
): Map<V, readonly Path<V, E>[]> {
    for (const node of nodes) {
        if (!paths.has(node)) {
            const selfPath: Path<V, E> = { from: node, to: node, path: [] };
            paths.set(node, [selfPath]);
        }
    }
    return paths;
}