Polynomials for Typescript.

```ts
import Poly from "@erosson/polynomial"
// "var Poly = require("break_infinity.js");" also works

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

`npm install --save https://github.com/erosson/polynomial`

or

`yarn add https://github.com/erosson/polynomial`

TODO npm