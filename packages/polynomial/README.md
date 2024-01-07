[![npm version](https://badge.fury.io/js/@erosson%2Fpolynomial.svg)](https://www.npmjs.com/package/@erosson/polynomial)
[![cdn usage](https://data.jsdelivr.com/v1/package/npm/@erosson/polynomial/badge)](https://www.jsdelivr.com/package/npm/@erosson/polynomial)

Polynomials for Typescript. Also, implements [Swarm Simulator](https://www.swarmsim.com)-style polynomial unit production.

```ts
import {Polynomial} from "@erosson/polynomial"

const p = Polynomial.parse([3,2,1])
p  // [3, 2, 1]
p.toString()  // "t^2 + 2 t + 3"

p.add(Polynomial.parse([1, 2, 3]))  // [4, 4, 4]
p.mul(5)  // [15, 10, 5]
p.evaluate(0)  // 3
p.evaluate(1)  // 6
p.evaluate(2)  // 11
```

Other number formats are supported, like [Decimal.js](https://mikemcl.github.io/decimal.js/):

```ts
import {Polynomial, decimalNumberOps} from "@erosson/polynomial"
import Decimal from "decimal.js"

const p = Polynomial.parse([new Decimal(3), new Decimal(2), new Decimal(1)], decimalNumberOps(Decimal))
p.toString()  // "t^2 + 2 t + 3"
```

## Usage

In the browser, pick an import style:

```html
<script type="module">
    import {Polynomial} from "https://esm.run/@erosson/polynomial@latest"
    ...
</script>
```

```html
<script src="https://cdn.jsdelivr.net/npm/@erosson/polynomial@latest"></script>
<script>
    // it's now at `PolyProd` or `window.PolyProd`
</script>
```

In Node, to install via NPM:

`npm install --save https://github.com/erosson/polynomial`

In Node, to install via Yarn:

`yarn add https://github.com/erosson/polynomial`

Once installed, pick an import style:

```ts
import {Polynomial} from "@erosson/polynomial"
```

```ts
const {Polynomial} = require("@erosson/polynomial");
```