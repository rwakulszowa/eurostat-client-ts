import {
	CategoryId,
	type DatasetData,
	type DatasetDataDimension,
	DimensionId,
} from "./api.js";

/**
 * A parsed dataset.
 */
export class Dataset {
	constructor(
		public rows: { key: { [key: DimensionId]: CategoryId }; value: number }[],
		public definitions: { [key: DimensionId]: Dimension },
	) {}
}

type Dimension = {
	label: string;
	categories: { [key: CategoryId]: Category };
};

type Category = {
	id: CategoryId;
	label: string;
	parsedLabel?: unknown;
};

/**
 * Parse Eurostat API funny format, with values separated from dimensions,
 * into a verbose list of key-value pairs.
 */
export function parseDatasetValues(data: DatasetData): Dataset {
	const totalSize = data.size.reduce((x, y) => x * y, 1);
	const categories: number[][] = indexToCategories(data.size);

	const dimensions: Array<[string, ReturnType<typeof parseValuesDimension>]> =
		data.id.map((dimId) => [
			dimId,
			parseValuesDimension(data.dimension[dimId], dimId),
		]);

	const rows = Array(totalSize)
		.fill(null)
		.map((_, valueI) => {
			const value = data.value[valueI];

			const labeledCategories: Array<[DimensionId, CategoryId]> = categories[
				valueI
			].map((catI, dimI) => {
				const [dimId, dim] = dimensions[dimI];
				const cat = dim.categories[catI];
				return [dimId, cat.id];
			});

			return { key: Object.fromEntries(labeledCategories), value };
		});

	const definitions = Object.fromEntries(
		dimensions.map(([dimId, dim]) => {
			const categories: { [key: CategoryId]: Category } = Object.fromEntries(
				dim.categories.map((cat) => [cat.id, cat]),
			);

			return [dimId, { label: dim.label, categories }];
		}),
	);

	return new Dataset(rows, definitions);
}

/**
 * Parse Eurostat API dimension into a more JS friendly object.
 * Where applicable, categories are converted to more specific types (e.g. Date).
 */
function parseValuesDimension(
	rawDimension: DatasetDataDimension,
	dimId: DimensionId,
): { label: string; categories: Category[] } {
	const { label, category } = rawDimension;

	// Choose a label mapping function depending on the dimension.
	let parseLabel: undefined | ((label: string) => unknown);
	if (dimId === "time") {
		parseLabel = parseDate;
	}

	const categories: Category[] = [];
	for (const [catId, catIndex] of Object.entries(category.index)) {
		const catLabel: string = category.label[catId];
		const cat: Category = { id: catId, label: catLabel };
		if (parseLabel) {
			cat.parsedLabel = parseLabel(catLabel);
		}
		categories[catIndex] = cat;
	}
	return { label, categories };
}

/**
 * Precompute an array mapping flat indices to per-dimension category indices.
 */
function indexToCategories(dimSizes: Array<number>): Array<Array<number>> {
	// Precomputed dimension coefficients.
	// All we need to later map indices to categories quickly.
	const coeffs: Array<{ mul: number; mod: number }> = [];

	// Aggregated multiplier for the current dimension.
	let mul = 1;
	for (const dimSize of dimSizes.reverse()) {
		const coef = {
			mul,
			mod: dimSize,
		};
		coeffs.push(coef);

		// The next dimension will take all previous dimension sizes into account.
		mul *= dimSize;
	}
	coeffs.reverse();

	// Produce an array with category indices precalculated.
	const totalSize = dimSizes.reduce((x, y) => x * y, 1);
	return Array(totalSize)
		.fill(null)
		.map((_, index) =>
			coeffs.map((coef) => {
				// Trim data describing previous dimensions.
				const quotient = Math.floor(index / coef.mul);
				return quotient % coef.mod;
			}),
		);
}

/**
 * Convert an eurostat date string into a JS Date object.
 * Eurostat dates come in 3 forms:
 * - full year: 2023
 * - quarter: 2023-Q1
 * - month: 2023-01
 */
export function parseDate(date: string): Date {
	const yearRegex = /^(\d{4})$/;
	const quarterRegex = /^(\d{4})-Q(\d)$/;
	const monthRegex = /^(\d{4})-(\d{2})$/;

	const yearMatch = date.match(yearRegex);
	if (yearMatch) {
		const [_, year] = yearMatch;
		return buildDate(parseInt(year), 0);
	}

	const quarterMatch = date.match(quarterRegex);
	if (quarterMatch) {
		const [_, year, quarter] = quarterMatch;
		return buildDate(parseInt(year), 3 * (parseInt(quarter) - 1));
	}

	const monthMatch = date.match(monthRegex);
	if (monthMatch) {
		const [_, year, month] = monthMatch;
		return buildDate(parseInt(year), parseInt(month) - 1);
	}

	throw new Error(`Failed to parse date: ${date}`);
}

function buildDate(year: number, month: number): Date {
	const d = new Date(0);
	d.setFullYear(year);
	d.setMonth(month);
	return d;
}
