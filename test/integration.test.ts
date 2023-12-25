import test from "ava";

import { fetchDatasetRaw } from "../src/api-raw";

test("fetchDatasetRaw", async (t) => {
	const datasetId = "aact_ali01";
	const categoriesPerDimension = {
		time: ["2000", "2010"],
		geo: ["BE", "BG"],
		freq: ["A"],
		itm_newa: ["40000"],
	};
	const result = await fetchDatasetRaw(datasetId, categoriesPerDimension);
	t.is(result.class, "dataset");
	t.deepEqual(Object.keys(result.value).length, 4);
});
