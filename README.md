# ts-libs
[![Push](https://github.com/erosson/ts-libs/actions/workflows/push.yml/badge.svg)](https://github.com/erosson/ts-libs/actions/workflows/push.yml)

Monorepo for my public Typescript packages.

Why a monorepo? Easier to keep infrastructure consistent and up to date, quicker to start a new package, few/no other contributors so separate PRs/issues doesn't matter so much. If anything in here gets popular, I'll probably split it into its own repo.

CI runs `yarn test` and `yarn release` on every changed package. Release usually runs `semver-incr-npm` which releases the package to NPM only if anything's changed.

CI also runs `yarn release-docs` to build the [documentation website](https://erosson.github.io/ts-libs/).
