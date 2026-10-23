# How Complex Math Works

This guide explains what every part of the site does and how the parts connect. Read the overview first, then jump to whichever section (HTML, CSS, or JavaScript) you are working on.

---

## 1. The big picture

```
Browser opens algebra.html
        │
        ├─ loads CSS: main.css (template look) + complex-math.css (our components & animations)
        │
        ├─ loads template scripts: jQuery → dropotron → breakpoints → util.js → main.js
        │     (drop-down menu, phone slide-out menu)
        │
        └─ loads our module: assets/js/pages/topic.js
                │
                ├─ data.js   → fetch('data/formulas.json')   (all the math content)
                ├─ url.js    → reads ?formula=…&step=…        (URL parameters)
                ├─ slideshow.js → builds the Back/Next step slides
                ├─ note-editor.js → "My notes" box → notes-store.js → localStorage
                └─ ui.js     → loading spinner, error box, scroll-in animation
```

The HTML pages are mostly **empty frames**: header, nav, footer, and a few placeholder `<div>`s. The JavaScript fetches `data/formulas.json` and builds the formula cards, slideshows, and lists inside those placeholders. To change the math content, you edit **one JSON file**, not seven HTML files.

### File map

| Path | What it is |
|---|---|
| `index.html` | Home page: banner, topic flip cards, "how it works," sticking points, Formula of the Day |
| `algebra.html`, `geometry.html`, `calculus.html` | Topic pages. Nearly identical; `<body data-topic="algebra">` tells the JS which topic to show |
| `feedback.html` | The detailed, validated feedback form |
| `thanks.html` | Confirmation page shown after the form is sent (reads URL parameters) |
| `notes.html` | Lists every note the student saved |
| `data/formulas.json` | All topics, formulas, explanations, and steps |
| `images/chalkboard.jpg` | Header background photo |
| `images/favicon.svg` | Browser-tab icon: the yellow √x from the logo |
| `images/steps/*.svg` | One picture per step of every formula (51 total), made by the generator script |
| `tools/generate-step-images.mjs` | Node script that draws the step pictures from the JSON |
| `assets/css/main.css` | The ZeroFour template's styles (grid, header, nav, buttons, footer) |
| `assets/css/complex-math.css` | Everything we added: cards, slideshow, form, notes, flip cards, animations |
| `assets/js/main.js`, `util.js`, `jquery*.js`, `breakpoints.min.js` | Template scripts for the drop-down and mobile menu |
| `assets/js/modules/*.js` | Our reusable modules (data, URL, storage, slideshow, validation…) |
| `assets/js/pages/*.js` | One "entry" module per page that wires the modules together |

---

## 2. HTML

### Shared layout (every page)

Every page has the same three parts, copied from the template:

1. **`#header-wrapper`** contains the logo ("Complex Math"), the main `<nav id="nav">`, and on the home page only, the `#banner`.
2. **`<main id="main-wrapper">`** holds the page content. It was a `<div>` in the template; making it `<main>` tells screen readers where the content starts.
3. **`#footer-wrapper`** contains topic links, popular formulas (deep links using URL parameters), the About text, contact info, and credits.

**Navigation.** The nav is a nested list. The `<ul>` *inside* the "Math Topics" `<li>` is the drop-down:

```html
<li class="current_page_item">
  <a href="index.html#topics">Math Topics</a>
  <ul>
    <li><a href="algebra.html">Algebra</a></li>
    <li><a href="geometry.html">Geometry</a></li>
    <li><a href="calculus.html">Calculus</a></li>
  </ul>
</li>
<li><a href="feedback.html">Feedback</a></li>
<li><a href="notes.html">Student Notes</a></li>
```

`class="current_page_item"` highlights the page you're on. Move it to a different `<li>` on each page. "Math Topics" links to the topic cards on the home page, so it still works for keyboard and touch users who can't hover.

**Accessibility features in the HTML:**
- `lang="en"` on `<html>`, and a `<meta name="description">` on each page.
- A "Skip to main content" link: the first thing a keyboard user tabs to.
- The template's `user-scalable=no` was removed so people can pinch-zoom.
- Every image has `alt` text (decorative ones use `alt=""`), plus `width`/`height` so the layout doesn't jump while images load.
- Form fields all have `<label>`s; radio groups use `<fieldset>` + `<legend>`; error messages are linked with `aria-describedby`.

### Page-specific HTML

- **Home (`index.html`).** Each flip card has a `.flip-front` and a `.flip-back`. The back's formula list starts as "Loading formulas…" and gets filled in by `home.js`. `#spotlight-content` (Formula of the Day) and `#note-count` are also filled by JS.
- **Topic pages.** The page only contains the intro text, the empty sidebar list `<ul id="formula-nav">`, and the empty `<div id="formula-list">`. Everything inside them is built by `topic.js`.
- **Feedback (`feedback.html`).** The `<form id="feedback-form" novalidate>`. `novalidate` turns off the browser's pop-up bubbles so our own friendly messages appear instead. The validation *rules* are still plain HTML attributes: `required`, `type="email"`, `minlength`, `maxlength`, `pattern`. Each field sits in a `.field` wrapper with an empty `<p class="field-error" id="NAME-error">` for its message. A hidden `botcheck` checkbox is Web3Forms' spam trap: bots tick it, humans never see it.
- **Notes (`notes.html`).** Empty `#note-filters` and `#notes-list`, filled by `notes.js`. The "Delete all" confirmation is built into the page (instead of `confirm()`).
- **Thanks (`thanks.html`).** An SVG checkmark plus a heading and message that `thanks.js` personalizes.

---

## 3. The data file (`data/formulas.json`)

```jsonc
{
  "topics": [
    {
      "id": "algebra",                 // used in URLs and data-topic
      "name": "Algebra",
      "page": "algebra.html",
      "icon": "fa-superscript",
      "tagline": "Solve for the unknown",
      "description": "…",
      "image": "https://images.unsplash.com/…",
      "formulas": [
        {
          "id": "quadratic-formula",   // used in ?formula= and image file names
          "name": "The Quadratic Formula",
          "formula": "x = (−b ± √(b² − 4ac)) ÷ 2a",
          "summary": "…",
          "whenToUse": "…",
          "watchOut": "…",             // the common mistake students make
          "example": "Solve 2x² + 3x − 2 = 0",
          "diagram": { "type": "graph", … },   // optional picture on the right of each slide
          "steps": [
            {
              "title": "Identify a, b, and c",
              "text": "Explanation shown under the slide",
              "work": ["2x² + 3x − 2 = 0", "a = 2,  b = 3,  c = −2"]  // lines written on the board
            }
          ]
        }
      ]
    }
  ]
}
```

### Adding or changing a formula

1. Edit `data/formulas.json` (copy an existing formula as a starting point; keep `id`s lowercase-with-dashes).
2. Regenerate the step pictures: `node tools/generate-step-images.mjs`
3. Refresh the page. The new formula appears in the sidebar, the topic page, the home flip card, the feedback form's formula list, and Formula of the Day automatically.

### The step pictures

`tools/generate-step-images.mjs` reads the JSON and writes one SVG per step to `images/steps/<formula-id>-<step>.svg`. Each picture looks like a chalkboard:
- earlier steps' `work` lines in grey, the current step's lines highlighted in yellow;
- a step badge ("STEP 2 / 5") and the step title;
- an optional diagram from `"diagram"`: `right-triangle`, `triangle-height`, `circle`, `cylinder`, or `graph` (a plotted function with optional `points`, a `hole`, or a `shade`d area).

SVG files are text, so they stay sharp at any size and are tiny to download.

---

## 4. CSS

There are two stylesheets, loaded in this order:

1. **`main.css`**: the ZeroFour template, mostly unchanged. The one edit: `#header-wrapper` now uses `images/chalkboard.jpg` with a dark gradient on top so white text stays readable.
2. **`complex-math.css`**: all our styles, organized into labeled sections.

### Key sections of `complex-math.css`

| Section | What it does |
|---|---|
| Shared values | CSS variables (`--blue`, `--chalkboard`, `--chalk-yellow`…) used everywhere, so colors change in one place |
| Accessibility | Skip link, visible yellow focus outlines (the template removed them), slightly darker text for contrast |
| Buttons | Lift-on-hover animation, `.small` and `.danger` variants, disabled state |
| Loading and messages | The spinning loader and the red error box |
| Scroll-in animation | `.reveal` elements fade/slide up as they scroll into view |
| Flip cards | 3D card flip on the home page |
| Topic pages / Slideshow | Formula cards, "When to use it" / "Watch out" boxes, the chalkboard slideshow, dots, progress bar |
| Note editor / Notes page | The "My notes" box and the sticky-note cards |
| Feedback form | Pill-shaped radio buttons, error styles, character counter, spinner inside the submit button |
| Thank-you page | The self-drawing checkmark |
| Responsive | Phone-size adjustments (≤ 736px) |
| Keyframes | Every `@keyframes` animation in one place |

### Responsive design

The template's grid uses classes such as `col-4 col-12-medium`: 4 of 12 columns on large screens, full width on medium (≤ 980px). Breakpoints: large ≤ 1280px, medium ≤ 980px, small ≤ 736px. Below 980px the top nav is replaced by a bar with a ☰ button that slides out the menu (built by `main.js`). Our own CSS adds phone rules: single-column fact boxes, smaller slide buttons, and stacked images.

### CSS animations (where each one is used)

| Animation | Where | How |
|---|---|---|
| `rise-in` | Banner text, formula cards as you scroll, opened note editor | `@keyframes` + `animation-delay` for a staggered entrance |
| `slide-from-right` / `slide-from-left` | Changing slides | JS adds the class matching the direction you moved |
| `spin` | Loading spinner, submit-button spinner | Rotating border |
| `pulse` | "Start Learning" button | Grows slightly twice to draw attention |
| `pop-in`, `check-bounce` | "✔ Saved" after saving a note | Checkmark bounces in |
| `shake` | Invalid form fields | Short side-to-side shake |
| `shrink-out` | Deleting a note | Card shrinks and fades before it is removed |
| `draw` | Thank-you checkmark | Animates `stroke-dashoffset` so the circle and tick draw themselves |
| Flip transition | Home topic cards | `transform: rotateY(180deg)` + `backface-visibility: hidden` |

**Reduced motion.** At the bottom of the file, `@media (prefers-reduced-motion: reduce)` makes all animations nearly instant for people who have turned on "reduce motion" in their operating system.

**Why `.js-reveal .reveal`?** Elements are only hidden (waiting to animate in) when JavaScript has added `js-reveal` to `<html>`. If the JS ever fails, the content is still visible.

---

## 5. JavaScript

### Two kinds of scripts

1. **Template scripts** (classic `<script>` tags): jQuery, `jquery.dropotron.min.js` (the hover drop-down), `breakpoints.min.js`, `util.js`, and `main.js`. Together they run the drop-down and the phone menu. We removed code from the template that wasn't used (`browser.min.js`, the Sass source files, and two unused helpers in `util.js`).
2. **Our ES modules** (`<script type="module">`). Each page loads exactly one *page module*, which `import`s the *feature modules* it needs.

### Feature modules: `assets/js/modules/`

| Module | Exports | Job |
|---|---|---|
| `config.js` | `WEB3FORMS_ACCESS_KEY`, `WEB3FORMS_ENDPOINT`, `DATA_URL`, `NOTES_KEY` | Settings in one place |
| `data.js` | `getTopics()`, `getTopic(id)`, `findFormula(id)`, `stepImage(id, n)` | Fetches the JSON **once** and caches the promise, so several calls don't download it again |
| `url.js` | `getParam`, `getNumberParam`, `setParams`, `buildUrl` | Read and write URL parameters |
| `notes-store.js` | `getAllNotes`, `getNote`, `saveNote`, `deleteNote`, `clearNotes` | The only code that touches `localStorage` |
| `note-editor.js` | `createNoteEditor(topic, formula)` | Builds the "My notes" box for one formula |
| `slideshow.js` | `createSlideshow(formula, startStep, onChange)` | Builds the step slideshow |
| `validation.js` | `validateForm`, `validateField`, `liveValidate` | Friendly form error messages |
| `ui.js` | `escapeHtml`, `showLoading`, `showError`, `revealOnScroll`, `formatDate` | Small shared display helpers |

### Page modules: `assets/js/pages/`

| Page module | Page | What it does |
|---|---|---|
| `home.js` | index | Fills the flip-card formula lists, picks the Formula of the Day (it changes daily), shows how many notes you have, flips cards |
| `topic.js` | algebra / geometry / calculus | Builds every formula card, slideshow, and note editor; builds the sidebar; jumps to `?formula=`, opens `&step=` |
| `feedback.js` | feedback | Pre-selects topic/formula from the URL, fills the formula list for the chosen topic, validates, sends to Web3Forms, redirects to thanks |
| `thanks.js` | thanks | Personalizes the message from `?name=&type=&topic=` |
| `notes.js` | notes | Lists, filters (`?topic=`), and deletes notes |

### How a topic page is built (step by step)

1. `topic.js` reads `document.body.dataset.topic` (for example `"algebra"`).
2. It shows a spinner with `showLoading()`, then `await getTopic('algebra')`, which uses `fetch()` behind the scenes.
3. For each formula it calls `renderFormula()`, which creates an `<article class="formula-card">` with a template literal. All text from the JSON goes through `escapeHtml()`.
4. It drops in a `createSlideshow(...)` and a `createNoteEditor(...)` for that formula.
5. `revealOnScroll(cards)` uses an `IntersectionObserver` to add `is-visible` when each card scrolls into view, which starts the CSS animation.
6. If the URL has `?formula=quadratic-formula&step=3`, that card scrolls into view with its slideshow on step 3.
7. If anything fails (for example, the page was opened with `file://`), `showError()` shows a helpful message instead of a blank page.

### How the slideshow works

`createSlideshow()` keeps one number, `current`, the index of the step on screen. `show(index)`:
- sets the `<img src>` to `images/steps/<id>-<n>.svg` and its `alt` text to the work shown;
- updates the caption, the "Step 2 of 5" counter (an `aria-live` region, so screen readers announce it), the progress bar, and the active dot;
- disables **Back** on the first step and **Next** on the last;
- restarts the slide-in animation in the direction you moved;
- preloads the next step's image so it appears instantly.

The Back/Next buttons, the dots, and the ← / → arrow keys all call `go(index)`. After each change, `onChange` runs `setParams({ formula, step })`, so the address bar always points at the exact slide on screen. Copy the URL and a classmate lands on the same step.

### Local storage (notes)

All notes are saved under one key, `complexMath.notes`, as a JSON object:

```json
{
  "pythagorean-theorem": {
    "text": "c is always across from the right angle",
    "topicId": "geometry",
    "topicName": "Geometry",
    "formulaName": "The Pythagorean Theorem",
    "updated": "2026-10-22T18:00:00.000Z"
  }
}
```

`notes-store.js` wraps every `localStorage` call in `try/catch`, because some browsers (private mode, or storage turned off) throw errors. Saving empty text deletes the note. The notes page, the home-page note count, and each formula's note editor all read from this same object. Notes stay in the browser where they were written; they don't sync between devices.

### URL parameters (every place they are used)

| URL | Read by | Effect |
|---|---|---|
| `algebra.html?formula=quadratic-formula` | `topic.js` | Scrolls to that formula |
| `algebra.html?formula=quadratic-formula&step=3` | `topic.js` | …and opens its slideshow on step 3 (updated live as you click Next/Back) |
| `feedback.html?topic=calculus&formula=chain-rule` | `feedback.js` | Pre-selects the topic and formula. Used by every "Still stuck? Ask us a question" link |
| `thanks.html?name=Ana&type=Question&topic=calculus` | `thanks.js` | "Thanks, Ana!", a reply matching the feedback type, and a "Back to Calculus" button |
| `notes.html?topic=geometry` | `notes.js` | Shows only geometry notes. Used by "My Geometry Notes" and the filter pills |

`buildUrl()` makes these links safely (it encodes spaces and special characters). Values read from the URL are always shown with `textContent`, never `innerHTML`, so a crafted link can't inject HTML.

### The feedback form, from click to email

1. The student fills in the form. After a field has been marked wrong once, it re-checks as they type. Leaving a filled-in field checks it right away.
2. On **Send Feedback**, `validateForm()` checks every field with the browser's built-in Constraint Validation API (`field.checkValidity()` and `field.validity.valueMissing`, `.typeMismatch`, `.tooShort`, `.patternMismatch`). It writes a custom message into each field's error `<p>`, sets `aria-invalid`, and moves focus to the first problem.
3. If everything is valid, `feedback.js` builds a JSON payload with the access key, a subject line, and readable field names, then `fetch()`es it to `https://api.web3forms.com/submit`. The button shows a spinner while it waits.
4. Web3Forms emails the message to `complex_math_feedback@proton.me`. Because we send `replyto`, you can reply straight to the student.
5. On success the browser goes to `thanks.html?name=…&type=…&topic=…`. On failure the student sees an error and can try again.

**Setup:** put your Web3Forms access key in `assets/js/modules/config.js`. Access keys are meant to be public, so it's fine for them to appear in front-end code.

---

## 6. Requirement checklist

| Requirement | Where it's met |
|---|---|
| Detailed, validated form | `feedback.html` (9 fields: name, email, 3 selects, 2 radio groups, textarea, checkbox) + `modules/validation.js` |
| Local storage for persistence | Notes: `modules/notes-store.js`, used by `note-editor.js`, `pages/notes.js`, `pages/home.js` |
| Fetching data from JSON / an API | `modules/data.js` fetches `data/formulas.json`; `pages/feedback.js` POSTs to the Web3Forms API |
| Drop-down menu | "Math Topics" in the nav (Algebra, Geometry, Calculus); the topic → formula drop-downs on the feedback form |
| CSS animation | Formula cards animate in, slide transitions, flip cards, spinners, save checkmark, form shake, drawn checkmark (see the table in section 4) |
| Responsive design | Template grid + breakpoints, phone slide-out menu, phone rules in `complex-math.css` |
| UX & accessibility | Skip link, focus outlines, labels/fieldsets, `aria-live` updates, keyboard-operable slideshow, reduced-motion support, inline confirmations, loading/error states |
| URL parameters | `?formula=`, `&step=`, `?topic=`, and thanks-page parameters (section 5) |
| Modules | 8 feature modules + 5 page modules using `import`/`export` |

---

## 7. Common tasks

- **Change a color:** edit the variables at the top of `complex-math.css`.
- **Change the nav:** edit the `<nav id="nav">` list in **every** HTML file (the pages are static, so the header and footer are repeated on each).
- **Swap a photo:** topic and page photos are Unsplash URLs in the HTML (and `"image"` in the JSON). Replace the URL and update the `alt` text.
- **Testing locally:** always use Live Server (or another local server). Opening files directly breaks `fetch()` and modules.
- **Clear your test notes:** Student Notes → Delete all notes, or in DevTools → Application → Local Storage, delete `complexMath.notes`.
