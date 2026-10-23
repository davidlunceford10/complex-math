// Runs on feedback.html: validates the form and sends it to Web3Forms, which emails it to the site.
// URL parameters: ?topic=<id>&formula=<id> pre-select the topic and formula (used by the
// "Still stuck?" links on each formula). After sending, the user goes to thanks.html with
// their name, feedback type, and topic in the URL.

import { WEB3FORMS_ACCESS_KEY, WEB3FORMS_ENDPOINT } from '../modules/config.js';
import { getTopics } from '../modules/data.js';
import { getParam, buildUrl } from '../modules/url.js';
import { validateForm, liveValidate } from '../modules/validation.js';
import { escapeHtml } from '../modules/ui.js';

const form = document.querySelector('#feedback-form');
const topicSelect = form.elements.topic;
const formulaSelect = form.elements.formula;
const message = form.elements.message;
const counter = document.querySelector('#message-count');
const submitButton = form.querySelector('button[type="submit"]');
const status = document.querySelector('#form-status');

let topics = [];

// The formula drop-down lists only the formulas in the chosen topic.
function fillFormulaOptions(selectedFormula = '') {
	const topic = topics.find((t) => t.id === topicSelect.value);
	formulaSelect.disabled = !topic;
	formulaSelect.innerHTML = '<option value="">Not about one formula</option>' +
		(topic ? topic.formulas.map((f) => `<option value="${f.id}">${escapeHtml(f.name)}</option>`).join('') : '');
	formulaSelect.value = topic && topic.formulas.some((f) => f.id === selectedFormula) ? selectedFormula : '';
}

function updateCounter() {
	const max = message.maxLength;
	counter.textContent = `${message.value.length} / ${max}`;
	counter.classList.toggle('is-near-limit', message.value.length > max * 0.9);
}

async function init() {
	const topicParam = getParam('topic');
	if (topicParam && [...topicSelect.options].some((o) => o.value === topicParam)) {
		topicSelect.value = topicParam;
	}

	try {
		topics = await getTopics();
	} catch {
		topics = [];
	}
	fillFormulaOptions(getParam('formula'));
}

topicSelect.addEventListener('change', () => fillFormulaOptions());
message.addEventListener('input', updateCounter);
liveValidate(form);
updateCounter();
init();

form.addEventListener('submit', async (event) => {
	event.preventDefault();
	status.textContent = '';
	status.className = 'form-status';

	if (!validateForm(form)) {
		status.textContent = 'Please fix the highlighted fields.';
		status.classList.add('error');
		return;
	}

	if (WEB3FORMS_ACCESS_KEY.startsWith('YOUR_')) {
		status.textContent = 'The feedback form is not connected yet. Add the Web3Forms access key in assets/js/modules/config.js.';
		status.classList.add('error');
		return;
	}

	const data = Object.fromEntries(new FormData(form));
	const topicName = topicSelect.selectedOptions[0].textContent;
	const formulaName = formulaSelect.value ? formulaSelect.selectedOptions[0].textContent : 'None';

	const payload = {
		access_key: WEB3FORMS_ACCESS_KEY,
		subject: `Complex Math feedback: ${data.type} about ${topicName}`,
		from_name: 'Complex Math website',
		replyto: data.email,
		botcheck: data.botcheck || '',
		Name: data.name,
		Email: data.email,
		'I am a': data.role,
		Topic: topicName,
		Formula: formulaName,
		'Feedback type': data.type,
		'Helpfulness (1-5)': data.rating,
		Message: data.message,
		'OK to reply': data.reply ? 'Yes' : 'No'
	};

	submitButton.disabled = true;
	submitButton.classList.add('is-loading');

	try {
		const response = await fetch(WEB3FORMS_ENDPOINT, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
			body: JSON.stringify(payload)
		});
		const result = await response.json();
		if (!response.ok || !result.success) throw new Error(result.message || 'The message was not accepted.');

		window.location.href = buildUrl('thanks.html', {
			name: data.name.split(' ')[0],
			type: data.type,
			topic: data.topic
		});
	} catch (error) {
		status.textContent = `Sorry, your feedback could not be sent (${error.message}). Please try again in a moment.`;
		status.classList.add('error');
		submitButton.disabled = false;
		submitButton.classList.remove('is-loading');
	}
});
