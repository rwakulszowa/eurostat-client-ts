import { CategoriesPerDimension, DatasetId, fetchDataset } from "./api";
import { Dataset, parseDatasetValues } from "./parse";
export {
	fetchDataset,
	searchDatasetsByText,
	fetchDatasetMetadata,
} from "./api";

export async function fetchDatasetAndParse(
	datasetId: DatasetId,
	categoriesPerDimension: CategoriesPerDimension,
): Promise<Dataset> {
	const raw = await fetchDataset(datasetId, categoriesPerDimension);
	return parseDatasetValues(raw);
}
