// The small-screen drop-down menu. On large screens the links are always shown in a row
// (pure CSS); below 981px the Menu button opens them in a panel that drops down OVER the
// page with a dimmed backdrop. The page never moves, so closing is always one tap away:
// the button again, the backdrop, the Escape key, or choosing a link.

const DESKTOP = window.matchMedia('(min-width: 981px)');

export function initNav() {
	const header = document.querySelector('#site-header');
	if (!header) return;

	const toggle = header.querySelector('.nav-toggle');
	const nav = header.querySelector('#site-nav');
	const icon = toggle.querySelector('.icon');
	const label = toggle.querySelector('.nav-toggle-label');

	const backdrop = document.createElement('div');
	backdrop.className = 'nav-backdrop';
	backdrop.hidden = true;
	header.after(backdrop);

	function setOpen(open, { returnFocus = false } = {}) {
		header.classList.toggle('is-open', open);
		toggle.setAttribute('aria-expanded', String(open));
		icon.classList.toggle('fa-bars', !open);
		icon.classList.toggle('fa-times', open);
		label.textContent = open ? 'Close' : 'Menu';
		backdrop.hidden = !open;
		if (open) nav.querySelector('a').focus();
		else if (returnFocus) toggle.focus();
	}

	const isOpen = () => header.classList.contains('is-open');

	toggle.addEventListener('click', () => setOpen(!isOpen()));
	backdrop.addEventListener('click', () => setOpen(false));
	nav.addEventListener('click', (event) => {
		if (event.target.closest('a') && isOpen()) setOpen(false);
	});

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && isOpen()) setOpen(false, { returnFocus: true });
	});

	// Tabbing past the last link closes the menu so it doesn't cover what you tabbed to.
	header.addEventListener('focusout', (event) => {
		if (isOpen() && event.relatedTarget && !header.contains(event.relatedTarget)) setOpen(false);
	});

	// Rotating a tablet (or resizing a window) to the large layout resets the menu.
	DESKTOP.addEventListener('change', () => {
		if (DESKTOP.matches && isOpen()) setOpen(false);
	});
}
