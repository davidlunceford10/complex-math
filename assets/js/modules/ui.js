// Small display helpers shared by several pages.

// Escape text before putting it inside an HTML string, so typed-in notes can't inject markup.
export function escapeHtml(text) {
	return String(text)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

export function showLoading(container, message = 'Loading…') {
	container.innerHTML = `
		<div class="loader" role="status">
			<span class="spinner" aria-hidden="true"></span>
			<span>${escapeHtml(message)}</span>
		</div>`;
}

export function showError(container, message) {
	container.innerHTML = `
		<div class="message error" role="alert">
			<p><strong>Something went wrong.</strong> ${escapeHtml(message)}</p>
		</div>`;
}

// Adds "is-visible" to each element as it scrolls into view, which starts its CSS animation.
export function revealOnScroll(elements) {
	document.documentElement.classList.add('js-reveal');

	if (!('IntersectionObserver' in window)) {
		elements.forEach((el) => el.classList.add('is-visible'));
		return;
	}

	const observer = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			if (entry.isIntersecting) {
				entry.target.classList.add('is-visible');
				observer.unobserve(entry.target);
			}
		}
	}, { threshold: 0.1 });

	elements.forEach((el, i) => {
		el.style.setProperty('--delay', `${(i % 3) * 120}ms`);
		observer.observe(el);
	});
}

// Formats an ISO date such as "2026-10-22T18:00:00Z" as "Oct 22, 2026".
export function formatDate(iso) {
	return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
