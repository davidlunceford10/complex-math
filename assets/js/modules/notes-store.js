// Saves student notes in localStorage so they are still there after the browser is closed.
// A formula can have any number of notes. Every note is one object in an array saved
// under one key (NOTES_KEY):
// [{ id, formulaId, topicId, topicName, formulaName, text, created, updated }, ...]

import { NOTES_KEY } from './config.js';

// The first version of the site saved one note per formula as an object keyed by formula id.
// Those notes are converted to the new list format the first time they are read.
function upgradeOldFormat(old) {
	return Object.entries(old)
		.filter(([, note]) => note && note.text)
		.map(([formulaId, note]) => {
			const date = note.updated || new Date().toISOString();
			return {
				id: makeId(),
				formulaId,
				topicId: note.topicId,
				topicName: note.topicName,
				formulaName: note.formulaName,
				text: note.text,
				created: date,
				updated: date
			};
		});
}

// Skips anything in storage that isn't a usable note (for example, if it was edited by hand).
const isNote = (note) => note && typeof note === 'object' && typeof note.id === 'string' && typeof note.text === 'string';

function makeId() {
	return window.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// localStorage can throw (private browsing, storage disabled), so every access is guarded.
function readAll() {
	try {
		const data = JSON.parse(localStorage.getItem(NOTES_KEY));
		if (Array.isArray(data)) return data.filter(isNote);
		if (data && typeof data === 'object') {
			const upgraded = upgradeOldFormat(data);
			writeAll(upgraded);
			return upgraded;
		}
		return [];
	} catch {
		return [];
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

const newestFirst = (a, b) => String(b.updated || '').localeCompare(String(a.updated || ''));

// Every note, newest first.
export function getAllNotes() {
	return readAll().sort(newestFirst);
}

// The notes for one formula, newest first.
export function getNotesFor(formulaId) {
	return getAllNotes().filter((note) => note.formulaId === formulaId);
}

// details: { formulaId, topicId, topicName, formulaName, text }.
// Returns the saved note, or null if the text was empty or the browser refused to store it.
export function addNote(details) {
	const text = details.text.trim();
	if (!text) return null;
	const now = new Date().toISOString();
	const note = { ...details, text, id: makeId(), created: now, updated: now };
	const notes = readAll();
	notes.push(note);
	return writeAll(notes) ? note : null;
}

// Returns true when the change was saved.
export function updateNote(id, text) {
	const notes = readAll();
	const note = notes.find((n) => n.id === id);
	if (!note || !text.trim()) return false;
	note.text = text.trim();
	note.updated = new Date().toISOString();
	return writeAll(notes);
}

export function deleteNote(id) {
	return writeAll(readAll().filter((note) => note.id !== id));
}

export function clearNotes() {
	return writeAll([]);
}
