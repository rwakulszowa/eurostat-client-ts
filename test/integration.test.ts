import test from "ava";

import {
	fetchDataset,
	fetchDatasetMetadata,
	fetchDatasetRaw,
	searchDatasetsByText,
} from "../src/";

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

test("searchDatasetsByTest", async (t) => {
	const result = await searchDatasetsByText("hospital");
	t.not(result.length, 0);

	// Pick a random, expected result and check its structure.
	const item = result.find((x) => x.code === "hlth_co_hosday");
	t.deepEqual(item, {
		code: "hlth_co_hosday",
		type: "dataset",
		suggest: {
			highLightLocation: "title",
			highlightPhrase: "<b>Hospital</b> days of in-patients",
		},
	});
});

test("fetchDatasetMetadata", async (t) => {
	const result = await fetchDatasetMetadata(datasetId);
	t.like(result, {
		code: datasetId,
		title:
			"Agricultural labour input statistics: absolute figures (1 000 annual work units)",
		dimensions: [
			{
				code: "GEO",
				description: "Geopolitical entity (reporting)",
				positions: [
					{
						code: "EU",
						description:
							"European Union (EU6-1958, EU9-1973, EU10-1981, EU12-1986, EU15-1995, EU25-2004, EU27-2007, EU28-2013, EU27-2020)",
					},
				],
			},
			{
				code: "FREQ",
				description: "Time frequency",
				positions: [{ code: "A", description: "Annual" }],
			},
			{
				code: "ITM_NEWA",
				description: "List of products - EAA",
				positions: [{ code: "40000", description: "Total labour force input" }],
			},
			{
				code: "TIME",
				description: "Period of time",
				positions: [{ code: "1973", description: "1973" }],
			},
		],
	});
});
