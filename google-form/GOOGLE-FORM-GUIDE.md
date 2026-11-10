# Pre-Assessment Quiz on Google Forms — step-by-step

This folder builds the **Digital Saathi Pre-Assessment Quiz** as a Google Form and connects it to the website.

- `pre-assessment-form.gs`: a script that creates the whole form for you (questions, answer key, points, feedback).
- The questions are the 11 questions in `QUIZ` in `index.html`, grouped by the **six approved learning modules**.
  The Post-Assessment form (`post-assessment-form.gs`, guide `POST-FORM-GUIDE.md`) asks 14 different, scenario-style
  questions on the same learning steps, so learners can compare their two percentages, not question by question.

What the form looks like:

| Page | What is on it | Scored? |
|---|---|---|
| 1 · Welcome | First name (optional) · "I am…" (Senior citizen / Homemaker / Child or student 8–14 / Other) · "How comfortable are you with a smartphone?" (1–5) | No |
| 2 · Step 1 Smartphone Basics | 1 question | 1 point each |
| 3 · Step 2 Google, Gmail & YouTube | 1 question | |
| 4 · Step 3 Communication with family & friends | 1 question | |
| 5 · Step 4 Stay safe online | 3 questions | |
| 6 · Step 5 Digital payments & government services | 3 questions | |
| 7 · Step 6 AI tools & family digital safety | 2 questions | |

**Total: 11 points.** Every question has 3 options, exactly one right answer and is required. After a wrong answer, the
learner sees the right answer and the step where they will learn it.

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

## Good to know

- **Changing a question later?** Change it in the Google Form **and** in `QUIZ` in `index.html`, so pre and post
  stay the same.
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
