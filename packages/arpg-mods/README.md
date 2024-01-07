[![npm version](https://badge.fury.io/js/@erosson%2Farpg-mods.svg)](https://www.npmjs.com/package/@erosson/arpg-mods)
[![cdn usage](https://data.jsdelivr.com/v1/package/npm/@erosson/arpg-mods/badge)](https://www.jsdelivr.com/package/npm/@erosson/arpg-mods)

Action RPG-style modifiers and stats.

TODO: documentation

## Usage

In the browser, pick an import style:

```html
<script type="module">
    import {Modifier} from "https://esm.run/@erosson/arpg-mods@latest"
    ...
</script>
```

```html
<script src="https://cdn.jsdelivr.net/npm/@erosson/arpg-mods@latest"></script>
<script>
    // it's now at `ARPGMods` or `window.ARPGMods`
</script>
```

In Node, to install via NPM:

`npm install --save https://github.com/erosson/arpg-mods`

In Node, to install via Yarn:

`yarn add https://github.com/erosson/arpg-mods`

Once installed, pick an import style:

```ts
import {Modifier} from "@erosson/arpg-mods"
```

```ts
const {Modifier} = require("@erosson/arpg-mods");
```