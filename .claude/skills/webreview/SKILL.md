---
name: webreview
description: Publish an approved client review onto annaprudential.com/reviews/ — adds the review card, matching Review schema, bumps the cache-buster, commits and pushes. Use this whenever Annabel wants a review put live, mentions publishing/approving a review or testimonial, says "push out that review", "add this review to the site", "publish Eugenie's review", or pastes review text she wants on the reviews page. Also use it when she asks what reviews are waiting, or wants a review taken down.
---

# Publish a client review

Annabel collects reviews through the form at `/reviews/`. They land in a Google
Sheet, never auto-publish, and go live only when she says so. This skill is that
last step.

Repo: `C:\Users\User\Desktop\ANTIGRAVITY\insurance-landing-page`
Page: `reviews/index.html`

## The one rule that matters

**Never publish a review that a real person did not write and consent to.**

Reviews are the one part of this site where invention is not a style mistake but
a fabricated endorsement on a licensed financial adviser's domain — and `Review`
schema describing a review that doesn't exist is a structured-data violation
that earns a manual penalty. So:

- Publish only what came from the form or what Annabel supplies directly.
- `consent_publish` must be `Yes`. If it isn't, tell her and stop — she can ask
  the client and come back.
- If anything is ambiguous (which review? is this the final wording?), ask.
  One clarifying question is far cheaper than retracting something.

## Getting the review text

Two paths — take the cheap one first.

**She gives you the text.** Most common, and needs no browser at all. Confirm the
reviewer's name, rating, and that they consented, then go straight to publishing.

**She says "check the sheet" or doesn't have it handy.** Open the Google Sheet in
the browser, `Leads` tab, and look for rows where `source` is `Website Review`:

- Sheet: `https://docs.google.com/spreadsheets/d/1zbUhCWieeplhl61My7AjuIopR59waRhcP7a6RZ86RLQ/edit`
- Relevant columns: `name`, `rating`, `review`, `review_context`,
  `consent_publish`, `spam_suspect`
- Set the sheet zoom to 50% first — the review columns sit past the frozen
  panes and won't scroll into view at 100%.
- Click a cell and read the **formula bar** for full text; cells truncate.
- `spam_suspect = Yes` means a hidden anti-bot field was filled. Usually a bot,
  occasionally a real person whose browser autofilled it. Judge the content and
  flag it to her rather than publishing or binning it silently.

Reading Sheets costs a lot of screenshots. If she's already told you the text,
don't open the browser at all.

### Careful with the Name Box

The cell reference box sits directly above column A and is easy to miss by a few
pixels — a mis-click lands in the header row instead, and typing then overwrites
a column header. That matters here: the webhook matches columns by header name,
so clobbering `Timestamp` silently breaks lead capture. Screenshot before typing
into it, and if a header does get overwritten, `Ctrl+Z` immediately.

## Publishing

### 1. Add the card

In `reviews/index.html`, inside `<div class="review-grid">`. Newest first.

```html
<div class="review-card">
  <div class="review-stars" aria-label="5 out of 5">★★★★★</div>
  <p class="review-text">Their words, verbatim.</p>
  <div class="review-meta">
    <strong>Firstname L.</strong>
    Client since 2024 · Critical illness &amp; medical
  </div>
</div>
```

- Stars: one ★ per rating point, and set `aria-label` to match.
- Attribution: first name + last initial, which is what the consent checkbox
  actually asks permission for. Never the full surname or the email.
- The meta second line is optional — use `review_context` if she supplied it,
  otherwise `Submitted via annaprudential.com`.

**Keep the wording verbatim.** Clients write like people, and lightly wonky
grammar reads as real in a way polished copy doesn't. If something genuinely
reads as a typo, ask before changing it — it's their words, not ours.

### 2. Add matching schema

A `Review` node in the `@graph` in the same file, one per visible card:

```json
{
  "@type": "Review",
  "@id": "https://annaprudential.com/reviews/#review-firstname-l",
  "itemReviewed": { "@id": "https://annaprudential.com/#agency" },
  "author": { "@type": "Person", "name": "Firstname L." },
  "reviewRating": { "@type": "Rating", "ratingValue": 5, "bestRating": 5, "worstRating": 1 },
  "reviewBody": "Their words, verbatim — identical to the card.",
  "datePublished": "YYYY-MM-DD",
  "publisher": { "@id": "https://annaprudential.com/#agency" }
}
```

`reviewBody` and the card text must match exactly. Drift between schema and
visible content is what search engines penalise.

**No `AggregateRating` until there are several genuine reviews**, and if you add
it, `reviewCount` must equal the number actually on the page. Note that Google
does not show stars for self-serving reviews (a business reviewing itself on its
own site) regardless — those come from a Google Business Profile. The schema is
here because answer engines read it even when Search shows no stars.

### 3. Housekeeping

- If the page still carries the "not many here yet" note and reviews are
  accumulating, offer to drop it.
- Bump the cache-buster on `reviews/index.html` only — `css/site.css?v=N` and
  `js/main.js?v=N` to the next number. Other pages don't need it for a
  content-only change.
- Update `dateModified` in the page's `WebPage` node to today.

### 4. Verify, then ship

Validate the JSON-LD before committing — a broken `@graph` silently kills every
structured-data signal on the page:

```bash
python -c "
import re,json
s=open('reviews/index.html',encoding='utf-8').read()
for m in re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>',s,re.S): json.loads(m)
print('schema OK')
"
```

Then check the card count matches the `Review` node count, and that each
`reviewBody` matches its card text. Commit and push — Vercel deploys from
`main` automatically.

## Taking a review down

Remove the card and its `Review` node together — leaving orphaned schema behind
is exactly the mismatch that causes penalties. Bump the cache-buster, push, and
note in the sheet why it was pulled so it doesn't get re-published later.
