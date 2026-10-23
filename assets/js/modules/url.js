// Helpers for reading and writing URL parameters, e.g. algebra.html?formula=quadratic-formula&step=3

export function getParam(name) {
	return new URLSearchParams(window.location.search).get(name);
}

// Reads a whole-number parameter, falling back when it is missing or not a number.
export function getNumberParam(name, fallback) {
	const value = Number.parseInt(getParam(name), 10);
	return Number.isNaN(value) ? fallback : value;
}

// Updates the address bar without reloading, so the current view can be bookmarked or shared.
// A value of null removes that parameter.
export function setParams(params) {
	const url = new URL(window.location.href);
	for (const [name, value] of Object.entries(params)) {
		if (value === null || value === undefined || value === '') url.searchParams.delete(name);
		else url.searchParams.set(name, value);
	}
	window.history.replaceState(null, '', url);
}

// buildUrl('feedback.html', { topic: 'algebra' })  ->  'feedback.html?topic=algebra'
export function buildUrl(page, params = {}) {
	const query = new URLSearchParams();
	for (const [name, value] of Object.entries(params)) {
		if (value !== null && value !== undefined && value !== '') query.set(name, value);
	}
	const text = query.toString();
	return text ? `${page}?${text}` : page;
}
