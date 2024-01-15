# ts-libs
Monorepo for my public Typescript packages. Still a work in progress, still importing packages from other repos.

Why a monorepo? Easier to keep infrastructure consistent and up to date, quicker to start a new package, few/no other contributors so separate PRs/issues doesn't matter so much. If anything in here gets popular, I'll probably split it into its own repo.

CI runs `yarn release` on every package. This should always run tests (re-evaluate if/when things get slow), and run `semver-incr-npm` which releases the package only if anything's changed.