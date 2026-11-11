# Pre-Assessment Quiz on Google Forms — step-by-step

This folder builds the **Digital Saathi Pre-Assessment Quiz** as a Google Form and connects it to the website.

- `pre-assessment-form.gs`: a script that creates the whole form for you (questions, answer key, points, feedback).
- The questions are the 11 questions in `QUIZ` in `index.html`, grouped by the **six approved learning modules**.
  They are written in short, everyday words, but they are **deliberately harder than common sense**: each one asks about
  one specific skill that the learning steps teach (for example “which button starts Emergency SOS?” or “which number
  reports online money fraud?”), with wrong choices that sound sensible. A learner who has not learned the steps yet
  should find many of them hard. That is the point of a pre-test: the Post-Assessment later shows the improvement.
  The Post-Assessment form (`post-assessment-form.gs`, guide `POST-FORM-GUIDE.md`) asks 14 different, scenario-style
  questions on the same learning steps, so learners can compare their two percentages, not question by question.

What the form looks like:

| Page | What is on it | Scored? |
|---|---|---|
| 1 · Welcome | First name (optional) · "I am…" (Senior citizen / Homemaker / Child or student 8–14 / Other) · "How comfortable are you with a smartphone?" (1–5) | No |
| 2 · Step 1 Smartphone Basics | 2 questions | 1 point each |
| 3 · Step 2 Google, Gmail & YouTube | 2 questions | |
| 4 · Step 3 Communication with family & friends | 2 questions | |
| 5 · Step 4 Stay safe online | 2 questions | |
| 6 · Step 5 Digital payments & government services | 2 questions | |
| 7 · Step 6 AI tools & family digital safety | 1 question | |

**Total: 11 points.** Every question has 3 real options **plus a 4th choice, “I am not sure”** (it always counts as wrong,
and it is better than guessing). Exactly one option is right, and the question is required. After a wrong answer, the
learner sees the right answer and the step where they will learn it.

**What score to expect.** A learner who only guesses among 3 options gets about 3.7 of 11 on average, and reaches 6 or
more only about 12 % of the time (about 3 % if they choose “I am not sure” when unsure). Real learners will score
differently, so after the first workshop check the Sheet of responses (Part B, step 5): if many people score 6 or more,
tell Claude which questions were easy and they will be made harder; if almost everyone scores 0–1, a few can be
made easier.

---

## Part A: Create the form (about 5 minutes)

1. On a computer, sign in to the Google account that should own the form (for example the team Gmail).
2. Open **https://script.google.com** and click **New project**.
3. Delete the few lines that are already there. Open `pre-assessment-form.gs` from this folder, copy **everything**
   and paste it in. Click 💾 **Save** and name the project `Digital Saathi form`.
4. In the toolbar, open the function menu (next to **Debug**) and choose which form to make:
   - `createEnglishForm`: English
   - `createHindiForm`: Hindi
   - `createMarathiForm`: Marathi
   - `createAllLanguages`: all three at once
5. Click ▶ **Run**. The first time, Google asks for permission:
   **Review permissions** → choose your account → if you see *"Google hasn't verified this app"*, click
   **Advanced** → **Go to Digital Saathi form (unsafe)** → **Allow**.
   (This warning appears for every personal script. The script only creates forms in your own Drive.)
6. When it finishes, the **Execution log** at the bottom shows, for each form:
   - **Share link** → for the website and for learners
   - **Edit link** → for the team only, don't share it

The forms are also in your Google Drive and on **https://forms.google.com**.

## Part B: Check the settings and make it look nice (5 minutes)

Open the form with its **Edit link**, then:

1. **⚙️ Settings → Make this a quiz**: should already be ON. Under it check:
   - **Release grades:** *Immediately after each submission*
   - **Respondent can see:** *Missed questions*, *Correct answers* and *Point values*, all ON
2. **⚙️ Settings → Responses**
   - **Collect email addresses:** *Do not collect* (easier for seniors and safer for children)
   - **Limit to 1 response:** OFF (otherwise people must sign in to Google)
3. **🎨 Customize theme** (palette icon at the top) to match the website:
   - **Color:** click **+** and enter `#2C5841` (Digital Saathi green)
   - **Text style:** Header 22 · Question **16** · Text **14** (bigger text is easier to read)
   - **Header image** (optional): a simple photo or illustration
4. Click **Preview** (👁) and do the quiz once yourself on a phone **and** a computer. Check that your score appears
   at the end.
5. **Responses → Link to Sheets** to collect all answers in a Google Sheet for the team.

## Part C: Get the share link

1. In the form, click **Send** (or **Publish** on newer accounts, then **Copy responder link**).
2. Choose the 🔗 **link** tab. **Leave "Shorten URL" unticked**, so the link looks like
   `https://docs.google.com/forms/d/e/1FAIpQ…/viewform`, and click **Copy**.
   (A short `forms.gle` link also works.)

## Part D: Put it on the website

1. Open `index.html` and search for **`PRE_FORM`** (it is just below `CONTACT`, near the top of the script).
2. Paste the link(s) between the quotes:

   ```js
   const PRE_FORM = {
     en: "https://docs.google.com/forms/d/e/XXXX/viewform",
     hi: "",   // Hindi form link — if left empty, the English form is used
     mr: ""    // Marathi form link — if left empty, the English form is used
   };
   ```
3. Save and open the website → **Quizzes** → **Pre-Assessment Quiz**. The big **Start Pre-Assessment Quiz**
   button now opens your form in a new tab (each language opens its own form). The form is not shown inside the
   website: a separate tab is easier to use on phones, and learners can come back to the website afterwards.

   While `PRE_FORM` is empty, the button is greyed out and says **Coming soon**.

## Part E: Replace the old forms with the new questions

The Pre-Assessment forms you made earlier still contain the **old, easier questions**. Google Forms cannot be updated
by the website, so make new forms and switch the links:

1. In Apps Script open your **Digital Saathi form** project, delete the old `pre-assessment-form.gs` code, paste the new
   `pre-assessment-form.gs` from this folder, and click 💾 **Save**.
2. Run **`createAllLanguages`** (Part A). Copy the three new **Share links** from the Execution log.
3. Do Part B (settings) and Part C for each new form, then replace the three links in `PRE_FORM` in `index.html`
   (Part D). Or paste the three links to Claude, who will replace them and test the button.
4. In Google Drive, move the old Pre forms to the bin once the new ones work (their results stay in their own Sheets
   until you delete them; keep the Sheets if you want the old answers).

## Part F: Show each learner's score and level after the quiz

After a learner taps **Submit**, they should see a **View score** button. It shows how many points they got out of 11,
and the thank-you message shows which **level** that is:

| Level | Points (out of 11) |
|---|---|
| 🏆 Best | 10–11 |
| 🌟 Better | 9 |
| 👍 Good | 8 |
| 🙂 Average | 6–7 |
| 🌱 Getting started | 0–5 |

The Pre-Assessment is deliberately hard and has no pass or fail, so most learners will be at *Getting started* or *Average*. That's expected.

**To switch it on for the three forms that are already live:**
1. In the Apps Script project with `pre-assessment-form.gs`, paste the latest version of the file and run
   **`updatePreFormsScoreLevels`**. It sets the new thank-you message in all three forms, keeps quiz mode on and makes sure every
   question is worth 1 point. It finds the right language from each form's title.
2. **By hand, in each form (Google doesn't let a script change this):** Settings → **Make this a quiz** →
   **Release grades: Immediately after each submission**, and **Respondent can see: Missed questions, Correct answers,
   Point values** all ON. If *Release grades* is set to *Later, after manual review*, learners never see their score. This is
   the usual reason the score doesn't appear.
3. Test it: open the form's link, answer every question, tap **Submit**, then tap **View score**.

---

## The 11 questions (English; the right answer is marked ✅)

| # | Step | Question | Options |
|---|---|---|---|
| 1 | 1 Smartphone Basics | Many Android phones have Emergency SOS. How do you start it fast? | Press the volume-up button 3 times · ✅ Press the power button 5 times quickly · Shake the phone and say “help” |
| 2 | 1 Smartphone Basics | You give your phone to a child to watch one video. You want the child to stay only in that app. What helps? | Turn on Airplane mode · Turn on Battery Saver · ✅ Turn on App pinning |
| 3 | 2 Google, Gmail & YouTube | A medicine strip is written in a language you cannot read. Which Google tool translates it when you point your camera? | ✅ Google Lens · Google Forms · Google Meet |
| 4 | 2 Google, Gmail & YouTube | On YouTube, which setting helps hide videos made for adults? | Dark mode · ✅ Restricted Mode · Autoplay |
| 5 | 3 Family & friends | You are walking home and want your family to see you on the map. In a WhatsApp chat, what do you choose? | Status → Add my location · Settings → Privacy → Last seen · ✅ 📎 → Location → Share live location |
| 6 | 3 Family & friends | Unknown numbers keep calling you on WhatsApp. How can you stop them from ringing? | ✅ Turn on “Silence unknown callers” in Privacy → Calls · Switch off all WhatsApp notifications · Show “Last seen” to nobody |
| 7 | 4 Stay safe online | A call sounds exactly like your son. He asks for money in a hurry. What is the safest step? | Send the money — it is clearly his voice · ✅ Hang up and call him back on his own number, or ask for your family code word · Send a small amount first to test |
| 8 | 4 Stay safe online | Which national helpline number is for reporting online money fraud? | ✅ 1930 · 1098 · 108 |
| 9 | 5 Payments & government services | Which UPI feature lets you pay small amounts, like for tea or vegetables, with one tap and no PIN? | AutoPay · UPI Circle · ✅ UPI Lite |
| 10 | 5 Payments & government services | From what age can people get the Ayushman Vay Vandana card for free hospital cover? | 60 years · 65 years · ✅ 70 years |
| 11 | 6 AI tools & family digital safety | Which of these can show that a photo or video was made by AI? | ✅ Strange-looking hands or faces · The picture is very bright · A friend sent it to you |

Every question also has the 4th choice “I am not sure”. The Hindi and Marathi versions are in `QUIZ` in `index.html` and
in the script. Every right answer comes from the learning steps on the website.

## Good to know

- **Changing a question later?** Change it in the Google Form **and** in `QUIZ` in `index.html` (and in the script,
  if you will run it again), so the website and the form stay the same.
- **Children (8–14):** the form only asks for a first name, and that is optional. No email, phone or address is
  collected. Keep it that way.
- **Re-running the script** makes a *new* form each time. Delete extra copies in Google Drive, and update `PRE_FORM` if
  you switch to a new form.
- **Button says "Coming soon"?** The link in `PRE_FORM` is empty or is not a Google Forms link (it must start with
  `https://docs.google.com/forms/` or `https://forms.gle/`).
- **Learners are asked to sign in, or to type an email?** Open the form → ⚙️ **Settings → Responses** and set
  **Limit to 1 response** to OFF (it makes Google ask everyone to sign in) and **Collect email addresses** to
  *Do not collect* (it adds a required Email question, and its *Verified* option also needs a sign-in). See Part B.
  Signing in is hard for many seniors, and children should not have to give an email.
