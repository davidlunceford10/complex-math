// Loads the math content from data/formulas.json and offers helpers to look things up.

import { DATA_URL } from './config.js';

let request = null;

// Fetch the JSON once and reuse the same promise on later calls.
export function getTopics() {
	if (!request) {
		request = fetch(DATA_URL)
			.then((response) => {
				if (!response.ok) throw new Error(`Could not load ${DATA_URL} (status ${response.status})`);
				return response.json();
			})
			.then((data) => data.topics)
			.catch((error) => {
				request = null; // allow a retry on the next call
				throw error;
			});
	}
	return request;
}

export async function getTopic(topicId) {
	const topics = await getTopics();
	return topics.find((topic) => topic.id === topicId);
}

// Step pictures follow a naming pattern: images/steps/<formula-id>-<step number>.svg
export const stepImage = (formulaId, stepNumber) => `images/steps/${formulaId}-${stepNumber}.svg`;
