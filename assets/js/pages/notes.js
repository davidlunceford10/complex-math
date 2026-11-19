// Runs on notes.html: lists every note saved in localStorage, newest first.
// URL parameter: ?topic=<id> shows only that topic's notes.

import { getAllNotes, deleteNote, clearNotes } from '../modules/notes-store.js';
import { getParam, buildUrl } from '../modules/url.js';
import { escapeHtml, formatDate } from '../modules/ui.js';
import { initNav } from '../modules/nav.js';

initNav();

const list = document.querySelector('#notes-list');
const filters = document.querySelector('#note-filters');
const clearArea = document.querySelector('#clear-area');
const topicFilter = getParam('topic');

const TOPICS = [
	{ id: '', name: 'All topics' },
	{ id: 'algebra', name: 'Algebra' },
	{ id: 'geometry', name: 'Geometry' },
	{ id: 'calculus', name: 'Calculus' }
];

function renderFilters() {
	filters.innerHTML = TOPICS.map((topic) => {
		const active = (topicFilter || '') === topic.id;
		return `<li><a href="${buildUrl('notes.html', { topic: topic.id })}" ${active ? 'aria-current="page" class="active"' : ''}>${topic.name}</a></li>`;
	}).join('');
}

function render() {
	const notes = getAllNotes().filter((note) => !topicFilter || note.topicId === topicFilter);

	clearArea.hidden = notes.length === 0 || Boolean(topicFilter);

	if (!notes.length) {
		list.innerHTML = `
			<div class="empty-notes">
				<p class="icon solid fa-sticky-note" aria-hidden="true"></p>
				<h3>No notes ${topicFilter ? 'for this topic ' : ''}yet</h3>
				<p>Open any formula, write in the <strong>My notes on this formula</strong> box under the worked example, and press Save. Your notes will show up here.</p>
				<p>
					<a href="algebra.html" class="button small">Algebra</a>
					<a href="geometry.html" class="button small">Geometry</a>
					<a href="calculus.html" class="button small">Calculus</a>
				</p>
			</div>`;
		return;
	}

	list.innerHTML = notes.map((note) => `
		<article class="note-card" data-id="${escapeHtml(note.id)}">
			<header>
				<p>${escapeHtml(note.topicName)} · saved ${formatDate(note.updated)}</p>
				<h3>${escapeHtml(note.formulaName)}</h3>
			</header>
			<p class="note-text">${escapeHtml(note.text)}</p>
			<footer>
				<a href="${escapeHtml(buildUrl(`${note.topicId}.html`, { formula: note.formulaId }))}" class="button small icon solid fa-edit">Open lesson</a>
				<button type="button" class="button small alt icon solid fa-trash-alt" data-action="delete">Delete</button>
			</footer>
		</article>
	`).join('');
}

// Deleting asks for a second click instead of using confirm(), which is easy to dismiss by accident.
list.addEventListener('click', (event) => {
	const button = event.target.closest('button[data-action]');
	if (!button) return;
	const card = button.closest('.note-card');

	if (button.dataset.action === 'delete') {
		button.dataset.action = 'confirm';
		button.textContent = 'Click again to delete';
		button.classList.add('danger');
		return;
	}

	card.classList.add('is-removing');
	card.addEventListener('animationend', () => {
		deleteNote(card.dataset.id);
		render();
	}, { once: true });
});

document.querySelector('#clear-all').addEventListener('click', () => {
	document.querySelector('#clear-confirm').hidden = false;
	document.querySelector('#clear-confirm-yes').focus();
});

document.querySelector('#clear-confirm-yes').addEventListener('click', () => {
	clearNotes();
	document.querySelector('#clear-confirm').hidden = true;
	render();
});

document.querySelector('#clear-confirm-no').addEventListener('click', () => {
	document.querySelector('#clear-confirm').hidden = true;
	document.querySelector('#clear-all').focus();
});

renderFilters();
render();
