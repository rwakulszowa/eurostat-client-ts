import { CategoriesPerDimension, DatasetId, fetchDataset } from "./api.js";
import { Dataset, parseDatasetValues } from "./parse.js";
export {
	fetchDataset,
	searchDatasetsByText,
	fetchDatasetMetadata,
} from "./api.js";

export async function fetchDatasetAndParse(
	datasetId: DatasetId,
	categoriesPerDimension: CategoriesPerDimension,
): Promise<Dataset> {
	const raw = await fetchDataset(datasetId, categoriesPerDimension);
	return parseDatasetValues(raw);
}
