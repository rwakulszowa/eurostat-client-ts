/**
 * Dataset identifier.
 *
 * @example
 * Identifier for the "Agricultural labour input statistics: absolute figures (1 000 annual work units)" dataset:
 * ```
 * "aact_ali01"
 * ```
 */
export type DatasetId = string;

/**
 * Dimension identifier.
 * Dimensions are direct children of a dataset.
 *
 * @example
 * Identifier for the "Geopolitical entity (reporting)" dimension under _aact_ali01_:
 * ```
 * "geo"
 * ```
 */
export type DimensionId = string;

/**
 * Category identifier.
 * Categories are direct children of a dimension.
 *
 *
 * @example
 * Identifier for the "Belgium" category under _aact_ali01 > geo_:
 * ```
 * "BE"
 * ```
 */
export type CategoryId = string;

/**
 * A subset of categories per dimension.
 * A single dataset may be divided into multiple dimensions and each dimension
 * consists of multiple categories. Fetching the whole dataset at once is slow (and
 * sometimes impossible). In practice, a single request will typically fetch data
 * for a subset of all categories.
 */
export type CategoriesPerDimension = { [key: DimensionId]: CategoryId[] };

/**
 * JSON object returned by the API.
 * This is a subset of all information. Some fields have been omitted.
 */
export type DatasetDataRaw = {
	label: string;
	// Actual values are stored in a flat array with missing fields.
	// Combine with dimensions to get a specific value.
	value: number[];
	id: string[];
	// Extra information about the reading. See `DatasetExtensionRaw.status`.
	status: string[];
	// Size of each dimension.
	size: number[];
	// Dimensions keyed by `DimensionId`.
	dimension: { [key: DimensionId]: DatasetDataDimensionRaw };
	// Extra metadata.
	extension: DatasetDataExtensionRaw;
};

/**
 * Single dimension.
 * In short - a list of categories.
 */
export type DatasetDataDimensionRaw = {
	label: string;
	// Categories are provided as 2 separate objects with the
	// exact same sets of keys. ¯\_(ツ)_/¯
	category: {
		index: { [key: CategoryId]: number };
		label: { [key: CategoryId]: string };
	};
};

/**
 * Extra metadata.
 */
export type DatasetDataExtensionRaw = {
	// Metadata - observation time bounds, update time, etc.
	annotation: { type: string; title: string }[];
	// Labels for `status` ids.
	status: { label: { [key: string]: string } };
};

/**
 * Fetch values for a dataset.
 * `categoriesPerDimension` is a set of filters - some datasets are massive and fetching all
 * data is either impractical or impossible. Use this argument to specify the subset of data
 * you're interested in.
 */
export async function fetchDatasetRaw(
	datasetId: DatasetId,
	categoriesPerDimension: CategoriesPerDimension,
): Promise<DatasetDataRaw> {
	const url = buildQueryUrl(datasetId, categoriesPerDimension);
	const resp = await fetch(url);
	return await resp.json();
}

/**
 * Given a dataset and its dimensions, generate a query.
 * Based on https://ec.europa.eu/eurostat/web/query-builder/tool
 */
function buildQueryUrl(
	datasetId: DatasetId,
	categoriesPerDimension: CategoriesPerDimension,
): string {
	const searchParams = new URLSearchParams();
	searchParams.append("format", "JSON");

	// Add all dimensions to the query string.
	for (const [dimName, dimValues] of Object.entries(categoriesPerDimension)) {
		for (const value of dimValues) {
			searchParams.append(dimName, value);
		}
	}

	return `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${datasetId}?${searchParams}`;
}
