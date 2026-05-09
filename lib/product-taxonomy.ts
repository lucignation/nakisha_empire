const baseProductCategories = ["Serum", "Toner", "Moisturizer", "Cleanser", "Body Care", "Sun Care"];
const baseProductCollections = ["Golden Ritual", "Soft Reset", "Velvet Body", "Daily Defense", "New Arrivals"];

function getUniqueSortedOptions(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort((left, right) => left.localeCompare(right));
}

export function getProductCategoryOptions(values: string[] = []) {
  return getUniqueSortedOptions([...baseProductCategories, ...values]);
}

export function getProductCollectionOptions(values: string[] = []) {
  return getUniqueSortedOptions([...baseProductCollections, ...values]);
}
