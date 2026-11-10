# Digital Saathi on Google Classroom: step-by-step

This folder creates the **six Digital Saathi Google Classrooms**, one for each learning step on the website, on your
own personal Gmail account. It works the same way as the Pre- and Post-Assessment Google Forms: you paste a script
into **Google Apps Script**, click **Run**, and Google asks you for permission once.

| File | What it is |
|---|---|
| `classroom-setup.gs` | The script. It creates the classrooms and fills them with lessons. **Paste it into Apps Script.** |
| `appsscript.json` | The script's settings: it switches on the Classroom API and lists the exact permissions. **Paste it too.** |
| `CLASSROOM-CONTENT.md` | Every class, topic and post the script creates, in full, to review or to build a class by hand. |
| `classrooms.json` | Where the real class IDs, links and class codes are saved after Part F (for the website later). |
| `.gitignore` | Stops credential files from ever being committed, if one is ever added to this folder. |

**The six classrooms**

| Step | Classroom | Website step | Lessons |
|---|---|---|---|
| 01 | Digital Saathi – Smartphone Basics | Smartphone Basics | 6 |
| 02 | Digital Saathi – Google, Gmail & YouTube | Google, Gmail & YouTube | 6 |
| 03 | Digital Saathi – Communication with Family & Friends | Communication with family & friends | 6 |
| 04 | Digital Saathi – Stay Safe Online | Stay safe online | 8 |
| 05 | Digital Saathi – Digital Payments & Government Services | Digital payments & government services | 8 |
| 06 | Digital Saathi – AI Tools & Family Digital Safety | AI tools & family digital safety | 7 |

**What is inside every classroom** (on the *Classwork* page, top to bottom)

| Topic | Posts |
|---|---|
| Start here | "Welcome! How this class works" · "Before you start: Pre-Assessment (optional)" with the Pre-Assessment form link |
| Lesson 1 · … / Lesson 2 · … / Lesson 3 · … | One post per learning point of that website step. Each post has: **How to do it** (the website's text, word for word), **Try it now**, a **suggested video**, a **suggested PDF or handout**, and the point's title in Hindi and Marathi |
| Practical activities | 2 activities to do on your own phone (ungraded: learners click *Mark as done*) |
| Check your skills | "Post-Assessment: see how much you have learned", with the Post-Assessment form link |

The class itself also gets a **name**, **section** ("Step 01 of 6 · Digital literacy"), **room** ("Online · learn at
your own pace"), a **description heading** and a **description** with the learning objective, the list of what you
will learn, how the class works and a safety rule. (The Classroom API has no separate "Subject" field, so the subject,
*Digital literacy*, is written in the section and the description.)

**No outside links were invented.** The only links in the classes are your own Pre- and Post-Assessment Google Forms
(copied from the website). Video and PDF suggestions describe what to record or prepare; you can attach real files or
trusted videos later (Part I).

---

## Who does what

| Step | Who | What |
|---|---|---|
| Write the script, settings, content and this guide; test the script | ✅ Claude (done) | Tested in a browser against a simulated Classroom: 59 of 59 checks passed (no duplicates, safe re-runs, right order, export format) |
| Open Classroom once and accept Google's terms | 👤 You | Part A1 |
| Create the Apps Script project and paste the two files | 👤 You | Part A2–A4 |
| Allow the script to use Classroom ("Review permissions") | 👤 You, **only you can** | Part B |
| Run the read-only checks and the preview | 👤 You click Run, the script does the work | Parts B and C1 |
| **Create the six classrooms** | 👤 You click Run, **only after you have checked the preview** | Part C2 |
| **Accept each classroom** | 👤 You, **by hand, in the Classroom website** | Part D |
| Add topics, lessons and activities | 👤 You click Run, the script does the work | Part E |
| Export the IDs, links and class codes | 👤 You click Run, then paste the result to Claude or into `classrooms.json` | Part F |
| Copy each class's invite link | 👤 You, by hand (the API doesn't give it) | Part F3 |
| Check the result in Google | 👤 You click Run (`step3_checkStatus`) + look in Classroom | Part G |

Claude cannot sign in to your Google account, so Claude never runs anything in Google for you. Nothing is created
until **you** run `step2b_createClassrooms`.

---

## How it works (the short version)

- **Method: Google Apps Script + the official Google Classroom API.** Apps Script is Google's own scripting tool. Its
  **Classroom service** is the official Classroom API (version 1), the same one other programs use.
- **Google Cloud project:** every Apps Script project automatically gets a hidden *default* Google Cloud project.
  When you add the Classroom service (Part A3), Apps Script switches the Classroom API on in that project for you.
  You do **not** need to open the Google Cloud Console, create a project, or turn on the API by hand.
- **OAuth 2.0 (sign-in and permission):** the first time you click **Run**, Google shows its permission screen
  ("Review permissions" → choose your account → Allow). That *is* the OAuth 2.0 authorization. Google keeps the sign-in
  token itself. **There is no client ID, client secret, `credentials.json` or `token.json` to create, download or
  protect**, so there is nothing secret to leak into the website or Git.
- **Permissions (scopes)** the script asks for. They are listed in `appsscript.json`, and nothing else is requested:

  | Scope | Why it is needed |
  |---|---|
  | `https://www.googleapis.com/auth/classroom.courses` | See your classes; create the six classes; (optional) switch them to ACTIVE |
  | `https://www.googleapis.com/auth/classroom.topics` | Create the topics (Start here, Lesson 1–3, …) |
  | `https://www.googleapis.com/auth/classroom.courseworkmaterials` | Create the lesson posts (materials) |
  | `https://www.googleapis.com/auth/classroom.coursework.students` | Create the two practical activities in each class |

  The script cannot read your Gmail, Drive, contacts or anything outside Classroom.
- **Credentials:** none to generate. Google's permission screen is the only "credential" step.

**Limits of a personal Gmail account (important)**

1. **New classes start as PROVISIONED, not ACTIVE.** Google's documentation says personal accounts (`@gmail.com`)
   cannot create ACTIVE classes through the API (Google answers *403 PERMISSION_DENIED*). So the script creates each class
   as **PROVISIONED**: it exists, but students can't see it yet. Google documents two ways to activate it:
   **you accept it in the Classroom website** (Part D, the main way), or the class is updated through the API
   (`step3b_activateWithApi`, optional; Google may refuse this for a personal account, and that's fine).
   The script never tries to get around Google's rules.
2. **Lessons can only be added to ACTIVE classes**, so Part E comes after Part D. The script checks this for you.
3. **"Google hasn't verified this app."** This warning appears for every personal script, exactly as it did for the
   Forms. It is your own script, running on your own account.
4. **Apps Script stops any run after 6 minutes.** Adding lessons to all six classes takes roughly 1–3 minutes. If a run
   ever gets close to the limit, the script stops safely and tells you to run it again; it continues where it stopped.
5. **Google has daily limits** on how many classes and posts an account can create. Six classes and about 70 posts is
   small, but if Google says a limit was reached, wait and run the same step again (nothing is duplicated).
6. **Some Classroom features need Google Workspace for Education** (a school's paid or free education domain): for
   example guardian emails and some admin features. This project doesn't use any of them.
7. **Learners join with their own Google account.** People using a personal Gmail can join. A learner whose account
   belongs to a school or company may be blocked from joining outside classes by their administrator.
8. **Posts made by this script** can be edited by you in the Classroom website as normal. Another script project can't
   change them through the API (Google allows that only for the project that made them).

---

## Part A: One-time setup (about 10 minutes, on a computer)

**A1. Open Classroom once.** Sign in with the Gmail account that should **own** the classes (for example the team
Gmail that owns the Forms). Open **https://classroom.google.com**. If Google asks you to agree to its terms or to choose
a role, agree, and choose **teacher** if asked. Close the tab.

**A2. Create the script project.**
1. Open **https://script.google.com** with the same account → **New project**.
2. Click *Untitled project* at the top and rename it **Digital Saathi classrooms**.

**A3. Paste the settings file (this also switches on the Classroom API).**
1. Click ⚙️ **Project Settings** (left bar) → tick **Show "appsscript.json" manifest file in editor**.
2. Click **< > Editor** (left bar) → open **appsscript.json**.
3. Delete everything in it. Open `appsscript.json` from this folder, copy **all** of it, paste it in, and click
   💾 **Save**.
4. Check: under **Services** on the left you should now see **Classroom**. If you don't, click **+** next to
   *Services* → choose **Google Classroom API** → keep the identifier **Classroom** → **Add**.

**A4. Paste the script.**
1. Open **Code.gs**, delete the few lines already there.
2. Open `classroom-setup.gs` from this folder, copy **everything** and paste it in. Click 💾 **Save**.
   (Optional: rename *Code.gs* to *classroom-setup* using ⋮ → Rename.)

Setup is done. You never have to repeat Part A.

---

## Part B: Allow access and check the setup (read-only)

1. In the toolbar, open the function menu (next to **Debug**) and choose **`step1_checkSetup`**. Click ▶ **Run**.
2. The first time, Google asks for permission:
   **Review permissions** → choose your account → if you see *"Google hasn't verified this app"*, click **Advanced** →
   **Go to Digital Saathi classrooms (unsafe)** → read the list (it should only mention Google Classroom) → **Allow**.
3. The **Execution log** opens at the bottom. You should see:
   ```
   ✅ The Classroom API answered. This account teaches or owns 0 class(es).
   The six Digital Saathi classrooms:
      01 Digital Saathi – Smartphone Basics → not created yet
      …
   Nothing was created or changed. Next: run step2a_previewClassrooms.
   ```
   If a red error appears instead, see Part H.

---

## Part C: Preview, then create the six classrooms

**C1. Preview (read-only).** Choose **`step2a_previewClassrooms`** → ▶ **Run**. The log shows, for each class, whether it
**WILL CREATE** or **WILL SKIP** (already exists), with its section, room, heading and planned topics. Nothing is created.

**C2. Create.** ⚠️ **This step creates classes in your Google account.** Run it only when the preview looks right.
Choose **`step2b_createClassrooms`** → ▶ **Run**. Expected log:
```
✅ Created Digital Saathi – Smartphone Basics  [PROVISIONED]  id 123456789012
…
Summary: 6 created, 0 already existed, 0 failed.
NEXT (by hand): open https://classroom.google.com — each new class shows an "Accept" button.
```
After each class is created, the script asks Google for it again (`courses.get`) to verify that it really exists.

**Duplicate protection:** before creating anything, the script lists all your classes and skips any class with the same
name (it ignores capital letters, extra spaces and the kind of dash). Running this step again creates nothing new.
A class you *declined* is ignored, so it would be created again.

---

## Part D: Accept the classrooms (by hand, about 2 minutes)

This is the step Google requires a person to do for personal accounts.

1. Open **https://classroom.google.com** (same account). The six new classes appear as cards.
2. On each Digital Saathi card, click **Accept**. (If you see *Decline*, don't click it. If you decline one by mistake,
   just run `step2b_createClassrooms` again to make it anew.)
3. Back in Apps Script, run **`step3_checkStatus`**. Each class should now say **State: ACTIVE**, with a link and a class
   code. The last line should say **6 of 6 classrooms are ACTIVE**.

**Optional, instead of clicking Accept:** run **`step3b_activateWithApi`**. It asks Google to switch each PROVISIONED class
to ACTIVE through the API and checks the result. If Google refuses (likely for a personal account), the log says so
clearly; then accept the classes by hand as above.

---

## Part E: Add the topics, lessons and activities

1. Choose **`step4_addLessons`** → ▶ **Run**. For each ACTIVE class the log shows `+ topic: …`, `+ material: …` and
   `+ activity: …`, then `Done: 17 added, 0 already there.` (the number depends on the class).
2. Classes that are not ACTIVE yet are skipped with a message. Accept them (Part D) and run this again.
3. If the log says **Stopped safely** or **post(s) could not be added**, just run `step4_addLessons` again. It only adds
   what is missing.

Classroom shows the newest topic and post at the top, so the script creates them last-to-first. Learners then see
*Start here* first and the lessons in order. If the order ever looks different, drag a topic or post to move it in the
Classwork page (or ⋮ → *Move up* / *Move down*).

Posts are **published** straight away. Nobody sees them until learners join. To create them as drafts instead,
change `POST_STATE: "PUBLISHED"` to `POST_STATE: "DRAFT"` in `SETTINGS` at the top of the script before running Part E.

---

## Part F: Save the classroom information

**F1. Export.** Choose **`step5_exportClassroomInfo`** → ▶ **Run**. The log prints a block between
`COPY FROM HERE` and `COPY TO HERE`. It looks like this:
```json
{
  "about": "Digital Saathi Google Classrooms — one per learning step. …",
  "exportedAt": "2026-11-10T10:00:00.000Z",
  "classrooms": {
    "phone": {
      "step": 1,
      "websiteStep": "Smartphone Basics",
      "name": "Digital Saathi – Smartphone Basics",
      "courseId": "123456789012",
      "url": "https://classroom.google.com/c/…",
      "enrollmentCode": "abc1234",
      "state": "ACTIVE",
      "inviteLink": null
    },
    "google": { … }, "family": { … }, "safety": { … }, "money": { … }, "ai": { … }
  }
}
```
**F2. Save it.** Either paste the block to Claude in the chat (Claude will check it and save it), or open
`classrooms.json` in this folder, replace everything with the block, and save.

**F3. Invite links (by hand).** The Classroom API doesn't give the "invite link". For each class, open it in Classroom →
⚙️ **Settings** (or the class card's ⋮) → **Copy class invite link**, and paste it as `"inviteLink"` for that class in
`classrooms.json`.

**What each field is**

| Field | Meaning | Who may see it |
|---|---|---|
| `courseId` | Google's ID of the class | Fine to keep in the project |
| `url` | Link to the class (`alternateLink`). Works for the teacher and for learners who have joined | Fine to share |
| `enrollmentCode` | The class code learners type to join | Share only where you want people to join |
| `inviteLink` | One-click join link | Share only where you want people to join |
| `state` | `ACTIVE`, `PROVISIONED`, `NOT_CREATED`, … | Fine |

**Security:** `classrooms.json` contains **no passwords, tokens or keys**. Google keeps the sign-in token for the
script on its own servers. Never paste anything from the Apps Script **Project Settings** page (such as the project
number) or any `credentials.json` / `token.json` into the website. The `.gitignore` in this folder blocks such files
if one is ever added.

---

## Part G: Check that everything worked

**Through Google's API:** run **`step3_checkStatus`**. For each class it asks Google for the state, link and class code,
and counts the topics, materials and activities. Compare with the plan:

| Classroom | Topics | Materials | Activities |
|---|---|---|---|
| Smartphone Basics | 6 | 9 | 2 |
| Google, Gmail & YouTube | 6 | 9 | 2 |
| Communication with Family & Friends | 6 | 9 | 2 |
| Stay Safe Online | 6 | 11 | 2 |
| Digital Payments & Government Services | 6 | 11 | 2 |
| AI Tools & Family Digital Safety | 6 | 10 | 2 |

(Materials = 2 in *Start here* + the lessons + 1 in *Check your skills*.)

**In the Classroom website:**
- [ ] All six classes are on the home page, with the right names and sections.
- [ ] Each class's **Classwork** page shows Start here → Lesson 1 → Lesson 2 → Lesson 3 → Practical activities → Check your skills.
- [ ] Open one lesson post: How to do it, Try it now, suggested video and PDF, Hindi and Marathi titles.
- [ ] The Pre-Assessment and Post-Assessment links open the right forms.
- [ ] Optional: join one class with a second Gmail account (using the class code) to see it as a learner.

---

## Part H: If something goes wrong

| Message in the log | What it means | What to do |
|---|---|---|
| *The Google Classroom service is not switched on in this project* | Part A3 wasn't finished | Add the **Google Classroom API** service (Part A3, step 4) and save |
| *Classroom API has not been used in project … or it is disabled* | Google hasn't switched the API on yet | Wait 2 minutes and run again. If it continues, remove the Classroom service, add it again, save, run again |
| *PERMISSION_DENIED* (403) when creating | The account can't create classes yet | Do Part A1 (open Classroom, accept the terms, choose teacher), then run again. A school or work account may be blocked by its admin; use a personal @gmail.com |
| *PERMISSION_DENIED … ACTIVE* | Personal accounts can't make ACTIVE classes through the API | Expected. Accept the classes by hand (Part D) |
| *UserCannotOwnCourse* | This account can't own classes | Use a personal @gmail.com account that has opened Classroom |
| *Authorization is required* / *insufficient scopes* | Permission was not given, or was removed | Run again and click **Review permissions → Allow** |
| *RESOURCE_EXHAUSTED*, *quota*, *rate* (429) | Google's limit for now | Wait 10 minutes and run the same step again |
| *Exceeded maximum execution time* | A run took over 6 minutes | Run the same step again; it continues where it stopped |
| `step4_addLessons` says a class is *PROVISIONED* | Not accepted yet | Part D |
| *2 classes are called "…"* | A duplicate exists (for example made by hand) | The script uses the ACTIVE one. Archive the extra one in Classroom (⋮ → Archive) |
| *ProjectPermissionDenied* | The post was made by a different script project | Edit or delete it in the Classroom website |

If you see anything else, copy the red message and the log and share them with Claude.

---

## Part I: Changing things later

- **Edit text:** change a post or the class details directly in the Classroom website. (The script won't overwrite
  anything; it only adds what is missing, matched by title.)
- **Attach real videos or PDFs:** open a lesson post → *Edit* → *Add* → YouTube / Drive / Link. Use only videos and files
  the team has checked.
- **Change the content for future runs:** the data at the bottom of `classroom-setup.gs` (`CLASSROOMS`) is generated from
  the website's lessons. Ask Claude to regenerate it if the website's lessons change.
- **Undo:** the script never deletes anything. To remove a class, archive it in Classroom (class card ⋮ → *Archive*),
  then delete it from *Archived classes* if you wish.

---

## Part J: Later, linking the website to the classrooms (not done yet)

The website was **not** changed. `classrooms.json` is ready for it:

- Its keys (`phone`, `google`, `family`, `safety`, `money`, `ai`) are exactly the website's step ids (`LESSONS` in
  `index.html`), in the same order as the six step tabs.
- When you are ready, the **"See how to do each one"** button of each step can open `inviteLink` (best for new learners:
  one click to join) or, if that is empty, `url`. The class code can be shown next to it for learners who prefer to type it.
- Only classes with `"state": "ACTIVE"` should be linked.
- Only public values (links and class codes) would be copied into the website; nothing secret exists.

Ask Claude when you want this done; it is a small change to the step panel.
