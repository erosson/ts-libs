Polynomials for Typescript.

```ts
import Poly from "@erosson/polynomial"
// `var Poly = require("@erosson/polynomial");` also works

const p = Poly.parse([3,2,1])

p  // [3, 2, 1]
Poly.toString(p)  // "t^2 + 2 t + 3"

Poly.add(p, Poly.parse([1, 2, 3]))  // [4, 4, 4]
Poly.mul(p, 5)  // [15, 10, 5]
Poly.evaluate(p, 0)  // 3
Poly.evaluate(p, 1)  // 6
Poly.evaluate(p, 2)  // 11
```

Other number formats are supported, like [Decimal.js](https://mikemcl.github.io/decimal.js/):

```ts
import * as P from "@erosson/polynomial"
import Decimal from "decimal.js"
const Poly = P.Decimal((n) => new Decimal(n))

const p = Poly.parse([new Decimal(3), new Decimal(2), new Decimal(1)])
Poly.toString(p)  // "t^2 + 2 t + 3"
```

## Usage

In the browser, pick an import style:

```html
<script type="module">
    import Poly from "https://esm.run/@erosson/polynomial@latest"
    ...
</script>
```

```html
<script src="https://cdn.jsdelivr.net/npm/@erosson/polynomial@latest"></script>
<script>
    // it's now at `Poly` or `window.Poly`
</script>
```

In Node, to install via NPM:

`npm install --save https://github.com/erosson/polynomial`

In Node, to install via Yarn:

`yarn add https://github.com/erosson/polynomial`

Once installed, pick an import style:

```ts
import Poly from "@erosson/polynomial"
```

```ts
const Poly = require("@erosson/polynomial");
```