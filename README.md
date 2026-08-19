# Arjun Mehta — Personal Trainer (static site)

Plain HTML / CSS / JS. No build step, no dependencies. Layout, sections, copy and
type are matched to the reference design.

```
index.html                 single-page site (all sections)
assets/css/style.css       theme + layout
assets/js/main.js          sticky header, mobile menu, scroll reveal, active nav
assets/img/*.jpg           photos cropped out of the reference
assets/img/avatar-*.svg    testimonial avatars (generated)
assets/img/_placeholders/  the original generated SVG art, unused - safe to delete
.htaccess                  clean URLs (Apache)
```

## Run it

Double-click `index.html`, or serve the folder over HTTP (any of these):

```
npx serve .          # needs Node
php -S localhost:8000
python -m http.server 8000
```

Then open `http://localhost:8000/` — the URL shows no `.html` because
`index.html` is served as the folder root.

## Keeping `.html` out of URLs

- The homepage is already extensionless: `/`.
- **Adding more pages?** Two options:
  1. Folder per page — `about/index.html` → URL becomes `/about`. Works on
     every host, no config needed. Recommended.
  2. Keep `about.html` and let `.htaccess` rewrite it (Apache / cPanel /
     Hostinger). Netlify, Vercel and GitHub Pages do this automatically, so
     `.htaccess` can be deleted there.

## Images

Real photos from **Pexels** — free for commercial use, no attribution required
(crediting the photographer is still a nice thing to do). Downloaded at full
resolution, so they are sharp on retina screens.

The trainer is male and Indian in every shot, matching the Arjun Mehta brand.

| File | Size | Subject | Pexels photo |
|---|---|---|---|
| `hero.jpg` | 1920×1080 | machine work, teal-lit gym | 13756380 |
| `about.jpg` | 900×1150 | trainer portrait, b&w | 17559312 |
| `plan-1.jpg` | 1280×860 | gym floor, two lifters | 12709356 |
| `plan-2.jpg` | 1280×860 | trainer coaching a client | 2011383 |
| `plan-3.jpg` | 1280×860 | trainer close-up, studio light | 10305185 |
| `cta.jpg` | 1920×900 | dumbbell curl, b&w | 1229356 |
| `avatar-1/2.svg` | 200×200 | testimonial faces (generated) | — |

Any photo can be re-fetched or re-cropped from Pexels' CDN by changing the URL
params, e.g. face-aware crop:

```
https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?auto=compress&cs=tinysrgb&fit=crop&crop=faces&w=1280&h=860
```

Swap in the trainer's own photos with the same filenames and nothing else needs
to change. If the extension differs, update:

- `index.html` — the `<img src="...">` tags (about / plans / avatars)
- `assets/css/style.css` — `.hero-media` and `.cta-media` background images

The CSS dims and de-saturates the plan photos (`filter: grayscale(.35)
brightness(.85)`, full colour on hover) so they sit back behind the text. Lower
those values in `.plan-media img` if you want the photos brighter.

## Typography

| Role | Font | Used for |
|---|---|---|
| display | **Montserrat** 700/800 | headings, prices, brand, testimonial names |
| body | **Inter** 300/400/500 | copy, nav, buttons, labels |

Heavy uppercase Montserrat with wide letter-spacing is what matches the
reference's headline look. Offline the stack falls back to Segoe UI.

## Theme

All colors live in `:root` at the top of `style.css`:

```css
--bg:     #0e0e0e;   /* page */
--bg-3:   #1c1c1c;   /* plan cards */
--accent: #ff1f4b;   /* crimson */
```

## Content to edit before going live

Placeholders in `index.html`:

- name **Arjun Mehta** (title, meta description, brand, about heading, footer
  copyright) and the `AM` monogram in `assets/img/favicon.svg`
- phone `+91 98765 43210`, email `arjun@amfitness.in`, handle `@arjunmehta.fit`
- the `#` social links in the header and footer
- prices — ₹799 / ₹1,499 / ₹2,499 per session, written as `&#8377;` entities
- the two testimonials (Rahul Verma, Sneha Kulkarni)
