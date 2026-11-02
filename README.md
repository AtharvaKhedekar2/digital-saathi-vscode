# Digital Saathi

**Nirman Lab-I project · Semester 1**
Theme: *Digital Bharat for Inclusive Learning* · Problem statement #2: **Community Digital Literacy & Skills**
Built by Atharva — First Year Computer Engineering, Terna

---

## What it is
A simple, friendly web app that helps people who are new to phones and the internet —
elderly relatives, first-time smartphone users, and people looking for work — learn
basic digital skills. It has four parts:

1. **Lessons** — short, big-text lessons (UPI payments, spotting scams, email, searching safely), each with a **Listen** button that reads it aloud.
2. **Quiz** — a quick "check your level" test that suggests which lessons to study next.
3. **Ask Saathi** — type any question and get a simple answer.
4. **Three languages** — English, हिंदी, मराठी, switchable at the top.

## How to run it
1. Double-click **`index.html`** — it opens in any browser. That's it (no install, no server).
2. Everything works **offline**, including the Ask Saathi box (built-in answers).

## Turning on real AI (optional)
The Ask box can use a real AI model for *any* question:
1. Get a free key at <https://aistudio.google.com/apikey>.
2. In the app, open **⚙️ Settings**, paste the key, choose **AI** mode, and press **Save**.
3. The key is stored only on your own device.
> Keep **Offline** mode for the viva demo — it never needs wifi. Switch to AI only to answer a surprise question.

## How it's built
One file, so it's easy to carry and explain:
- **HTML** — the page structure (header, tabs, four sections).
- **CSS** — large text and high contrast, made for people who find screens hard.
- **JavaScript** — all content (lessons, quiz, answers) in three languages, plus the quiz logic, read-aloud (browser text-to-speech), and the optional AI call.

## What I built and why *(adapt this for your report / viva)*
> Many people around me can use a phone for calls but are afraid of UPI, email and online
> scams, which keeps them out of digital services and jobs. I built **Digital Saathi**, a
> web app that teaches these skills in simple steps, reads them aloud for people who can't
> read easily, and answers their questions in Marathi, Hindi or English. I kept it offline-first
> so it works on any phone without data. I tested it with **[name your one real user]** and
> changed **[one thing]** after watching them use it.

## Ideas to extend (make it more yours)
- Add a 5th lesson your user actually needs (video calls, Google Maps, online forms).
- Add more questions to the offline answer bank.
- Add a "font size" button to make the text even bigger.
- Track which lessons a user finished.

## For the marks
- **Term work (25):** keep a weekly logbook with dated screenshots; show a running version at each monthly review.
- **Viva (25):** rehearse a 5-minute walkthrough — problem → your user → live demo → what you learned. Know how the AI call works. Have the offline demo ready as backup.
