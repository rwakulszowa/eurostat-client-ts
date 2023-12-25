import test from "ava";

import { foo } from "./foo.ts";

test("foo", (t) => {
	t.is(foo(3), 4);
});
