import { describe, expect, test } from "vitest";
import { type Path, allIncomingPaths, allOutgoingPaths } from "./graph";

type Edge = { from: string; to: string };
describe("graph", () => {
    test.each([
        [[] as Edge[], new Map() as Map<string, Path<string, Edge>[]>],
        [
            [{ from: "a", to: "b" }],
            new Map([
                [
                    "a",
                    [
                        { from: "a", to: "a", path: [] },
                        { from: "a", to: "b", path: [{ from: "a", to: "b" }] },
                    ],
                ],
                ["b", [{ from: "b", to: "b", path: [] }]],
            ]),
        ],
        [
            [
                { from: "a", to: "b" },
                { from: "b", to: "c" },
            ],
            new Map([
                [
                    "a",
                    [
                        { from: "a", to: "a", path: [] },
                        { from: "a", to: "b", path: [{ from: "a", to: "b" }] },
                        {
                            from: "a",
                            to: "c",
                            path: [
                                { from: "a", to: "b" },
                                { from: "b", to: "c" },
                            ],
                        },
                    ],
                ],
                [
                    "b",
                    [
                        { from: "b", to: "b", path: [] },
                        { from: "b", to: "c", path: [{ from: "b", to: "c" }] },
                    ],
                ],
                ["c", [{ from: "c", to: "c", path: [] }]],
            ]),
        ],
        [
            [
                { from: "b", to: "c" },
                { from: "a", to: "b" },
            ],
            new Map([
                [
                    "a",
                    [
                        { from: "a", to: "a", path: [] },
                        { from: "a", to: "b", path: [{ from: "a", to: "b" }] },
                        {
                            from: "a",
                            to: "c",
                            path: [
                                { from: "a", to: "b" },
                                { from: "b", to: "c" },
                            ],
                        },
                    ],
                ],
                [
                    "b",
                    [
                        { from: "b", to: "b", path: [] },
                        { from: "b", to: "c", path: [{ from: "b", to: "c" }] },
                    ],
                ],
                ["c", [{ from: "c", to: "c", path: [] }]],
            ]),
        ],
        [
            [{ from: "a", to: "b", label: "atob" }],
            new Map([
                [
                    "a",
                    [
                        { from: "a", to: "a", path: [] },
                        { from: "a", to: "b", path: [{ from: "a", to: "b", label: "atob" }] },
                    ],
                ],
                ["b", [{ from: "b", to: "b", path: [] }]],
            ]),
        ],
    ])("allOutgoingPaths: %j", (edges, result) => {
        expect(allOutgoingPaths(edges)).toEqual(result);
    });

    test.each([
        [[] as Edge[], new Map() as Map<string, Path<string, Edge>[]>],
        [
            [{ from: "a", to: "b" }],
            new Map([
                ["a", [{ from: "a", to: "a", path: [] }]],
                [
                    "b",
                    [
                        { from: "b", to: "b", path: [] },
                        { from: "a", to: "b", path: [{ from: "a", to: "b" }] },
                    ],
                ],
            ]),
        ],
        [
            [
                { from: "a", to: "b" },
                { from: "b", to: "c" },
            ],
            new Map([
                [
                    "c",
                    [
                        { from: "c", to: "c", path: [] },
                        { from: "b", to: "c", path: [{ from: "b", to: "c" }] },
                        {
                            from: "a",
                            to: "c",
                            path: [
                                { from: "b", to: "c" },
                                { from: "a", to: "b" },
                            ],
                        },
                    ],
                ],
                [
                    "b",
                    [
                        { from: "b", to: "b", path: [] },
                        { from: "a", to: "b", path: [{ from: "a", to: "b" }] },
                    ],
                ],
                ["a", [{ from: "a", to: "a", path: [] }]],
            ]),
        ],
        [
            [
                { from: "b", to: "c" },
                { from: "a", to: "b" },
            ],
            new Map([
                [
                    "c",
                    [
                        { from: "c", to: "c", path: [] },
                        { from: "b", to: "c", path: [{ from: "b", to: "c" }] },
                        {
                            from: "a",
                            to: "c",
                            path: [
                                { from: "b", to: "c" },
                                { from: "a", to: "b" },
                            ],
                        },
                    ],
                ],
                [
                    "b",
                    [
                        { from: "b", to: "b", path: [] },
                        { from: "a", to: "b", path: [{ from: "a", to: "b" }] },
                    ],
                ],
                ["a", [{ from: "a", to: "a", path: [] }]],
            ]),
        ],
        [
            [{ from: "a", to: "b", label: "atob" }],
            new Map([
                ["a", [{ from: "a", to: "a", path: [] }]],
                [
                    "b",
                    [
                        { from: "b", to: "b", path: [] },
                        { from: "a", to: "b", path: [{ from: "a", to: "b", label: "atob" }] },
                    ],
                ],
            ]),
        ],
    ])("allIncomingPaths: %j", (edges, result) => {
        expect(allIncomingPaths(edges)).toEqual(result);
    });
});