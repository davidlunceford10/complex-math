// Runs on thanks.html. Reads the URL parameters set by the feedback form
// (thanks.html?name=Ana&type=Question&topic=algebra) to personalize the message.

import { getParam } from '../modules/url.js';

const name = getParam('name');
const type = getParam('type');
const topic = getParam('topic');

const REPLIES = {
	Question: 'We got your question and will reply to your email as soon as we can.',
	Suggestion: 'Thanks for the idea! Suggestions like yours shape what we add next.',
	'Report a mistake': 'Thanks for catching that. We will double-check it and fix it quickly.',
	Compliment: 'That made our day. We are glad the site is helping!'
};

const TOPIC_PAGES = { algebra: 'Algebra', geometry: 'Geometry', calculus: 'Calculus' };

// textContent (not innerHTML) is used because these values come from the URL.
document.querySelector('#thanks-title').textContent = name ? `Thanks, ${name}!` : 'Thanks for your feedback!';
document.querySelector('#thanks-message').textContent = REPLIES[type] || 'Your message was sent to the Complex Math team.';

if (TOPIC_PAGES[topic]) {
	const link = document.querySelector('#back-to-topic');
	link.href = `${topic}.html`;
	link.textContent = `Back to ${TOPIC_PAGES[topic]}`;
	link.hidden = false;
}
