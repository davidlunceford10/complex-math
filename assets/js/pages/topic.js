// Runs on algebra.html, geometry.html and calculus.html.
// Each page says which topic it is with <body data-topic="...">; everything else comes from the JSON.
//
// The page shows ONE formula at a time. The formula list (sidebar on large screens, a sticky row
// of buttons on small screens) is always in view, so switching formulas never requires scrolling.
//
// URL parameters:
//   ?formula=<id>  which formula to show (the first one when missing or unknown)
//   &step=<n>      which slide of the worked example to open
// Picking a formula adds a history entry, so the browser's Back button returns to the previous one.

import { getTopic } from '../modules/data.js';
import { getParam, getNumberParam, setParams, buildUrl } from '../modules/url.js';
import { createSlideshow } from '../modules/slideshow.js';
import { createNoteEditor } from '../modules/note-editor.js';
import { escapeHtml, showLoading, showError } from '../modules/ui.js';
import { initNav } from '../modules/nav.js';

initNav();

const topicId = document.body.dataset.topic;
const view = document.querySelector('#formula-view');
const menu = document.querySelector('.formula-menu');
const menuList = document.querySelector('#formula-nav');
const header = document.querySelector('#site-header');
const SMALL_SCREEN = window.matchMedia('(max-width: 980px)');

let topic = null;

function formulaCard(formula, index) {
	const total = topic.formulas.length;
	const prev = topic.formulas[index - 1];
	const next = topic.formulas[index + 1];
	const pagerLink = (f, cls, label) => f
		? `<a class="${cls}" href="${buildUrl(topic.page, { formula: f.id })}" data-formula="${f.id}"><span>${label}</span>${escapeHtml(f.name)}</a>`
		: '';

	const card = document.createElement('article');
	card.className = 'formula-card';
	card.id = formula.id;
	card.setAttribute('aria-labelledby', `${formula.id}-title`);
	card.innerHTML = `
		<header class="formula-header">
			<p class="formula-count">Formula ${index + 1} of ${total}</p>
			<h3 id="${formula.id}-title" tabindex="-1">${escapeHtml(formula.name)}</h3>
			<p class="formula-display">${escapeHtml(formula.formula)}</p>
			<p class="formula-summary">${escapeHtml(formula.summary)}</p>
		</header>
		<div class="formula-facts card-part">
			<div class="fact">
				<h4><span class="icon solid fa-lightbulb" aria-hidden="true"></span>When to use it</h4>
				<p>${escapeHtml(formula.whenToUse)}</p>
			</div>
			<div class="fact watch-out">
				<h4><span class="icon solid fa-exclamation-triangle" aria-hidden="true"></span>Watch out</h4>
				<p>${escapeHtml(formula.watchOut)}</p>
			</div>
		</div>
		<section class="card-part" aria-labelledby="${formula.id}-example">
			<h4 class="part-label" id="${formula.id}-example"><span class="icon solid fa-play-circle" aria-hidden="true"></span>Worked example</h4>
			<p class="example-problem">${escapeHtml(formula.example)}</p>
			<p class="example-hint">Press Next and Back (or use the arrow keys) to go one step at a time.</p>
			<div class="slideshow-slot"></div>
		</section>
		<div class="note-slot"></div>
		<p class="formula-help">
			<a href="${buildUrl('feedback.html', { topic: topic.id, formula: formula.id })}"><span class="icon solid fa-question-circle" aria-hidden="true"></span>Still stuck on this one? Ask us a question</a>
		</p>
		${prev || next ? `<nav class="formula-pager" aria-label="More ${escapeHtml(topic.name.toLowerCase())} formulas">
			${pagerLink(prev, 'prev', 'Previous formula')}
			${pagerLink(next, 'next', 'Next formula')}
		</nav>` : ''}`;

	// Changing slides records the formula and step in the URL, so the exact slide can be shared.
	card.querySelector('.slideshow-slot').replaceWith(
		createSlideshow(formula, getStartStep(formula), (step) => setParams({ formula: formula.id, step }))
	);
	card.querySelector('.note-slot').replaceWith(createNoteEditor(topic, formula));
	return card;
}

// The step from the URL only applies to the formula the URL names.
function getStartStep(formula) {
	return getParam('formula') === formula.id ? getNumberParam('step', 1) : 1;
}

function findIndex(formulaId) {
	const index = topic.formulas.findIndex((f) => f.id === formulaId);
	return index === -1 ? 0 : index;
}

// Shows one formula. userAction is true when the student picked it (not on first load), which
// moves keyboard/screen-reader focus to the new heading so the change is announced.
function showFormula(formulaId, { userAction = false } = {}) {
	const index = findIndex(formulaId);
	const formula = topic.formulas[index];

	const card = formulaCard(formula, index);
	if (userAction) card.classList.add('is-entering');
	view.replaceChildren(card);
	document.title = `${formula.name} | ${topic.name} | Complex Math`;

	menuList.querySelectorAll('a').forEach((link) => {
		if (link.dataset.formula === formula.id) link.setAttribute('aria-current', 'true');
		else link.removeAttribute('aria-current');
	});
	keepActiveChipVisible();

	if (userAction) {
		// If the student had scrolled down the previous formula, start the new one at its top
		// (an instant jump, like opening a new page; no long animated scroll).
		const offset = header.offsetHeight + (SMALL_SCREEN.matches ? menu.offsetHeight : 0) + 16;
		const top = view.getBoundingClientRect().top - offset;
		if (top < 0) window.scrollTo({ top: window.scrollY + top, behavior: 'instant' });
		card.querySelector('h3').focus({ preventScroll: true });
	}
}

// On small screens the formula list is a sideways-scrolling row; slide the active button into view.
function keepActiveChipVisible() {
	const active = menuList.querySelector('[aria-current="true"]');
	if (!active || !SMALL_SCREEN.matches) return;
	const left = active.offsetLeft - menuList.offsetLeft;
	if (left < menuList.scrollLeft || left + active.offsetWidth > menuList.scrollLeft + menuList.clientWidth) {
		menuList.scrollLeft = left - 16;
	}
}

function renderMenu() {
	menuList.innerHTML = topic.formulas.map((formula) => `
		<li><a href="${buildUrl(topic.page, { formula: formula.id })}" data-formula="${formula.id}">${escapeHtml(formula.name)}</a></li>
	`).join('');
}

// Links to other formulas on this page (sidebar and previous/next) swap the formula in place
// instead of reloading the page, and record the choice in the URL.
function handleFormulaLinks(event) {
	const link = event.target.closest('a[data-formula]');
	if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) return;
	event.preventDefault();
	if (link.dataset.formula !== getParam('formula') || getParam('step')) {
		setParams({ formula: link.dataset.formula, step: null }, { push: true });
	}
	showFormula(link.dataset.formula, { userAction: true });
}

async function init() {
	showLoading(view, 'Loading formulas…');

	try {
		topic = await getTopic(topicId);
		if (!topic) throw new Error(`No topic called "${topicId}" in the data file.`);

		renderMenu();
		showFormula(getParam('formula'));

		menuList.addEventListener('click', handleFormulaLinks);
		view.addEventListener('click', handleFormulaLinks);

		// Back and Forward buttons: show whichever formula the URL now names.
		window.addEventListener('popstate', () => showFormula(getParam('formula'), { userAction: true }));
	} catch (error) {
		showError(view, `${error.message} If you opened this file directly, run the site with a local server such as VS Code Live Server.`);
	}
}

init();
