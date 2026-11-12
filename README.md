# Digital Saathi

**Nirman Lab-I project · Semester 1**
Theme: *Digital Bharat for Inclusive Learning* · Problem statement #2: **Community Digital Literacy & Skills**
Built by Atharva — First Year Computer Engineering, Terna

---

## What it is
The website of Digital Saathi — a free, student-led community initiative where **senior citizens,
housewives and children** learn everyday digital skills at their own pace. The site is written
from the learner's side: what you will learn, and what you will be able to do in daily life
(video-call family, search Google, learn on YouTube, avoid scams, pay with UPI, use government
services and senior citizen benefits, and use AI tools like ChatGPT, Gemini and Copilot).

It is one long page with a menu on the left (or a **Menu** button on phones):
**About · Your Saathi Journey · Learn · Certificate · Outcomes · Contact**, plus a separate **Quizzes** page (menu → Quizzes)

The **Learn** section is the interactive part:
1. **Learning path** — six steps, each with five skills and a **Listen** button that reads it aloud:
   1. Smartphone basics · 2. Google, Gmail & YouTube · 3. Communication with family & friends ·
   4. Stay safe online · 5. Digital payments & government services · 6. AI tools & family digital safety.
   Each step's points come word for word from the approved "Steps Digital Saathi" document (6, 6, 6, 8, 8 and 6 points).
2. **Quizzes page** — a **Pre-Assessment** (before learning, no pass or fail: one big **Start Pre-Assessment Quiz** button opens the team's Google Form in a new tab) and a **Post-Assessment** that works the same way: one big **Start Post-Assessment Quiz** button opens the team's Post-Assessment Google Form (20 everyday questions grouped by the six learning steps, 4 answer choices each, 8 of them re-testing Pre-Assessment concepts so learning can be compared; 70 % = 14 of 20 qualifies for the certificate). The form links are in `PRE_FORM` and `POST_FORM` in `assets/js/main.js`; the "14 of 20" shown on the page is counted from `POST_QUIZ`, the same questions as the form. Both quizzes' answers go to the team through Google Forms. The Digital Saathi team checks results and sends certificates later.
3. **Pocket safety card** — five golden rules that can be printed.

Every word is in **three languages** — English, हिंदी, मराठी — and a **text size** button (A / A+ / A++) makes everything bigger for anyone who finds the screen hard to read.

**Light and dark mode:** the site follows the phone's own setting until the visitor chooses. The switch is the **Light / Dark** buttons in the sidebar or the Menu, or the sun/moon button in the top bar on phones. The choice is remembered on that device, colours fade smoothly when it changes, and printing always uses light colours.

**Static website:** no sign-up, no login, and no connection to any server or AI service. The only things that go online are the two quiz buttons, which open the team's Google Forms in a new tab.

## How to run it
1. Double-click **`index.html`** — it opens in any browser. That's it (no install, no server).
2. Everything works **offline**. Only the two quizzes and the Google Classroom links need internet.
3. With internet, the page downloads nicer fonts from Google Fonts. Without internet it uses the computer's own fonts and works exactly the same.

## Before you share the site
Open `assets/js/main.js` and fill in the **`CONTACT`** block near the top
(WhatsApp number and email). Until then the Contact section honestly shows "Coming soon".
The Contact section also has a "Coming to a virtual workshop?" card marked **Coming soon**
(what to keep ready); it is plain information, with nothing to fill in.

## Pre-Assessment on Google Forms
The Pre-Assessment Quiz is a Google Form. `integrations/google-forms/pre-assessment-form.gs` creates the form
(same 11 questions as the site, one page per learning module, automatic scoring), and
`integrations/google-forms/GOOGLE-FORM-GUIDE.md` explains every step. Paste the form's share link into **`PRE_FORM`** in
`assets/js/main.js` (just below `CONTACT`). The Pre-Assessment section is a short card with one big
**Start Pre-Assessment Quiz** button that opens the form in a new tab, in the visitor's language. The form is
not shown inside the page. While `PRE_FORM` is empty, the button is greyed out and says "Coming soon".

## Project structure
```
index.html                  the website's entry point (open this)
assets/
  css/styles.css            all styling (design tokens, light/dark, layout)
  js/main.js                content in 3 languages + logic (quiz links, read-aloud, theme)
content/
  lessons/                  story lessons (english / hindi / marathi, Steps 00-06)
integrations/
  google-forms/             Apps Script + guides that build the Pre/Post-Assessment forms
  google-classroom/         Apps Script + guides that set up the Google Classroom classes
streamlit-app/              the optional Python/Streamlit version (app.py, requirements, .streamlit)
docs/
  streamlit-app.md          how to run the Python version + viva notes
  reference/                approved source document ("Steps Digital Saathi.pdf")
```

## How it's built
Three plain files (no build step, no server), so it's easy to carry and explain:
- **HTML** (`index.html`) — the page structure: a sidebar menu, and one `<section>` for each part of the site.
- **CSS** (`assets/css/styles.css`) — the design. All colours and fonts are set once at the top ("design tokens"), so the look stays consistent. Dark mode is a second set of the same tokens, switched by `data-theme="dark"` on the page. Large text and high contrast, made for people who find screens hard.
- **JavaScript** (`assets/js/main.js`) — all content (lessons, quiz, answers and every label) in three languages, plus the quiz logic, read-aloud (browser text-to-speech), the offline Ask box and the light/dark switch.
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
- **Viva (25):** rehearse a 5-minute walkthrough — problem → your user → live demo → what you learned. Be ready to explain how the light/dark switch works (design tokens + `data-theme`).
