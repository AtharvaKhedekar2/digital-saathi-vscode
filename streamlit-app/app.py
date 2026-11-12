"""
DIGITAL SAATHI  —  Python / Streamlit version
================================================
Nirman Lab-I project (Problem statement #2: Community Digital Literacy & Skills)
Built by Atharva · First Year Computer Engineering

WHAT THIS IS
------------
The same idea as the web page (index.html), but written in Python using Streamlit.
It has these parts:
  1. Account  — register, log in, and edit a user profile
  2. Lessons  — short, simple lessons on basic digital skills, marked as completed
  3. Quiz     — unlocked after the lessons; passing it earns a certificate
  4. Certificate — a printable course completion certificate to download
  5. Ask Saathi — type a question, get a simple answer (works offline; AI optional)
  6. Analytics — charts and CSV exports of the saved data (admin only)

WHY A PYTHON VERSION
--------------------
Python is the language used for real AI work, and Streamlit lets us build a web app
from one readable file — easy to show and explain in the viva.

HOW TO RUN  (do this setup once, before the viva)
-------------------------------------------------
  1. Install Python 3 from python.org (tick "Add to PATH").
  2. Open a terminal in this folder (streamlit-app) and run:
         pip install -r requirements.txt
  3. Start the app:
         streamlit run app.py
  4. It opens in your browser at http://localhost:8501

CONCEPTS USED (point to these in the viva)
------------------------------------------
  - Variables and dictionaries (dict)  -> storing lessons, quiz, answers
  - Functions (def ...)                -> grade_quiz(), offline_answer(), ai_answer()
  - Loops (for) and conditions (if)    -> scoring the quiz, matching keywords
  - An API call (requests.post)        -> the optional AI answer
  - A database (SQL with sqlite3)      -> saving users, progress, quiz results
  - Password hashing (hashlib)         -> never storing the real password
These are the same ideas as the C course, used in Python.
"""

import hashlib                  # scrambles passwords so the real one is never stored
import hmac                     # compares password hashes safely
import html                     # makes user text safe to place inside the certificate
import os                       # reads the optional SAATHI_DB setting
import random                   # shuffles the quiz options
import secrets                  # creates random salts and certificate IDs
import sqlite3                  # the database: one file, built into Python
from contextlib import contextmanager
from datetime import datetime, timedelta
from pathlib import Path

import pandas as pd             # turns database results into tables for analytics
import streamlit as st          # Streamlit builds the web interface
import requests                 # used to call the AI model over the internet (optional)
from streamlit.errors import StreamlitSecretNotFoundError

DB_FILE = os.environ.get("SAATHI_DB", str(Path(__file__).parent / "saathi.db"))
PASS_PERCENT = 70               # minimum quiz score needed to earn the certificate
MIN_PASSWORD_LENGTH = 8
HASH_ROUNDS = 600_000           # more rounds = slower for anyone guessing passwords
MAX_LOGIN_FAILURES = 5          # wrong passwords allowed before an account is locked...
LOCKOUT_MINUTES = 15            # ...and for how long
# Only learners count in analytics, so the admin's own testing doesn't skew the numbers
LEARNERS = "user_id IN (SELECT id FROM users WHERE is_admin = 0)"
AGE_GROUPS = ["<18", "18-35", "36-60", "60+"]

# =========================================================================
# 1) CONTENT  — stored in dictionaries, one key per language (en / hi / mr)
# =========================================================================

# ---- UI labels (the words shown on screen) ----
UI = {
    "en": {"title": "🤝 Digital Saathi",
           "tagline": "Learn everyday digital skills",
           "nav": "Go to", "home": "Home", "lessons": "Lessons", "quiz": "Quiz", "ask": "Ask Saathi",
           "home_intro": "A friendly helper for learning phones and the internet. Pick a page on the left.",
           "quiz_intro": "Answer all the questions. Score at least {pct}% to earn your certificate.",
           "see_result": "See my result", "your_score": "You got", "learn_next": "Learn these next:",
           "ask_intro": "Type any question about using a phone or the internet.",
           "ask_label": "Your question", "ask_btn": "Ask", "mode": "Answer mode",
           "offline": "Offline (built-in)", "ai": "AI (needs key)",
           "api_key": "Google Gemini API key", "model": "Model",
           "thinking": "Thinking…", "no_answer": "I don't have a built-in answer for that yet. Try the Lessons, or switch on AI mode.",
           "ai_fail": "Could not reach the AI. Check the key and internet, or use Offline mode.",
           "account": "Login / Register", "profile": "My Profile", "certificate": "My Certificate",
           "analytics": "Analytics", "logout": "Log out", "login": "Log in", "register": "Create account",
           "username": "Username", "password": "Password", "new_password": "Password (at least {n} characters)",
           "full_name": "Full name (printed on your certificate)", "age_group": "Age group",
           "gender": "Gender", "location": "Village / City", "save": "Save changes",
           "gender_options": {"female": "Female", "male": "Male", "other": "Other", "unsaid": "Prefer not to say"},
           "err_fields": "Please fill in all the fields.",
           "err_taken": "That username is already taken. Please choose another.",
           "err_password": "Password must have at least {n} characters.",
           "err_login": "Wrong username or password.", "saved": "Your profile is saved.",
           "privacy": "Your profile, lesson progress, quiz answers and questions are saved in the course database to run and improve the course, and the course organiser can see them. Your password is stored only in scrambled (hashed) form.",
           "consent": "I agree to my data being saved and used as described above.",
           "guardian": "If I am under 18: my parent or guardian has agreed to this.",
           "err_consent": "Please tick the agreement to create an account.",
           "err_guardian": "Under 18s need a parent or guardian's agreement. Please tick that box.",
           "err_locked": "Too many wrong passwords. Please try again in {m} minutes.",
           "forgot": "Forgot your password? Ask the course organiser for a temporary one.",
           "change_password": "Change password", "current_password": "Current password",
           "err_current": "Your current password is wrong.", "password_changed": "Your password is changed.",
           "ask_note": "Your question is saved to help improve the lessons. Do not type your PIN, OTP or password here.",
           "welcome": "Welcome,", "progress": "Lessons completed",
           "guest_prompt": "Create a free account to save your progress and earn a certificate.",
           "mark_done": "Mark as completed",
           "quiz_locked": "Finish all the lessons to unlock the quiz. Still to do:",
           "answer_all": "Please answer every question.",
           "passed": "Congratulations, you passed! Your certificate is ready under My Certificate.",
           "failed": "You need {pct}% to pass. Study the lessons below and try again.",
           "next_lessons": "Next step: finish the lessons.", "next_quiz": "Next step: take the quiz.",
           "next_cert": "You have earned your certificate!",
           "no_cert": "No certificate yet. Finish all the lessons and pass the quiz to earn it.",
           "download": "Download certificate",
           "print_tip": "Open the downloaded file in your browser and choose Print, then Save as PDF, to get a PDF copy.",
           "cert_title": "Certificate of Completion", "cert_certifies": "This certifies that",
           "cert_completed": "has successfully completed the course", "cert_course": "Everyday Digital Skills",
           "cert_topics": "Topics covered", "cert_score": "Quiz score", "cert_date": "Date",
           "cert_id": "Certificate ID", "quiz_best": "Best quiz score", "quiz_tries": "Quiz attempts"},
    "hi": {"title": "🤝 डिजिटल साथी",
           "tagline": "रोज़मर्रा के डिजिटल कौशल सीखें",
           "nav": "जाएं", "home": "होम", "lessons": "पाठ", "quiz": "क्विज़", "ask": "साथी से पूछें",
           "home_intro": "फ़ोन और इंटरनेट सीखने के लिए एक आसान साथी। बाईं ओर से कोई पेज चुनें।",
           "quiz_intro": "सभी सवालों के जवाब दें। प्रमाणपत्र पाने के लिए कम से कम {pct}% अंक लाएं।",
           "see_result": "मेरा परिणाम देखें", "your_score": "आपको मिले", "learn_next": "आगे ये सीखें:",
           "ask_intro": "फ़ोन या इंटरनेट के बारे में कोई भी सवाल लिखें।",
           "ask_label": "आपका सवाल", "ask_btn": "पूछें", "mode": "जवाब का तरीका",
           "offline": "ऑफ़लाइन (बिल्ट-इन)", "ai": "AI (key चाहिए)",
           "api_key": "Google Gemini API key", "model": "मॉडल",
           "thinking": "सोच रहा हूँ…", "no_answer": "इसका बना-बनाया जवाब अभी नहीं है। पाठ देखें, या AI मोड चालू करें।",
           "ai_fail": "AI तक नहीं पहुँच सका। key और इंटरनेट जांचें, या ऑफ़लाइन मोड इस्तेमाल करें।",
           "account": "लॉगिन / रजिस्टर", "profile": "मेरी प्रोफ़ाइल", "certificate": "मेरा प्रमाणपत्र",
           "analytics": "विश्लेषण", "logout": "लॉग आउट", "login": "लॉग इन", "register": "खाता बनाएं",
           "username": "यूज़रनेम", "password": "पासवर्ड", "new_password": "पासवर्ड (कम से कम {n} अक्षर)",
           "full_name": "पूरा नाम (प्रमाणपत्र पर छपेगा)", "age_group": "आयु वर्ग",
           "gender": "लिंग", "location": "गांव / शहर", "save": "बदलाव सेव करें",
           "gender_options": {"female": "महिला", "male": "पुरुष", "other": "अन्य", "unsaid": "नहीं बताना चाहते"},
           "err_fields": "कृपया सभी जानकारी भरें।",
           "err_taken": "यह यूज़रनेम पहले से लिया जा चुका है। कृपया दूसरा चुनें।",
           "err_password": "पासवर्ड में कम से कम {n} अक्षर होने चाहिए।",
           "err_login": "यूज़रनेम या पासवर्ड गलत है।", "saved": "आपकी प्रोफ़ाइल सेव हो गई।",
           "privacy": "आपकी प्रोफ़ाइल, पाठों की प्रगति, क्विज़ के जवाब और सवाल कोर्स चलाने और बेहतर बनाने के लिए कोर्स के डेटाबेस में सेव होते हैं, और कोर्स संचालक इन्हें देख सकते हैं। आपका पासवर्ड केवल बदले हुए (hashed) रूप में सेव होता है।",
           "consent": "मैं ऊपर बताए अनुसार अपना डेटा सेव और इस्तेमाल किए जाने से सहमत हूँ।",
           "guardian": "यदि मेरी आयु 18 से कम है: मेरे माता-पिता या अभिभावक इससे सहमत हैं।",
           "err_consent": "खाता बनाने के लिए कृपया सहमति पर टिक करें।",
           "err_guardian": "18 से कम आयु के लिए माता-पिता या अभिभावक की सहमति चाहिए। कृपया उस बॉक्स पर टिक करें।",
           "err_locked": "बहुत बार गलत पासवर्ड डाला गया। कृपया {m} मिनट बाद फिर कोशिश करें।",
           "forgot": "पासवर्ड भूल गए? कोर्स संचालक से अस्थायी पासवर्ड मांगें।",
           "change_password": "पासवर्ड बदलें", "current_password": "मौजूदा पासवर्ड",
           "err_current": "आपका मौजूदा पासवर्ड गलत है।", "password_changed": "आपका पासवर्ड बदल गया।",
           "ask_note": "पाठों को बेहतर बनाने के लिए आपका सवाल सेव होता है। यहां अपना PIN, OTP या पासवर्ड न लिखें।",
           "welcome": "स्वागत है,", "progress": "पूरे हुए पाठ",
           "guest_prompt": "अपनी प्रगति सेव करने और प्रमाणपत्र पाने के लिए मुफ़्त खाता बनाएं।",
           "mark_done": "पूरा हुआ चिह्नित करें",
           "quiz_locked": "क्विज़ खोलने के लिए सभी पाठ पूरे करें। अभी बाकी हैं:",
           "answer_all": "कृपया हर सवाल का जवाब दें।",
           "passed": "बधाई हो, आप पास हो गए! आपका प्रमाणपत्र 'मेरा प्रमाणपत्र' में तैयार है।",
           "failed": "पास होने के लिए {pct}% चाहिए। नीचे दिए पाठ पढ़ें और फिर कोशिश करें।",
           "next_lessons": "अगला कदम: पाठ पूरे करें।", "next_quiz": "अगला कदम: क्विज़ दें।",
           "next_cert": "आपने अपना प्रमाणपत्र पा लिया है!",
           "no_cert": "अभी कोई प्रमाणपत्र नहीं है। इसे पाने के लिए सभी पाठ पूरे करें और क्विज़ पास करें।",
           "download": "प्रमाणपत्र डाउनलोड करें",
           "print_tip": "PDF कॉपी के लिए डाउनलोड की गई फ़ाइल ब्राउज़र में खोलें और Print, फिर Save as PDF चुनें।",
           "cert_title": "पूर्णता प्रमाणपत्र", "cert_certifies": "यह प्रमाणित किया जाता है कि",
           "cert_completed": "ने यह कोर्स सफलतापूर्वक पूरा किया है", "cert_course": "रोज़मर्रा के डिजिटल कौशल",
           "cert_topics": "शामिल विषय", "cert_score": "क्विज़ के अंक", "cert_date": "दिनांक",
           "cert_id": "प्रमाणपत्र क्रमांक", "quiz_best": "क्विज़ के सर्वोत्तम अंक", "quiz_tries": "क्विज़ के प्रयास"},
    "mr": {"title": "🤝 डिजिटल साथी",
           "tagline": "रोजचे डिजिटल कौशल्य शिका",
           "nav": "जा", "home": "होम", "lessons": "धडे", "quiz": "क्विझ", "ask": "साथीला विचारा",
           "home_intro": "फोन आणि इंटरनेट शिकण्यासाठी एक सोपा साथी. डावीकडून एक पेज निवडा.",
           "quiz_intro": "सर्व प्रश्नांची उत्तरे द्या. प्रमाणपत्र मिळवण्यासाठी किमान {pct}% गुण मिळवा.",
           "see_result": "माझा निकाल पाहा", "your_score": "तुम्हाला मिळाले", "learn_next": "पुढे हे शिका:",
           "ask_intro": "फोन किंवा इंटरनेटबद्दल कोणताही प्रश्न लिहा.",
           "ask_label": "तुमचा प्रश्न", "ask_btn": "विचारा", "mode": "उत्तराचा मोड",
           "offline": "ऑफलाइन (बिल्ट-इन)", "ai": "AI (key लागते)",
           "api_key": "Google Gemini API key", "model": "मॉडेल",
           "thinking": "विचार करत आहे…", "no_answer": "याचे तयार उत्तर अजून नाही. धडे पाहा, किंवा AI मोड सुरू करा.",
           "ai_fail": "AI पर्यंत पोहोचता आले नाही. key आणि इंटरनेट तपासा, किंवा ऑफलाइन मोड वापरा.",
           "account": "लॉगिन / नोंदणी", "profile": "माझी प्रोफाइल", "certificate": "माझे प्रमाणपत्र",
           "analytics": "विश्लेषण", "logout": "लॉग आउट", "login": "लॉग इन", "register": "खाते तयार करा",
           "username": "युझरनेम", "password": "पासवर्ड", "new_password": "पासवर्ड (किमान {n} अक्षरे)",
           "full_name": "पूर्ण नाव (प्रमाणपत्रावर छापले जाईल)", "age_group": "वयोगट",
           "gender": "लिंग", "location": "गाव / शहर", "save": "बदल जतन करा",
           "gender_options": {"female": "स्त्री", "male": "पुरुष", "other": "इतर", "unsaid": "सांगू इच्छित नाही"},
           "err_fields": "कृपया सर्व माहिती भरा.",
           "err_taken": "हे युझरनेम आधीच घेतले आहे. कृपया दुसरे निवडा.",
           "err_password": "पासवर्डमध्ये किमान {n} अक्षरे असावीत.",
           "err_login": "युझरनेम किंवा पासवर्ड चुकीचा आहे.", "saved": "तुमची प्रोफाइल जतन झाली.",
           "privacy": "तुमची प्रोफाइल, धड्यांची प्रगती, क्विझची उत्तरे आणि प्रश्न कोर्स चालवण्यासाठी आणि सुधारण्यासाठी कोर्सच्या डेटाबेसमध्ये जतन होतात, आणि कोर्स संचालक ते पाहू शकतात. तुमचा पासवर्ड फक्त बदललेल्या (hashed) स्वरूपात जतन होतो.",
           "consent": "वर सांगितल्याप्रमाणे माझी माहिती जतन करण्यास आणि वापरण्यास मी सहमत आहे.",
           "guardian": "माझे वय 18 पेक्षा कमी असल्यास: माझे पालक किंवा संरक्षक याला सहमत आहेत.",
           "err_consent": "खाते तयार करण्यासाठी कृपया संमतीवर टिक करा.",
           "err_guardian": "18 पेक्षा कमी वयासाठी पालक किंवा संरक्षकांची संमती हवी. कृपया त्या बॉक्सवर टिक करा.",
           "err_locked": "खूप वेळा चुकीचा पासवर्ड टाकला. कृपया {m} मिनिटांनी पुन्हा प्रयत्न करा.",
           "forgot": "पासवर्ड विसरलात? कोर्स संचालकांकडून तात्पुरता पासवर्ड मागा.",
           "change_password": "पासवर्ड बदला", "current_password": "सध्याचा पासवर्ड",
           "err_current": "तुमचा सध्याचा पासवर्ड चुकीचा आहे.", "password_changed": "तुमचा पासवर्ड बदलला.",
           "ask_note": "धडे सुधारण्यासाठी तुमचा प्रश्न जतन होतो. इथे तुमचा PIN, OTP किंवा पासवर्ड लिहू नका.",
           "welcome": "स्वागत आहे,", "progress": "पूर्ण झालेले धडे",
           "guest_prompt": "तुमची प्रगती जतन करण्यासाठी आणि प्रमाणपत्र मिळवण्यासाठी मोफत खाते तयार करा.",
           "mark_done": "पूर्ण झाले म्हणून नोंदवा",
           "quiz_locked": "क्विझ उघडण्यासाठी सर्व धडे पूर्ण करा. अजून बाकी:",
           "answer_all": "कृपया प्रत्येक प्रश्नाचे उत्तर द्या.",
           "passed": "अभिनंदन, तुम्ही उत्तीर्ण झालात! तुमचे प्रमाणपत्र 'माझे प्रमाणपत्र' मध्ये तयार आहे.",
           "failed": "उत्तीर्ण होण्यासाठी {pct}% हवेत. खालील धडे वाचा आणि पुन्हा प्रयत्न करा.",
           "next_lessons": "पुढची पायरी: धडे पूर्ण करा.", "next_quiz": "पुढची पायरी: क्विझ द्या.",
           "next_cert": "तुम्ही तुमचे प्रमाणपत्र मिळवले आहे!",
           "no_cert": "अजून प्रमाणपत्र नाही. ते मिळवण्यासाठी सर्व धडे पूर्ण करा आणि क्विझ उत्तीर्ण व्हा.",
           "download": "प्रमाणपत्र डाउनलोड करा",
           "print_tip": "PDF प्रतीसाठी डाउनलोड केलेली फाइल ब्राउझरमध्ये उघडा आणि Print, मग Save as PDF निवडा.",
           "cert_title": "पूर्णता प्रमाणपत्र", "cert_certifies": "हे प्रमाणित करण्यात येते की",
           "cert_completed": "यांनी हा कोर्स यशस्वीपणे पूर्ण केला आहे", "cert_course": "रोजची डिजिटल कौशल्ये",
           "cert_topics": "समाविष्ट विषय", "cert_score": "क्विझचे गुण", "cert_date": "दिनांक",
           "cert_id": "प्रमाणपत्र क्रमांक", "quiz_best": "क्विझचे सर्वोत्तम गुण", "quiz_tries": "क्विझचे प्रयत्न"},
}

# ---- Lessons: each lesson has an id, a title and a list of steps ----
LESSONS = {
    "en": [
        {"id": "upi", "title": "💸 Pay with UPI safely", "steps": [
            "Open your UPI app and log in with your PIN.",
            "Choose Pay and scan the shop's QR code, or enter the UPI ID.",
            "Check the name and amount on screen carefully before paying.",
            "Enter your UPI PIN to confirm. Never share this PIN.",
            "You never need a PIN to RECEIVE money — if someone asks, it is a scam."]},
        {"id": "scam", "title": "🛡️ Spot a scam message", "steps": [
            "Be careful with messages about prizes or lotteries you never entered.",
            "Never click links asking for bank details, OTP or password.",
            "A real bank never asks for your OTP or PIN by call, SMS or WhatsApp.",
            "If a message creates fear or hurry, slow down — that is a trick.",
            "When unsure, ask a family member or call the bank's official number."]},
        {"id": "email", "title": "✉️ Set up and use email", "steps": [
            "Open the Gmail app or gmail.com in a browser.",
            "Tap Create account and fill your name, username and a strong password.",
            "Write the password somewhere safe. Do not share it.",
            "To send a mail: Compose, enter address, subject, message, then Send.",
            "Don't open attachments from people you do not know."]},
        {"id": "search", "title": "🔎 Search the internet safely", "steps": [
            "Open Google or go to google.com.",
            "Type what you want to know in simple words, then search.",
            "Prefer well-known websites — news sites, or .gov.in government sites.",
            "Don't trust one forwarded message — check news on 2–3 trusted sites.",
            "Close any page demanding payment or personal details to show an answer."]},
    ],
    "hi": [
        {"id": "upi", "title": "💸 UPI से सुरक्षित भुगतान", "steps": [
            "अपना UPI ऐप खोलें और PIN से लॉग इन करें।",
            "Pay चुनें और दुकान का QR स्कैन करें, या UPI ID डालें।",
            "भुगतान से पहले नाम और राशि ध्यान से जांचें।",
            "पुष्टि के लिए UPI PIN डालें। यह PIN कभी साझा न करें।",
            "पैसे लेने के लिए कभी PIN नहीं चाहिए — कोई मांगे तो यह धोखा है।"]},
        {"id": "scam", "title": "🛡️ धोखे वाला संदेश पहचानें", "steps": [
            "जिस इनाम/लॉटरी में भाग नहीं लिया, उसके संदेशों से सावधान रहें।",
            "बैंक विवरण, OTP या पासवर्ड मांगने वाले लिंक न खोलें।",
            "असली बैंक कॉल, SMS या WhatsApp पर OTP/PIN नहीं मांगता।",
            "संदेश डर या जल्दबाज़ी पैदा करे तो रुकें — यह चाल है।",
            "संदेह हो तो परिजन से पूछें या बैंक का आधिकारिक नंबर कॉल करें।"]},
        {"id": "email", "title": "✉️ ईमेल बनाएं और इस्तेमाल करें", "steps": [
            "Gmail ऐप या ब्राउज़र में gmail.com खोलें।",
            "Create account पर टैप करें और नाम, यूज़रनेम, मज़बूत पासवर्ड भरें।",
            "पासवर्ड सुरक्षित जगह लिखें। साझा न करें।",
            "मेल भेजने के लिए: Compose, पता, विषय, संदेश, फिर Send।",
            "अनजान लोगों के अटैचमेंट न खोलें।"]},
        {"id": "search", "title": "🔎 इंटरनेट पर सुरक्षित खोजें", "steps": [
            "Google खोलें या google.com पर जाएं।",
            "आसान शब्दों में जो जानना है लिखें, फिर search करें।",
            "जानी-मानी वेबसाइट चुनें — समाचार साइट, या .gov.in सरकारी साइट।",
            "एक फॉरवर्ड संदेश पर भरोसा न करें — खबर 2–3 भरोसेमंद साइटों पर जांचें।",
            "जवाब दिखाने के लिए पैसे/जानकारी मांगने वाला पेज बंद कर दें।"]},
    ],
    "mr": [
        {"id": "upi", "title": "💸 UPI ने सुरक्षित पैसे द्या", "steps": [
            "तुमचे UPI ॲप उघडा आणि PIN ने लॉग इन करा.",
            "Pay निवडा आणि दुकानाचा QR स्कॅन करा, किंवा UPI ID टाका.",
            "पैसे देण्याआधी नाव आणि रक्कम काळजीपूर्वक तपासा.",
            "पुष्टीसाठी UPI PIN टाका. हा PIN कधीही सांगू नका.",
            "पैसे घेण्यासाठी कधीही PIN लागत नाही — कोणी मागितले तर फसवणूक आहे."]},
        {"id": "scam", "title": "🛡️ फसवा संदेश ओळखा", "steps": [
            "भाग न घेता बक्षीस/लॉटरी जिंकल्याच्या संदेशांपासून सावध राहा.",
            "बँक माहिती, OTP किंवा पासवर्ड मागणाऱ्या लिंकवर क्लिक करू नका.",
            "खरी बँक कॉल, SMS किंवा WhatsApp वर OTP/PIN मागत नाही.",
            "संदेश भीती किंवा घाई निर्माण करत असेल तर थांबा — ही युक्ती आहे.",
            "शंका असल्यास घरातील कोणाला विचारा किंवा बँकेचा अधिकृत नंबर कॉल करा."]},
        {"id": "email", "title": "✉️ ईमेल तयार करा आणि वापरा", "steps": [
            "Gmail ॲप किंवा ब्राउझरमध्ये gmail.com उघडा.",
            "Create account वर टॅप करा आणि नाव, युझरनेम, मजबूत पासवर्ड भरा.",
            "पासवर्ड सुरक्षित ठिकाणी लिहा. कोणाला सांगू नका.",
            "मेल पाठवण्यासाठी: Compose, पत्ता, विषय, संदेश, मग Send.",
            "अनोळखी लोकांचे अटॅचमेंट उघडू नका."]},
        {"id": "search", "title": "🔎 इंटरनेटवर सुरक्षित शोधा", "steps": [
            "Google उघडा किंवा google.com वर जा.",
            "सोप्या शब्दांत जे जाणायचे ते लिहा, मग search करा.",
            "ओळखीच्या वेबसाइट निवडा — बातम्यांच्या साइट, किंवा .gov.in सरकारी साइट.",
            "एका फॉरवर्ड संदेशावर विश्वास ठेवू नका — बातमी 2–3 विश्वासार्ह साइटवर तपासा.",
            "उत्तर दाखवण्यासाठी पैसे/माहिती मागणारे पेज बंद करा."]},
    ],
}

# ---- Quiz: each question links to a lesson id (used to suggest what to learn) ----
QUIZ = {
    "en": [
        {"q": "Someone messages: 'Share your OTP to receive ₹5000.' What do you do?",
         "options": ["Share the OTP", "Never share it — it is a scam", "Share only 3 digits"], "answer": 1, "lesson": "scam"},
        {"q": "Do you need a UPI PIN to RECEIVE money?",
         "options": ["Yes, always", "No, never", "Only for big amounts"], "answer": 1, "lesson": "upi"},
        {"q": "A message says you won a lottery you never entered. It is probably…",
         "options": ["True, collect it", "A scam, ignore it", "A bank offer"], "answer": 1, "lesson": "scam"},
        {"q": "Before paying on UPI, you should check…",
         "options": ["Nothing, pay fast", "The name and amount", "Only the app colour"], "answer": 1, "lesson": "upi"},
        {"q": "You get an email attachment from an unknown person. You should…",
         "options": ["Open it quickly", "Not open it", "Forward to friends"], "answer": 1, "lesson": "email"},
        {"q": "You read shocking news in a forwarded message. Before believing it…",
         "options": ["Forward to everyone", "Check on 2–3 trusted sites", "Believe it, a friend sent it"], "answer": 1, "lesson": "search"},
    ],
    "hi": [
        {"q": "कोई कहता है: '₹5000 पाने के लिए OTP बताएं।' आप क्या करेंगे?",
         "options": ["OTP बता दें", "कभी न बताएं — यह धोखा है", "सिर्फ़ 3 अंक बताएं"], "answer": 1, "lesson": "scam"},
        {"q": "पैसे लेने (RECEIVE) के लिए क्या UPI PIN चाहिए?",
         "options": ["हाँ, हमेशा", "नहीं, कभी नहीं", "सिर्फ़ बड़ी राशि के लिए"], "answer": 1, "lesson": "upi"},
        {"q": "संदेश कहता है आपने बिना भाग लिए लॉटरी जीती। यह शायद…",
         "options": ["सच है, ले लें", "धोखा है, छोड़ें", "बैंक ऑफर है"], "answer": 1, "lesson": "scam"},
        {"q": "UPI भुगतान से पहले जांचें…",
         "options": ["कुछ नहीं", "नाम और राशि", "सिर्फ़ ऐप का रंग"], "answer": 1, "lesson": "upi"},
        {"q": "अनजान से ईमेल अटैचमेंट आए तो…",
         "options": ["जल्दी खोलें", "न खोलें", "दोस्तों को भेजें"], "answer": 1, "lesson": "email"},
        {"q": "फॉरवर्ड संदेश में चौंकाने वाली खबर — मानने से पहले…",
         "options": ["सबको भेजें", "2–3 भरोसेमंद साइटों पर जांचें", "दोस्त ने भेजा, मान लें"], "answer": 1, "lesson": "search"},
    ],
    "mr": [
        {"q": "कोणी म्हणतो: '₹5000 मिळवण्यासाठी OTP सांगा.' तुम्ही काय कराल?",
         "options": ["OTP सांगा", "कधीही सांगू नका — फसवणूक", "फक्त 3 अंक सांगा"], "answer": 1, "lesson": "scam"},
        {"q": "पैसे घेण्यासाठी (RECEIVE) UPI PIN लागतो का?",
         "options": ["हो, नेहमी", "नाही, कधीच नाही", "फक्त मोठ्या रकमेला"], "answer": 1, "lesson": "upi"},
        {"q": "संदेश म्हणतो भाग न घेता लॉटरी जिंकली. हे बहुधा…",
         "options": ["खरे, घ्या", "फसवणूक, दुर्लक्ष करा", "बँक ऑफर"], "answer": 1, "lesson": "scam"},
        {"q": "UPI पैसे देण्याआधी तपासा…",
         "options": ["काहीच नाही", "नाव आणि रक्कम", "फक्त ॲपचा रंग"], "answer": 1, "lesson": "upi"},
        {"q": "अनोळखी व्यक्तीकडून ईमेल अटॅचमेंट आल्यास…",
         "options": ["पटकन उघडा", "उघडू नका", "मित्रांना पाठवा"], "answer": 1, "lesson": "email"},
        {"q": "फॉरवर्ड संदेशातील धक्कादायक बातमी — विश्वास ठेवण्याआधी…",
         "options": ["सगळ्यांना पाठवा", "2–3 विश्वासार्ह साइटवर तपासा", "मित्राने पाठवली, विश्वास ठेवा"], "answer": 1, "lesson": "search"},
    ],
}

# ---- Offline answer bank for "Ask Saathi": keyword -> answer ----
ANSWERS = {
    "en": [
        (["upi", "pay", "payment", "money", "scan", "qr"],
         "To pay with UPI safely: open your app, scan the QR or enter the UPI ID, check the name and amount, then enter your PIN. Never share your PIN. You never need a PIN to RECEIVE money."),
        (["otp", "password", "pin"],
         "Never share your OTP, PIN or password — not even with someone claiming to be your bank. A real bank never asks for these."),
        (["scam", "fraud", "fake", "lottery", "prize", "win"],
         "To stay safe: ignore prizes/lotteries you never entered, don't click links asking for bank details or OTP, and if a message creates fear or hurry, stop and ask a family member."),
        (["email", "gmail", "mail"],
         "To use email: open Gmail and sign in, tap Compose, enter the address, subject and message, then Send. Don't open attachments from unknown people."),
        (["search", "google", "find", "news", "fake"],
         "To search safely: type your question in simple words, prefer well-known or .gov.in sites, and for news check 2–3 trusted sites before believing it."),
    ],
    "hi": [
        (["upi", "भुगतान", "पैसे", "स्कैन", "qr"],
         "UPI से सुरक्षित भुगतान: ऐप खोलें, QR स्कैन करें या UPI ID डालें, नाम और राशि जांचें, फिर PIN डालें। PIN कभी साझा न करें।"),
        (["otp", "पासवर्ड", "pin", "पिन"],
         "अपना OTP, PIN या पासवर्ड कभी साझा न करें — बैंक का बताने वाले को भी नहीं। असली बैंक ये नहीं मांगता।"),
        (["धोखा", "फ्रॉड", "फर्जी", "लॉटरी", "इनाम", "जीत"],
         "सुरक्षित रहें: बिना भाग लिए इनाम/लॉटरी के संदेश न मानें, बैंक विवरण/OTP मांगने वाले लिंक न खोलें, डर/जल्दी वाले संदेश पर रुककर परिजन से पूछें।"),
        (["ईमेल", "gmail", "मेल"],
         "ईमेल: Gmail खोलें, Compose दबाएं, पता/विषय/संदेश लिखें, फिर Send। अनजान के अटैचमेंट न खोलें।"),
        (["खोज", "google", "जानकारी", "खबर", "फेक"],
         "सुरक्षित खोज: आसान शब्दों में सवाल लिखें, जानी-मानी या .gov.in साइट चुनें, खबर 2–3 भरोसेमंद साइटों पर जांचें।"),
    ],
    "mr": [
        (["upi", "पैसे", "स्कॅन", "qr", "पेमेंट"],
         "UPI ने सुरक्षित पैसे: ॲप उघडा, QR स्कॅन करा किंवा UPI ID टाका, नाव आणि रक्कम तपासा, मग PIN टाका. PIN कधीही सांगू नका."),
        (["otp", "पासवर्ड", "pin", "पिन"],
         "तुमचा OTP, PIN किंवा पासवर्ड कधीही सांगू नका — बँकेचा असल्याचे सांगणाऱ्यालाही नाही. खरी बँक हे मागत नाही."),
        (["फसवणूक", "फ्रॉड", "खोटे", "लॉटरी", "बक्षीस", "जिंक"],
         "सुरक्षित राहा: भाग न घेता बक्षीस/लॉटरीच्या संदेशांवर विश्वास ठेवू नका, बँक माहिती/OTP मागणाऱ्या लिंक उघडू नका, भीती/घाईच्या संदेशावर थांबून विचारा."),
        (["ईमेल", "gmail", "मेल"],
         "ईमेल: Gmail उघडा, Compose दाबा, पत्ता/विषय/संदेश लिहा, मग Send. अनोळखी लोकांचे अटॅचमेंट उघडू नका."),
        (["शोध", "google", "माहिती", "बातमी", "फेक"],
         "सुरक्षित शोध: सोप्या शब्दांत प्रश्न लिहा, ओळखीच्या किंवा .gov.in साइट निवडा, बातमी 2–3 विश्वासार्ह साइटवर तपासा."),
    ],
}


# =========================================================================
# 2) FUNCTIONS  — the "programming logic" (explain these in the viva)
# =========================================================================

def grade_quiz(lang, chosen):
    """Count correct answers and collect lessons for the wrong ones.
    `chosen` is a list: the option index the user picked for each question."""
    questions = QUIZ[lang]
    score = 0
    wrong_lessons = []
    for i, item in enumerate(questions):          # loop over every question
        if chosen[i] == item["answer"]:           # condition: was it correct?
            score += 1
        else:
            if item["lesson"] not in wrong_lessons:
                wrong_lessons.append(item["lesson"])
    return score, wrong_lessons


def offline_answer(lang, question):
    """Return a built-in answer by matching keywords. Works with no internet."""
    q = question.lower()
    for keywords, answer in ANSWERS[lang]:        # loop over each stored answer
        for key in keywords:                      # loop over its keywords
            if key.lower() in q:                  # condition: keyword found?
                return answer
    return UI[lang]["no_answer"]


def is_passed(score, total):
    """The quiz is cleared when the score reaches PASS_PERCENT."""
    return score * 100 >= PASS_PERCENT * total


def shuffled_options(user_id, question_no, count):
    """Give each user their own option order, so the answer isn't always in one place.
    The same user always gets the same order, so it stays put when the page redraws."""
    return random.Random(f"{user_id}-{question_no}").sample(range(count), count)


def ai_answer(lang, question, api_key, model):
    """Ask a real AI model (Google Gemini) over the internet. Optional."""
    if not api_key:
        return UI[lang]["ai_fail"]
    lang_name = {"en": "English", "hi": "Hindi", "mr": "Marathi"}[lang]
    prompt = (
        "You are 'Digital Saathi', a kind helper teaching basic digital skills to beginners. "
        f"Answer in {lang_name}, in very simple words, as short numbered steps (max 4). "
        "If the question is about money/OTP/PIN, add a one-line safety warning. "
        f"Question: {question}"
    )
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    try:
        resp = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=20)
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception:
        return UI[lang]["ai_fail"]


# =========================================================================
# 3) DATABASE  — everything is saved in one SQLite file for later analysis
# =========================================================================

# Each table answers an analytics question:
#   users               -> who is learning (age group, gender, location, language)
#   lesson_completions  -> which lessons get finished, and when
#   quiz_attempts       -> scores and pass rate
#   quiz_answers        -> which questions people get wrong most often
#   certificates        -> who finished the whole course
#   questions_asked     -> what people want to know, and what we couldn't answer
SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    full_name TEXT NOT NULL,
    age_group TEXT NOT NULL,
    gender TEXT NOT NULL,
    location TEXT NOT NULL,
    language TEXT NOT NULL,
    is_admin INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    consent_at TEXT
);
CREATE TABLE IF NOT EXISTS login_failures (
    username TEXT NOT NULL COLLATE NOCASE,
    failed_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS lesson_completions (
    user_id INTEGER NOT NULL REFERENCES users(id),
    lesson_id TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    PRIMARY KEY (user_id, lesson_id)
);
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    language TEXT NOT NULL,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    passed INTEGER NOT NULL,
    taken_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS quiz_answers (
    attempt_id INTEGER NOT NULL REFERENCES quiz_attempts(id),
    question_no INTEGER NOT NULL,
    lesson_id TEXT NOT NULL,
    chosen INTEGER NOT NULL,
    correct INTEGER NOT NULL,
    PRIMARY KEY (attempt_id, question_no)
);
CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    issued_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS questions_asked (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    language TEXT NOT NULL,
    question TEXT NOT NULL,
    mode TEXT NOT NULL,
    answered INTEGER NOT NULL,
    asked_at TEXT NOT NULL
);
"""

# The tables the admin can download. The users export leaves out the password columns.
EXPORTS = {
    "users": "SELECT id, username, full_name, age_group, gender, location, language, is_admin, created_at, consent_at FROM users",
    "lesson_completions": "SELECT * FROM lesson_completions",
    "quiz_attempts": "SELECT * FROM quiz_attempts",
    "quiz_answers": "SELECT * FROM quiz_answers",
    "certificates": "SELECT * FROM certificates",
    "questions_asked": "SELECT * FROM questions_asked",
}


@contextmanager
def open_db():
    """Open the database, save the changes if all went well, then close it."""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row                # lets us write row["username"]
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        with conn:
            yield conn
    finally:
        conn.close()


def init_db():
    """Create the tables the first time the app runs."""
    with open_db() as conn:
        conn.executescript(SCHEMA)
        columns = [row["name"] for row in conn.execute("PRAGMA table_info(users)")]
        if "consent_at" not in columns:           # a database made by an older version
            conn.execute("ALTER TABLE users ADD COLUMN consent_at TEXT")


def get_setting(name):
    """Read a private setting from an environment variable or Streamlit's secrets file.
    These never go in the code, so they stay private when the code is on GitHub."""
    if name in os.environ:
        return os.environ[name]
    try:
        return st.secrets.get(name, "")
    except StreamlitSecretNotFoundError:          # there is no secrets file
        return ""


@st.cache_resource                                # run once when the server starts, not on every click
def setup_admin():
    """Only the account named in the private settings is the admin.
    Without those settings there is no admin, so Analytics stays hidden from everyone."""
    username = get_setting("SAATHI_ADMIN_USERNAME")
    password = get_setting("SAATHI_ADMIN_PASSWORD")
    with open_db() as conn:
        conn.execute("UPDATE users SET is_admin = 0")
        if username and len(password) >= MIN_PASSWORD_LENGTH:
            salt = secrets.token_hex(16)
            conn.execute(
                """INSERT INTO users (username, password_hash, salt, full_name, age_group, gender,
                                      location, language, is_admin, created_at)
                   VALUES (?, ?, ?, 'Administrator', '18-35', 'unsaid', '-', 'en', 1, ?)
                   ON CONFLICT (username) DO UPDATE SET
                       password_hash = excluded.password_hash, salt = excluded.salt, is_admin = 1""",
                (username, hash_password(password, salt), salt, now()))
    return True


def now():
    return datetime.now().isoformat(timespec="seconds")


def hash_password(password, salt):
    """Scramble a password. The salt makes the same password hash differently per user."""
    return hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), HASH_ROUNDS).hex()


def register_user(username, password, full_name, age_group, gender, location, language):
    """Save a new user, with the time they gave consent, and return their id.
    Returns None if the username is taken."""
    salt = secrets.token_hex(16)
    try:
        with open_db() as conn:
            row = conn.execute(
                """INSERT INTO users (username, password_hash, salt, full_name, age_group, gender,
                                      location, language, is_admin, created_at, consent_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
                   RETURNING id""",
                (username, hash_password(password, salt), salt, full_name, age_group, gender,
                 location, language, now(), now())).fetchone()
            return row["id"]
    except sqlite3.IntegrityError:                # UNIQUE rule: username already exists
        return None


def lockout_start():
    """Failures older than this no longer count."""
    return (datetime.now() - timedelta(minutes=LOCKOUT_MINUTES)).isoformat(timespec="seconds")


def is_locked_out(username):
    """Stop password guessing: too many recent failures locks the username for a while."""
    with open_db() as conn:
        row = conn.execute("SELECT COUNT(*) AS failures FROM login_failures WHERE username = ? AND failed_at > ?",
                           (username, lockout_start())).fetchone()
    return row["failures"] >= MAX_LOGIN_FAILURES


def login_user(username, password):
    """Return the user's id if the username and password match, otherwise None."""
    with open_db() as conn:
        row = conn.execute("SELECT id, password_hash, salt FROM users WHERE username = ?",
                           (username,)).fetchone()
    # Hash even for an unknown username, so response time doesn't reveal which usernames exist
    attempt = hash_password(password, row["salt"] if row else "00" * 16)
    with open_db() as conn:
        if row and hmac.compare_digest(row["password_hash"], attempt):
            conn.execute("DELETE FROM login_failures WHERE username = ?", (username,))
            return row["id"]
        conn.execute("DELETE FROM login_failures WHERE failed_at <= ?", (lockout_start(),))
        conn.execute("INSERT INTO login_failures VALUES (?, ?)", (username, now()))
    return None


def set_password(user_id, password):
    salt = secrets.token_hex(16)
    with open_db() as conn:
        conn.execute("UPDATE users SET password_hash = ?, salt = ? WHERE id = ?",
                     (hash_password(password, salt), salt, user_id))


def password_matches(user, password):
    return hmac.compare_digest(user["password_hash"], hash_password(password, user["salt"]))


def reset_password(username):
    """For a learner who forgot their password. Returns a temporary one, or None if there's no such learner.
    The admin password can't be reset here; it comes from the private settings."""
    with open_db() as conn:
        row = conn.execute("SELECT id FROM users WHERE username = ? AND is_admin = 0", (username,)).fetchone()
        conn.execute("DELETE FROM login_failures WHERE username = ?", (username,))
    if not row:
        return None
    temporary = secrets.token_urlsafe(9)
    set_password(row["id"], temporary)
    return temporary


def to_safe_csv(table):
    """Excel runs cells starting with these characters as formulas, and learners
    type some of this text, so a leading ' makes Excel treat it as plain text."""
    return table.map(lambda v: "'" + v if isinstance(v, str) and v[:1] in ("=", "+", "-", "@") else v).to_csv(index=False)


def get_user(user_id):
    with open_db() as conn:
        return conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()


def update_profile(user_id, full_name, age_group, gender, location):
    with open_db() as conn:
        conn.execute("UPDATE users SET full_name = ?, age_group = ?, gender = ?, location = ? WHERE id = ?",
                     (full_name, age_group, gender, location, user_id))


def get_completed_lessons(user_id):
    with open_db() as conn:
        rows = conn.execute("SELECT lesson_id FROM lesson_completions WHERE user_id = ?", (user_id,)).fetchall()
    return {row["lesson_id"] for row in rows}


def mark_lesson_complete(user_id, lesson_id):
    with open_db() as conn:
        conn.execute("INSERT OR IGNORE INTO lesson_completions VALUES (?, ?, ?)", (user_id, lesson_id, now()))


def save_quiz_attempt(user_id, lang, chosen, score):
    """Save the attempt and each answer, and issue the certificate on the first pass."""
    questions = QUIZ[lang]
    passed = is_passed(score, len(questions))
    with open_db() as conn:
        row = conn.execute(
            """INSERT INTO quiz_attempts (user_id, language, score, total, passed, taken_at)
               VALUES (?, ?, ?, ?, ?, ?) RETURNING id""",
            (user_id, lang, score, len(questions), passed, now())).fetchone()
        for i, item in enumerate(questions):
            conn.execute("INSERT INTO quiz_answers VALUES (?, ?, ?, ?, ?)",
                         (row["id"], i, item["lesson"], chosen[i], chosen[i] == item["answer"]))
        if passed:
            code = "DS-" + secrets.token_hex(4).upper()
            conn.execute("INSERT OR IGNORE INTO certificates VALUES (?, ?, ?, ?, ?)",
                         (code, user_id, score, len(questions), now()))
    return passed


def get_quiz_stats(user_id):
    with open_db() as conn:
        return conn.execute("SELECT COUNT(*) AS tries, MAX(score) AS best, MAX(total) AS total "
                            "FROM quiz_attempts WHERE user_id = ?", (user_id,)).fetchone()


def get_certificate(user_id):
    with open_db() as conn:
        return conn.execute("SELECT * FROM certificates WHERE user_id = ?", (user_id,)).fetchone()


def save_question(user_id, lang, question, mode, answered):
    with open_db() as conn:
        conn.execute("""INSERT INTO questions_asked (user_id, language, question, mode, answered, asked_at)
                        VALUES (?, ?, ?, ?, ?, ?)""", (user_id, lang, question, mode, answered, now()))


def run_query(sql, params=()):
    """Run a SELECT and return the result as a table (a pandas DataFrame)."""
    with open_db() as conn:
        return pd.read_sql_query(sql, conn, params=params)


def count_rows(sql, params=()):
    return int(run_query(sql, params).iloc[0, 0])


def show_bars(title, table):
    """Draw a two-column table as a horizontal bar chart, with the numbers underneath."""
    st.subheader(title)
    if table.empty:
        st.info("No data yet.")
        return
    st.bar_chart(table, x=table.columns[0], y=table.columns[1], horizontal=True, sort=False)
    with st.expander("Show table"):
        st.dataframe(table, hide_index=True)


# =========================================================================
# 4) THE CERTIFICATE  — a web page the user can download and print as a PDF
# =========================================================================

def certificate_body(T, lang, user, cert):
    """Build the certificate as HTML. Browsers draw Hindi and Marathi names correctly."""
    name = html.escape(user["full_name"])         # so a name can't break or inject into the page
    topics = " · ".join(lesson["title"].split(" ", 1)[1] for lesson in LESSONS[lang])
    issued = datetime.fromisoformat(cert["issued_at"]).strftime("%d-%m-%Y")
    return f"""
    <div style="background:#fffdf6;color:#1f2a44;border:10px double #b8860b;padding:40px 32px;
                text-align:center;font-family:Georgia,'Nirmala UI','Noto Sans Devanagari',serif;">
      <div style="font-size:18px;letter-spacing:1px;">🤝 {T["title"].split(" ", 1)[1]}</div>
      <div style="font-size:34px;font-weight:bold;color:#7a5a00;margin:16px 0 24px;">{T["cert_title"]}</div>
      <div style="font-size:17px;">{T["cert_certifies"]}</div>
      <div style="font-size:32px;font-weight:bold;margin:10px 0;">{name}</div>
      <div style="font-size:17px;">{T["cert_completed"]}</div>
      <div style="font-size:24px;font-weight:bold;margin:10px 0 18px;">{T["cert_course"]}</div>
      <div style="font-size:14px;margin-bottom:24px;">{T["cert_topics"]}: {topics}</div>
      <div style="font-size:14px;">
        {T["cert_score"]}: {cert["score"]} / {cert["total"]} &nbsp;·&nbsp;
        {T["cert_date"]}: {issued} &nbsp;·&nbsp; {T["cert_id"]}: {cert["id"]}
      </div>
    </div>"""


def certificate_file(T, lang, user, cert):
    """Wrap the certificate in a complete page, set up to print on one A4 sheet."""
    return f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<title>{T["cert_title"]}</title>
<style>
  @page {{ size: A4 landscape; margin: 12mm; }}
  body {{ margin: 0 auto; padding: 16px; max-width: 900px; background: #fff;
          -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
</style>
</head>
<body>{certificate_body(T, lang, user, cert)}</body>
</html>"""


# =========================================================================
# 5) THE INTERFACE  — Streamlit draws the page from top to bottom
# =========================================================================

st.set_page_config(page_title="Digital Saathi", page_icon="🤝")
init_db()
setup_admin()

# --- Who is logged in? session_state remembers this while the browser tab stays open ---
user = get_user(st.session_state["user_id"]) if "user_id" in st.session_state else None

# --- Sidebar: language, page navigation, and AI settings ---
lang_label = st.sidebar.selectbox("Language / भाषा", ["English", "हिंदी", "मराठी"])
lang = {"English": "en", "हिंदी": "hi", "मराठी": "mr"}[lang_label]
T = UI[lang]                                      # shortcut for the current language's labels
all_lesson_ids = [lesson["id"] for lesson in LESSONS[lang]]

if user:
    st.sidebar.write(f"👤 {T['welcome']} **{user['full_name']}**")
    if st.sidebar.button(T["logout"]):
        del st.session_state["user_id"]
        st.rerun()

st.sidebar.markdown("---")
if user:
    pages = [T["home"], T["lessons"], T["quiz"], T["certificate"], T["ask"], T["profile"]]
    if user["is_admin"]:
        pages.append(T["analytics"])
else:
    pages = [T["home"], T["account"], T["lessons"], T["ask"]]
page = st.sidebar.radio(T["nav"], pages)

st.sidebar.markdown("---")
st.sidebar.caption("⚙️ AI settings (optional)")
mode = st.sidebar.radio(T["mode"], [T["offline"], T["ai"]])
api_key = st.sidebar.text_input(T["api_key"], type="password")
model = st.sidebar.text_input(T["model"], value="gemini-flash-latest")   # Google's name for its newest Flash model

# --- Header ---
st.title(T["title"])
st.caption(T["tagline"])

# --- HOME ---
if page == T["home"]:
    st.write(T["home_intro"])
    if user:
        done = get_completed_lessons(user["id"])
        st.progress(len(done) / len(all_lesson_ids), text=f"{T['progress']}: {len(done)} / {len(all_lesson_ids)}")
        if get_certificate(user["id"]):
            st.success(T["next_cert"])
        elif len(done) < len(all_lesson_ids):
            st.info(T["next_lessons"])
        else:
            st.info(T["next_quiz"])
    else:
        st.info(T["guest_prompt"])

# --- LOGIN / REGISTER ---
elif page == T["account"]:
    login_tab, register_tab = st.tabs([T["login"], T["register"]])

    with login_tab:
        with st.form("login_form"):
            username = st.text_input(T["username"], max_chars=50, key="login_username")
            password = st.text_input(T["password"], type="password", max_chars=200, key="login_password")
            if st.form_submit_button(T["login"]):
                if is_locked_out(username.strip()):
                    st.error(T["err_locked"].format(m=LOCKOUT_MINUTES))
                else:
                    user_id = login_user(username.strip(), password)
                    if user_id:
                        st.session_state["user_id"] = user_id
                        st.rerun()
                    else:
                        st.error(T["err_login"])
        st.caption(T["forgot"])

    with register_tab:
        st.caption(T["privacy"])
        with st.form("register_form"):
            username = st.text_input(T["username"], max_chars=50, key="reg_username")
            password = st.text_input(T["new_password"].format(n=MIN_PASSWORD_LENGTH), type="password",
                                     max_chars=200, key="reg_password")
            full_name = st.text_input(T["full_name"], max_chars=100, key="reg_name")
            age_group = st.selectbox(T["age_group"], AGE_GROUPS, key="reg_age")
            gender = st.selectbox(T["gender"], list(T["gender_options"]),
                                  format_func=lambda g: T["gender_options"][g], key="reg_gender")
            location = st.text_input(T["location"], max_chars=100, key="reg_location")
            consent = st.checkbox(T["consent"], key="reg_consent")
            guardian = st.checkbox(T["guardian"], key="reg_guardian")
            if st.form_submit_button(T["register"]):
                if not (username.strip() and full_name.strip() and location.strip()):
                    st.error(T["err_fields"])
                elif len(password) < MIN_PASSWORD_LENGTH:
                    st.error(T["err_password"].format(n=MIN_PASSWORD_LENGTH))
                elif not consent:
                    st.error(T["err_consent"])
                elif age_group == AGE_GROUPS[0] and not guardian:
                    st.error(T["err_guardian"])
                else:
                    user_id = register_user(username.strip(), password, full_name.strip(),
                                            age_group, gender, location.strip(), lang)
                    if user_id:
                        st.session_state["user_id"] = user_id
                        st.rerun()
                    else:
                        st.error(T["err_taken"])

# --- LESSONS ---
elif page == T["lessons"]:
    st.header("📘 " + T["lessons"])
    done = get_completed_lessons(user["id"]) if user else set()
    if user:
        st.progress(len(done) / len(all_lesson_ids), text=f"{T['progress']}: {len(done)} / {len(all_lesson_ids)}")
    else:
        st.info(T["guest_prompt"])
    for lesson in LESSONS[lang]:                  # loop: show each lesson
        is_done = lesson["id"] in done
        with st.expander(("✅ " if is_done else "") + lesson["title"]):   # a click-to-open box
            for n, step in enumerate(lesson["steps"], start=1):
                st.write(f"{n}. {step}")
            if user and not is_done:
                if st.button(T["mark_done"], key=f"done_{lesson['id']}"):
                    mark_lesson_complete(user["id"], lesson["id"])
                    st.rerun()

# --- QUIZ ---
elif page == T["quiz"]:
    st.header("✅ " + T["quiz"])
    remaining = [l for l in LESSONS[lang] if l["id"] not in get_completed_lessons(user["id"])]
    if remaining:                                 # condition: the quiz stays locked
        st.warning(T["quiz_locked"])
        for lesson in remaining:
            st.write("• " + lesson["title"])
    else:
        st.write(T["quiz_intro"].format(pct=PASS_PERCENT))
        chosen = []                               # will hold the user's answers
        for i, item in enumerate(QUIZ[lang]):
            order = shuffled_options(user["id"], i, len(item["options"]))
            picked = st.radio(f"{i+1}. {item['q']}", order, index=None, key=f"q{i}_{lang}",
                              format_func=lambda o, options=item["options"]: options[o])
            chosen.append(picked)                 # store the chosen option number

        if st.button(T["see_result"]):
            if None in chosen:
                st.warning(T["answer_all"])
            else:
                score, wrong = grade_quiz(lang, chosen)   # call our function
                passed = save_quiz_attempt(user["id"], lang, chosen, score)
                st.subheader(f"{T['your_score']} {score} / {len(QUIZ[lang])}")
                if passed:
                    st.success(T["passed"])
                else:
                    st.error(T["failed"].format(pct=PASS_PERCENT))
                if wrong:
                    st.write("**" + T["learn_next"] + "**")
                    for lid in wrong[:3]:
                        title = next(l["title"] for l in LESSONS[lang] if l["id"] == lid)
                        st.write("• " + title)

# --- CERTIFICATE ---
elif page == T["certificate"]:
    st.header("🎓 " + T["certificate"])
    cert = get_certificate(user["id"])
    if cert:
        st.html(certificate_body(T, lang, user, cert))
        st.download_button(T["download"], certificate_file(T, lang, user, cert),
                           file_name=f"digital-saathi-certificate-{cert['id']}.html", mime="text/html")
        st.caption(T["print_tip"])
    else:
        st.info(T["no_cert"])

# --- ASK SAATHI ---
elif page == T["ask"]:
    st.header("💬 " + T["ask"])
    st.write(T["ask_intro"])
    st.caption(T["ask_note"])
    question = st.text_area(T["ask_label"], max_chars=500)
    if st.button(T["ask_btn"]) and question.strip():
        if mode == T["ai"]:
            with st.spinner(T["thinking"]):
                answer = ai_answer(lang, question, api_key.strip(), model.strip())
        else:
            answer = offline_answer(lang, question)
        st.success(answer)
        save_question(user["id"] if user else None, lang, question.strip(),
                      "ai" if mode == T["ai"] else "offline",
                      answer not in (T["no_answer"], T["ai_fail"]))

# --- PROFILE ---
elif page == T["profile"]:
    st.header("👤 " + T["profile"])
    st.write(f"**{T['username']}:** {user['username']}")
    stats = get_quiz_stats(user["id"])
    col1, col2, col3 = st.columns(3)
    col1.metric(T["progress"], f"{len(get_completed_lessons(user['id']))} / {len(all_lesson_ids)}")
    col2.metric(T["quiz_tries"], stats["tries"])
    col3.metric(T["quiz_best"], f"{stats['best']} / {stats['total']}" if stats["tries"] else "-")

    gender_keys = list(T["gender_options"])
    with st.form("profile_form"):
        full_name = st.text_input(T["full_name"], value=user["full_name"], max_chars=100)
        age_group = st.selectbox(T["age_group"], AGE_GROUPS, index=AGE_GROUPS.index(user["age_group"]))
        gender = st.selectbox(T["gender"], gender_keys, index=gender_keys.index(user["gender"]),
                              format_func=lambda g: T["gender_options"][g])
        location = st.text_input(T["location"], value=user["location"], max_chars=100)
        if st.form_submit_button(T["save"]):
            if full_name.strip() and location.strip():
                update_profile(user["id"], full_name.strip(), age_group, gender, location.strip())
                st.session_state["profile_saved"] = True
                st.rerun()
            else:
                st.error(T["err_fields"])
    if st.session_state.pop("profile_saved", False):
        st.success(T["saved"])

    # The admin's password comes from the private settings, so it isn't changed here
    if not user["is_admin"]:
        st.subheader(T["change_password"])
        with st.form("password_form", clear_on_submit=True):
            current = st.text_input(T["current_password"], type="password", max_chars=200)
            new = st.text_input(T["new_password"].format(n=MIN_PASSWORD_LENGTH), type="password", max_chars=200)
            if st.form_submit_button(T["change_password"]):
                if not password_matches(user, current):
                    st.error(T["err_current"])
                elif len(new) < MIN_PASSWORD_LENGTH:
                    st.error(T["err_password"].format(n=MIN_PASSWORD_LENGTH))
                else:
                    set_password(user["id"], new)
                    st.success(T["password_changed"])

# --- ANALYTICS (only the admin's menu has this page) ---
elif page == T["analytics"]:
    st.header("📊 " + T["analytics"])
    lesson_count = len(all_lesson_ids)
    registered = count_rows("SELECT COUNT(*) FROM users WHERE is_admin = 0")
    finished_lessons = count_rows(
        f"""SELECT COUNT(*) FROM (SELECT user_id FROM lesson_completions WHERE {LEARNERS}
            GROUP BY user_id HAVING COUNT(*) >= ?)""", (lesson_count,))
    took_quiz = count_rows(f"SELECT COUNT(DISTINCT user_id) FROM quiz_attempts WHERE {LEARNERS}")
    certified = count_rows(f"SELECT COUNT(*) FROM certificates WHERE {LEARNERS}")
    attempts = count_rows(f"SELECT COUNT(*) FROM quiz_attempts WHERE {LEARNERS}")
    passes = count_rows(f"SELECT COUNT(*) FROM quiz_attempts WHERE passed = 1 AND {LEARNERS}")

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Registered learners", registered)
    col2.metric("Certificates issued", certified)
    col3.metric("Quiz attempts", attempts)
    col4.metric("Quiz pass rate", f"{passes * 100 / attempts:.0f}%" if attempts else "-")

    show_bars("Learner journey", pd.DataFrame({
        "Stage": ["Registered", "Finished all lessons", "Took the quiz", "Earned certificate"],
        "Learners": [registered, finished_lessons, took_quiz, certified]}))

    lesson_titles = {lesson["id"]: lesson["title"] for lesson in LESSONS[lang]}
    per_lesson = run_query(f"SELECT lesson_id, COUNT(*) AS Learners FROM lesson_completions WHERE {LEARNERS} GROUP BY lesson_id")
    lesson_counts = dict(zip(per_lesson["lesson_id"], per_lesson["Learners"]))
    show_bars("Lesson completions", pd.DataFrame({
        "Lesson": list(lesson_titles.values()),
        "Learners": [lesson_counts.get(lid, 0) for lid in lesson_titles]}))

    st.subheader("Questions people get wrong most")
    missed = run_query(f"""SELECT question_no, COUNT(*) AS Answers, SUM(correct = 0) AS Wrong
                           FROM quiz_answers WHERE attempt_id IN (SELECT id FROM quiz_attempts WHERE {LEARNERS})
                           GROUP BY question_no ORDER BY Wrong * 1.0 / COUNT(*) DESC""")
    if missed.empty:
        st.info("No data yet.")
    else:
        missed.insert(0, "Question", [QUIZ[lang][n]["q"] for n in missed["question_no"]])
        missed["% wrong"] = (missed["Wrong"] * 100 / missed["Answers"]).round().astype(int)
        st.dataframe(missed.drop(columns="question_no"), hide_index=True)

    age_table = run_query('SELECT age_group AS "Age group", COUNT(*) AS Learners FROM users WHERE is_admin = 0 GROUP BY age_group')
    show_bars("Learners by age group", age_table.sort_values("Age group", key=lambda ages: ages.map(AGE_GROUPS.index)))
    gender_table = run_query('SELECT gender AS Gender, COUNT(*) AS Learners FROM users WHERE is_admin = 0 GROUP BY gender ORDER BY Learners DESC')
    gender_table["Gender"] = [T["gender_options"][g] for g in gender_table["Gender"]]
    show_bars("Learners by gender", gender_table)
    show_bars("Top 10 locations", run_query(
        """SELECT location AS Location, COUNT(*) AS Learners FROM users WHERE is_admin = 0
           GROUP BY location COLLATE NOCASE ORDER BY Learners DESC LIMIT 10"""))

    st.subheader("Questions Saathi could not answer")
    st.dataframe(run_query("""SELECT question AS Question, language AS Language, mode AS Mode, asked_at AS "Asked at"
                              FROM questions_asked WHERE answered = 0 ORDER BY id DESC"""), hide_index=True)

    st.subheader("Download the data")
    st.caption("CSV files open in Excel. Passwords are never included. These files contain personal data, so keep them private.")
    for table_name, sql in EXPORTS.items():
        st.download_button(f"⬇️ {table_name}.csv", to_safe_csv(run_query(sql)),
                           file_name=f"{table_name}.csv", mime="text/csv")

    st.subheader("Reset a learner's password")
    st.caption("Check that the request really comes from this learner first. Ask them to change the temporary password under My Profile.")
    with st.form("reset_form", clear_on_submit=True):
        reset_username = st.text_input("Learner's username", max_chars=50)
        if st.form_submit_button("Create temporary password"):
            temporary = reset_password(reset_username.strip())
            if temporary:
                st.success("Temporary password (shown only once):")
                st.code(temporary)
            else:
                st.error("No learner has that username.")
