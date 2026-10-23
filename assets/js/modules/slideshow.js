// Builds the step-by-step slideshow for one formula: a picture of the current step,
// an explanation, Back/Next buttons, and a dot for each step.

import { stepImage } from './data.js';
import { escapeHtml } from './ui.js';

// startStep is 1-based (step 1 is the first slide). onChange(stepNumber) runs after the user changes slides.
export function createSlideshow(formula, startStep = 1, onChange = () => {}) {
	const steps = formula.steps;
	let current = Math.min(Math.max(startStep, 1), steps.length) - 1;

	const root = document.createElement('div');
	root.className = 'slideshow';
	root.tabIndex = 0;
	root.setAttribute('role', 'region');
	root.setAttribute('aria-roledescription', 'slideshow');
	root.setAttribute('aria-label', `${formula.name}, step by step`);

	root.innerHTML = `
		<div class="slide-progress" aria-hidden="true"><span></span></div>
		<figure class="slide">
			<img width="800" height="450" alt="" />
			<figcaption>
				<h4></h4>
				<p></p>
			</figcaption>
		</figure>
		<div class="slide-controls">
			<button type="button" class="button alt icon solid fa-arrow-left" data-move="-1">Back</button>
			<p class="slide-counter" aria-live="polite"></p>
			<button type="button" class="button icon solid fa-arrow-right" data-move="1">Next</button>
		</div>
		<ol class="slide-dots">
			${steps.map((step, i) => `
				<li><button type="button" data-step="${i}" aria-label="Go to step ${i + 1}: ${escapeHtml(step.title)}"></button></li>
			`).join('')}
		</ol>`;

	const figure = root.querySelector('.slide');
	const img = figure.querySelector('img');
	const title = figure.querySelector('h4');
	const text = figure.querySelector('figcaption p');
	const counter = root.querySelector('.slide-counter');
	const bar = root.querySelector('.slide-progress span');
	const back = root.querySelector('[data-move="-1"]');
	const next = root.querySelector('[data-move="1"]');
	const dots = [...root.querySelectorAll('.slide-dots button')];

	function show(index, direction = 0) {
		current = index;
		const step = steps[index];

		img.src = stepImage(formula.id, index + 1);
		img.alt = `Step ${index + 1} worked on a chalkboard: ${step.work.join(', ')}`;
		title.textContent = `Step ${index + 1}: ${step.title}`;
		text.textContent = step.text;
		counter.textContent = `Step ${index + 1} of ${steps.length}`;
		bar.style.width = `${((index + 1) / steps.length) * 100}%`;
		back.disabled = index === 0;
		next.disabled = index === steps.length - 1;
		dots.forEach((dot, i) => dot.toggleAttribute('aria-current', i === index));

		// Restart the slide-in animation in the direction the user moved.
		if (direction) {
			figure.classList.remove('slide-from-right', 'slide-from-left');
			void figure.offsetWidth; // forces the browser to notice the class was removed
			figure.classList.add(direction > 0 ? 'slide-from-right' : 'slide-from-left');
		}

		// Preload the next picture so it appears instantly.
		if (index + 1 < steps.length) new Image().src = stepImage(formula.id, index + 2);
	}

	function go(index) {
		if (index < 0 || index >= steps.length || index === current) return;
		const direction = index > current ? 1 : -1;
		show(index, direction);
		onChange(index + 1);
	}

	root.addEventListener('click', (event) => {
		const button = event.target.closest('button');
		if (!button) return;
		if (button.dataset.move) go(current + Number(button.dataset.move));
		if (button.dataset.step) go(Number(button.dataset.step));
	});

	// Left and right arrow keys work while the slideshow (or one of its buttons) has focus.
	root.addEventListener('keydown', (event) => {
		if (event.key === 'ArrowRight') go(current + 1);
		if (event.key === 'ArrowLeft') go(current - 1);
	});

	show(current);
	return root;
}
