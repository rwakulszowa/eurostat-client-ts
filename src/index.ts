import { CategoriesPerDimension, DatasetId, fetchDatasetRaw } from "./api-raw";
import { Dataset, parseDatasetValues } from "./parse";
export {
	fetchDatasetRaw,
	searchDatasetsByText,
	fetchDatasetMetadata,
} from "./api-raw";

export async function fetchDataset(
	datasetId: DatasetId,
	categoriesPerDimension: CategoriesPerDimension,
): Promise<Dataset> {
	const raw = await fetchDatasetRaw(datasetId, categoriesPerDimension);
	return parseDatasetValues(raw);
}
