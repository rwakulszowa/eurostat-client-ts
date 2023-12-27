import test from "ava";

import { Dataset, parseDatasetValues } from "./parse";

function monthDate(month: number, year: number): Date {
	return new Date(Date.UTC(year, month - 1));
}

test("parseDatasetValues", (t) => {
	const data = {
		class: "dataset",
		id: ["x", "y", "time"],
		size: [1, 2, 3],
		dimension: {
			x: {
				label: "X",
				category: { index: { a: 0 }, label: { a: "xa" } },
			},
			y: {
				label: "Y",
				category: { index: { a: 0, b: 1 }, label: { a: "ya", b: "yb" } },
			},
			time: {
				label: "Time",
				category: {
					index: { a: 0, b: 1, c: 2 },
					label: { a: "2020-01", b: "2020-02", c: "2020-03" },
				},
			},
		},
		value: [0, 1, 2, 3, 4, 5],
		label: "label",
		status: [],
		extension: { annotation: [], status: { label: {} } },
	};

	const dataset = parseDatasetValues(data);

	t.deepEqual(
		dataset,
		new Dataset(
			[
				{ key: { x: "a", y: "a", time: "a" }, value: 0 },
				{ key: { x: "a", y: "a", time: "b" }, value: 1 },
				{ key: { x: "a", y: "a", time: "c" }, value: 2 },
				{ key: { x: "a", y: "b", time: "a" }, value: 3 },
				{ key: { x: "a", y: "b", time: "b" }, value: 4 },
				{ key: { x: "a", y: "b", time: "c" }, value: 5 },
			],
			{
				x: { label: "X", categories: { a: { id: "a", label: "xa" } } },
				y: {
					label: "Y",
					categories: {
						a: { id: "a", label: "ya" },
						b: { id: "b", label: "yb" },
					},
				},
				time: {
					label: "Time",
					categories: {
						a: { id: "a", label: "2020-01", parsedLabel: monthDate(1, 2020) },
						b: { id: "b", label: "2020-02", parsedLabel: monthDate(2, 2020) },
						c: { id: "c", label: "2020-03", parsedLabel: monthDate(3, 2020) },
					},
				},
			},
		),
	);
});
