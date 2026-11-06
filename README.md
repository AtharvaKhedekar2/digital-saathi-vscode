# Digital Saathi

**Nirman Lab-I project · Semester 1**
Theme: *Digital Bharat for Inclusive Learning* · Problem statement #2: **Community Digital Literacy & Skills**
Built by Atharva — First Year Computer Engineering, Terna

---

## What it is
The website of Digital Saathi — a free, student-led community initiative that helps people
who are new to phones and the internet (elderly relatives, first-time smartphone users,
people looking for work) learn basic digital skills.

It is one long page with a menu on the left (or a **Menu** button on phones):
**About · Services · How it works · Learn · Impact · Get involved · Contact**

The **Learn** section is the interactive part:
1. **Lessons** — six short, big-text lessons (smartphone basics, UPI payments, spotting scams, bills & government services, email, searching safely), each with a **Listen** button that reads it aloud.
2. **Quiz** — a quick "check your level" test, one question at a time, that suggests which lessons to study next.
3. **Ask Saathi** — type any question and get a simple answer.
4. **Pocket safety card** — five golden rules that can be printed.

Every word is in **three languages** — English, हिंदी, मराठी — and a **text size** button (A / A+ / A++) makes everything bigger for anyone who finds the screen hard to read.

## How to run it
1. Double-click **`index.html`** — it opens in any browser. That's it (no install, no server).
2. Everything works **offline**, including the Ask Saathi box (built-in answers).
3. With internet, the page downloads nicer fonts from Google Fonts. Without internet it uses the computer's own fonts and works exactly the same.

## Before you share the site
Open `index.html` and fill in the **`CONTACT`** block near the top of the `<script>`
(WhatsApp number, email, and where/when the help desk meets). Until then the Contact
section honestly shows "Coming soon", and the contact form shows the visitor's finished
message so they can copy it. Once a WhatsApp number is filled in, the form opens WhatsApp
with the message already typed.

## Turning on real AI (optional)
The Ask box can use a real AI model for *any* question:
1. Get a free key at <https://aistudio.google.com/apikey>.
2. In the app, open **⚙️ Settings**, paste the key, choose **AI** mode, and press **Save**.
3. The key is stored only on your own device.
> Keep **Offline** mode for the viva demo — it never needs wifi. Switch to AI only to answer a surprise question.

The **Model** box is set to `gemini-flash-latest`, Google's name for its newest Flash model.
(The old `gemini-1.5-flash` was switched off by Google in 2025, so it no longer answers.)

## How it's built
One file, so it's easy to carry and explain:
- **HTML** — the page structure: a sidebar menu, and one `<section>` for each part of the site.
- **CSS** — the design. All colours and fonts are set once at the top ("design tokens"), so the look stays consistent. Large text and high contrast, made for people who find screens hard.
- **JavaScript** — all content (lessons, quiz, answers and every label) in three languages, plus the quiz logic, read-aloud (browser text-to-speech), the contact form and the optional AI call.
- The numbers in the Impact section (lessons, quiz questions, languages) are **counted from the content**, so they are always true. There are no made-up statistics or testimonials.

## What I built and why *(adapt this for your report / viva)*
> Many people around me can use a phone for calls but are afraid of UPI, email and online
> scams, which keeps them out of digital services and jobs. I built **Digital Saathi**, a
> web app that teaches these skills in simple steps, reads them aloud for people who can't
> read easily, and answers their questions in Marathi, Hindi or English. I kept it offline-first
> so it works on any phone without data. I tested it with **[name your one real user]** and
> changed **[one thing]** after watching them use it.

## Ideas to extend (make it more yours)
- Add a 7th lesson your user actually needs (Google Maps, online forms, train tickets).
- Add more questions to the offline answer bank.
- Track which lessons a user finished.
- After your first workshop, add real numbers (people taught, questions answered) to the Impact section.
- Add photos from your own workshops (with people's permission) to the hero.

## For the marks
- **Term work (25):** keep a weekly logbook with dated screenshots; show a running version at each monthly review.
- **Viva (25):** rehearse a 5-minute walkthrough — problem → your user → live demo → what you learned. Know how the AI call works. Have the offline demo ready as backup.
