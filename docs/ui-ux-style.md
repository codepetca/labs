# UI/UX Style Guide

CodePet Labs should feel like a small builder studio, not a school club, SaaS
landing page, or corporate program.

## Direction

- Mobile-first: design the 360px screen first.
- Minimal: every section needs one job.
- Low text: short headings, no default subtitles, sparse labels.
- Calm: quiet surfaces, soft borders, clear hierarchy.
- Slightly playful: small accents are fine; decoration should be rare.

## Page Rules

- Put the real page content above the fold on mobile.
- Use one primary action per page when possible.
- Keep paragraphs under two lines on mobile.
- Use chips and status labels only when they help an action or admin workflow.
- Cards are for repeated items, project summaries, placeholders, and callouts.
- Do not nest cards inside cards.
- Keep border radius at `8px` or less.
- Use full-width sections instead of floating page cards.

## Copy Rules

- Use literal, concrete language.
- Avoid corporate phrases like "unlock potential" or "reimagine education."
- Avoid school-club language like "members," "meetings," or "sign-ups."
- Keep safety and legal boundaries in docs, not public-page warning chips.
- Headings should usually be 1-4 words.
- Button labels should be verbs or clear destinations.

## Visual System

- Base layout: max width `5xl`, mobile padding `px-4`, desktop padding `sm:px-6`.
- Type: Geist Sans for UI, Geist Mono only for IDs, initials, and step numbers.
- Palette: neutral base with restrained teal, violet, and warm accents.
- Avoid one-color themes, heavy gradients, decorative blobs, and stock imagery.
- Tap targets should be at least `44px` tall for primary actions.
- Use simple product-state images over long explanation. Images should look like
  prototype screens, boards, cards, charts, or flows.
- Keep image files local in `public/images/` and reference them from content when
  a student can update them by PR.

## AI Change Checklist

Before committing AI-assisted UI work:

- Remove text that does not help the user choose or understand.
- Check the page at mobile width first.
- Verify no UI element overlaps or resizes awkwardly.
- Keep all content static and PR-editable.
- Preserve project boundaries without adding extra public-site warning labels.
- Run `pnpm lint` and `pnpm build`.
