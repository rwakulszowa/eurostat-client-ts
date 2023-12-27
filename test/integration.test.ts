import test from "ava";

import { fetchDataset, fetchDatasetRaw } from "../src/";

const datasetId = "aact_ali01";
const categoriesPerDimension = {
	time: ["2000", "2010"],
	geo: ["BE", "BG"],
	freq: ["A"],
	itm_newa: ["40000"],
};

test("fetchDatasetRaw", async (t) => {
	const result = await fetchDatasetRaw(datasetId, categoriesPerDimension);
	t.is(result.class, "dataset");
	t.deepEqual(Object.keys(result.value).length, 4);
});

test("fetchDataset", async (t) => {
	const result = await fetchDataset(datasetId, categoriesPerDimension);
	t.is(result.rows.length, 4);
	t.deepEqual([...Object.keys(result.definitions)].sort(), [
		"freq",
		"geo",
		"itm_newa",
		"time",
	]);
	t.deepEqual(result.definitions.geo, {
		label: "Geopolitical entity (reporting)",
		categories: {
			BE: { id: "BE", label: "Belgium" },
			BG: { id: "BG", label: "Bulgaria" },
		},
	});
});
