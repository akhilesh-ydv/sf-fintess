# Amit Kumar — Personal Trainer (static site)

Plain HTML / CSS / JS. No build step, no dependencies. Layout, sections, copy and
type are matched to the reference design.

```
index.html                 single-page site (all sections)
                           hero, about, 3 plans, testimonials,
                           Instagram grid, CTA, footer
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

The trainer is male and Indian in every shot, matching the Amit Kumar brand.

| File | Size | Subject | Pexels photo |
|---|---|---|---|
| `hero.jpg` | 1920×1080 | machine work, teal-lit gym | 13756380 |
| `about.jpg` | 900×1150 | trainer portrait, b&w | 17559312 |
| `plan-1.jpg` | 1280×860 | group class in a studio | 3775589 |
| `plan-2.jpg` | 1280×860 | trainer with a trainee, Indian gym | 16640766 |
| `plan-3.jpg` | 1280×860 | trainer and trainee, dumbbells | 12931805 |
| `cta.jpg` | 1920×900 | dumbbell curl, b&w | 1229356 |
| `social-1..6.jpg` | 700×700 | Instagram grid tiles | 13993016, 10795063, 13436331, 11800270, 14316237, 12600444 |
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

## Instagram section

The `#social` section is a **static mock** of an Instagram feed — six tiles in a
mosaic (one 2×2 feature), reel badges, and like/comment counts that appear on
hover. Nothing calls Instagram's API, so the numbers (128K followers, likes,
comments) are hand-written placeholders in `index.html`.

To make it show real posts, either:

- swap `assets/img/social-*.jpg` for screenshots of actual posts and point each
  `<a href="#">` at the post URL — simplest, no API, no rate limits; or
- use an embed widget (Elfsight, Behold, LightWidget) or Instagram's own
  oEmbed / Graph API, which needs a Facebook app and a business account.

The tile markup is plain `<a>` + `<img>`, so replacing the grid with a widget's
embed code is a drop-in change.

## Content to edit before going live

Placeholders in `index.html`:

- name **Amit Kumar** (title, meta description, brand, about heading, footer
  copyright) and the `AK` monogram in `assets/img/favicon.svg`
- phone `+91 98765 43210`, email `amit@akfitness.in`, handle `@amitkumar.fit`
- the `#` social links in the header and footer
- prices — ₹799 / ₹1,499 / ₹2,499 per session, written as `&#8377;` entities
- the two testimonials (Rahul Verma, Sneha Kulkarni)
