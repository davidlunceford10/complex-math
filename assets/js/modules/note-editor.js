// The "My notes" panel shown under each formula. It is always open (not collapsed) so
// students see it while they study. A formula can have several notes: each saved note is
// listed with Edit and Delete, and the box at the bottom adds a new one.
// Notes are saved with notes-store.js.

import { getNotesFor, addNote, updateNote, deleteNote } from './notes-store.js';
import { buildUrl } from './url.js';
import { escapeHtml, formatDate } from './ui.js';

export function createNoteEditor(topic, formula) {
	const fieldId = `note-${formula.id}`;
	let editingId = null; // id of the note being edited, or null when adding a new note

	const panel = document.createElement('section');
	panel.className = 'note-panel card-part';
	panel.setAttribute('aria-labelledby', `${fieldId}-title`);
	panel.innerHTML = `
		<div class="note-panel-header">
			<h4 id="${fieldId}-title"><span class="icon solid fa-sticky-note" aria-hidden="true"></span>My notes on this formula<span class="note-count-badge" hidden></span></h4>
			<a href="${buildUrl('notes.html', { topic: topic.id })}">All my ${escapeHtml(topic.name.toLowerCase())} notes</a>
		</div>
		<ul class="note-items"></ul>
		<form class="note-form">
			<label for="${fieldId}">Add a note (saved in this browser)</label>
			<textarea id="${fieldId}" name="note" maxlength="2000" placeholder="Example: remember to divide the WHOLE top by 2a"></textarea>
			<div class="note-actions">
				<button type="submit" class="button small icon solid fa-save">Save note</button>
				<button type="button" class="button small alt" data-action="cancel" hidden>Cancel</button>
				<span class="note-status" role="status"></span>
			</div>
		</form>`;

	const list = panel.querySelector('.note-items');
	const badge = panel.querySelector('.note-count-badge');
	const form = panel.querySelector('form');
	const label = form.querySelector('label');
	const textarea = form.querySelector('textarea');
	const saveButton = form.querySelector('button[type="submit"]');
	const cancelButton = form.querySelector('[data-action="cancel"]');
	const status = panel.querySelector('.note-status');

	function renderList() {
		const notes = getNotesFor(formula.id);
		badge.hidden = notes.length === 0;
		badge.innerHTML = `${notes.length}<span class="visually-hidden"> saved</span>`;
		list.hidden = notes.length === 0;
		list.innerHTML = notes.map((note) => `
			<li class="note-item${note.id === editingId ? ' is-editing' : ''}" data-id="${escapeHtml(note.id)}">
				<p class="note-text">${escapeHtml(note.text)}</p>
				<p class="note-meta">
					<time datetime="${escapeHtml(note.updated)}">Saved ${formatDate(note.updated)}</time>
					<button type="button" class="link-button" data-action="edit">Edit</button>
					<button type="button" class="link-button" data-action="delete">Delete</button>
				</p>
			</li>`).join('');
	}

	function showStatus(message, ok) {
		status.classList.remove('is-saved', 'is-error');
		void status.offsetWidth; // restart the checkmark animation on repeated saves
		status.textContent = message;
		status.classList.add(ok ? 'is-saved' : 'is-error');
	}

	function setMode(noteId) {
		editingId = noteId;
		const editing = Boolean(noteId);
		label.textContent = editing ? 'Edit your note' : 'Add a note (saved in this browser)';
		saveButton.textContent = editing ? 'Save changes' : 'Save note';
		cancelButton.hidden = !editing;
		if (!editing) textarea.value = '';
		renderList();
	}

	form.addEventListener('submit', (event) => {
		event.preventDefault();
		const text = textarea.value;
		if (!text.trim()) {
			showStatus('Write something first.', false);
			textarea.focus();
			return;
		}

		const ok = editingId
			? updateNote(editingId, text)
			: Boolean(addNote({
				formulaId: formula.id,
				topicId: topic.id,
				topicName: topic.name,
				formulaName: formula.name,
				text
			}));

		if (!ok) {
			showStatus('Your browser blocked saving. Notes need local storage turned on.', false);
			return;
		}
		showStatus(editingId ? 'Changes saved' : 'Note saved', true);
		setMode(null);
	});

	cancelButton.addEventListener('click', () => {
		setMode(null);
		status.textContent = '';
		textarea.focus();
	});

	list.addEventListener('click', (event) => {
		const button = event.target.closest('button[data-action]');
		if (!button) return;
		const item = button.closest('.note-item');
		const id = item.dataset.id;

		if (button.dataset.action === 'edit') {
			const note = getNotesFor(formula.id).find((n) => n.id === id);
			if (!note) return;
			setMode(id);
			textarea.value = note.text;
			textarea.focus();
			return;
		}

		// Deleting asks for a second click instead of using confirm(), which is easy to dismiss by accident.
		if (button.dataset.action === 'delete') {
			button.dataset.action = 'confirm-delete';
			button.textContent = 'Click again to delete';
			button.classList.add('danger');
			return;
		}

		if (button.dataset.action === 'confirm-delete') {
			item.classList.add('is-removing');
			item.addEventListener('animationend', () => {
				deleteNote(id);
				if (editingId === id) setMode(null);
				else renderList();
				showStatus('Note deleted', true);
			}, { once: true });
		}
	});

	renderList();
	return panel;
}
