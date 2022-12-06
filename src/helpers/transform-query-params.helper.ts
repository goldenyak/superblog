export function transformSortDirectionFilter(value) {
	return value === 'asc' ? 'asc' : 'desc';
}

export function transformSortByFilter(value) {
	return value === 'createdAt' ? 'createdAt' : value;
}
