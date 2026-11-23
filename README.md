# Auto Solving – Website (front-end)

Plain HTML/CSS/JS, no build step. Open `index.html` directly or serve the folder:
`python3 -m http.server 8000`

## Where to put real data (search for "PLACEHOLDER" in index.html)
- Stats numbers: `data-target` attributes in the stats section
- Portfolio projects, testimonials
- Email / phone / WhatsApp number (`201000000000` appears in 2 links: contact section + floating button)
- Social media links in the footer (`href="#"`)
- Contact form is front-end only: connect it in `js/main.js` (submit handler) to a backend or a service like Formspree.

## Translations
Arabic is written in the markup; English lives in `data-en`, `data-en-placeholder`, `data-en-aria-label` attributes.
