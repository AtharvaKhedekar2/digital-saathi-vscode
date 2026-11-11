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
| Questions | 11 questions | **20 questions**: 8 re-test Pre-Assessment concepts in simpler everyday words, 12 are new practical questions |
| Learning steps tested | All six | **The same six**: 3 + 3 + 3 + 4 + 4 + 3 questions, one page per step |
| Pass mark | No pass or fail | **14 of 20 (70%)** for the certificate |
| "I am…" and "How comfortable are you…" | Yes | **Yes, word for word the same**, so groups can be compared |

Because the two quizzes have a different number of questions, you compare **percentages** (for example 45% → 79%),
not raw scores. You can also compare the **8 matched concepts** one by one: they are the same skills asked in
different words (marked 🔁 in Part C). Part F shows how.

The Pre-Assessment is deliberately harder than common sense (3 options plus “I am not sure”). The Post-Assessment uses
clear everyday situations with 4 answer options and one clearly right answer, so a learner who has followed the steps
can answer with confidence.

The questions are exactly the same as the website's own Post-Assessment (`POST_QUIZ` in `index.html`), so the form
and the website always agree.

What the form looks like:

| Page | What is on it | Scored? |
|---|---|---|
| 1 · About you | First name (optional) · "I am…" · "Did you take the Pre-Assessment?" · "Which learning steps did you finish?" · "How comfortable are you using a smartphone today?" (1–5) | No |
| 2 · Step 1 of 6 · 📱 Smartphone Basics | 3 questions | 1 point each |
| 3 · Step 2 of 6 · 🔍 Google, Gmail & YouTube | 3 questions | 1 point each |
| 4 · Step 3 of 6 · 💬 Communication with family & friends | 3 questions | 1 point each |
| 5 · Step 4 of 6 · 🛡️ Stay safe online | 4 questions | 1 point each |
| 6 · Step 5 of 6 · 💳 Digital payments & government services | 4 questions | 1 point each |
| 7 · Step 6 of 6 · ✨ AI tools & family digital safety | 3 questions | 1 point each |
| 8 · One last thing | "What would you like to learn next?" (optional) | No |

**Total: 20 points.** Every scored question has 4 options, exactly one right answer, and is required. After a wrong
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

**B4. Pages 2–7: one page per learning step**
1. In the toolbar on the right, click **Add section** (the icon with two rectangles). A new page starts.
2. Type the page title, for example `Step 1 of 6 · 📱 Smartphone Basics`, and the description
   `Choose one answer for each question.`
3. Add the page's questions (3 or 4; see Part C). For each one:
   1. Type the question and choose **Multiple choice**.
   2. Type the 4 options (A, B, C, D from Part C) in the same order.
   3. Switch **Required** on.
   4. Click **Answer key** (bottom left of the question). Click the **right option** so it gets a green tick ✅.
   5. Top right of the answer key, set the points to **1**.
   6. Click **Add answer feedback**. Paste the *correct* feedback in the first tab and the *incorrect* feedback in the
      second tab (both are in Part C). Click **Save**, then **Done**.
4. Repeat for all 6 step pages (20 questions).

**B5. Page 8: one last thing**
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
> • 20 everyday questions · about 10 minutes
> • Score 14 or more out of 20 (70%) to qualify for the Digital Saathi certificate
> • At the end you will see your score and the right answers
>
> 🔒 Never type your OTP, PIN, password or bank details in any form.

**Thank-you (confirmation) message:**
> Thank you! 🎉 Tap “View score” to see how many points you got out of 20.
>
> Your level:
> 🏆 Best: 18–20 points · 🌟 Better: 16–17 points · 👍 Good: 14–15 points · 🙂 Average: 10–13 points · 🌱 Getting started: 0–9 points
>
> Good, Better or Best (14 or more out of 20) earns the Digital Saathi certificate: show your score to a Digital Saathi
> volunteer. Keep practising on your own phone!

Page 1 (about you) is in the table in Part B3. The scored questions:

### Page 2 · Step 1 of 6 · 📱 Smartphone Basics

Page description: *Choose one answer for each question.*

**Q1. You feel unsafe and want to call for help fast. Your Android phone has Emergency SOS turned on. What do you do?**  🔁 *re-tests Pre-Assessment Q1*

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. Press the volume button once<br>B. Press the power button 5 times quickly ✅<br>C. Shake the phone twice<br>D. Open the camera app | **B** | Multiple choice · Yes · 1 | 1 · Smartphone Basics |

Feedback for correct answers: *Correct — well done! 💡 With Emergency SOS turned on, pressing the power button 5 times quickly calls for help. Add emergency contacts in Settings → Safety & emergency.*  
Feedback for incorrect answers: *Not quite. The right answer is: “Press the power button 5 times quickly”. 💡 With Emergency SOS turned on, pressing the power button 5 times quickly calls for help. Add emergency contacts in Settings → Safety & emergency. (Look at Step 1 — Smartphone Basics again.)*

**Q2. Your grandson wants to watch one video on your phone. You want him to stay only in that app. What helps?**  🔁 *re-tests Pre-Assessment Q2*

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. Turn on Airplane mode<br>B. Turn on Battery Saver<br>C. Turn on App pinning and pin the app ✅<br>D. Turn on Dark mode | **C** | Multiple choice · Yes · 1 | 1 · Smartphone Basics |

Feedback for correct answers: *Correct — well done! 💡 App pinning keeps the phone on one app. The child cannot leave it without your PIN. (iPhone: Guided Access.)*  
Feedback for incorrect answers: *Not quite. The right answer is: “Turn on App pinning and pin the app”. 💡 App pinning keeps the phone on one app. The child cannot leave it without your PIN. (iPhone: Guided Access.) (Look at Step 1 — Smartphone Basics again.)*

**Q3. You often forget to take your medicine at 9 am. What is an easy way to remember?**

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. Say “Hey Google, remind me to take my medicine every day at 9 am” ✅<br>B. Switch the phone to silent<br>C. Lock the screen with a PIN<br>D. Turn on Battery Saver | **A** | Multiple choice · Yes · 1 | 1 · Smartphone Basics |

Feedback for correct answers: *Correct — well done! 💡 You can set a reminder just by speaking. The phone reminds you on time.*  
Feedback for incorrect answers: *Not quite. The right answer is: “Say “Hey Google, remind me to take my medicine every day at 9 am””. 💡 You can set a reminder just by speaking. The phone reminds you on time. (Look at Step 1 — Smartphone Basics again.)*


### Page 3 · Step 2 of 6 · 🔍 Google, Gmail & YouTube

Page description: *Choose one answer for each question.*

**Q4. A shop board is written in a language you cannot read. How can your phone camera help?**  🔁 *re-tests Pre-Assessment Q3*

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. Take a photo and email it to yourself<br>B. Turn on Restricted Mode<br>C. Open Google Forms<br>D. Point Google Lens at the board and tap Translate ✅ | **D** | Multiple choice · Yes · 1 | 2 · Google, Gmail & YouTube |

Feedback for correct answers: *Correct — well done! 💡 Tap the camera icon (Google Lens) in the Google search bar, point it at the words and choose Translate.*  
Feedback for incorrect answers: *Not quite. The right answer is: “Point Google Lens at the board and tap Translate”. 💡 Tap the camera icon (Google Lens) in the Google search bar, point it at the words and choose Translate. (Look at Step 2 — Google, Gmail & YouTube again.)*

**Q5. Your 6-year-old granddaughter wants to watch videos on your phone. Which app is made for young children?**

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. YouTube Kids ✅<br>B. Gmail<br>C. Google Maps<br>D. Google Meet | **A** | Multiple choice · Yes · 1 | 2 · Google, Gmail & YouTube |

Feedback for correct answers: *Correct — well done! 💡 YouTube Kids shows videos made for children. On normal YouTube you can turn on Restricted Mode.*  
Feedback for incorrect answers: *Not quite. The right answer is: “YouTube Kids”. 💡 YouTube Kids shows videos made for children. On normal YouTube you can turn on Restricted Mode. (Look at Step 2 — Google, Gmail & YouTube again.)*

**Q6. You do not want to be locked out of your Google account if you forget the password. What should you add?**

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. A new profile photo<br>B. A longer name<br>C. A recovery phone number and a recovery email ✅<br>D. A second Gmail with the same password | **C** | Multiple choice · Yes · 1 | 2 · Google, Gmail & YouTube |

Feedback for correct answers: *Correct — well done! 💡 A recovery phone number and email help Google let you back in. Keep your password written down in a safe place at home.*  
Feedback for incorrect answers: *Not quite. The right answer is: “A recovery phone number and a recovery email”. 💡 A recovery phone number and email help Google let you back in. Keep your password written down in a safe place at home. (Look at Step 2 — Google, Gmail & YouTube again.)*


### Page 4 · Step 3 of 6 · 💬 Communication with family & friends

Page description: *Choose one answer for each question.*

**Q7. You are walking home late and want your family to follow you on the map. What do you do in a WhatsApp chat?**  🔁 *re-tests Pre-Assessment Q5*

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. Change your Status<br>B. Tap 📎 → Location → Share live location ✅<br>C. Turn off “Last seen”<br>D. Send a voice note every hour | **B** | Multiple choice · Yes · 1 | 3 · Communication with family & friends |

Feedback for correct answers: *Correct — well done! 💡 Your family can follow you on the map until you reach home. You choose how long to share, for example 1 hour.*  
Feedback for incorrect answers: *Not quite. The right answer is: “Tap 📎 → Location → Share live location”. 💡 Your family can follow you on the map until you reach home. You choose how long to share, for example 1 hour. (Look at Step 3 — Communication with family & friends again.)*

**Q8. Strangers keep adding you to WhatsApp groups. What can you do to stop it?**

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. Delete your WhatsApp account<br>B. Reply to each stranger<br>C. Mute every group<br>D. Go to Settings → Privacy → Groups and choose “My contacts” ✅ | **D** | Multiple choice · Yes · 1 | 3 · Communication with family & friends |

Feedback for correct answers: *Correct — well done! 💡 With “My contacts”, only people in your contacts can add you to a group.*  
Feedback for incorrect answers: *Not quite. The right answer is: “Go to Settings → Privacy → Groups and choose “My contacts””. 💡 With “My contacts”, only people in your contacts can add you to a group. (Look at Step 3 — Communication with family & friends again.)*

**Q9. You are getting a new phone. You do not want to lose your WhatsApp chats and family photos. What should you do first?**

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. Turn on chat backup and photo backup ✅<br>B. Delete WhatsApp<br>C. Remove your SIM card<br>D. Nothing, they always come back on their own | **A** | Multiple choice · Yes · 1 | 3 · Communication with family & friends |

Feedback for correct answers: *Correct — well done! 💡 Turn on WhatsApp chat backup (Google Drive on Android, iCloud on iPhone) and backup in Google Photos.*  
Feedback for incorrect answers: *Not quite. The right answer is: “Turn on chat backup and photo backup”. 💡 Turn on WhatsApp chat backup (Google Drive on Android, iCloud on iPhone) and backup in Google Photos. (Look at Step 3 — Communication with family & friends again.)*


### Page 5 · Step 4 of 6 · 🛡️ Stay safe online

Page description: *Choose one answer for each question.*

**Q10. A call sounds exactly like your daughter. She cries and asks for money right now. What is the safest first step?**  🔁 *re-tests Pre-Assessment Q7*

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. Send the money, then ask questions later<br>B. Believe her because it is her voice<br>C. Hang up and call her back on her own number, or ask for your family code word ✅<br>D. Ask her to send a selfie | **C** | Multiple choice · Yes · 1 | 4 · Stay safe online |

Feedback for correct answers: *Correct — well done! 💡 Scammers can copy a voice using AI. Use a family code word, or call back on the number you know.*  
Feedback for incorrect answers: *Not quite. The right answer is: “Hang up and call her back on her own number, or ask for your family code word”. 💡 Scammers can copy a voice using AI. Use a family code word, or call back on the number you know. (Look at Step 4 — Stay safe online again.)*

**Q11. Someone cheated you online and took your money. Which helpline should you call to report it?**  🔁 *re-tests Pre-Assessment Q8*

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. 108<br>B. 1091<br>C. 1098<br>D. 1930 ✅ | **D** | Multiple choice · Yes · 1 | 4 · Stay safe online |

Feedback for correct answers: *Correct — well done! 💡 1930 is the National Cyber Crime Helpline. Call in the first hour, and call your bank to block your card or UPI.*  
Feedback for incorrect answers: *Not quite. The right answer is: “1930”. 💡 1930 is the National Cyber Crime Helpline. Call in the first hour, and call your bank to block your card or UPI. (Look at Step 4 — Stay safe online again.)*

**Q12. On a video call, a person in police uniform says you are under “digital arrest” and must pay money. What is true?**

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. Police never arrest anyone on a video call. Hang up and call 1930 or your local police ✅<br>B. Pay quickly to avoid jail<br>C. Give your Aadhaar number to prove you are innocent<br>D. Stay on the call until they finish | **A** | Multiple choice · Yes · 1 | 4 · Stay safe online |

Feedback for correct answers: *Correct — well done! 💡 Police, the CBI or courts never arrest anyone on a video call and never ask for money to “settle a case”.*  
Feedback for incorrect answers: *Not quite. The right answer is: “Police never arrest anyone on a video call. Hang up and call 1930 or your local police”. 💡 Police, the CBI or courts never arrest anyone on a video call and never ask for money to “settle a case”. (Look at Step 4 — Stay safe online again.)*

**Q13. You get an SMS: “Your KYC expires today. Tap this link now.” What is the safest thing to do?**

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. Tap the link quickly<br>B. Do not tap. Check only in your bank's official app or at the branch ✅<br>C. Call the number in the SMS<br>D. Forward it to your friends | **B** | Multiple choice · Yes · 1 | 4 · Stay safe online |

Feedback for correct answers: *Correct — well done! 💡 Messages that rush you about KYC, bills or parcels are fake. Check only in the official app or at the office.*  
Feedback for incorrect answers: *Not quite. The right answer is: “Do not tap. Check only in your bank's official app or at the branch”. 💡 Messages that rush you about KYC, bills or parcels are fake. Check only in the official app or at the office. (Look at Step 4 — Stay safe online again.)*


### Page 6 · Step 5 of 6 · 💳 Digital payments & government services

Page description: *Choose one answer for each question.*

**Q14. You buy tea and vegetables every day. Which UPI feature lets you pay small amounts with one tap and no PIN?**  🔁 *re-tests Pre-Assessment Q9*

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. UPI Circle<br>B. AutoPay<br>C. UPI Lite ✅<br>D. Net banking | **C** | Multiple choice · Yes · 1 | 5 · Digital payments & government services |

Feedback for correct answers: *Correct — well done! 💡 Add a small balance to UPI Lite once. Small payments then go through in one tap, without a PIN.*  
Feedback for incorrect answers: *Not quite. The right answer is: “UPI Lite”. 💡 Add a small balance to UPI Lite once. Small payments then go through in one tap, without a PIN. (Look at Step 5 — Digital payments & government services again.)*

**Q15. A stranger says: “Scan this QR code and enter your UPI PIN to receive ₹2,000.” What is true?**

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. You never need your PIN to receive money. It is a scam ✅<br>B. You must enter your PIN to get the money<br>C. It is safe if the amount is small<br>D. It is safe because it is a QR code | **A** | Multiple choice · Yes · 1 | 5 · Digital payments & government services |

Feedback for correct answers: *Correct — well done! 💡 Your UPI PIN is only for sending money. Anyone who asks for it to “send” you money is a fraud.*  
Feedback for incorrect answers: *Not quite. The right answer is: “You never need your PIN to receive money. It is a scam”. 💡 Your UPI PIN is only for sending money. Anyone who asks for it to “send” you money is a fraud. (Look at Step 5 — Digital payments & government services again.)*

**Q16. Where can you keep official copies of your Aadhaar, PAN and certificates safely on your phone?**

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. In a family WhatsApp group<br>B. In your photo gallery with no lock<br>C. In an email to a friend<br>D. In DigiLocker ✅ | **D** | Multiple choice · Yes · 1 | 5 · Digital payments & government services |

Feedback for correct answers: *Correct — well done! 💡 Sign in to DigiLocker with your Aadhaar-linked mobile number. Official copies kept there are accepted as valid.*  
Feedback for incorrect answers: *Not quite. The right answer is: “In DigiLocker”. 💡 Sign in to DigiLocker with your Aadhaar-linked mobile number. Official copies kept there are accepted as valid. (Look at Step 5 — Digital payments & government services again.)*

**Q17. Your father is a pensioner and finds it hard to go to the bank for his life certificate. What can he do?**

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. Send his passbook by courier<br>B. Submit it from home with a face scan in the Jeevan Pramaan app ✅<br>C. Ask a neighbour to sign for him<br>D. Wait until the bank calls him | **B** | Multiple choice · Yes · 1 | 5 · Digital payments & government services |

Feedback for correct answers: *Correct — well done! 💡 Pensioners can submit the life certificate from home with the Jeevan Pramaan and AadhaarFaceRD apps. No bank visit is needed.*  
Feedback for incorrect answers: *Not quite. The right answer is: “Submit it from home with a face scan in the Jeevan Pramaan app”. 💡 Pensioners can submit the life certificate from home with the Jeevan Pramaan and AadhaarFaceRD apps. No bank visit is needed. (Look at Step 5 — Digital payments & government services again.)*


### Page 7 · Step 6 of 6 · ✨ AI tools & family digital safety

Page description: *Choose one answer for each question.*

**Q18. A shocking photo is forwarded to you on WhatsApp. Which sign can show it was made by AI?**  🔁 *re-tests Pre-Assessment Q11*

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. It is very colourful<br>B. It has strange-looking hands or faces ✅<br>C. A friend sent it<br>D. It was sent in a group | **B** | Multiple choice · Yes · 1 | 6 · AI tools & family digital safety |

Feedback for correct answers: *Correct — well done! 💡 AI can make fake photos and videos. Look for odd hands or faces, and check trusted news websites before you forward.*  
Feedback for incorrect answers: *Not quite. The right answer is: “It has strange-looking hands or faces”. 💡 AI can make fake photos and videos. Look for odd hands or faces, and check trusted news websites before you forward. (Look at Step 6 — AI tools & family digital safety again.)*

**Q19. Which of these should you NEVER type into an AI chat app?**

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. A recipe question<br>B. A homework question<br>C. Your OTP, password or bank details ✅<br>D. A question in Marathi | **C** | Multiple choice · Yes · 1 | 6 · AI tools & family digital safety |

Feedback for correct answers: *Correct — well done! 💡 Treat an AI chat like a stranger. Never type your OTP, passwords, Aadhaar, bank details or family photos.*  
Feedback for incorrect answers: *Not quite. The right answer is: “Your OTP, password or bank details”. 💡 Treat an AI chat like a stranger. Never type your OTP, passwords, Aadhaar, bank details or family photos. (Look at Step 6 — AI tools & family digital safety again.)*

**Q20. Your child wears a GPS smartwatch. Which is a safe way to use it?**

| Options | Correct answer | Type · Required · Points | Learning step |
|---|---|---|---|
| A. Post the watch's map on social media<br>B. Share the app password with neighbours<br>C. Stop watching over your child, because the watch is enough<br>D. Add only trusted family members as contacts and keep the location private ✅ | **D** | Multiple choice · Yes · 1 | 6 · AI tools & family digital safety |

Feedback for correct answers: *Correct — well done! 💡 Location is sensitive, so keep it private and use only trusted contacts. A watch never replaces an adult's care.*  
Feedback for incorrect answers: *Not quite. The right answer is: “Add only trusted family members as contacts and keep the location private”. 💡 Location is sensitive, so keep it private and use only trusted contacts. A watch never replaces an adult's care. (Look at Step 6 — AI tools & family digital safety again.)*


### Page 8 · One last thing
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
   - **Show progress bar:** ON ("page 3 of 8")
   - **Shuffle question order:** OFF (keeps each step's questions together)
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
2. Submit, click **View score**, and check: the score is out of **20**, wrong answers show the right answer and a 💡 tip,
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
Google writes the score as text, like `13 / 20`. On each tab:
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
| **Post** tab (5 about-you questions + 20 + 1) | D | G | AC |

> If a form collects email addresses, Google adds an *Email address* column after Score and every letter moves one to
> the right. Always check row 1 of each tab before typing a formula.

Make a third tab called `Compare` (the **+** at the bottom left) and type:

| What | Formula |
|---|---|
| Average Pre-Assessment % | `=AVERAGE(Pre!Q2:Q)` |
| Average Post-Assessment % | `=AVERAGE(Post!AC2:AC)` |
| Senior citizens, before | `=AVERAGEIF(Pre!D2:D,"A senior citizen (60+)",Pre!Q2:Q)` |
| Senior citizens, after | `=AVERAGEIF(Post!D2:D,"A senior citizen (60+)",Post!AC2:AC)` |
| Average comfort, before | `=AVERAGE(Pre!E2:E)` |
| Average comfort, after | `=AVERAGE(Post!G2:G)` |
| How many took each quiz | `=COUNTA(Pre!A2:A)` and `=COUNTA(Post!A2:A)` |

For the other groups, copy the senior-citizen rows and change the text in quotes to *A homemaker* or
*A child or student (8–14 years)*. The Hindi and Marathi forms write their answers in Hindi and Marathi, so link each
language to its own pair of tabs, or use the Hindi/Marathi option text in the formula. In the Post tab, the answer to
*"Did you take the Pre-Assessment?"* (column E) tells you which learners took both quizzes.

Example of what to report: *"Senior citizens: 41% before → 78% after; comfort 2.1 → 3.9 out of 5."*
Only report real numbers from the sheet, never estimates.

**F5. Compare the 8 matched concepts, one by one**
Eight Post-Assessment questions ask about the same skills as eight Pre-Assessment questions, in simpler words (🔁 in
Part C). On the `Compare` tab, the share of learners who chose the right answer for each concept is:

| Concept | Pre question | Post question | Pre: % right | Post: % right |
|---|---|---|---|---|
| Emergency SOS | Pre Q1 · column F | Post Q1 · column H | `=COUNTIF(Pre!F2:F,"Press the power button 5 times quickly")/COUNTA(Pre!F2:F)` | `=COUNTIF(Post!H2:H,"Press the power button 5 times quickly")/COUNTA(Post!H2:H)` |
| App pinning (child on one app) | Pre Q2 · column G | Post Q2 · column I | `=COUNTIF(Pre!G2:G,"Turn on App pinning")/COUNTA(Pre!G2:G)` | `=COUNTIF(Post!I2:I,"Turn on App pinning and pin the app")/COUNTA(Post!I2:I)` |
| Google Lens (translate with the camera) | Pre Q3 · column H | Post Q4 · column K | `=COUNTIF(Pre!H2:H,"Google Lens")/COUNTA(Pre!H2:H)` | `=COUNTIF(Post!K2:K,"Point Google Lens at the board and tap Translate")/COUNTA(Post!K2:K)` |
| Share live location on WhatsApp | Pre Q5 · column J | Post Q7 · column N | `=COUNTIF(Pre!J2:J,"📎 → Location → Share live location")/COUNTA(Pre!J2:J)` | `=COUNTIF(Post!N2:N,"Tap 📎 → Location → Share live location")/COUNTA(Post!N2:N)` |
| Family code word (fake voice call) | Pre Q7 · column L | Post Q10 · column Q | `=COUNTIF(Pre!L2:L,"Hang up and call him back on his own number, or ask for your family code word")/COUNTA(Pre!L2:L)` | `=COUNTIF(Post!Q2:Q,"Hang up and call her back on her own number, or ask for your family code word")/COUNTA(Post!Q2:Q)` |
| 1930 cyber crime helpline | Pre Q8 · column M | Post Q11 · column R | `=COUNTIF(Pre!M2:M,"1930")/COUNTA(Pre!M2:M)` | `=COUNTIF(Post!R2:R,"1930")/COUNTA(Post!R2:R)` |
| UPI Lite (small payments, no PIN) | Pre Q9 · column N | Post Q14 · column U | `=COUNTIF(Pre!N2:N,"UPI Lite")/COUNTA(Pre!N2:N)` | `=COUNTIF(Post!U2:U,"UPI Lite")/COUNTA(Post!U2:U)` |
| Signs of an AI photo | Pre Q11 · column P | Post Q18 · column Y | `=COUNTIF(Pre!P2:P,"Strange-looking hands or faces")/COUNTA(Pre!P2:P)` | `=COUNTIF(Post!Y2:Y,"It has strange-looking hands or faces")/COUNTA(Post!Y2:Y)` |

Format those cells as **Percent**. The text inside the quotes must match the answer exactly (copy it from Part C), and
the column letters assume no email column (see the note above). For the Hindi and Marathi forms, copy the answer text from
`post-assessment-form.gs` and use each language's own tabs. A concept whose Post percentage is higher than its Pre
percentage is a skill the learners picked up. Report only real numbers from the sheet.

**Comparing one person:** if a learner gave the same first name in both forms, a volunteer can find both rows with
**Ctrl + F**. The first name is optional, so many learners can only be compared as a group. That is fine and normal.

---

## Part G: Show each learner's score and level after the quiz

After **Submit**, learners tap **View score** to see their points out of 20. The thank-you message shows the level:

| Level | Points (out of 20) | Certificate |
|---|---|---|
| 🏆 Best | 18–20 | ✅ |
| 🌟 Better | 16–17 | ✅ |
| 👍 Good | 14–15 | ✅ (14 = the 70 % pass mark) |
| 🙂 Average | 10–13 | not yet |
| 🌱 Getting started | 0–9 | not yet |

**To switch it on for the three forms that are already live:**
1. In the Apps Script project with `post-assessment-form.gs`, paste the latest version and run **`updatePostFormsScoreLevels`**.
   It sets the thank-you message with the levels, keeps quiz mode on and checks every question is worth 1 point.
2. **By hand, in each form:** Settings → **Make this a quiz** → **Release grades: Immediately after each submission**, and
   **Respondent can see: Missed questions, Correct answers, Point values** all ON. A script can't change this setting.
3. Test it once: submit the form, tap **View score**, and check the score is out of 20.

---

## Good to know

- **On the website:** the form links are in **`POST_FORM`** in `index.html` (just below `PRE_FORM`). The
  **Start Post-Assessment Quiz** button opens the form in the visitor's language. Use the *Share link* (or the
  learner `…/viewform` link), never the Edit link. While `POST_FORM` is empty, the button says **Coming soon**.
- **Changing a question later?** Change it in `POST_QUIZ` in `index.html` **and** in the form (or in
  `post-assessment-form.gs` before you run it), so the website and the form stay the same.
- **Re-running the script** makes a *new* form each time. Delete extra copies in Google Drive.
- **Switching from the old 14-question forms to the 20-question forms:** your live Post forms still hold the old
  questions. In Apps Script replace the old `post-assessment-form.gs` code with the new file, save, and run
  `createPostAllLanguages` (Part A). Do Parts D and E for each new form, then put the three new Share links in
  `POST_FORM` in `index.html` (or send them to Claude, who will replace them and test the button). Afterwards move the
  three old Post forms to the bin in Google Drive. Keep their response Sheets if you want the old answers. Until you
  switch, the website says “14 of 20” while the old form still has 14 questions.
- **Children (8–14):** the form only asks for a first name, and that is optional. No email, phone or address is
  collected. Keep it that way.
