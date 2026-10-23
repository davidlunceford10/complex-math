// Builds one chalkboard-style SVG picture for every step in data/formulas.json.
// Run from the project folder after editing the steps:  node tools/generate-step-images.mjs
// Output: images/steps/<formula-id>-<step number>.svg

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const W = 800;
const H = 450;
const CHALK = "'Segoe Print', 'Chalkboard SE', 'Comic Sans MS', cursive";
const SANS = "'Open Sans', 'Segoe UI', Arial, sans-serif";
const YELLOW = '#ffd866';
const WHITE = '#f2f4f7';
const DIM = '#9aa3ad';

const data = JSON.parse(readFileSync(new URL('../data/formulas.json', import.meta.url), 'utf8'));
const outDir = new URL('../images/steps/', import.meta.url);
mkdirSync(outDir, { recursive: true });

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Shrink the font when a line is too long to fit the available width.
const fitSize = (text, base, maxWidth) => Math.min(base, Math.floor(maxWidth / (text.length * 0.56)));

let count = 0;

for (const topic of data.topics) {
	for (const formula of topic.formulas) {
		formula.steps.forEach((step, i) => {
			const svg = drawStep(formula, i);
			writeFileSync(new URL(`${formula.id}-${i + 1}.svg`, outDir), svg);
			count++;
		});
	}
}

console.log(`Wrote ${count} step images to images/steps/`);

function drawStep(formula, index) {
	const step = formula.steps[index];
	const total = formula.steps.length;
	const hasDiagram = Boolean(formula.diagram);
	const workWidth = hasDiagram ? 450 : 720;

	// Earlier work is shown dimmed; this step's new lines are highlighted.
	// Older steps drop off the top once the board holds more than 5 earlier lines.
	let previous = [];
	for (let i = index - 1; i >= 0; i--) {
		if (previous.length + formula.steps[i].work.length > 5) break;
		previous = [...formula.steps[i].work, ...previous];
	}
	const current = step.work;
	const lines = [
		...previous.map((text) => ({ text, now: false })),
		...current.map((text) => ({ text, now: true }))
	];

	const top = 150;
	const bottom = 420;
	const lineHeight = Math.min(52, (bottom - top) / lines.length);
	let y = top + lineHeight * 0.7;

	const work = lines.map((line) => {
		const base = line.now ? lineHeight * 0.72 : lineHeight * 0.6;
		const size = fitSize(line.text, base, workWidth);
		const text = `<text x="40" y="${y.toFixed(1)}" font-family="${CHALK}" font-size="${size}" fill="${line.now ? YELLOW : DIM}">${esc(line.text)}</text>`;
		y += lineHeight;
		return text;
	}).join('\n\t');

	const badge = `STEP ${index + 1} / ${total}`;
	const titleSize = fitSize(step.title, 26, 560);

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
	<title>${esc(`${formula.name}, step ${index + 1}: ${step.title}`)}</title>
	<rect width="${W}" height="${H}" rx="14" fill="#2b3035"/>
	<rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="10" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"/>
	<rect x="32" y="30" width="${badge.length * 11 + 24}" height="34" rx="17" fill="${YELLOW}"/>
	<text x="${32 + (badge.length * 11 + 24) / 2}" y="53" text-anchor="middle" font-family="${SANS}" font-size="16" font-weight="800" fill="#2b3035" letter-spacing="1">${badge}</text>
	<text x="${badge.length * 11 + 72}" y="56" font-family="${SANS}" font-size="${titleSize}" font-weight="700" fill="${WHITE}">${esc(step.title)}</text>
	<text x="40" y="104" font-family="${SANS}" font-size="18" fill="${DIM}">${esc(`Example: ${formula.example}`)}</text>
	<line x1="40" y1="124" x2="${W - 40}" y2="124" stroke="#ffffff" stroke-opacity="0.15" stroke-width="2" stroke-dasharray="6 6"/>
	${work}
	${hasDiagram ? drawDiagram(formula.diagram) : ''}
	<text x="${W - 32}" y="${H - 22}" text-anchor="end" font-family="${SANS}" font-size="12" font-weight="800" fill="#ffffff" fill-opacity="0.25" letter-spacing="2">COMPLEX MATH</text>
</svg>
`;
}

// Diagrams are drawn inside a box on the right side of the board.
function drawDiagram(d) {
	const box = { x: 520, y: 140, w: 250, h: 260 };
	const label = (x, y, text, anchor = 'middle') =>
		`<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${CHALK}" font-size="20" fill="${WHITE}">${esc(text)}</text>`;
	const stroke = `stroke="${WHITE}" stroke-width="3" fill="none" stroke-linejoin="round"`;

	if (d.type === 'right-triangle') {
		const [x0, y0, x1, y1] = [box.x + 30, box.y + 30, box.x + 210, box.y + 220];
		return `<g>
		<polygon points="${x0},${y0} ${x0},${y1} ${x1},${y1}" ${stroke}/>
		<polyline points="${x0},${y1 - 22} ${x0 + 22},${y1 - 22} ${x0 + 22},${y1}" stroke="${YELLOW}" stroke-width="2" fill="none"/>
		${label(x0 - 14, (y0 + y1) / 2, `a = ${d.a}`, 'end')}
		${label((x0 + x1) / 2, y1 + 30, `b = ${d.b}`)}
		${label((x0 + x1) / 2 + 22, (y0 + y1) / 2 - 8, d.c, 'start')}
	</g>`;
	}

	if (d.type === 'triangle-height') {
		const base = box.y + 210;
		const [ax, bx, cx, cy] = [box.x + 10, box.x + 240, box.x + 80, box.y + 40];
		return `<g>
		<polygon points="${ax},${base} ${bx},${base} ${cx},${cy}" ${stroke}/>
		<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${base}" stroke="${YELLOW}" stroke-width="2.5" stroke-dasharray="8 6"/>
		<polyline points="${cx},${base - 16} ${cx + 16},${base - 16} ${cx + 16},${base}" stroke="${YELLOW}" stroke-width="2" fill="none"/>
		${label(cx + 10, (cy + base) / 2, `h = ${d.h}`, 'start')}
		${label((ax + bx) / 2, base + 32, `b = ${d.b}`)}
	</g>`;
	}

	if (d.type === 'circle') {
		const [cx, cy, r] = [box.x + 125, box.y + 120, 100];
		return `<g>
		<circle cx="${cx}" cy="${cy}" r="${r}" ${stroke}/>
		<line x1="${cx - r}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="${DIM}" stroke-width="2" stroke-dasharray="6 6"/>
		<line x1="${cx}" y1="${cy}" x2="${cx + r * 0.71}" y2="${cy - r * 0.71}" stroke="${YELLOW}" stroke-width="3"/>
		<circle cx="${cx}" cy="${cy}" r="4" fill="${WHITE}"/>
		${label(cx + 30, cy - 50, d.r, 'end')}
		${label(cx, cy + 28, d.d)}
	</g>`;
	}

	if (d.type === 'cylinder') {
		const [cx, top, bottom, rx, ry] = [box.x + 90, box.y + 50, box.y + 210, 80, 24];
		return `<g>
		<ellipse cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}" ${stroke}/>
		<line x1="${cx - rx}" y1="${top}" x2="${cx - rx}" y2="${bottom}" ${stroke}/>
		<line x1="${cx + rx}" y1="${top}" x2="${cx + rx}" y2="${bottom}" ${stroke}/>
		<path d="M ${cx - rx} ${bottom} A ${rx} ${ry} 0 0 0 ${cx + rx} ${bottom}" ${stroke}/>
		<path d="M ${cx - rx} ${bottom} A ${rx} ${ry} 0 0 1 ${cx + rx} ${bottom}" stroke="${DIM}" stroke-width="2" fill="none" stroke-dasharray="6 6"/>
		<line x1="${cx}" y1="${top}" x2="${cx + rx}" y2="${top}" stroke="${YELLOW}" stroke-width="3"/>
		<line x1="${cx + rx + 18}" y1="${top}" x2="${cx + rx + 18}" y2="${bottom}" stroke="${YELLOW}" stroke-width="2" stroke-dasharray="6 6"/>
		${label(cx + rx / 2, top - ry - 10, d.r)}
		${label(cx + rx + 26, (top + bottom) / 2, d.h, 'start')}
	</g>`;
	}

	if (d.type === 'graph') {
		return drawGraph(d, box);
	}

	return '';
}

function drawGraph(d, box) {
	const f = new Function('x', `return ${d.fn};`);
	const [xMin, xMax] = d.x;
	const [yMin, yMax] = d.y;
	const px = (x) => box.x + ((x - xMin) / (xMax - xMin)) * box.w;
	const py = (y) => box.y + box.h - ((y - yMin) / (yMax - yMin)) * box.h;
	const parts = [];

	// Axes
	parts.push(`<rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" fill="#ffffff" fill-opacity="0.03" stroke="#ffffff" stroke-opacity="0.1"/>`);
	parts.push(`<line x1="${box.x}" y1="${py(0)}" x2="${box.x + box.w}" y2="${py(0)}" stroke="${DIM}" stroke-width="1.5"/>`);
	parts.push(`<line x1="${px(0)}" y1="${box.y}" x2="${px(0)}" y2="${box.y + box.h}" stroke="${DIM}" stroke-width="1.5"/>`);
	parts.push(`<text x="${box.x + box.w - 4}" y="${py(0) - 6}" text-anchor="end" font-family="${SANS}" font-size="13" fill="${DIM}">x</text>`);
	parts.push(`<text x="${px(0) + 6}" y="${box.y + 14}" font-family="${SANS}" font-size="13" fill="${DIM}">y</text>`);

	// Shaded area under the curve
	if (d.shade) {
		const [a, b] = d.shade;
		const pts = [`${px(a)},${py(0)}`];
		for (let x = a; x <= b + 1e-9; x += (b - a) / 60) pts.push(`${px(x).toFixed(1)},${py(f(x)).toFixed(1)}`);
		pts.push(`${px(b)},${py(0)}`);
		parts.push(`<polygon points="${pts.join(' ')}" fill="${YELLOW}" fill-opacity="0.3"/>`);
	}

	// Curve, broken into segments wherever it leaves the visible box
	const segments = [];
	let seg = [];
	for (let i = 0; i <= 200; i++) {
		const x = xMin + ((xMax - xMin) * i) / 200;
		const y = f(x);
		if (y >= yMin && y <= yMax) {
			seg.push(`${px(x).toFixed(1)},${py(y).toFixed(1)}`);
		} else if (seg.length) {
			segments.push(seg);
			seg = [];
		}
	}
	if (seg.length) segments.push(seg);
	for (const s of segments) parts.push(`<polyline points="${s.join(' ')}" stroke="${WHITE}" stroke-width="3" fill="none"/>`);

	for (const [x, y] of d.points || []) {
		parts.push(`<circle cx="${px(x)}" cy="${py(y)}" r="6" fill="${YELLOW}"/>`);
		// Labels near the right edge go on the left side of the point so they aren't cut off.
		const nearEdge = px(x) > box.x + box.w - 60;
		parts.push(`<text x="${px(x) + (nearEdge ? -10 : 10)}" y="${py(y) - 10}" text-anchor="${nearEdge ? 'end' : 'start'}" font-family="${SANS}" font-size="14" fill="${YELLOW}">(${x}, ${y})</text>`);
	}

	if (d.hole) {
		const [x, y] = d.hole;
		parts.push(`<circle cx="${px(x)}" cy="${py(y)}" r="7" fill="#2b3035" stroke="${YELLOW}" stroke-width="3"/>`);
		parts.push(`<text x="${px(x) - 12}" y="${py(y) - 12}" text-anchor="end" font-family="${SANS}" font-size="14" fill="${YELLOW}">(${x}, ${y})</text>`);
	}

	return `<g>\n\t\t${parts.join('\n\t\t')}\n\t</g>`;
}
