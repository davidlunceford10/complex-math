// Form validation built on the browser's Constraint Validation API (required, type="email",
// minlength, pattern...). This module turns those rules into clear, friendly messages
// shown next to each field, instead of the browser's default pop-up bubbles.

// Custom messages for a field, keyed by the name of the rule that failed.
const MESSAGES = {
	name: {
		valueMissing: 'Please enter your name.',
		tooShort: 'Your name should be at least 2 characters.',
		patternMismatch: 'Use letters, spaces, hyphens, or apostrophes only.'
	},
	email: {
		valueMissing: 'Please enter your email so we can reply.',
		typeMismatch: 'That doesn\'t look like an email address (example: you@school.edu).',
		patternMismatch: 'That doesn\'t look like an email address (example: you@school.edu).'
	},
	role: { valueMissing: 'Please choose the option that describes you best.' },
	topic: { valueMissing: 'Please choose a topic.' },
	type: { valueMissing: 'Please choose what kind of feedback this is.' },
	rating: { valueMissing: 'Please rate how helpful the site was.' },
	message: {
		valueMissing: 'Please write your question or feedback.',
		tooShort: 'Please write at least 20 characters so we understand what you need.'
	}
};

function messageFor(field) {
	const custom = MESSAGES[field.name] || {};
	for (const rule of Object.keys(custom)) {
		if (field.validity[rule]) return custom[rule];
	}
	return field.validationMessage;
}

// Every field has an element with id "<name>-error" right after it for its message.
export function validateField(form, name) {
	const fields = [...form.elements].filter((el) => el.name === name);
	const field = fields[0];
	const error = form.querySelector(`#${name}-error`);
	const valid = field.checkValidity();
	const wrapper = field.closest('.field');
	if (!wrapper) return valid; // hidden fields such as the spam trap have no message area

	fields.forEach((el) => el.setAttribute('aria-invalid', String(!valid)));
	wrapper.classList.toggle('has-error', !valid);
	if (error) error.textContent = valid ? '' : messageFor(field);
	return valid;
}

// Checks every field, focuses the first problem, and returns true when the form is valid.
export function validateForm(form) {
	const names = [...new Set([...form.elements].filter((el) => el.name && el.willValidate).map((el) => el.name))];
	const invalid = names.filter((name) => !validateField(form, name));

	if (invalid.length) {
		const first = form.elements[invalid[0]];
		(first instanceof RadioNodeList ? first[0] : first).focus();
	}
	return invalid.length === 0;
}

// Re-check a field as the user fixes it, but only after it has been marked wrong once,
// so people aren't scolded while they are still typing for the first time.
export function liveValidate(form) {
	const recheck = (event) => {
		const wrapper = event.target.closest('.field');
		if (event.target.name && wrapper && wrapper.classList.contains('has-error')) {
			validateField(form, event.target.name);
		}
	};
	form.addEventListener('input', recheck);
	form.addEventListener('change', recheck);

	// Leaving a filled-in text field checks it right away (catches email typos early).
	form.addEventListener('focusout', (event) => {
		const field = event.target;
		if (field.name && field.value && field.type !== 'radio' && field.closest('.field')) {
			validateField(form, field.name);
		}
	});
}
