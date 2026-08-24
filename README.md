# Amit Kumar — Personal Trainer (static site)

Plain HTML / CSS / JS. No build step, no dependencies. Layout, sections, copy and
type are matched to the reference design.

```
index.html                 single page: hero, about, programs, gallery,
                           feature clip, Google reviews, reels, CTA, footer
assets/css/style.css       theme + layout
assets/css/motion.css      animation layer (springs, reveals, marquee)
assets/js/main.js          sticky header, mobile menu, scroll reveal, active nav
assets/js/motion.js        motion behaviour, opt-out on reduced motion
assets/js/slider.js        arrows + dots over native scroll-snap
assets/img/*.jpg           the trainer's photos + video posters
assets/video/*.mp4         the trainer's clips
assets/img/_originals/     untouched WhatsApp files, excluded from the deploy
.htaccess                  clean URLs (Apache only, ignored on Vercel)
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

## Hosting

Domain: **amitkumarfitness.in**

Host on **Cloudflare Pages**, not Vercel. Vercel's free Hobby plan forbids
commercial use, and their fair-use terms count "being paid to build the site"
as commercial — a client site does not belong there. Cloudflare Pages allows
commercial use on the free plan and does not meter bandwidth, which matters
here because of the 6 MB feature clip.

- `_headers` carries the cache rules on Cloudflare.
- `vercel.json` is kept for reference but is ignored by Cloudflare.
- Clean URLs work by default on Pages, so `.htaccess` stays unused too.
- Build settings: **no build command**, output directory `/` (this is plain
  HTML — there is nothing to compile).

`assets/img/_originals/` is skipped by `.vercelignore`, which Cloudflare does
not read, so those source files get uploaded there. Nothing links to them and
they are never served, so it costs storage and not speed.

## Keeping `.html` out of URLs

- The homepage is already extensionless: `/`.
- **Adding more pages?** Two options:
  1. Folder per page — `about/index.html` → URL becomes `/about`. Works on
     every host, no config needed. Recommended.
  2. Keep `about.html` and let `.htaccess` rewrite it (Apache / cPanel /
     Hostinger). Netlify, Vercel and GitHub Pages do this automatically, so
     `.htaccess` can be deleted there.

## Photos and video

Everything is the trainer's own material — nine phone photos and four clips.
The untouched files sit in `assets/img/_originals/` and are excluded from the
deploy by `.vercelignore`; the site uses cropped derivatives generated from them.

| File | Size | From |
|---|---|---|
| `trainer.jpg` | 1000×1500 | portrait, gym with the flag |
| `about.jpg` | 900×1200 | same shoot, tighter crop |
| `plan-1/2/3.jpg` | 900×1200 | cable and back work at the red wall |
| `shot-1…6.jpg` | 800×1200 | gallery rail |
| `cta.jpg` | 1920×900 | frame from the deadlift clip |
| `poster-feature.jpg` | 1280×720 | poster for `feature.mp4` |
| `poster-clip-1/2.jpg` | 720×1100 | posters for the portrait clips |

| Clip | Size | Used for |
|---|---|---|
| `clip-2.mp4` | 0.6 MB, 720×1280 | hero card, loops muted |
| `clip-1.mp4` | 0.4 MB, 720×1280 | first reels tile |
| `feature.mp4` | 6 MB, 1280×720 | feature band, `preload="none"` — downloads only on play |

Because the source photos are vertical, the layout is built around portrait
frames rather than cropping them into letterboxes.

### Replacing a photo

Drop a new file over the same name and bump the `?v=` number on its `<img>` tag
(images are cached for a year, so the query string is what forces a refresh).
Crops were produced with a script that reads EXIF orientation first — worth
keeping in mind if you regenerate them, since ignoring orientation flips some
phone photos on their side.

### Videos

Clips pause when they scroll off screen and resume when they come back, so a
phone is not decoding video it cannot see. Anything heavy is `preload="none"`.

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

The `#social` section shows three real reels from
**instagram.com/flowline.bosss** in a mosaic — one 2×2 feature tile plus two
singles — each linking to its own post.

### How the thumbnails got here

Instagram's profile listing is behind a login wall: `curl` on the profile, its
`/embed/`, and `?__a=1` all return a login shell with zero post data, and
`web_profile_info` rate-limits. What *does* work is the official **per-post
embed** — `instagram.com/p/<shortcode>/embed/captioned/` — rendered in a real
browser, since it builds the post client-side with JavaScript.

So the thumbnails in `reel-*.jpg` and `ig-avatar.jpg` were pulled by loading
those embeds in headless Chrome and reading the rendered image URLs. They are
now served from this site, which keeps the page fast but means **they do not
update when new reels are posted**.

### Adding or replacing a reel

1. Copy the post link from Instagram (⋯ → Copy link).
2. Save its thumbnail as `assets/img/reel-N.jpg`.
3. Copy an existing `<a class="ig-tile is-reel">` block in `index.html`, point
   `href` at the post and `src` at the new image.

Add `is-feature` to whichever tile should be the big one. The grid fills
cleanly at 3 tiles (feature + 2) or 6 (feature + 5).

For a feed that updates itself, use an embed widget (Behold, Elfsight,
LightWidget) or the Instagram Graph API — the latter needs a Business/Creator
account linked to a Facebook Page plus a Meta developer app.

### No invented numbers

There are deliberately no follower or like counts. The account currently has 20
posts and 32 followers, so the placeholder stats that were here first (128K
followers, 642 posts) would have misrepresented it on a live page. Each tile
shows a "Watch on Instagram" cue instead.

### Grid layout note

Tile height comes from `grid-auto-rows`, not `aspect-ratio`, and the images are
absolutely positioned. Sizing a tile by `aspect-ratio` while its image is sized
by `height:100%` is circular, and the tiles collapse to a fraction of their
cell. Keep it this way when editing.

## Motion layer

`assets/css/motion.css` + `assets/js/motion.js` add the animation pass. Both are
**additive**: `motion.js` adds a `js-motion` class to `<html>`, and every effect
is scoped under it. With JS off, or when the visitor's OS asks for reduced
motion, the site renders exactly as the base stylesheet describes — nothing is
hidden waiting for a script that never runs.

| Effect | How it works |
|---|---|
| Scroll progress bar | CSS `animation-timeline: scroll()` where supported, rAF fallback otherwise |
| Hero parallax | CSS `animation-timeline: view()`, rAF fallback |
| Headline reveals | Words wrapped in overflow-hidden boxes, rising with a 65 ms stagger |
| Magnetic buttons | Cursor offset fed into a spring, applied as `--tx`/`--ty` |
| Card + tile tilt | Pointer position → spring → `rotateX`/`rotateY` and a lift |
| Pointer spotlight | `--mx`/`--my` drive a radial gradient inside plan cards |
| Nav indicator | One underline that springs between links, follows the active section |
| Marquee band | Duplicated track translated -50%, paused on hover |

The spring is ~20 lines: `v = (v + (target - x) * k) * damping`. One
`requestAnimationFrame` loop drives every instance and stops itself once all
springs settle, so idle pages cost nothing.

Pointer effects (magnetic, tilt, nav indicator) are gated behind
`(pointer: fine)` — touch screens get the flat, fast version. Tilt is also
disabled under 860 px in CSS.

### Editing notes

- Add `data-split` to any heading to give it the staggered word reveal.
- Tilt strength: the two `addTilt(el, maxDeg, lift)` calls at the bottom of
  `motion.js`.
- To drop the whole layer, remove the two `<link>`/`<script>` tags — the site
  still works.

## Slider

`assets/js/slider.js` drives both the gallery rail and the reviews strip. It is
an enhancement layer, not a carousel library: the track is a native CSS
scroll-snap strip, so it already swipes on a phone and drags with a mouse
without any JavaScript. The script only adds arrows, dots and keyboard support.

Mark up a new one like this:

```html
<div class="slider" data-slider>
  <div class="my-track" data-slider-track> …items… </div>
  <div class="slider-ui">
    <button data-slider-prev class="slider-btn">…</button>
    <div data-slider-dots class="slider-dots"></div>
    <button data-slider-next class="slider-btn">…</button>
  </div>
</div>
```

Behaviour worth knowing:

- If the track has nothing to scroll, the slider adds `is-static` to itself and
  the controls hide. That is why the reviews controls appear on phones (the
  cards become a swipe strip) and disappear on desktop (they are a 3-up grid).
- Dots rebuild on resize and after `load`, since images finishing late change
  the scroll width.
- Arrow keys move the track once it has focus.
- `prefers-reduced-motion` switches the glide to an instant jump.

## 360° spin — what it would take

Not built, because the material for it does not exist yet. A 360 viewer needs a
**turntable sequence**: 24–36 frames taken at even angles around the subject,
camera height and distance fixed. The nine supplied photos are different
exercises from different days, and the clips are static shots — sampling
`clip-1` at 2s, 14s, 28s and 40s gives four near-identical frames, so there is
no rotation to scrub through.

To shoot one: the trainer stands still, someone walks a full slow circle around
him filming for 20–30 seconds, phone held at chest height, even pace, plain
background. Send that clip and the frames can be extracted and wired to a
drag-to-rotate viewer — the same technique product sites use.

## Google reviews

The `#reviews` section has a rating summary, three review cards, and two links
out to Google. **The three cards are samples and the rating is a placeholder** —
both must be replaced with real data before this is shown to clients. Fake
reviews violate Google's policies and can get a Business Profile suspended.

### 1. You need a Google Business Profile first

Reviews live on Google, not on this site — the buttons only send people there.
No profile means there is nowhere to leave a review.

1. Go to **google.com/business** and sign in with the business Gmail.
2. Add the business: name, category (`Personal trainer` or `Gym`), phone, and
   this website's URL. A trainer without a shopfront should choose
   **service-area business** rather than a public address.
3. Verify — usually a short video call or video upload, sometimes a postcard.
   Nothing is publicly visible until verification passes.

### 2. Get the review link

Once verified, either:

- **Business Profile → Ask for reviews** — gives a short link shaped like
  `https://g.page/r/XXXXXXXXXXXX/review`, or
- Look up the **Place ID** at
  `developers.google.com/maps/documentation/places/web-service/place-id`,
  then use `https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID`

### 3. Put the link in the page

Search `index.html` for **GOOGLE_LINK** — three spots:

| Marker | What it is |
|---|---|
| GOOGLE_LINK 1 | "Write a review" button (appears twice — button and footer line) |
| GOOGLE_LINK 2 | "Read all reviews" → paste the Google Maps listing URL |

Then update `5.0` and the star count in `.rating-card` to the real numbers.

### 4. What the client sees when they click

They land on Google's review box, signed into their own Google account (Google
requires one — nobody can review anonymously), pick a star rating, type the
review, optionally attach photos, and press Post. It shows on the listing within
a few minutes.

### Keeping reviews in sync

| Approach | Effort | Cost | Notes |
|---|---|---|---|
| **Manual** (current) | Copy real reviews into the cards | Free | Full design control, but you update it yourself |
| **Widget** — Elfsight, Trustindex, EmbedSocial, Featurable | Paste an embed snippet | Free tier with their badge, roughly $5–10/mo without | Syncs new reviews automatically |
| **Google Places API** | Needs a key, a billing account and a serverless proxy so the key stays private | Free tier, then per-call | Official, but returns only ~5 reviews |

The cards are plain HTML — copy an `<article class="review">` block to add one,
delete a block to remove one. The grid handles 1, 2, 3 or more.

## Content to edit before going live

Placeholders in `index.html`:

- name **Amit Kumar** (title, meta description, brand, about heading, footer
  copyright) and the `AK` monogram in `assets/img/favicon.svg`
- phone `+91 98765 43210`, email `amit@amitkumarfitness.in`, handle `@flowline.bosss`
- the `#` social links in the header and footer
- prices — ₹799 / ₹1,499 / ₹2,499 per session, written as `&#8377;` entities
- the three Google review cards + the 5.0 rating (see "Google reviews" above)
