// Runs on algebra.html, geometry.html and calculus.html.
// Each page says which topic it is with <body data-topic="...">; everything else comes from the JSON.
// URL parameters: ?formula=<id> jumps to a formula, &step=<n> opens its slideshow on that step.

import { getTopic } from '../modules/data.js';
import { getParam, getNumberParam, setParams, buildUrl } from '../modules/url.js';
import { createSlideshow } from '../modules/slideshow.js';
import { createNoteEditor } from '../modules/note-editor.js';
import { escapeHtml, showLoading, showError, revealOnScroll } from '../modules/ui.js';

const topicId = document.body.dataset.topic;
const list = document.querySelector('#formula-list');
const sidebarNav = document.querySelector('#formula-nav');

function renderFormula(topic, formula, number, startStep) {
	const card = document.createElement('article');
	card.className = 'formula-card reveal';
	card.id = formula.id;
	card.setAttribute('aria-labelledby', `${formula.id}-title`);
	card.innerHTML = `
		<header class="formula-header">
			<span class="formula-number" aria-hidden="true">${number}</span>
			<h3 id="${formula.id}-title" tabindex="-1">${escapeHtml(formula.name)}</h3>
			<p class="formula-display">${escapeHtml(formula.formula)}</p>
			<p class="formula-summary">${escapeHtml(formula.summary)}</p>
		</header>
		<div class="formula-facts">
			<div class="fact">
				<h4 class="icon solid fa-lightbulb">When to use it</h4>
				<p>${escapeHtml(formula.whenToUse)}</p>
			</div>
			<div class="fact watch-out">
				<h4 class="icon solid fa-exclamation-triangle">Watch out</h4>
				<p>${escapeHtml(formula.watchOut)}</p>
			</div>
		</div>
		<h4 class="example-label">Worked example: ${escapeHtml(formula.example)}</h4>
		<div class="slideshow-slot"></div>
		<div class="note-slot"></div>
		<p class="formula-help">
			<a href="${buildUrl('feedback.html', { topic: topic.id, formula: formula.id })}" class="icon solid fa-question-circle">
				Still stuck on this one? Ask us a question
			</a>
		</p>`;

	// Changing slides records the formula and step in the URL, so the exact slide can be shared.
	const slideshow = createSlideshow(formula, startStep, (step) => {
		setParams({ formula: formula.id, step });
	});
	card.querySelector('.slideshow-slot').replaceWith(slideshow);
	card.querySelector('.note-slot').replaceWith(createNoteEditor(topic, formula));
	return card;
}

function renderSidebar(topic) {
	sidebarNav.innerHTML = topic.formulas.map((formula) => `
		<li><a href="${buildUrl(topic.page, { formula: formula.id })}" data-formula="${formula.id}">${escapeHtml(formula.name)}</a></li>
	`).join('');

	// Jump within the page instead of reloading it, but still update the URL.
	sidebarNav.addEventListener('click', (event) => {
		const link = event.target.closest('a[data-formula]');
		if (!link) return;
		event.preventDefault();
		jumpTo(link.dataset.formula);
		setParams({ formula: link.dataset.formula, step: null });
	});
}

function jumpTo(formulaId) {
	const card = document.getElementById(formulaId);
	if (!card) return;
	card.classList.add('is-visible');
	card.scrollIntoView({ behavior: 'smooth', block: 'start' });
	card.querySelector('h3').focus({ preventScroll: true });
}

async function init() {
	showLoading(list, 'Loading formulas…');

	try {
		const topic = await getTopic(topicId);
		if (!topic) throw new Error(`No topic called "${topicId}" in the data file.`);

		const requested = getParam('formula');
		const requestedStep = getNumberParam('step', 1);

		list.innerHTML = '';
		const cards = topic.formulas.map((formula, i) =>
			renderFormula(topic, formula, i + 1, formula.id === requested ? requestedStep : 1)
		);
		list.append(...cards);
		renderSidebar(topic);
		revealOnScroll(cards);

		if (requested) jumpTo(requested);
	} catch (error) {
		showError(list, `${error.message} If you opened this file directly, run the site with a local server such as VS Code Live Server.`);
	}
}

init();
