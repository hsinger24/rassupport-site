# rassupport.org

Patient-facing guide to the supportive-care medicines for Rasonque (daraxonrasib):
the daily skin routine, mouth sores, nausea, diarrhea, and when to call the care team.

Content comes from the Northwell Health patient information guide
*Supportive Medications for Rasonque (daraxonrasib)*, v1.11 (9/8/26). No clinical
content is added beyond that guide.

## What this is

A static site. No accounts, no cookies, no analytics, no server. The daily checklist
is kept in the visitor's own browser (`localStorage`) and clears each day.

- `index.html` — the whole app; screens are sections switched by URL hash
  (`#home`, `#routine`, `#today`, `#symptoms`, `#mouth`, `#nausea`, `#diarrhea`, `#call`, `#caregivers`)
- The routine is six steps in the morning (antibiotic pill, spray, two steroid creams,
  moisturizer, sunscreen) and five in the evening (no sunscreen). The sky at the top of each
  screen follows the routine being shown: clear blue for morning, a soft indigo for evening
  ("Clinical Blue" palette; blue marks progress). The tab bar is a floating frosted capsule.
- `css/site.css`, `js/app.js` — styles and behaviour
- `img/` — product photos cropped from the printed guide
- `CNAME` — custom domain for GitHub Pages
- `404.html` — sends unknown paths back to `/`

## Not yet in this version

- Clinic and after-hours phone numbers (placeholders on the Call screen)
- Spanish (the button shows a notice; the translation will come from the team's translated guide)
- Videos (placeholders)
- Access codes and usage analytics — these belong to the IRB-approved study build

`js/app.js` has a `GATE` flag; set it to `true` to show the access-code screen.

## Hosting

GitHub Pages, branch `main`, root folder. Custom domain `rassupport.org` with
"Enforce HTTPS" on. The page carries `<meta name="robots" content="noindex">` until
the care team clears it for search engines; remove that line to go public.
