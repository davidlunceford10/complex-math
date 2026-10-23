// The "My notes" box shown under each formula. Notes are saved with notes-store.js.

import { getNote, saveNote } from './notes-store.js';
import { buildUrl } from './url.js';

export function createNoteEditor(topic, formula) {
	const saved = getNote(formula.id);
	const fieldId = `note-${formula.id}`;

	const details = document.createElement('details');
	details.className = 'note-editor';
	details.open = Boolean(saved);
	details.innerHTML = `
		<summary><span class="icon solid fa-pen"></span> My notes on this formula</summary>
		<form>
			<label for="${fieldId}">Write anything that helps you remember (saved in this browser)</label>
			<textarea id="${fieldId}" maxlength="2000" placeholder="Example: remember to divide the WHOLE top by 2a"></textarea>
			<div class="note-actions">
				<button type="submit" class="button small icon solid fa-save">Save note</button>
				<span class="note-status" role="status"></span>
				<a href="${buildUrl('notes.html', { topic: topic.id })}">See all my ${topic.name.toLowerCase()} notes</a>
			</div>
		</form>`;

	const textarea = details.querySelector('textarea');
	const status = details.querySelector('.note-status');
	textarea.value = saved ? saved.text : '';

	details.querySelector('form').addEventListener('submit', (event) => {
		event.preventDefault();
		const ok = saveNote(formula.id, {
			text: textarea.value,
			topicId: topic.id,
			topicName: topic.name,
			formulaName: formula.name
		});

		status.classList.remove('is-saved', 'is-error');
		void status.offsetWidth; // restart the checkmark animation on repeated saves
		if (!ok) {
			status.textContent = 'Your browser blocked saving. Notes need localStorage turned on.';
			status.classList.add('is-error');
		} else {
			status.textContent = textarea.value.trim() ? 'Saved' : 'Note cleared';
			status.classList.add('is-saved');
		}
	});

	return details;
}
