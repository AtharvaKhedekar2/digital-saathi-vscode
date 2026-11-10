# Post-Assessment Quiz on Google Forms — step-by-step

This folder builds the **Digital Saathi Post-Assessment Quiz** as a Google Form, the same way as the Pre-Assessment
(see `GOOGLE-FORM-GUIDE.md`). Learners take it **after** finishing the six learning steps.

- `post-assessment-form.gs`: a script that creates the whole form for you (questions, answer key, points, feedback,
  settings) in English, Hindi and Marathi. **This is the easiest way (Part A).**
- If you would rather click everything yourself, Part B shows how, and Part C has every question and answer.

**How it differs from the Pre-Assessment, and how they can still be compared**

| | Pre-Assessment form | Post-Assessment form |
|---|---|---|
| When | Before learning | After finishing all six learning steps |
| Questions | 11 questions | **14 new questions**, 2 per topic, everyday situations |
| Learning steps tested | All six | **The same six** (every question is linked to one step) |
| Pass mark | No pass or fail | **10 of 14 (70%)** for the certificate |
| "I am…" and "How comfortable are you…" | Yes | **Yes, word for word the same**, so groups can be compared |

Because the two quizzes have a different number of questions, you compare **percentages** (for example 45% → 79%),
not raw scores. Part F shows how.

The questions are exactly the same as the website's own Post-Assessment (`POST_QUIZ` in `index.html`), so the form
and the website always agree.

What the form looks like:

| Page | What is on it | Scored? |
|---|---|---|
| 1 · About you | First name (optional) · "I am…" · "Did you take the Pre-Assessment?" · "Which learning steps did you finish?" · "How comfortable are you using a smartphone today?" (1–5) | No |
| 2 · 📱 Smartphone basics | 2 questions | 1 point each |
| 3 · 🔍 Internet & Google | 2 questions | 1 point each |
| 4 · 💬 Talking with family & friends | 2 questions | 1 point each |
| 5 · 💳 Online payments & UPI safety | 2 questions | 1 point each |
| 6 · 🛡️ Online fraud & safety | 2 questions | 1 point each |
| 7 · 🏛️ Government services online | 2 questions | 1 point each |
| 8 · 🧩 Solving everyday problems | 2 questions | 1 point each |
| 9 · One last thing | "What would you like to learn next?" (optional) | No |

**Total: 14 points.** Every scored question has 3 options, exactly one right answer, and is required. After a wrong
answer, the learner sees the right answer, a short tip and the learning step to look at again.

---

## Part A: Create the form with the script (about 5 minutes)

1. On a computer, sign in to the Google account that owns the Pre-Assessment form (the team Gmail), so both forms
   and their results are in one place.
2. Open **https://script.google.com**.
   - You can open your existing project **Digital Saathi form** and add a new file: click **+** next to *Files* →
     **Script** → name it `post-assessment-form`. (The two scripts don't clash.)
   - Or click **New project** and name it `Digital Saathi post form`.
3. In the new, empty file, delete the few lines that are already there. Open `post-assessment-form.gs` from this
   folder, copy **everything** and paste it in. Click 💾 **Save**.
4. In the toolbar, open the function menu (next to **Debug**) and choose which form to make:
   - `createPostEnglishForm`: English
   - `createPostHindiForm`: Hindi
   - `createPostMarathiForm`: Marathi
   - `createPostAllLanguages`: all three at once
5. Click ▶ **Run**. The first time, Google asks for permission:
   **Review permissions** → choose your account → if you see *"Google hasn't verified this app"*, click
   **Advanced** → **Go to … (unsafe)** → **Allow**.
   (This warning appears for every personal script. The script only creates forms in your own Drive.)
6. When it finishes, the **Execution log** at the bottom shows, for each form:
   - **Share link**: for learners
   - **Edit link**: for the team only, don't share it

   Copy both into a safe note. The forms are also in your Google Drive and on **https://forms.google.com**.
7. The script has already set quiz mode, the answer key, points, feedback and the main settings. **Still do Part D**
   (some settings can only be checked by hand) and **Part E** (test it).

Skip Part B if you used the script.

---

## Part B: Or build the form by hand (about 45 minutes per language)

Do this only if you can't use the script. Use the exact text from Part C.

**B1. Create the form**
1. Open **https://forms.google.com** and click **Blank form** (the big **+**).
2. Click **Untitled form** at the top and type the title:
   `Digital Saathi — Post-Assessment Quiz`
3. Click **Form description** under it and paste the description from Part C.

**B2. Turn on quiz mode first** (so every question gets an *Answer key* button)
1. Click the **Settings** tab at the top of the form.
2. Turn on **Make this a quiz**.
3. Go back to the **Questions** tab.

**B3. Page 1: about you (not scored)**

Each new form starts with one empty question. For each question below: type the question, choose the type from the
menu on the right of the question, type the options, then set the **Required** switch at the bottom of the question.
Add the next question with **⊕ Add question** in the small toolbar on the right.

| # | Question | Type | Options | Required |
|---|---|---|---|---|
| 1 | Your first name (optional) | **Short answer** | — (help text: *So a Saathi volunteer can find your result for the certificate. You can leave this empty.* Add it with **⋮ → Description**) | **No** |
| 2 | I am… | **Multiple choice** | A senior citizen (60+) · A homemaker · A child or student (8–14 years) · Other | **Yes** |
| 3 | Did you take the Pre-Assessment Quiz before you started learning? | **Multiple choice** | Yes · No · I don't remember | **Yes** |
| 4 | Which learning steps did you finish? (Tick all that apply) | **Checkboxes** | 1 · Smartphone Basics · 2 · Google, Gmail & YouTube · 3 · Communication with family & friends · 4 · Stay safe online · 5 · Digital payments & government services · 6 · AI tools & family digital safety | **No** |
| 5 | How comfortable are you using a smartphone today? | **Linear scale** | 1 to 5 · label 1: *Not comfortable* · label 5: *Very comfortable* | **Yes** |

Questions 2 and 5 must be **exactly** the same as in the Pre-Assessment form; that is what makes the comparison work.
None of these five questions gets points: in quiz mode, leave their points at **0**.

**B4. Pages 2–8: one page per topic**
1. In the toolbar on the right, click **Add section** (the icon with two rectangles). A new page starts.
2. Type the page title, for example `Topic 1 of 7 · 📱 Smartphone basics`, and the description
   `Choose one answer for each question.`
3. Add the page's 2 questions. For each one:
   1. Type the question and choose **Multiple choice**.
   2. Type the 3 options (A, B, C from Part C) in the same order.
   3. Switch **Required** on.
   4. Click **Answer key** (bottom left of the question). Click the **right option** so it gets a green tick ✅.
   5. Top right of the answer key, set the points to **1**.
   6. Click **Add answer feedback**. Paste the *correct* feedback in the first tab and the *incorrect* feedback in the
      second tab (both are in Part C). Click **Save**, then **Done**.
4. Repeat for all 7 topic pages (14 questions).

**B5. Page 9: one last thing**
1. **Add section** with the title `One last thing`.
2. Add a **Paragraph** question: `What would you like to learn next? (optional)`, description
   `For example: video calls, filling online forms, using AI safely…`. **Required: No.** Points: 0.

**B6. Thank-you message**
Settings → **Presentation** → **Confirmation message** → **Edit**, and paste the thank-you text from Part C.

For Hindi and Marathi, use the texts in `post-assessment-form.gs` (search for `"hi"` and `"mr"`): titles,
descriptions, options and feedback are all there, in the same order.

---

## Part C: Every question, option and correct answer (English)

**Title:** `Digital Saathi — Post-Assessment Quiz`

**Description:**
> Well done for finishing the Digital Saathi learning steps! 🎉 This quiz shows how much you have learned.
>
> • 14 everyday questions · about 7 minutes
> • Score 10 or more out of 14 (70%) to qualify for the Digital Saathi certificate
> • At the end you will see your score and the right answers
>
> 🔒 Never type your OTP, PIN, password or bank details in any form.

**Thank-you (confirmation) message:**
> Thank you! 🎉 Click “View score” to see your result. If you scored 10 or more out of 14, show it to a Digital Saathi
> volunteer for your certificate. Keep practising on your own phone!

Page 1 (about you) is in the table in Part B3. The scored questions:

### Page 2 · Topic 1 of 7 · 📱 Smartphone basics

Page description: *Choose one answer for each question.*

**Q1. You may need help in an emergency, even when your phone is locked. What can you set up today?**

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. Emergency SOS, so pressing the power button 5 times calls for help ✅<br>B. A new wallpaper<br>C. A louder ringtone | **A** | Multiple choice · Yes · 1 | 1 · Smartphone Basics |

Feedback for correct answers: *Correct — well done! 💡 Settings → Safety & emergency → Emergency SOS. Add emergency contacts too, so they show on the lock screen.*  
Feedback for incorrect answers: *Not quite. The right answer is: “Emergency SOS, so pressing the power button 5 times calls for help”. 💡 Settings → Safety & emergency → Emergency SOS. Add emergency contacts too, so they show on the lock screen. (Look at Step 1 — Smartphone Basics again.)*

**Q2. Your grandson wants to play a game on your phone. How can you keep him inside that one game?**

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. Tell him your phone PIN<br>B. Turn on App pinning and pin the game ✅<br>C. Switch the phone off and on again | **B** | Multiple choice · Yes · 1 | 1 · Smartphone Basics |

Feedback for correct answers: *Correct — well done! 💡 With App pinning, he cannot leave the game or open other apps without your PIN.*  
Feedback for incorrect answers: *Not quite. The right answer is: “Turn on App pinning and pin the game”. 💡 With App pinning, he cannot leave the game or open other apps without your PIN. (Look at Step 1 — Smartphone Basics again.)*


### Page 3 · Topic 2 of 7 · 🔍 Internet & Google

Page description: *Choose one answer for each question.*

**Q3. You need a pharmacy near you, quickly. What is the easiest way to find one?**

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. Wait for a newspaper advertisement<br>B. Search “pharmacy near me” in Google Maps ✅<br>C. Ask strangers in a WhatsApp group | **B** | Multiple choice · Yes · 1 | 2 · Google, Gmail & YouTube |

Feedback for correct answers: *Correct — well done! 💡 Google Maps shows the nearest places, how far they are and the way to get there.*  
Feedback for incorrect answers: *Not quite. The right answer is: “Search “pharmacy near me” in Google Maps”. 💡 Google Maps shows the nearest places, how far they are and the way to get there. (Look at Step 2 — Google, Gmail & YouTube again.)*

**Q4. Your medicine strip has instructions in a language you cannot read. What can help?**

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. Guess what it says<br>B. Throw the medicine away<br>C. Point Google Lens at it and choose Translate ✅ | **C** | Multiple choice · Yes · 1 | 2 · Google, Gmail & YouTube |

Feedback for correct answers: *Correct — well done! 💡 Tap the camera icon in the Google search bar, point it at the words and choose Translate.*  
Feedback for incorrect answers: *Not quite. The right answer is: “Point Google Lens at it and choose Translate”. 💡 Tap the camera icon in the Google search bar, point it at the words and choose Translate. (Look at Step 2 — Google, Gmail & YouTube again.)*


### Page 4 · Topic 3 of 7 · 💬 Talking with family & friends

Page description: *Choose one answer for each question.*

**Q5. You are coming home alone late in the evening. How can your family see where you are until you reach home?**

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. Share your live location on WhatsApp ✅<br>B. Send them a photo every hour<br>C. Call them every five minutes | **A** | Multiple choice · Yes · 1 | 3 · Communication with family & friends |

Feedback for correct answers: *Correct — well done! 💡 In a chat tap 📎 → Location → Share live location, and choose how long to share.*  
Feedback for incorrect answers: *Not quite. The right answer is: “Share your live location on WhatsApp”. 💡 In a chat tap 📎 → Location → Share live location, and choose how long to share. (Look at Step 3 — Communication with family & friends again.)*

**Q6. On a video call, your son wants to see your screen to guide you through a phone setting. What should you do first?**

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. Open your bank app so he can check it<br>B. Close bank and payment apps, then share your screen ✅<br>C. Switch off the internet | **B** | Multiple choice · Yes · 1 | 3 · Communication with family & friends |

Feedback for correct answers: *Correct — well done! 💡 Screen sharing shows everything on your screen, so close bank and payment apps before you share.*  
Feedback for incorrect answers: *Not quite. The right answer is: “Close bank and payment apps, then share your screen”. 💡 Screen sharing shows everything on your screen, so close bank and payment apps before you share. (Look at Step 3 — Communication with family & friends again.)*


### Page 5 · Topic 4 of 7 · 💳 Online payments & UPI safety

Page description: *Choose one answer for each question.*

**Q7. A buyer says: “Scan this QR code and enter your UPI PIN to receive ₹2,000.” What is true?**

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. You must enter your PIN to get the money<br>B. It is safe because a QR code is used<br>C. You never need a PIN to receive money — it is a scam ✅ | **C** | Multiple choice · Yes · 1 | 5 · Digital payments & government services |

Feedback for correct answers: *Correct — well done! 💡 Your UPI PIN is only for sending money. Anyone who asks for it to “send” you money is a fraud.*  
Feedback for incorrect answers: *Not quite. The right answer is: “You never need a PIN to receive money — it is a scam”. 💡 Your UPI PIN is only for sending money. Anyone who asks for it to “send” you money is a fraud. (Look at Step 5 — Digital payments & government services again.)*

**Q8. You scan a shop's QR code, but the name on the screen is someone you don't know. What do you do?**

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. Cancel, and ask the shopkeeper before paying ✅<br>B. Pay anyway — QR codes are always correct<br>C. Pay twice to be sure | **A** | Multiple choice · Yes · 1 | 5 · Digital payments & government services |

Feedback for correct answers: *Correct — well done! 💡 Always read the name and the amount on the screen before you enter your PIN.*  
Feedback for incorrect answers: *Not quite. The right answer is: “Cancel, and ask the shopkeeper before paying”. 💡 Always read the name and the amount on the screen before you enter your PIN. (Look at Step 5 — Digital payments & government services again.)*


### Page 6 · Topic 5 of 7 · 🛡️ Online fraud & safety

Page description: *Choose one answer for each question.*

**Q9. A message says: “Your electricity will be cut tonight. Call this number now.” What is the safe thing to do?**

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. Call the number straight away<br>B. Pay whatever amount they ask<br>C. Don't call or tap anything — check in the official app or at the office ✅ | **C** | Multiple choice · Yes · 1 | 4 · Stay safe online |

Feedback for correct answers: *Correct — well done! 💡 Messages that rush you about KYC, electricity bills or parcels are a common scam.*  
Feedback for incorrect answers: *Not quite. The right answer is: “Don't call or tap anything — check in the official app or at the office”. 💡 Messages that rush you about KYC, electricity bills or parcels are a common scam. (Look at Step 4 — Stay safe online again.)*

**Q10. Someone has cheated you and money has left your bank account. What should you do first?**

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. Wait a few days to see if it comes back<br>B. Call 1930 at once, and call your bank to block your card or UPI ✅<br>C. Tell nobody because you feel embarrassed | **B** | Multiple choice · Yes · 1 | 4 · Stay safe online |

Feedback for correct answers: *Correct — well done! 💡 The first hour matters most. Call 1930 or report it at cybercrime.gov.in.*  
Feedback for incorrect answers: *Not quite. The right answer is: “Call 1930 at once, and call your bank to block your card or UPI”. 💡 The first hour matters most. Call 1930 or report it at cybercrime.gov.in. (Look at Step 4 — Stay safe online again.)*


### Page 7 · Topic 6 of 7 · 🏛️ Government services online

Page description: *Choose one answer for each question.*

**Q11. Your father is a pensioner and finds it hard to go to the bank for his life certificate. What can he do?**

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. Stop taking his pension<br>B. Submit it from home with a face scan in the Jeevan Pramaan app ✅<br>C. Send a photo of his Aadhaar to an unknown number | **B** | Multiple choice · Yes · 1 | 5 · Digital payments & government services |

Feedback for correct answers: *Correct — well done! 💡 With the Jeevan Pramaan and AadhaarFaceRD apps, pensioners scan their face with the phone camera.*  
Feedback for incorrect answers: *Not quite. The right answer is: “Submit it from home with a face scan in the Jeevan Pramaan app”. 💡 With the Jeevan Pramaan and AadhaarFaceRD apps, pensioners scan their face with the phone camera. (Look at Step 5 — Digital payments & government services again.)*

**Q12. You are 72 years old. Which card can give you free hospital treatment cover?**

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. The Ayushman Vay Vandana card ✅<br>B. A shop's loyalty card<br>C. A new SIM card | **A** | Multiple choice · Yes · 1 | 5 · Digital payments & government services |

Feedback for correct answers: *Correct — well done! 💡 Everyone aged 70 and above can get it. Apply in the Ayushman app, at beneficiary.nha.gov.in, or at a hospital or CSC.*  
Feedback for incorrect answers: *Not quite. The right answer is: “The Ayushman Vay Vandana card”. 💡 Everyone aged 70 and above can get it. Apply in the Ayushman app, at beneficiary.nha.gov.in, or at a hospital or CSC. (Look at Step 5 — Digital payments & government services again.)*


### Page 8 · Topic 7 of 7 · 🧩 Solving everyday problems

Page description: *Choose one answer for each question.*

**Q13. Your phone battery runs out before the evening. What will help it last longer?**

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. Keep the screen at full brightness<br>B. Turn on Battery Saver and keep the screen brightness low ✅<br>C. Keep every app open all day | **B** | Multiple choice · Yes · 1 | 1 · Smartphone Basics |

Feedback for correct answers: *Correct — well done! 💡 Settings → Battery → Battery Saver. Also switch off Location and Bluetooth when you don't need them.*  
Feedback for incorrect answers: *Not quite. The right answer is: “Turn on Battery Saver and keep the screen brightness low”. 💡 Settings → Battery → Battery Saver. Also switch off Location and Bluetooth when you don't need them. (Look at Step 1 — Smartphone Basics again.)*

**Q14. You have rice, dal, onion and tomato at home and need a quick dinner idea. What can help?**

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. Throw the food away and order from outside<br>B. Type your bank details into an AI app<br>C. Tell an AI app what you have and ask for a simple recipe ✅ | **C** | Multiple choice · Yes · 1 | 6 · AI tools & family digital safety |

Feedback for correct answers: *Correct — well done! 💡 AI apps like Gemini or ChatGPT can suggest recipes — but never type private details into them.*  
Feedback for incorrect answers: *Not quite. The right answer is: “Tell an AI app what you have and ask for a simple recipe”. 💡 AI apps like Gemini or ChatGPT can suggest recipes — but never type private details into them. (Look at Step 6 — AI tools & family digital safety again.)*


### Page 9 · One last thing
**What would you like to learn next? (optional)** · Paragraph · Required: No · 0 points

---

## Part D: Check the settings (5 minutes)

Open the form with its **Edit link**, click the **Settings** tab, and check each item:

1. **Make this a quiz**: ON. Under it:
   - **Release grades:** *Immediately after each submission* (learners see their score straight away)
   - **Respondent can see:** *Missed questions* ON, *Correct answers* ON, *Point values* ON
2. **Responses** (click to open it):
   - **Collect email addresses:** *Do not collect* (easier for seniors, safer for children)
   - **Send responders a copy of their response:** *Off*
   - **Allow response editing:** OFF
   - **Limit to 1 response:** **OFF**. If this is on, Google makes everyone sign in first, which stops many seniors.
3. **Presentation**:
   - **Show progress bar:** ON ("page 3 of 9")
   - **Shuffle question order:** OFF (keeps each topic's two questions together)
   - **Show link to submit another response:** ON (a volunteer can hand the same phone to the next learner)
   - **View results summary:** OFF (learners should not see other people's answers)
4. **🎨 Customize theme** (palette icon at the top), the same as the Pre-Assessment form:
   - **Color:** click **+** and enter `#2C5841` (Digital Saathi green)
   - **Text style:** Header 22 · Question **16** · Text **14**
5. Top right: click **Publish** (newer accounts) if the form is not published yet, and make sure
   **Responses → Accepting responses** is ON.

> ⚠️ The live **Pre-Assessment** forms were asking learners to sign in and to type an email (checked on 9 Nov 2026).
> While you are here, open each Pre-Assessment form too and set **Limit to 1 response: OFF** and
> **Collect email addresses: Do not collect**.

---

## Part E: Test it yourself (10 minutes)

1. Click **Preview** (👁) and take the quiz once, on a phone **and** a computer. Give a mix of right and wrong answers.
2. Submit, click **View score**, and check: the score is out of **14**, wrong answers show the right answer and a 💡 tip,
   and the thank-you message appears.
3. Open the **Share link** in a private window (Chrome: **⋮ → New Incognito window**). If it asks you to **sign in**,
   go back to Part D, step 2. Learners must be able to start without signing in.
4. Delete your test answers afterwards: **Responses** tab → **⋮** → **Delete all responses**.

---

## Part F: See the results and compare them with the Pre-Assessment

**F1. Quick look, inside the form**
Open the form → **Responses** tab:
- **Summary**: average score, the score spread, and the questions most people missed (*Frequently missed questions*).
  Missed questions show which learning step needs more teaching.
- **Question**: everyone's answers to one question.
- **Individual**: one learner at a time, with their score. Use this when a volunteer checks a result for the certificate.

**F2. Put both quizzes in one Google Sheet**
1. Open the **Pre-Assessment** form → **Responses** → **Link to Sheets** → **Create a new spreadsheet**, name it
   `Digital Saathi results`. (If you already linked it, skip this.)
2. Open the **Post-Assessment** form → **Responses** → **Link to Sheets** → **Select existing spreadsheet** → choose
   `Digital Saathi results`. It gets its own tab, for example *Form Responses 2*.
3. Rename the tabs (right-click a tab → **Rename**) to `Pre` and `Post`. New answers now appear there automatically.

**F3. Turn scores into percentages**
Google writes the score as text, like `9 / 14`. On each tab:
1. Find the **Score** column (near the left) and note its letter, for example **B**.
2. In the first empty column, type the heading `Percent` in row 1.
3. In row 2 of that column, paste (change **B** if your Score column has another letter):

   `=IF(B2="","",VALUE(REGEXEXTRACT(B2,"^\s*(\d+)"))/VALUE(REGEXEXTRACT(B2,"/\s*(\d+)")))`

4. Click that cell, then drag the small blue square at its corner down to the last row.
   Select the column → **Format → Number → Percent**.

**F4. Compare before and after**
Google puts the columns in this order: **A** Timestamp, **B** Score, then one column per question in form order.
So, with no email collected, the columns you need are:

| | "I am…" | "How comfortable…" (1–5) | Percent (the column you added) |
|---|---|---|---|
| **Pre** tab (3 about-you questions + 11) | D | E | Q |
| **Post** tab (5 about-you questions + 14 + 1) | D | G | W |

> If a form collects email addresses, Google adds an *Email address* column after Score and every letter moves one to
> the right. Always check row 1 of each tab before typing a formula.

Make a third tab called `Compare` (the **+** at the bottom left) and type:

| What | Formula |
|---|---|
| Average Pre-Assessment % | `=AVERAGE(Pre!Q2:Q)` |
| Average Post-Assessment % | `=AVERAGE(Post!W2:W)` |
| Senior citizens, before | `=AVERAGEIF(Pre!D2:D,"A senior citizen (60+)",Pre!Q2:Q)` |
| Senior citizens, after | `=AVERAGEIF(Post!D2:D,"A senior citizen (60+)",Post!W2:W)` |
| Average comfort, before | `=AVERAGE(Pre!E2:E)` |
| Average comfort, after | `=AVERAGE(Post!G2:G)` |
| How many took each quiz | `=COUNTA(Pre!A2:A)` and `=COUNTA(Post!A2:A)` |

For the other groups, copy the senior-citizen rows and change the text in quotes to *A homemaker* or
*A child or student (8–14 years)*. The Hindi and Marathi forms write their answers in Hindi and Marathi, so link each
language to its own pair of tabs, or use the Hindi/Marathi option text in the formula. In the Post tab, the answer to
*"Did you take the Pre-Assessment?"* (column E) tells you which learners took both quizzes.

Example of what to report: *"Senior citizens: 41% before → 78% after; comfort 2.1 → 3.9 out of 5."*
Only report real numbers from the sheet, never estimates.

**Comparing one person:** if a learner gave the same first name in both forms, a volunteer can find both rows with
**Ctrl + F**. The first name is optional, so many learners can only be compared as a group. That is fine and normal.

---

## Good to know

- **On the website:** the form links are in **`POST_FORM`** in `index.html` (just below `PRE_FORM`). The
  **Start Post-Assessment Quiz** button opens the form in the visitor's language. Use the *Share link* (or the
  learner `…/viewform` link), never the Edit link. While `POST_FORM` is empty, the button says **Coming soon**.
- **Changing a question later?** Change it in `POST_QUIZ` in `index.html` **and** in the form (or in
  `post-assessment-form.gs` before you run it), so the website and the form stay the same.
- **Re-running the script** makes a *new* form each time. Delete extra copies in Google Drive.
- **Children (8–14):** the form only asks for a first name, and that is optional. No email, phone or address is
  collected. Keep it that way.
