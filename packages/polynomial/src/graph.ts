import toposort from "toposort";
import { groupBy } from "./util/map";

/**
 * Describes how to interact with an arbitrary edge type.
 * 
 * Your graph's edges can be any format, as long as you supply the appropriate accessors.
 * 
 *     type Vertex = object
 *     type Edge1 = {from: Vertex, to: Vertex}
 *     const getEdge1 = {from: (e: Edge1) => e.from, to: (e: Edge1) => e.to}
 * 
 *     type Edge2 = {parent: Vertex, child: Vertex}
 *     const getEdge2 = {from: (e: Edge1) => e.parent, to: (e: Edge1) => e.child}
 */
export interface GetEdge<V, E> {
    from: (edge: E) => V;
    to: (edge: E) => V;
}

/**
 * A list of edges starting at vertex `from` that lead to vertex `to`.
 * 
 * Returned by the various path-building functions in this module. Don't construct these yourself.
 */
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

/**
 * Construct every possible path between every node in your graph, grouped by the node they *start* at.
 * 
 * Every node has a zero-length path from itself.
 * 
 *     //      a -> d 
 *     // b -> c -> d
 * 
 *     import {Graph} from "@erosson/polynomial"
 *     const paths = Graph.allOutgoingPaths([{from: 'a', to: 'd'}, {from: 'b', to: 'c'}, {from: 'c', to: 'd'}])
 *     paths.get('a')  // length 2: [a -> a], [a -> d]
 *     paths.get('b')  // length 3: [b -> b], [b -> c], [b -> c -> d]
 *     paths.get('c')  // length 2: [c -> c], [c -> d]
 *     paths.get('d')  // length 1: [d -> d]
 * 
 * The default edge accessors are the `from` and `to` keys. Pass a pair of getters, and your edges can be any other format:
 * 
 *     import {Graph} from "@erosson/polynomial"
 *     const paths = Graph.allOutgoingPaths([{parent: 'a', child: 'd'}, {parent: 'b', child: 'c'}, {parent: 'c', child: 'd'}], {
 *         from: (e) -> e.parent,
 *         to: (e) -> e.child,
 *     })
 */
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

/**
 * Construct every possible path between every node in your graph, grouped by the node they *finish* at.
 * 
 * Every node has a zero-length path to itself.
 * 
 *     //      a -> d 
 *     // b -> c -> d
 * 
 *     import {Graph} from "@erosson/polynomial"
 *     const paths = Graph.allIncomingPaths([{from: 'a', to: 'd'}, {from: 'b', to: 'c'}, {from: 'c', to: 'd'}])
 *     paths.get('a')  // length 1: [a -> a]
 *     paths.get('b')  // length 1: [b -> b]
 *     paths.get('c')  // length 2: [c -> c], [b -> c]
 *     paths.get('d')  // length 4: [d -> d], [a -> d], [c -> d], [b -> c -> d]
 * 
 * The default edge accessors are the `from` and `to` keys. Pass a pair of getters, and your edges can be any other format:
 * 
 *     import {Graph} from "@erosson/polynomial"
 *     const paths = Graph.allIncomingPaths([{parent: 'a', child: 'd'}, {parent: 'b', child: 'c'}, {parent: 'c', child: 'd'}], {
 *         from: (e) -> e.parent,
 *         to: (e) -> e.child,
 *     })
 */
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

function withNodes<V, E>(
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