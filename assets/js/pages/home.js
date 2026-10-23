// Runs on index.html: fills the flip cards and "Formula of the Day" from the JSON,
// shows how many notes are saved, and handles flipping the topic cards.

import { getTopics } from '../modules/data.js';
import { getAllNotes } from '../modules/notes-store.js';
import { buildUrl } from '../modules/url.js';
import { escapeHtml, revealOnScroll } from '../modules/ui.js';

const cards = [...document.querySelectorAll('.flip-card')];

// Only the face that is showing can be reached with the keyboard or a screen reader.
function setFlipped(card, flipped) {
	card.classList.toggle('is-flipped', flipped);
	card.querySelector('.flip-front').inert = flipped;
	card.querySelector('.flip-back').inert = !flipped;
	card.querySelector(flipped ? '.flip-back .flip-toggle' : '.flip-front .flip-toggle').focus();
}

cards.forEach((card) => {
	card.querySelector('.flip-back').inert = true;
	card.querySelectorAll('.flip-toggle').forEach((button) => {
		button.addEventListener('click', () => setFlipped(card, !card.classList.contains('is-flipped')));
	});
});

revealOnScroll([...document.querySelectorAll('.reveal')]);

function fillFlipCards(topics) {
	for (const topic of topics) {
		const listEl = document.querySelector(`.flip-card[data-topic="${topic.id}"] .formula-links`);
		if (!listEl) continue;
		listEl.innerHTML = topic.formulas.map((formula) => `
			<li><a href="${buildUrl(topic.page, { formula: formula.id })}">${escapeHtml(formula.name)}</a></li>
		`).join('');
	}
}

// The same formula is featured all day, and a different one tomorrow.
function fillSpotlight(topics) {
	const spotlight = document.querySelector('#spotlight-content');
	const all = topics.flatMap((topic) => topic.formulas.map((formula) => ({ topic, formula })));
	const dayNumber = Math.floor(Date.now() / 86400000);
	const { topic, formula } = all[dayNumber % all.length];

	spotlight.innerHTML = `
		<header>
			<p>${escapeHtml(topic.name)}</p>
			<h3><a href="${buildUrl(topic.page, { formula: formula.id })}">${escapeHtml(formula.name)}</a></h3>
		</header>
		<p class="formula-display">${escapeHtml(formula.formula)}</p>
		<p>${escapeHtml(formula.summary)}</p>
		<footer>
			<a href="${buildUrl(topic.page, { formula: formula.id, step: 1 })}" class="button alt icon solid fa-play-circle">Walk through it</a>
		</footer>`;
}

function showNoteCount() {
	const count = Object.keys(getAllNotes()).length;
	const el = document.querySelector('#note-count');
	if (count) el.textContent = `You have ${count} saved ${count === 1 ? 'note' : 'notes'}.`;
}

showNoteCount();

getTopics()
	.then((topics) => {
		fillFlipCards(topics);
		fillSpotlight(topics);
	})
	.catch(() => {
		document.querySelector('#spotlight-content').innerHTML =
			'<p>The formula list could not be loaded. Run the site with a local server (for example VS Code Live Server).</p>';
	});
