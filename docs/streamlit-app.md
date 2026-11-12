# Running the Python version (app.py) + viva notes

You now have **two versions** of Digital Saathi:

| File | Language | How to run | Best for |
|---|---|---|---|
| `index.html` | HTML + JavaScript | Double-click it | **Guaranteed demo** — runs offline, nothing to install |
| `app.py` | Python + Streamlit | `streamlit run app.py` | **Showing code** in the viva; aligns with AI-engineer path |

**Plan: demo with `index.html` (it can't fail), and open `app.py` when the examiner says "show me your code."** Keep both ready.

> Accounts, lesson tracking, the certificate and analytics exist **only in `app.py`**. To demo those, run the Python version.

## One-time setup (do this well before the viva)
1. Install **Python 3** from <https://python.org> — tick **"Add Python to PATH"** during install.
2. Open a terminal **in this folder** and install the libraries:
   ```
   pip install -r requirements.txt
   ```
3. Start the app:
   ```
   streamlit run app.py
   ```
   It opens in your browser at `http://localhost:8501`.
4. For the AI answer: open the sidebar, pick **AI** mode, paste a free key from
   <https://aistudio.google.com/apikey>. Leave it on **Offline** for a no-internet demo.

> Practise the `streamlit run app.py` command a few times so it's second nature on the day.

## What to say the code does (point to these in app.py)
- **Dictionaries** `UI`, `LESSONS`, `QUIZ`, `ANSWERS` — store all the content, one key per language.
- **`grade_quiz()`** — a `for` loop with an `if` condition counts correct answers (same logic as C).
- **`offline_answer()`** — loops over keywords and returns the matching answer; works with no internet.
- **`ai_answer()`** — builds a prompt and calls the Gemini model with `requests.post()` (this is "using an API").
- **The interface section** — Streamlit draws the page top-to-bottom; `st.radio`, `st.button`, `st.text_area` make the controls.
- **`SCHEMA`** — the database tables. Each one exists to answer an analytics question (see the comment above it).
- **`register_user()` / `login_user()`** — `hash_password()` scrambles the password with a random salt, so the real password is never stored.
- **`save_quiz_attempt()`** — saves the score and every answer, and issues the certificate on the first pass.
- **`certificate_body()`** — builds the certificate as HTML; `html.escape()` stops a name from injecting code into it.
- **The Analytics section** — SQL `COUNT` and `GROUP BY` queries turned into charts and CSV downloads.

## How the course works
Register → finish all 4 lessons → the quiz unlocks → score at least 70% (5 of 6) → certificate → download it and print as PDF.

- All data is saved in **`saathi.db`**, created next to `app.py` the first time the app runs.
- **The admin** is the only account that sees Analytics. Its username and password are in `.streamlit/secrets.toml`, which is never uploaded to GitHub. Restart the app after changing that file.
- **Forgotten passwords:** the admin creates a temporary password at the bottom of Analytics, and the learner changes it under My Profile.
- **Wrong passwords:** 5 wrong tries lock that username for 15 minutes.
- To start again with empty data, stop the app and delete `saathi.db`. This erases every learner account; the admin account is created again at the next start.
- To change the pass mark, edit `PASS_PERCENT` at the top of `app.py`.

## Before hosting it publicly
1. Put the code on GitHub. Check that `saathi.db` and `secrets.toml` are **not** in the upload.
2. On Streamlit Community Cloud, paste `SAATHI_ADMIN_USERNAME` and `SAATHI_ADMIN_PASSWORD` into the app's Secrets box, using a new strong password.
3. Move the data to a hosted database first, because `saathi.db` can be wiped when a hosted app restarts.

## Likely viva questions this version answers well
- *"Is this real programming?"* → Yes: variables, dictionaries, functions, loops, conditions, and an API call — show `grade_quiz()`.
- *"Which language and why?"* → Python, because it's the language used for AI work, and Streamlit builds a web app from one file.
- *"What if there's no internet?"* → Offline mode uses the built-in answer bank (`offline_answer`).
- *"Change something and run it."* → Add a quiz question to the `QUIZ` dictionary, save, and Streamlit reloads.
- *"How does the AI work?"* → `ai_answer()` sends my question in a prompt to Gemini and shows the reply.
- *"Where is the data stored?"* → In a SQLite database, one file that Python can use without installing a database server.
- *"Are the passwords safe?"* → Only a salted hash is stored (PBKDF2), so even I can't read them. Show the `users` table.
- *"Why are the quiz options in a different order for each user?"* → All the correct answers are stored as the second option, so `shuffled_options()` stops people passing by always picking the same position.
- *"How do you stop password guessing?"* → `is_locked_out()` counts recent failures in the `login_failures` table and blocks that username for 15 minutes after 5.
- *"Where is the admin password?"* → In a private settings file that isn't uploaded with the code, read by `get_setting()`.
- *"What is SQL injection, and are you safe from it?"* → Attackers type SQL into a form. My queries use `?` placeholders, so user input is always treated as data.

## Honesty rule
Only show the version you can **explain**. If you're more comfortable with the JavaScript one, demo and explain that — the examiner marks your understanding, not the language.
