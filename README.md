# Complex Math

Step-by-step guides to the algebra, geometry, and calculus formulas that high school and college students use most.
WDD 231 team project by Agustina Echegaray and David Lunceford.

## Running the site

The pages load their content with `fetch()` and use JavaScript modules. Browsers block both when a page is opened straight from disk (`file://`), so run the site through a local server:

- **VS Code:** install the *Live Server* extension, right-click `index.html`, and choose **Open with Live Server**.
- **Or, from a terminal in this folder:** `npx serve` (or `python -m http.server`), then open the address it prints.

## Before you publish

1. Get a free Web3Forms access key at <https://web3forms.com> using `complex_math_feedback@proton.me`. The key is emailed to that inbox.
2. Paste it into `WEB3FORMS_ACCESS_KEY` in `assets/js/modules/config.js`.

Until you add the key, the feedback form still checks every field, but it shows "not connected yet" instead of sending.

## Learn how it works

See [docs/HOW-IT-WORKS.md](docs/HOW-IT-WORKS.md) for a walkthrough of the HTML, CSS, and JavaScript, plus a checklist that maps each project requirement to the code that meets it.

## Credits

- Layout: [ZeroFour by HTML5 UP](https://html5up.net) (CCA 3.0, credit kept in the footer)
- Photos: [Unsplash](https://unsplash.com)
- Icons: [Font Awesome](https://fontawesome.com)
