# semver-incr-npm

Automates NPM releases and [semantic versioning](https://semver.org/) git tagging using [`semver-incr-git`](https://github.com/erosson/semver-incr-git).

# Usage

In your commit messages, write `fix:`, `feat:`, or `feat!:`/`BREAKING CHANGE:` to indicate patch, minor, and major version changes respectively.

For most repositories, this prints a suggested version number based on your commit messages. By default, it's combined with your package's name, like `my-package/vx.x.x`:

```bash
$ semver-incr-npm
v1.2.3
# this was a dry-run, so the git tag and NPM package weren't pushed:
$ git show my-package/v1.2.3
fatal: Failed to resolve 'v1.2.3' as a valid ref.
$ npm view my-package@v1.2.3
npm ERR! code E404...
```

By default, this is a dry-run - nothing changes. If things look right, release the new NPM-package and git-tag using `--execute`:

```bash
$ semver-incr-npm --execute
v1.2.3
# the git tag and NPM package were pushed, as intended:
$ git show my-package/v1.2.3
commit abc123...
$ npm view my-package@1.2.3
my-package@1.2.3...
```

You can specify a path, or `cd` to a path. Only commits from that path are analyzed for changes, and we'll use the package name in that path's `package.json`. This provides monorepo support:

```bash
$ semver-incr-git --path ./packages/my-package #[--execute]
@company/my-package/v1.2.3
```bash