# rassupport.org

Patient-facing guide to the supportive-care medicines for Rasonque (daraxonrasib):
the daily skin routine, rash, mouth sores, nausea, diarrhea, and when to call the care team.

Content comes from the Northwell Health patient information guide
*Supportive Medications for Rasonque (daraxonrasib)*, v1.11 (9/8/26). No clinical
content is added beyond that guide.

## What this is

A static site. No accounts, no cookies, no analytics, no server. The daily checklist
is kept in the visitor's own browser (`localStorage`) and clears each day. So is the care
team's phone number if the patient saves one on the Call screen; it is never sent anywhere.

- `index.html` — the whole app; screens are sections switched by URL hash
  (`#home`, `#routine`, `#today`, `#symptoms`, `#rash`, `#mouth`, `#nausea`, `#diarrhea`, `#call`,
  `#caregivers`, `#video`, `#guide`)
- Home introduces the site on a visitor's first visit (Dr. King's wording), then greets them by
  time of day. Below the routine card: one row into Symptoms and a Learn card (how-to video,
  patient guide, caregivers). The globe button opens the patient guide.
- `#about` holds what the site is, the medical disclaimer and the privacy note; Home's footnote
  carries the short version (education only, follow your care team, 911 in an emergency) and links to it.
- The routine is six steps in the morning (antibiotic pill, spray, two steroid creams,
  moisturizer, sunscreen) and five in the evening (no sunscreen). The sky at the top of each
  screen follows the routine being shown: clear blue for morning, a soft indigo for evening
  ("Clinical Blue" palette; blue marks progress). Type is Figtree throughout, in sentence case.
- No tab bar. Home links to everything (routine, today's checklist, the other routine, symptoms,
  caregivers); inner screens have a back button; a terracotta "Call care team" button sits in the
  bottom-right corner of every screen except the routine walkthrough and the Call screen itself.
- `css/site.css`, `js/app.js` — styles and behaviour
- `img/` — product photos cropped from the printed guide
- `guide/` — the patient information guide as a PDF (English, v1.11); translations go here too
- `CNAME` — custom domain for GitHub Pages
- `404.html` — sends unknown paths back to `/`

## Not yet in this version

- Rash photos for mild, moderate and severe, and what to do for each (from the dermatology team;
  the Rash screen shows labelled placeholders)
- The how-to video (the Video screen shows "coming soon")
- The guide's six translations (add each PDF under `guide/` and a row on the Guide screen)
- The Call screen is deliberately institution-neutral: patients save their own care team's number
- Access codes and usage analytics — these belong to the IRB-approved study build

`js/app.js` has a `GATE` flag; set it to `true` to show the access-code screen.

## Hosting

GitHub Pages, branch `main`, root folder. Custom domain `rassupport.org` with
"Enforce HTTPS" on. The page carries `<meta name="robots" content="noindex">` until
the care team clears it for search engines; remove that line to go public.
