<div align="center">

# Digital Saathi

**Go digital. Stay safe. With a Saathi.**

A free, student-led community initiative that teaches everyday digital skills to senior citizens and first-time smartphone users, in **English, हिंदी and मराठी**.

![HTML5](https://img.shields.io/badge/HTML5-static%20site-e34f26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-design%20tokens-1572b6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-f7df1e?logo=javascript&logoColor=black)
![Languages](https://img.shields.io/badge/languages-EN%20%7C%20HI%20%7C%20MR-2c5841)
![Build](https://img.shields.io/badge/build%20step-none-lightgrey)

</div>

> **Nirman Lab-I project · Semester 1**
> Theme: *Digital Bharat for Inclusive Learning* · Problem statement #2: **Community Digital Literacy & Skills**
> Built by Atharva, First Year Computer Engineering, Terna.

---

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [Objectives](#-objectives)
3. [Target Audience](#-target-audience)
4. [Key Features](#-key-features)
5. [Learning Path](#-learning-path)
6. [Website Structure](#-website-structure)
7. [Quizzes & Assessment](#-quizzes--assessment)
8. [Certificate Section](#-certificate-section)
9. [Services](#-services)
10. [Technology Stack](#-technology-stack)
11. [Project Folder Structure](#-project-folder-structure)
12. [Installation & Setup](#-installation--setup)
13. [Configuration](#-configuration)
14. [Optional Python (Streamlit) Version](#-optional-python-streamlit-version)
15. [Current Status & Limitations](#-current-status--limitations)
16. [Future Scope](#-future-scope)

---

## 🌱 Project Overview

**Digital Saathi** (*saathi* means "companion") is a free learning website and community programme. Many people can use a phone for calls, but are afraid of UPI, email, online forms and scams. That fear keeps them away from digital services such as bill payments, pensions and health schemes.

Digital Saathi addresses this with:

- a **six-step learning path** (plus an optional "Step 00" setup guide) written in plain everyday words,
- **read-aloud** support, large-text and dark modes for people who find screens hard to read,
- everything available in **three languages**: English, हिंदी (Hindi) and मराठी (Marathi),
- a **Pre-Assessment** and **Post-Assessment** quiz (on Google Forms) so learners can see their own progress,
- **Google Classrooms** and **story-based lessons** that volunteers use to support learners.

The website is the front door: it explains what learners will be able to do, lets them read or listen to each lesson, and links them to the quizzes, classrooms and contact options.

**Vision:** the learner should say, *"I can do it myself."*
The three ideas shown on the site are **Confidence** (no fear of the phone), **Independence** (do it yourself) and **Curiosity** (keep learning).

---

## 🎯 Objectives

- Teach practical, everyday digital skills in simple steps, with no exams and no pressure.
- Help learners **stay safe** from common scams (fake police calls, fake KYC messages, OTP fraud).
- Help learners use **UPI payments** and **government services** (life certificate, Ayushman card, DigiLocker) on their own.
- Keep families connected through video calls, live-location sharing and safe use of WhatsApp.
- Introduce **AI tools** (Gemini, ChatGPT) and **family digital safety** (Family Link, privacy, spotting fakes).
- Remove language barriers by offering all content in English, Hindi and Marathi.
- Let learners measure their progress with a before-and-after quiz and earn a free certificate.

---

## 👥 Target Audience

| Group | Why Digital Saathi helps |
|---|---|
| **Senior citizens** | Learn at their own pace, with large text and read-aloud support. |
| **Housewives / homemakers** | Gain independence with payments, bills, safety and family communication. |
| **Children (8 to 14, as listed in the Pre-Assessment form)** | Learn safe screen habits, safe gaming and privacy. |
| **Non-tech workers and first-time smartphone users** | Practical skills for daily life and public digital services. |

Volunteers ("Saathis") sit beside learners during hands-on practice.

---

## ✨ Key Features

All of the following exist in the current code (`index.html`, `assets/js/main.js`, `assets/css/styles.css`).

| Feature | What it does |
|---|---|
| 🌐 **Three languages** | Every label, lesson and quiz is available in English, हिंदी and मराठी. Switch with the language buttons in the sidebar or top bar. The choice is remembered on that device. |
| 🔊 **Listen (read-aloud)** | Each learning step has a **Listen** button that reads it aloud using the browser's built-in text-to-speech (`en-IN`, `hi-IN`, `mr-IN`). Voice availability depends on the visitor's browser and device. |
| 🔠 **Text size control** | Three sizes: **A**, **A+**, **A++**. Remembered on that device. |
| 🌗 **Light / Dark mode** | Follows the device setting until the visitor chooses. Colours change smoothly, and printing always uses light colours. |
| 🧭 **Step explorer** | Six learning steps, each showing its skills with simple step-by-step instructions. Previous / Next lesson buttons move between them. |
| 🚀 **"Get Saathi-ready" guide (Step 00)** | A pop-up guide with six points (create a Gmail account, sign in and out safely, Gmail basics, join a Google Classroom, open and fill a Google Form, see and submit assignments). Done once, before Step 01. |
| 🏫 **Google Classroom buttons** | "Open class in Google Classroom" opens the class for that step **in the visitor's language** (see [Services](#-services)). |
| 📝 **Quizzes page** | A separate page with the Pre-Assessment and Post-Assessment, each opening a Google Form in a new tab. |
| 🎓 **Certificate section** | Explains the four requirements for the free Certificate of Completion. |
| 🛡️ **Pocket safety card** | Five golden rules that can be **printed** with the *Print this card* button. |
| 🌟 **"Saathi Wins" section** | Shows the five-stage learning journey and what learners gain. Numbers shown (steps, quiz questions, languages) are counted from the content, not typed in. |
| 📞 **Contact section** | WhatsApp and email buttons (configured in `main.js`), safety reminder, and a **"Coming to a virtual workshop?"** card marked *Coming soon*. |
| 📱 **Responsive layout** | Sidebar menu on large screens; a **Menu** button and top bar on phones and tablets. Respects reduced-motion settings. |
| ♿ **Accessibility touches** | Skip-to-content link, ARIA labels, live announcements, keyboard-friendly dialogs. |
| 📴 **No server, no login** | Static site. No sign-up, no database, no AI service connected. |

---

## 🗺️ Learning Path

The learning path has an optional **Step 00** followed by **six steps**. Each step in the website lists the skills below (point counts: 6, 6, 6, 8, 8, 7).

### Step 00 · Get Saathi-ready *(before you begin)*

Create a Gmail account, sign in and out safely, learn the Gmail basics, join a Google Classroom with a class code, open and fill a Google Form, and see and submit assignments in Classroom.

### Step 01 · Smartphone Basics
1. Send an SOS in one press and show emergency contacts on the lock screen
2. Make text bigger and let the phone read it aloud
3. Turn the camera into a document scanner
4. Lock the phone to one app before handing it to a child
5. Set medicine and bill reminders by speaking
6. Make the battery last the whole day

### Step 02 · Google, Gmail & YouTube
1. Use the camera (Google Lens) to translate, identify or copy text
2. Find the nearest hospital, pharmacy or bus route
3. Make YouTube safe for children
4. Never get locked out of the Google account
5. Create a Gmail account and use Google Forms and Classroom
6. Ask Google questions by voice in your own language

### Step 03 · Communication with Family & Friends
1. Share live location until reaching home
2. Back up WhatsApp chats and photos
3. Mute noisy groups and stop strangers adding you to groups
4. Silence calls from unknown numbers on WhatsApp
5. Share your screen on a video call to get help
6. Join a class or meeting with just a link

### Step 04 · Stay Safe Online
1. The "digital arrest" scam
2. Spot fake KYC, electricity-bill and parcel messages
3. Set a family code word against fake voice calls
4. Install apps only from the official store
5. Create strong, memorable passwords
6. Two-step verification for WhatsApp and Gmail
7. Say no to strangers in games and chats
8. Lost money? Call **1930** within the first hour

### Step 05 · Digital Payments & Government Services
1. Check the receiver's name before paying by QR
2. You never need a PIN to receive money
3. Small payments with UPI Lite
4. Autopay for electricity, gas and mobile bills
5. UPI Circle: let family pay from your UPI with a limit
6. Submit the pension life certificate from home
7. Free treatment cover with the Ayushman card (age 70+)
8. Keep Aadhaar, PAN and certificates safe in DigiLocker

### Step 06 · AI Tools & Family Digital Safety
1. Talk to AI in Hindi or Marathi by voice
2. Set up Family Link to guide a child's phone
3. Use AI as a tutor, not a cheat sheet
4. Never share private details with AI chatbots
5. Spot fake AI photos, videos and news forwards
6. Plan meals with what is in the kitchen
7. Smartwatches for child safety and location tracking

> Lesson content comes from the approved reference document [`docs/reference/Steps Digital Saathi.pdf`](docs/reference/Steps%20Digital%20Saathi.pdf). Menu paths are given mostly for Android; iPhone equivalents are mentioned where relevant.

### The "Your Saathi Journey" (how a learner moves through the programme)

1. **Get Saathi-ready** (Step 00)
2. **Check where you stand** (Pre-Assessment)
3. **Learn step by step** (six modules, in order)
4. **Practise on your own phone** (with a Saathi beside you)
5. **See how far you've come** (Post-Assessment)
6. **Earn your certificate**

---

## 🧱 Website Structure

The site is **one long page** plus a separate **Quizzes page**, both inside `index.html`.

| Section | Menu label | Purpose |
|---|---|---|
| Hero (`#home`) | (logo) | Headline "Go digital. Stay safe. With a Saathi.", a sample lesson preview, and a *Start learning* button. Quick facts: always free, 3 languages, works offline, read-aloud lessons, no app to install. |
| About (`#about`) | 👋 About | Meaning of *Saathi*, Confidence / Independence / Curiosity, and who it is for (senior citizens, housewives, children). |
| Your Saathi Journey (`#how`) | 👣 Your journey | The steps from Get Saathi-ready to the certificate. |
| Learn (`#learn`) | 📚 Learn | Step explorer with Listen buttons, the Google Classroom button, and the printable Pocket safety card. |
| Quizzes (`#quizzes`, `#pre-quiz`, `#post-quiz`) | 📝 Quizzes | Separate page with the Pre- and Post-Assessment. Has a *Back to home* link. |
| Certificate (`#certificate`) | 🎓 Certificate | How to earn the certificate, and a sample certificate preview. |
| Saathi Wins (`#impact`) | 🌟 Saathi Wins | The five-stage journey and what learners gain. |
| Contact (`#contact`) | 🙏 Contact | WhatsApp, email, safety reminder, virtual-workshop card. |
| Footer | | Links, the cyber fraud helpline **1930**, **cybercrime.gov.in**, and a reminder that Digital Saathi never asks for OTP or PIN. |

---

## 📝 Quizzes & Assessment

Both quizzes are **Google Forms**. The website does not show the forms inside the page. Each has a large button that opens the form **in a new tab, in the visitor's language** (a language with no form link falls back to English).

| | Pre-Assessment | Post-Assessment |
|---|---|---|
| **When** | Before learning | After finishing all six modules |
| **Questions** | 11 | 20 |
| **Pass / fail** | None. It shows where to start. | **14 of 20 (70%)** to qualify for the certificate |
| **Structure** | One page per learning module; a welcome page asks first name (optional), "I am…" and smartphone comfort (1 to 5) | One page per learning step (3 + 3 + 3 + 4 + 4 + 3 questions), 4 answer choices each |
| **Answer choices** | 3 options plus "I am not sure" | 4 options |
| **Scoring** | Automatic, 1 point per question, with feedback | Automatic, 1 point per question, with feedback |
| **Retakes** | n/a | Free |

- **Comparison:** 8 Post-Assessment questions re-test Pre-Assessment concepts in simpler words, so learners can compare percentages (for example 45% to 79%).
- **Google Forms integration:** the forms are created by Google Apps Script files in [`integrations/google-forms/`](integrations/google-forms/). Paste each form's share link into `PRE_FORM` / `POST_FORM` in `assets/js/main.js`. Responses go to the Digital Saathi team through Google Forms; the website itself stores nothing.
- The site also holds the same questions in `QUIZ` (11) and `POST_QUIZ` (20) in `main.js`. The "14 of 20" shown on the page is counted from `POST_QUIZ`.

Step-by-step guides: [`GOOGLE-FORM-GUIDE.md`](integrations/google-forms/GOOGLE-FORM-GUIDE.md) (Pre) and [`POST-FORM-GUIDE.md`](integrations/google-forms/POST-FORM-GUIDE.md) (Post).

---

## 🎓 Certificate Section

The website **describes** the certificate and shows a **sample** preview ("Certificate of Completion… awarded to *Your name here*"). It does **not** generate or download certificates.

To earn the free **Digital Saathi Certificate of Completion**, a learner must:

1. Finish all six learning modules.
2. Do the hands-on practice on their own phone with a Saathi.
3. Score **14 out of 20 (70%) or more** in the Post-Assessment Quiz (retakes are free).
4. Show the result to a Digital Saathi volunteer. After checking it, the team sends the certificate later.

Certificates are free. The team never asks for money, OTP or bank details for a certificate.

> The optional Python version ([see below](#-optional-python-streamlit-version)) has its own separate, printable certificate for its own quiz. It is not connected to the website.

---

## 🤝 Services

| Service | What it provides |
|---|---|
| **Learning website** | Free lessons in English, Hindi and Marathi, with read-aloud, text-size and dark-mode support. |
| **Google Classroom** | 21 classes: Step 00 plus Steps 01 to 06 in each of 3 languages (3 Step 00 classes + 18 step classes). Each class has a *Start here* welcome, story lessons, practical activities and "Mark as done" progress check-ins. Created by Apps Script in [`integrations/google-classroom/`](integrations/google-classroom/). |
| **Story-based lessons** | 47 short story pages per language (141 in total) in [`content/lessons/`](content/lessons/). Each has a real-life story, a *what if?*, set-up steps, an activity with a badge, benefits and a reflection question. Step 01 also has six longer English "full lessons". |
| **Assessments** | Pre- and Post-Assessment quizzes on Google Forms. |
| **Printable safety card** | Five golden rules to keep near the phone. |
| **Volunteer support (Saathis)** | Hands-on practice beside a volunteer, and WhatsApp / email help. |
| **Virtual workshops** | Shown on the site as **Coming soon**. Dates and joining links are not published yet. |

> Note: the story-lesson Markdown files are separate documents. They are **not** linked from the website pages; they are used as Classroom content. Hindi and Marathi story text was written by Claude and has not yet been checked by a native speaker (see [`content/lessons/README.md`](content/lessons/README.md)).

---

## 🛠️ Technology Stack

**Website (main project)**

| Layer | Technology |
|---|---|
| Structure | HTML5 (`index.html`), semantic sections, inline SVG icons |
| Styling | CSS3 with custom properties ("design tokens"), light/dark themes via `data-theme` |
| Logic | Vanilla JavaScript (no framework, no build tool, no npm) |
| Browser APIs | Web Speech API (`speechSynthesis`), `localStorage` (language, text size, theme), `<dialog>`, `matchMedia`, `window.print()` |
| Fonts | Google Fonts (Cormorant Garamond, Manrope, Mukta, IBM Plex Mono, Tiro Devanagari Hindi/Marathi). Falls back to system fonts offline. |
| External services | Google Forms (quizzes), Google Classroom (classes), WhatsApp / email links (contact) |

**Integrations (setup scripts)**

| Tool | Use |
|---|---|
| Google Apps Script (`.gs`) | Builds the Google Forms and Google Classrooms |
| Google Classroom API | Creates classes, topics, posts and check-ins |

**Optional Python version**

| Tool | Use |
|---|---|
| Python 3, [Streamlit](https://streamlit.io) | Web interface |
| SQLite (`sqlite3`) | Local database for accounts and progress |
| `pandas`, `requests` | Analytics tables; optional Gemini API call |
| `hashlib` (PBKDF2) | Salted password hashing |

---

## 📁 Project Folder Structure

```text
digital-saathi-vscode/
├── index.html                      # Website entry point (open this)
├── README.md                       # This file
├── .gitignore                      # Ignores databases, CSVs, secrets, virtual envs
│
├── assets/
│   ├── css/styles.css              # All styling: tokens, light/dark, layout, print
│   └── js/main.js                  # Trilingual content + logic (quizzes, Listen, theme, links)
│
├── content/
│   └── lessons/                    # Story-based lessons (separate from the website pages)
│       ├── README.md               # Index of all lessons, badges and quality notes
│       ├── english/                # step-00 … step-06 (+ step-01/full-lessons)
│       ├── hindi/                  # step-00 … step-06
│       └── marathi/                # step-00 … step-06
│
├── integrations/
│   ├── google-forms/               # Pre/Post-Assessment form builders + guides
│   │   ├── pre-assessment-form.gs
│   │   ├── post-assessment-form.gs
│   │   ├── GOOGLE-FORM-GUIDE.md
│   │   └── POST-FORM-GUIDE.md
│   └── google-classroom/           # Classroom builders, data, guides
│       ├── classroom-setup.gs      # Creates the six step classes + topics
│       ├── language-classes*.gs    # Hindi and Marathi classes
│       ├── step00-classes*.gs      # Step 00 classes (3 languages)
│       ├── story-lessons*.gs       # Adds story lessons as Classroom posts
│       ├── progress-checkins.gs    # "Mark as done" check-ins
│       ├── cleanup-old-lessons.gs, fix-form-links.gs   # One-time maintenance scripts
│       ├── appsscript.json         # Apps Script manifest (Classroom API + scopes)
│       ├── classrooms.json         # Exported English class IDs, links, codes
│       ├── CLASSROOM-GUIDE.md, CLASSROOM-CONTENT.md
│
├── streamlit-app/                  # Optional Python version
│   ├── app.py
│   ├── requirements.txt
│   └── .streamlit/                 # config.toml, secrets.toml (git-ignored)
│
└── docs/
    ├── streamlit-app.md            # How to run the Python version + viva notes
    └── reference/Steps Digital Saathi.pdf   # Approved source document for the lessons
```

| Important file | Role |
|---|---|
| `index.html` | Page structure and one `<section>` per part of the site. |
| `assets/js/main.js` | `UI` (all labels, 3 languages), `LESSONS`, `QUIZ`, `POST_QUIZ`, `PREREQ` (Step 00 guide), plus `CONTACT`, `CLASSROOM`, `PRE_FORM`, `POST_FORM` settings and all behaviour. |
| `assets/css/styles.css` | Design tokens, dark mode, responsive layout, print styles. |
| `integrations/` | Scripts to be pasted into Google Apps Script. They are not run by the website. |

---

## 🚀 Installation & Setup

### Requirements
- Any modern web browser (Chrome, Edge, Firefox, Safari).
- Internet is only needed for Google Fonts, the quizzes and the Classroom links.
- **No** Node.js, npm, Python or build step is needed for the website.

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/AtharvaKhedekar2/digital-saathi-vscode.git
   cd digital-saathi-vscode
   ```
2. **Open the website** by double-clicking `index.html`, or from a terminal:
   ```bash
   # Windows
   start index.html
   # macOS
   open index.html
   # Linux
   xdg-open index.html
   ```
3. *(Optional)* **Serve it locally** if you prefer a local server (Python must be installed):
   ```bash
   python -m http.server 8000
   # then visit http://localhost:8000
   ```
   This is not required; the site works directly from the folder.

There are no dependencies to install and no environment variables for the website.

---

## ⚙️ Configuration

Edit the settings blocks near the top of the "app logic" part of [`assets/js/main.js`](assets/js/main.js) (search for the names below):

| Setting | What to put there |
|---|---|
| `CONTACT` | `whatsapp` (country code plus digits, no `+`) and `email`. While a value is empty, the Contact section shows "Coming soon". |
| `CLASSROOM` | Google Classroom class links, one per step, for each language (`en`, `hi`, `mr`). A language with no link shows no button. |
| `PRE_FORM` | Share links of the Pre-Assessment Google Forms (`en`, `hi`, `mr`). |
| `POST_FORM` | Share links of the Post-Assessment Google Forms (`en`, `hi`, `mr`). |

**To create the Google Forms or Classrooms yourself** (only if you are setting up your own copy):
1. Sign in at [script.google.com](https://script.google.com) with the Google account that should own them.
2. Paste the `.gs` files from [`integrations/google-forms/`](integrations/google-forms/) or [`integrations/google-classroom/`](integrations/google-classroom/) (and `appsscript.json` for Classroom) into a new Apps Script project.
3. Run the functions in the order given in the guides ([`GOOGLE-FORM-GUIDE.md`](integrations/google-forms/GOOGLE-FORM-GUIDE.md), [`POST-FORM-GUIDE.md`](integrations/google-forms/POST-FORM-GUIDE.md), [`CLASSROOM-GUIDE.md`](integrations/google-classroom/CLASSROOM-GUIDE.md)). Google asks for permission once.
4. Copy the share links into `main.js` as above.

Browser-stored preferences (per device only): `ds_lang`, `ds_size`, `ds_theme`.

---

## 🐍 Optional Python (Streamlit) Version

[`streamlit-app/app.py`](streamlit-app/app.py) is a **separate, standalone** Python version created for demonstrating the code. It is **not** the website and has its own, smaller content (4 short lessons and a 6-question quiz with a 70% pass mark). It adds features the static website does not have:

- User registration and login (salted PBKDF2 password hashing, lock-out after 5 wrong tries for 15 minutes)
- Lesson completion tracking and a quiz that unlocks after the lessons
- A printable course certificate
- "Ask Saathi": an offline keyword answer bank, with an optional Gemini AI mode (the user pastes their own API key in the sidebar)
- An admin-only Analytics page with charts and CSV export
- Data stored in a local SQLite file (`saathi.db`, git-ignored)

**Run it:**
```bash
cd streamlit-app
pip install -r requirements.txt     # streamlit, requests, pandas
streamlit run app.py                # opens http://localhost:8501
```

**Configuration:** create `streamlit-app/.streamlit/secrets.toml` (git-ignored; keep it private) to enable the admin account:
```toml
SAATHI_ADMIN_USERNAME = "your-admin-username"
SAATHI_ADMIN_PASSWORD = "a-strong-password"
```
Optional environment variable: `SAATHI_DB` (path of the SQLite file). Full notes: [`docs/streamlit-app.md`](docs/streamlit-app.md).

> Before hosting it publicly, move the data to a hosted database; a local `saathi.db` can be wiped when a hosted app restarts.

---

## ✅ Current Status & Limitations

- The website is **static**: no accounts, no tracking of learner progress, no server, no AI chatbot.
- Quiz answers are collected only by Google Forms; the site never sees scores.
- Certificates are **issued manually** by the team after checking the result; the site does not generate them.
- **Virtual workshops** are marked *Coming soon* on the site.
- Hindi and Marathi story lessons have not yet been reviewed by a native speaker.
- The story-lesson Markdown files are not yet linked from the website itself.
- Text-to-speech depends on the voices installed in the visitor's browser or device.
- The Python version's content is separate from, and smaller than, the website's.

---

## 🔭 Future Scope

These are ideas only. **None of them exist yet.**

- Publish the website (for example GitHub Pages) and add a public link here.
- Link the story lessons from the website, or render them as pages.
- Native-speaker review of the Hindi and Marathi lessons.
- Announce real virtual-workshop dates and joining links.
- Add real workshop numbers and photos (with permission) once available.
- Further lesson topics based on learner feedback (for example Google Maps routes, online forms, train tickets).
- Automatic progress tracking and certificate generation, if a suitable backend is added.
- Unify the Python version's content with the website's.

---

<div align="center">

**Digital Saathi will never ask for your OTP, PIN, password or bank details.**
Cyber fraud helpline: **1930** · Report online: [cybercrime.gov.in](https://cybercrime.gov.in)

*जब जागो तभी सवेरा।* (Whenever you wake up, it's morning.)

</div>
