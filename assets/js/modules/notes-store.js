// Saves student notes in localStorage so they are still there after the browser is closed.
// All notes live under one key as an object keyed by formula id:
// { "quadratic-formula": { text, topicId, topicName, formulaName, updated }, ... }

import { NOTES_KEY } from './config.js';

// localStorage can throw (private browsing, storage disabled), so every access is guarded.
function readAll() {
	try {
		return JSON.parse(localStorage.getItem(NOTES_KEY)) || {};
	} catch {
		return {};
	}
}

function writeAll(notes) {
	try {
		localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
		return true;
	} catch {
		return false;
	}
}

export const getAllNotes = readAll;

export function getNote(formulaId) {
	return readAll()[formulaId];
}

// Saving empty text removes the note. Returns false if the browser refused to store it.
export function saveNote(formulaId, details) {
	const notes = readAll();
	if (details.text.trim()) {
		notes[formulaId] = { ...details, updated: new Date().toISOString() };
	} else {
		delete notes[formulaId];
	}
	return writeAll(notes);
}

export function deleteNote(formulaId) {
	const notes = readAll();
	delete notes[formulaId];
	return writeAll(notes);
}

export function clearNotes() {
	return writeAll({});
}
