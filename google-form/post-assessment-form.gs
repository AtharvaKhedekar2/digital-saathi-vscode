/**
 * DIGITAL SAATHI — POST-ASSESSMENT QUIZ (Google Form builder)
 * ----------------------------------------------------------------------------
 * Run this ONCE in Google Apps Script (script.google.com) to create the
 * Post-Assessment Quiz as a Google Form — a self-marking quiz with an answer
 * key, 1 point per question and friendly feedback. Step-by-step instructions:
 * see POST-FORM-GUIDE.md in this folder.
 *
 *   createPostEnglishForm()   → makes the English form
 *   createPostHindiForm()     → makes the Hindi form
 *   createPostMarathiForm()   → makes the Marathi form
 *   createPostAllLanguages()  → makes all three
 *
 * After it runs, open "Execution log": it prints each form's Share link and Edit link.
 *
 * The 14 questions are the SAME as the website's Post-Assessment (POST_QUIZ in
 * index.html): two per topic, each linked to one of the six approved learning steps.
 * They are different from the Pre-Assessment questions but test the same learning steps.
 * Page 1 asks the same "I am…" and "How comfortable…" questions as the Pre-Assessment
 * form, so the two forms' results can be compared (see POST-FORM-GUIDE.md, Part F).
 * ----------------------------------------------------------------------------
 */

function createPostEnglishForm() { return buildPostAssessmentForm_("en"); }
function createPostHindiForm()   { return buildPostAssessmentForm_("hi"); }
function createPostMarathiForm() { return buildPostAssessmentForm_("mr"); }
function createPostAllLanguages() { ["en", "hi", "mr"].forEach(buildPostAssessmentForm_); }

const POST_PASS_SHARE = 0.7;   // 70 % of the questions for the certificate — the same rule as the website

function buildPostAssessmentForm_(lang) {
  const T = POST_TEXT[lang];
  const total = POST_QUESTIONS[lang].length;
  const nums = { total: total, pass: Math.ceil(POST_PASS_SHARE * total), min: Math.ceil(total / 2) };
  const fill = function (text) { return text.replace(/\{(total|pass|min)\}/g, function (_, k) { return nums[k]; }); };

  const form = FormApp.create(T.title);
  form.setTitle(T.title)
      .setDescription(fill(T.description))
      .setIsQuiz(true)                 // quiz mode: answer key + automatic scoring
      .setProgressBar(true)            // shows "page 2 of 9" so people know how far they are
      .setShuffleQuestions(false)
      .setCollectEmail(false)          // no email needed — easier for seniors and safer for children
      .setLimitOneResponsePerUser(false)   // ON would force everyone to sign in to Google
      .setAllowResponseEdits(false)
      .setPublishingSummary(false)     // learners never see other people's answers
      .setShowLinkToRespondAgain(true) // a volunteer can hand the same phone to the next learner
      .setConfirmationMessage(fill(T.thanks));
  // Newer Google accounts create forms unpublished; publish it if this option exists
  if (typeof form.setPublished === "function") form.setPublished(true);
  form.setAcceptingResponses(true);

  // Page 1 — about you (not scored). "I am…" and "How comfortable…" are the same as in the
  // Pre-Assessment form, so the two results can be compared group by group.
  form.addTextItem().setTitle(T.name).setHelpText(T.nameHelp).setRequired(false);
  form.addMultipleChoiceItem().setTitle(T.who).setChoiceValues(T.whoOptions).setRequired(true);
  form.addMultipleChoiceItem().setTitle(T.tookPre).setChoiceValues(T.tookPreOptions).setRequired(true);
  form.addCheckboxItem().setTitle(T.steps)
      .setChoiceValues(POST_MODULES.map(function (m) { return m.step + " · " + m.title[lang]; }))
      .setRequired(false);
  form.addScaleItem().setTitle(T.confident).setBounds(1, 5).setLabels(T.low, T.high).setRequired(true);

  // Pages 2–8 — one page per topic, 2 questions each, 1 point per question
  let count = 0;
  POST_TOPICS.forEach(function (topic, ti) {
    const questions = POST_QUESTIONS[lang].filter(function (q) { return q.topic === topic.id; });
    if (!questions.length) return;
    form.addPageBreakItem()
        .setTitle(T.topic.replace("{n}", ti + 1).replace("{of}", POST_TOPICS.length) + " · " + topic.emoji + " " + topic.title[lang])
        .setHelpText(T.pageHelp);
    questions.forEach(function (q) {
      const m = POST_MODULES.filter(function (x) { return x.id === q.lesson; })[0];
      const item = form.addMultipleChoiceItem();
      const right = T.correct.replace("{tip}", q.tip);
      const wrong = T.wrong.replace("{a}", q.options[q.answer]).replace("{tip}", q.tip)
                           .replace("{n}", m.step).replace("{t}", m.title[lang]);
      item.setTitle(q.q)
          .setChoices(q.options.map(function (text, i) { return item.createChoice(text, i === q.answer); }))
          .setRequired(true)
          .setPoints(1)
          .setFeedbackForCorrect(FormApp.createFeedback().setText(right).build())
          .setFeedbackForIncorrect(FormApp.createFeedback().setText(wrong).build());
      count++;
    });
  });

  // Last page — one open question (not scored), so the team knows what to teach next
  form.addPageBreakItem().setTitle(T.lastPage);
  form.addParagraphTextItem().setTitle(T.next).setHelpText(T.nextHelp).setRequired(false);

  const shareLink = form.getPublishedUrl();
  Logger.log("✅ " + T.title + "  (" + count + " scored questions, pass mark " + nums.pass + "/" + total + ")");
  Logger.log("   Share link (for learners): " + shareLink);
  Logger.log("   Edit link (for the team only): " + form.getEditUrl());
  return shareLink;
}

// ---------------------------------------------------------------------------
// Text of the form in each language. {total}, {pass} and {min} are filled in from the questions.
// ---------------------------------------------------------------------------
const POST_TEXT = {
  "en": {
    "title": "Digital Saathi — Post-Assessment Quiz",
    "description": "Well done for finishing the Digital Saathi learning steps! 🎉 This quiz shows how much you have learned.\n\n• {total} everyday questions · about {min} minutes\n• Score {pass} or more out of {total} (70%) to qualify for the Digital Saathi certificate\n• At the end you will see your score and the right answers\n\n🔒 Never type your OTP, PIN, password or bank details in any form.",
    "name": "Your first name (optional)",
    "nameHelp": "So a Saathi volunteer can find your result for the certificate. You can leave this empty.",
    "who": "I am…",
    "whoOptions": [
      "A senior citizen (60+)",
      "A homemaker",
      "A child or student (8–14 years)",
      "Other"
    ],
    "tookPre": "Did you take the Pre-Assessment Quiz before you started learning?",
    "tookPreOptions": [
      "Yes",
      "No",
      "I don't remember"
    ],
    "steps": "Which learning steps did you finish? (Tick all that apply)",
    "confident": "How comfortable are you using a smartphone today?",
    "low": "Not comfortable",
    "high": "Very comfortable",
    "topic": "Topic {n} of {of}",
    "pageHelp": "Choose one answer for each question.",
    "correct": "Correct — well done! 💡 {tip}",
    "wrong": "Not quite. The right answer is: “{a}”. 💡 {tip} (Look at Step {n} — {t} again.)",
    "lastPage": "One last thing",
    "next": "What would you like to learn next? (optional)",
    "nextHelp": "For example: video calls, filling online forms, using AI safely…",
    "thanks": "Thank you! 🎉 Click “View score” to see your result. If you scored {pass} or more out of {total}, show it to a Digital Saathi volunteer for your certificate. Keep practising on your own phone!"
  },
  "hi": {
    "title": "डिजिटल साथी — अंतिम क्विज़ (Post-Assessment)",
    "description": "डिजिटल साथी के सीखने के चरण पूरे करने के लिए बधाई! 🎉 यह क्विज़ दिखाता है कि आपने कितना सीखा।\n\n• रोज़मर्रा के {total} सवाल · लगभग {min} मिनट\n• डिजिटल साथी प्रमाणपत्र के लिए {total} में से {pass} या ज़्यादा (70%) अंक लाएं\n• अंत में आपको अपना स्कोर और सही जवाब दिखेंगे\n\n🔒 किसी भी फ़ॉर्म में कभी भी अपना OTP, PIN, पासवर्ड या बैंक की जानकारी न लिखें।",
    "name": "आपका पहला नाम (वैकल्पिक)",
    "nameHelp": "ताकि प्रमाणपत्र के लिए कोई साथी स्वयंसेवक आपका नतीजा ढूंढ सके। आप इसे खाली भी छोड़ सकते हैं।",
    "who": "मैं हूँ…",
    "whoOptions": [
      "वरिष्ठ नागरिक (60+)",
      "गृहिणी",
      "बच्चा या विद्यार्थी (8–14 साल)",
      "अन्य"
    ],
    "tookPre": "क्या आपने सीखना शुरू करने से पहले शुरुआती क्विज़ (Pre-Assessment) दिया था?",
    "tookPreOptions": [
      "हाँ",
      "नहीं",
      "याद नहीं"
    ],
    "steps": "आपने सीखने के कौन-से चरण पूरे किए? (जितने लागू हों, सब पर टिक करें)",
    "confident": "आज आप स्मार्टफ़ोन इस्तेमाल करने में कितना सहज महसूस करते हैं?",
    "low": "बिल्कुल सहज नहीं",
    "high": "बहुत सहज",
    "topic": "विषय {n} / {of}",
    "pageHelp": "हर सवाल का एक जवाब चुनें।",
    "correct": "सही जवाब — शाबाश! 💡 {tip}",
    "wrong": "पूरी तरह सही नहीं। सही जवाब है: “{a}”। 💡 {tip} (चरण {n} — {t} फिर से देखें।)",
    "lastPage": "आख़िरी बात",
    "next": "आगे आप क्या सीखना चाहेंगे? (वैकल्पिक)",
    "nextHelp": "जैसे: वीडियो कॉल, ऑनलाइन फ़ॉर्म भरना, AI का सुरक्षित इस्तेमाल…",
    "thanks": "धन्यवाद! 🎉 अपना नतीजा देखने के लिए “View score” दबाएं। अगर आपके {total} में से {pass} या ज़्यादा अंक हैं, तो प्रमाणपत्र के लिए इसे किसी डिजिटल साथी स्वयंसेवक को दिखाएं। अपने फ़ोन पर अभ्यास करते रहें!"
  },
  "mr": {
    "title": "डिजिटल साथी — अंतिम क्विझ (Post-Assessment)",
    "description": "डिजिटल साथीचे शिकण्याचे टप्पे पूर्ण केल्याबद्दल अभिनंदन! 🎉 तुम्ही किती शिकलात ते ही क्विझ दाखवते.\n\n• रोजचे {total} प्रश्न · सुमारे {min} मिनिटे\n• डिजिटल साथी प्रमाणपत्रासाठी {total} पैकी {pass} किंवा जास्त (70%) गुण मिळवा\n• शेवटी तुम्हाला तुमचे गुण आणि बरोबर उत्तरे दिसतील\n\n🔒 कोणत्याही फॉर्ममध्ये कधीही तुमचा OTP, PIN, पासवर्ड किंवा बँकेची माहिती लिहू नका.",
    "name": "तुमचे पहिले नाव (ऐच्छिक)",
    "nameHelp": "म्हणजे प्रमाणपत्रासाठी साथी स्वयंसेवकांना तुमचा निकाल शोधता येईल. तुम्ही हे रिकामेही ठेवू शकता.",
    "who": "मी आहे…",
    "whoOptions": [
      "ज्येष्ठ नागरिक (60+)",
      "गृहिणी",
      "मूल किंवा विद्यार्थी (8–14 वर्षे)",
      "इतर"
    ],
    "tookPre": "शिकायला सुरुवात करण्याआधी तुम्ही सुरुवातीची क्विझ (Pre-Assessment) दिली होती का?",
    "tookPreOptions": [
      "हो",
      "नाही",
      "आठवत नाही"
    ],
    "steps": "तुम्ही शिकण्याचे कोणते टप्पे पूर्ण केले? (लागू असतील ते सगळे निवडा)",
    "confident": "आज स्मार्टफोन वापरताना तुम्हाला किती सहज वाटते?",
    "low": "अजिबात सहज नाही",
    "high": "खूप सहज",
    "topic": "विषय {n} / {of}",
    "pageHelp": "प्रत्येक प्रश्नाचे एक उत्तर निवडा.",
    "correct": "बरोबर — शाब्बास! 💡 {tip}",
    "wrong": "पूर्ण बरोबर नाही. बरोबर उत्तर आहे: “{a}”. 💡 {tip} (टप्पा {n} — {t} पुन्हा पाहा.)",
    "lastPage": "शेवटची गोष्ट",
    "next": "पुढे तुम्हाला काय शिकायला आवडेल? (ऐच्छिक)",
    "nextHelp": "उदा.: व्हिडिओ कॉल, ऑनलाइन फॉर्म भरणे, AI सुरक्षितपणे वापरणे…",
    "thanks": "धन्यवाद! 🎉 तुमचा निकाल पाहण्यासाठी “View score” दाबा. तुम्हाला {total} पैकी {pass} किंवा जास्त गुण मिळाले असतील, तर प्रमाणपत्रासाठी ते डिजिटल साथीच्या स्वयंसेवकाला दाखवा. तुमच्या फोनवर सराव करत राहा!"
  }
};

// The six approved learning modules (same order and titles as the website and the Pre-Assessment form)
const POST_MODULES = [
  {
    "id": "phone",
    "step": 1,
    "title": {
      "en": "Smartphone Basics",
      "hi": "स्मार्टफ़ोन की बुनियादी बातें",
      "mr": "स्मार्टफोनच्या मूलभूत गोष्टी"
    }
  },
  {
    "id": "google",
    "step": 2,
    "title": {
      "en": "Google, Gmail & YouTube",
      "hi": "Google, Gmail और YouTube",
      "mr": "Google, Gmail आणि YouTube"
    }
  },
  {
    "id": "family",
    "step": 3,
    "title": {
      "en": "Communication with family & friends",
      "hi": "परिवार और दोस्तों से बातचीत",
      "mr": "कुटुंब आणि मित्रांशी संवाद"
    }
  },
  {
    "id": "safety",
    "step": 4,
    "title": {
      "en": "Stay safe online",
      "hi": "ऑनलाइन सुरक्षित रहें",
      "mr": "ऑनलाइन सुरक्षित राहा"
    }
  },
  {
    "id": "money",
    "step": 5,
    "title": {
      "en": "Digital payments & government services",
      "hi": "डिजिटल भुगतान और सरकारी सेवाएं",
      "mr": "डिजिटल पेमेंट आणि सरकारी सेवा"
    }
  },
  {
    "id": "ai",
    "step": 6,
    "title": {
      "en": "AI tools & family digital safety",
      "hi": "AI टूल और परिवार की डिजिटल सुरक्षा",
      "mr": "AI टूल्स आणि कुटुंबाची डिजिटल सुरक्षा"
    }
  }
];

// The seven topics of the Post-Assessment (same as the website's POST_TOPICS), one form page each
const POST_TOPICS = [
  {
    "id": "basics",
    "emoji": "📱",
    "title": {
      "en": "Smartphone basics",
      "hi": "स्मार्टफ़ोन की बुनियादी बातें",
      "mr": "स्मार्टफोनच्या मूलभूत गोष्टी"
    }
  },
  {
    "id": "browse",
    "emoji": "🔍",
    "title": {
      "en": "Internet & Google",
      "hi": "इंटरनेट और Google",
      "mr": "इंटरनेट आणि Google"
    }
  },
  {
    "id": "talk",
    "emoji": "💬",
    "title": {
      "en": "Talking with family & friends",
      "hi": "परिवार और दोस्तों से बातचीत",
      "mr": "कुटुंब आणि मित्रांशी संवाद"
    }
  },
  {
    "id": "upi",
    "emoji": "💳",
    "title": {
      "en": "Online payments & UPI safety",
      "hi": "ऑनलाइन भुगतान और UPI सुरक्षा",
      "mr": "ऑनलाइन पेमेंट आणि UPI सुरक्षा"
    }
  },
  {
    "id": "fraud",
    "emoji": "🛡️",
    "title": {
      "en": "Online fraud & safety",
      "hi": "ऑनलाइन धोखाधड़ी से बचाव",
      "mr": "ऑनलाइन फसवणुकीपासून बचाव"
    }
  },
  {
    "id": "gov",
    "emoji": "🏛️",
    "title": {
      "en": "Government services online",
      "hi": "ऑनलाइन सरकारी सेवाएं",
      "mr": "ऑनलाइन सरकारी सेवा"
    }
  },
  {
    "id": "solve",
    "emoji": "🧩",
    "title": {
      "en": "Solving everyday problems",
      "hi": "रोज़ की समस्याएं सुलझाना",
      "mr": "रोजच्या अडचणी सोडवणे"
    }
  }
];

// The 14 questions, copied from the website's POST_QUIZ ("answer" = number of the right option, counting from 0)
const POST_QUESTIONS = {
  "en": [
    {
      "q": "You may need help in an emergency, even when your phone is locked. What can you set up today?",
      "options": [
        "Emergency SOS, so pressing the power button 5 times calls for help",
        "A new wallpaper",
        "A louder ringtone"
      ],
      "answer": 0,
      "topic": "basics",
      "lesson": "phone",
      "tip": "Settings → Safety & emergency → Emergency SOS. Add emergency contacts too, so they show on the lock screen."
    },
    {
      "q": "Your grandson wants to play a game on your phone. How can you keep him inside that one game?",
      "options": [
        "Tell him your phone PIN",
        "Turn on App pinning and pin the game",
        "Switch the phone off and on again"
      ],
      "answer": 1,
      "topic": "basics",
      "lesson": "phone",
      "tip": "With App pinning, he cannot leave the game or open other apps without your PIN."
    },
    {
      "q": "You need a pharmacy near you, quickly. What is the easiest way to find one?",
      "options": [
        "Wait for a newspaper advertisement",
        "Search “pharmacy near me” in Google Maps",
        "Ask strangers in a WhatsApp group"
      ],
      "answer": 1,
      "topic": "browse",
      "lesson": "google",
      "tip": "Google Maps shows the nearest places, how far they are and the way to get there."
    },
    {
      "q": "Your medicine strip has instructions in a language you cannot read. What can help?",
      "options": [
        "Guess what it says",
        "Throw the medicine away",
        "Point Google Lens at it and choose Translate"
      ],
      "answer": 2,
      "topic": "browse",
      "lesson": "google",
      "tip": "Tap the camera icon in the Google search bar, point it at the words and choose Translate."
    },
    {
      "q": "You are coming home alone late in the evening. How can your family see where you are until you reach home?",
      "options": [
        "Share your live location on WhatsApp",
        "Send them a photo every hour",
        "Call them every five minutes"
      ],
      "answer": 0,
      "topic": "talk",
      "lesson": "family",
      "tip": "In a chat tap 📎 → Location → Share live location, and choose how long to share."
    },
    {
      "q": "On a video call, your son wants to see your screen to guide you through a phone setting. What should you do first?",
      "options": [
        "Open your bank app so he can check it",
        "Close bank and payment apps, then share your screen",
        "Switch off the internet"
      ],
      "answer": 1,
      "topic": "talk",
      "lesson": "family",
      "tip": "Screen sharing shows everything on your screen, so close bank and payment apps before you share."
    },
    {
      "q": "A buyer says: “Scan this QR code and enter your UPI PIN to receive ₹2,000.” What is true?",
      "options": [
        "You must enter your PIN to get the money",
        "It is safe because a QR code is used",
        "You never need a PIN to receive money — it is a scam"
      ],
      "answer": 2,
      "topic": "upi",
      "lesson": "money",
      "tip": "Your UPI PIN is only for sending money. Anyone who asks for it to “send” you money is a fraud."
    },
    {
      "q": "You scan a shop's QR code, but the name on the screen is someone you don't know. What do you do?",
      "options": [
        "Cancel, and ask the shopkeeper before paying",
        "Pay anyway — QR codes are always correct",
        "Pay twice to be sure"
      ],
      "answer": 0,
      "topic": "upi",
      "lesson": "money",
      "tip": "Always read the name and the amount on the screen before you enter your PIN."
    },
    {
      "q": "A message says: “Your electricity will be cut tonight. Call this number now.” What is the safe thing to do?",
      "options": [
        "Call the number straight away",
        "Pay whatever amount they ask",
        "Don't call or tap anything — check in the official app or at the office"
      ],
      "answer": 2,
      "topic": "fraud",
      "lesson": "safety",
      "tip": "Messages that rush you about KYC, electricity bills or parcels are a common scam."
    },
    {
      "q": "Someone has cheated you and money has left your bank account. What should you do first?",
      "options": [
        "Wait a few days to see if it comes back",
        "Call 1930 at once, and call your bank to block your card or UPI",
        "Tell nobody because you feel embarrassed"
      ],
      "answer": 1,
      "topic": "fraud",
      "lesson": "safety",
      "tip": "The first hour matters most. Call 1930 or report it at cybercrime.gov.in."
    },
    {
      "q": "Your father is a pensioner and finds it hard to go to the bank for his life certificate. What can he do?",
      "options": [
        "Stop taking his pension",
        "Submit it from home with a face scan in the Jeevan Pramaan app",
        "Send a photo of his Aadhaar to an unknown number"
      ],
      "answer": 1,
      "topic": "gov",
      "lesson": "money",
      "tip": "With the Jeevan Pramaan and AadhaarFaceRD apps, pensioners scan their face with the phone camera."
    },
    {
      "q": "You are 72 years old. Which card can give you free hospital treatment cover?",
      "options": [
        "The Ayushman Vay Vandana card",
        "A shop's loyalty card",
        "A new SIM card"
      ],
      "answer": 0,
      "topic": "gov",
      "lesson": "money",
      "tip": "Everyone aged 70 and above can get it. Apply in the Ayushman app, at beneficiary.nha.gov.in, or at a hospital or CSC."
    },
    {
      "q": "Your phone battery runs out before the evening. What will help it last longer?",
      "options": [
        "Keep the screen at full brightness",
        "Turn on Battery Saver and keep the screen brightness low",
        "Keep every app open all day"
      ],
      "answer": 1,
      "topic": "solve",
      "lesson": "phone",
      "tip": "Settings → Battery → Battery Saver. Also switch off Location and Bluetooth when you don't need them."
    },
    {
      "q": "You have rice, dal, onion and tomato at home and need a quick dinner idea. What can help?",
      "options": [
        "Throw the food away and order from outside",
        "Type your bank details into an AI app",
        "Tell an AI app what you have and ask for a simple recipe"
      ],
      "answer": 2,
      "topic": "solve",
      "lesson": "ai",
      "tip": "AI apps like Gemini or ChatGPT can suggest recipes — but never type private details into them."
    }
  ],
  "hi": [
    {
      "q": "आपातकाल में मदद की ज़रूरत पड़ सकती है, तब भी जब फ़ोन लॉक हो। आप आज क्या सेट कर सकते हैं?",
      "options": [
        "इमरजेंसी SOS, ताकि पावर बटन 5 बार दबाने से मदद के लिए कॉल जाए",
        "नया वॉलपेपर",
        "तेज़ आवाज़ वाली रिंगटोन"
      ],
      "answer": 0,
      "topic": "basics",
      "lesson": "phone",
      "tip": "Settings → Safety & emergency → Emergency SOS। इमरजेंसी कॉन्टैक्ट भी जोड़ें, ताकि वे लॉक स्क्रीन पर दिखें।"
    },
    {
      "q": "आपका पोता आपके फ़ोन पर गेम खेलना चाहता है। उसे उसी एक गेम में कैसे रखें?",
      "options": [
        "उसे अपने फ़ोन का PIN बता दें",
        "App pinning चालू करके गेम को पिन करें",
        "फ़ोन बंद करके फिर चालू करें"
      ],
      "answer": 1,
      "topic": "basics",
      "lesson": "phone",
      "tip": "App pinning से वह आपके PIN के बिना गेम से बाहर नहीं निकल सकता और दूसरे ऐप नहीं खोल सकता।"
    },
    {
      "q": "आपको जल्दी से पास की दवा की दुकान चाहिए। उसे खोजने का सबसे आसान तरीका क्या है?",
      "options": [
        "अख़बार के विज्ञापन का इंतज़ार करें",
        "Google Maps में “pharmacy near me” खोजें",
        "WhatsApp ग्रुप में अनजान लोगों से पूछें"
      ],
      "answer": 1,
      "topic": "browse",
      "lesson": "google",
      "tip": "Google Maps पास की जगहें, उनकी दूरी और वहां पहुंचने का रास्ता दिखाता है।"
    },
    {
      "q": "आपकी दवा की पट्टी पर निर्देश ऐसी भाषा में हैं जो आप पढ़ नहीं सकते। क्या मदद कर सकता है?",
      "options": [
        "अंदाज़ा लगा लें कि क्या लिखा है",
        "दवा फेंक दें",
        "उस पर Google Lens रखें और Translate चुनें"
      ],
      "answer": 2,
      "topic": "browse",
      "lesson": "google",
      "tip": "Google सर्च बार में कैमरा आइकन दबाएं, उसे शब्दों पर रखें और Translate चुनें।"
    },
    {
      "q": "आप शाम को देर से अकेले घर लौट रहे हैं। घर पहुंचने तक परिवार कैसे देख सकता है कि आप कहां हैं?",
      "options": [
        "WhatsApp पर अपनी लाइव लोकेशन शेयर करें",
        "हर घंटे उन्हें एक फ़ोटो भेजें",
        "हर पांच मिनट में उन्हें कॉल करें"
      ],
      "answer": 0,
      "topic": "talk",
      "lesson": "family",
      "tip": "चैट में 📎 → Location → Share live location दबाएं और समय चुनें।"
    },
    {
      "q": "वीडियो कॉल पर आपका बेटा आपकी स्क्रीन देखकर फ़ोन की कोई सेटिंग समझाना चाहता है। पहले आप क्या करें?",
      "options": [
        "अपना बैंक ऐप खोलें ताकि वह उसे देख ले",
        "बैंक और पेमेंट ऐप बंद करें, फिर स्क्रीन शेयर करें",
        "इंटरनेट बंद कर दें"
      ],
      "answer": 1,
      "topic": "talk",
      "lesson": "family",
      "tip": "स्क्रीन शेयर करने पर स्क्रीन की हर चीज़ दिखती है, इसलिए पहले बैंक और पेमेंट ऐप बंद करें।"
    },
    {
      "q": "एक खरीदार कहता है: “यह QR कोड स्कैन करें और ₹2,000 पाने के लिए अपना UPI PIN डालें।” सच क्या है?",
      "options": [
        "पैसे पाने के लिए PIN डालना ज़रूरी है",
        "QR कोड है, इसलिए यह सुरक्षित है",
        "पैसे पाने के लिए कभी PIN नहीं लगता — यह धोखा है"
      ],
      "answer": 2,
      "topic": "upi",
      "lesson": "money",
      "tip": "UPI PIN सिर्फ़ पैसे भेजने के लिए है। जो इसे आपको पैसे “भेजने” के लिए मांगे, वह धोखेबाज़ है।"
    },
    {
      "q": "आपने दुकान का QR कोड स्कैन किया, पर स्क्रीन पर किसी अनजान व्यक्ति का नाम है। आप क्या करेंगे?",
      "options": [
        "रद्द करें और भुगतान से पहले दुकानदार से पूछें",
        "फिर भी भुगतान करें — QR कोड हमेशा सही होता है",
        "पक्का करने के लिए दो बार भुगतान करें"
      ],
      "answer": 0,
      "topic": "upi",
      "lesson": "money",
      "tip": "PIN डालने से पहले हमेशा स्क्रीन पर नाम और रकम पढ़ें।"
    },
    {
      "q": "संदेश आता है: “आज रात आपकी बिजली कट जाएगी। अभी इस नंबर पर कॉल करें।” सुरक्षित कदम क्या है?",
      "options": [
        "तुरंत उस नंबर पर कॉल करें",
        "वे जितने पैसे मांगें, दे दें",
        "न कॉल करें, न कुछ दबाएं — सिर्फ़ आधिकारिक ऐप या दफ़्तर में जांचें"
      ],
      "answer": 2,
      "topic": "fraud",
      "lesson": "safety",
      "tip": "KYC, बिजली बिल या पार्सल के नाम पर जल्दबाज़ी करवाने वाले संदेश आम धोखा हैं।"
    },
    {
      "q": "किसी ने आपको ठग लिया और आपके बैंक खाते से पैसे निकल गए। सबसे पहले क्या करें?",
      "options": [
        "कुछ दिन इंतज़ार करें कि शायद पैसे लौट आएं",
        "तुरंत 1930 पर कॉल करें, और कार्ड या UPI बंद कराने के लिए बैंक को कॉल करें",
        "शर्म के कारण किसी को न बताएं"
      ],
      "answer": 1,
      "topic": "fraud",
      "lesson": "safety",
      "tip": "पहला घंटा सबसे ज़रूरी है। 1930 पर कॉल करें या cybercrime.gov.in पर शिकायत करें।"
    },
    {
      "q": "आपके पिताजी पेंशनभोगी हैं और जीवन प्रमाणपत्र के लिए बैंक जाना उनके लिए मुश्किल है। वे क्या कर सकते हैं?",
      "options": [
        "पेंशन लेना बंद कर दें",
        "Jeevan Pramaan ऐप में चेहरे के स्कैन से घर बैठे जमा करें",
        "अपने आधार की फ़ोटो किसी अनजान नंबर पर भेजें"
      ],
      "answer": 1,
      "topic": "gov",
      "lesson": "money",
      "tip": "Jeevan Pramaan और AadhaarFaceRD ऐप से पेंशनभोगी फ़ोन के कैमरे से अपना चेहरा स्कैन करते हैं।"
    },
    {
      "q": "आपकी उम्र 72 साल है। कौन-सा कार्ड आपको अस्पताल में मुफ़्त इलाज का कवर दे सकता है?",
      "options": [
        "आयुष्मान वय वंदना कार्ड",
        "किसी दुकान का लॉयल्टी कार्ड",
        "नया सिम कार्ड"
      ],
      "answer": 0,
      "topic": "gov",
      "lesson": "money",
      "tip": "70 साल और उससे ज़्यादा उम्र का हर व्यक्ति इसे पा सकता है। Ayushman ऐप, beneficiary.nha.gov.in, या किसी अस्पताल या CSC पर आवेदन करें।"
    },
    {
      "q": "आपके फ़ोन की बैटरी शाम से पहले खत्म हो जाती है। उसे ज़्यादा देर चलाने में क्या मदद करेगा?",
      "options": [
        "स्क्रीन की रोशनी पूरी रखें",
        "Battery Saver चालू करें और स्क्रीन की रोशनी कम रखें",
        "दिनभर हर ऐप खुला रखें"
      ],
      "answer": 1,
      "topic": "solve",
      "lesson": "phone",
      "tip": "Settings → Battery → Battery Saver। ज़रूरत न हो तो Location और Bluetooth भी बंद रखें।"
    },
    {
      "q": "घर में चावल, दाल, प्याज़ और टमाटर हैं और आपको रात के खाने का जल्दी कोई आइडिया चाहिए। क्या मदद कर सकता है?",
      "options": [
        "खाना फेंककर बाहर से मंगवा लें",
        "किसी AI ऐप में अपनी बैंक की जानकारी लिखें",
        "AI ऐप को बताएं कि आपके पास क्या है और आसान रेसिपी पूछें"
      ],
      "answer": 2,
      "topic": "solve",
      "lesson": "ai",
      "tip": "Gemini या ChatGPT जैसे AI ऐप रेसिपी सुझा सकते हैं — पर उनमें कभी अपनी निजी जानकारी न लिखें।"
    }
  ],
  "mr": [
    {
      "q": "फोन लॉक असतानाही आपत्कालीन वेळी मदत लागू शकते. तुम्ही आजच काय सेट करू शकता?",
      "options": [
        "आपत्कालीन SOS, म्हणजे पॉवर बटण 5 वेळा दाबल्यावर मदतीसाठी कॉल जाईल",
        "नवीन वॉलपेपर",
        "मोठ्या आवाजाची रिंगटोन"
      ],
      "answer": 0,
      "topic": "basics",
      "lesson": "phone",
      "tip": "Settings → Safety & emergency → Emergency SOS. आपत्कालीन संपर्कही जोडा, म्हणजे ते लॉक स्क्रीनवर दिसतील."
    },
    {
      "q": "तुमच्या नातवाला तुमच्या फोनवर गेम खेळायचा आहे. त्याला त्या एकाच गेममध्ये कसे ठेवाल?",
      "options": [
        "त्याला तुमच्या फोनचा PIN सांगा",
        "App pinning सुरू करून गेम पिन करा",
        "फोन बंद करून पुन्हा सुरू करा"
      ],
      "answer": 1,
      "topic": "basics",
      "lesson": "phone",
      "tip": "App pinning मुळे तुमच्या PIN शिवाय तो गेममधून बाहेर पडू शकत नाही किंवा दुसरे ॲप उघडू शकत नाही."
    },
    {
      "q": "तुम्हाला लवकर जवळचे औषधाचे दुकान हवे आहे. ते शोधण्याचा सर्वात सोपा मार्ग कोणता?",
      "options": [
        "वर्तमानपत्रातील जाहिरातीची वाट पाहा",
        "Google Maps मध्ये “pharmacy near me” शोधा",
        "WhatsApp ग्रुपमधील अनोळखी लोकांना विचारा"
      ],
      "answer": 1,
      "topic": "browse",
      "lesson": "google",
      "tip": "Google Maps जवळची ठिकाणे, ती किती दूर आहेत आणि तिथे जाण्याचा मार्ग दाखवते."
    },
    {
      "q": "तुमच्या औषधाच्या पट्टीवरच्या सूचना तुम्हाला वाचता न येणाऱ्या भाषेत आहेत. काय मदत करेल?",
      "options": [
        "काय लिहिले आहे याचा अंदाज लावा",
        "औषध फेकून द्या",
        "त्यावर Google Lens धरा आणि Translate निवडा"
      ],
      "answer": 2,
      "topic": "browse",
      "lesson": "google",
      "tip": "Google सर्च बारमधील कॅमेरा आयकॉन दाबा, तो शब्दांवर धरा आणि Translate निवडा."
    },
    {
      "q": "तुम्ही संध्याकाळी उशिरा एकटे घरी येत आहात. घरी पोहोचेपर्यंत तुम्ही कुठे आहात ते कुटुंबाला कसे दिसेल?",
      "options": [
        "WhatsApp वर तुमचे लाइव्ह लोकेशन शेअर करा",
        "दर तासाला त्यांना एक फोटो पाठवा",
        "दर पाच मिनिटांनी त्यांना कॉल करा"
      ],
      "answer": 0,
      "topic": "talk",
      "lesson": "family",
      "tip": "चॅटमध्ये 📎 → Location → Share live location दाबा आणि वेळ निवडा."
    },
    {
      "q": "व्हिडिओ कॉलवर तुमचा मुलगा तुमची स्क्रीन पाहून फोनची एखादी सेटिंग समजावू इच्छितो. आधी काय कराल?",
      "options": [
        "तुमचे बँक ॲप उघडा म्हणजे तो ते पाहील",
        "बँक आणि पेमेंट ॲप बंद करा, मग स्क्रीन शेअर करा",
        "इंटरनेट बंद करा"
      ],
      "answer": 1,
      "topic": "talk",
      "lesson": "family",
      "tip": "स्क्रीन शेअर केल्यावर स्क्रीनवरचे सगळे दिसते, म्हणून आधी बँक आणि पेमेंट ॲप बंद करा."
    },
    {
      "q": "एक खरेदीदार म्हणतो: “हा QR कोड स्कॅन करा आणि ₹2,000 मिळवण्यासाठी तुमचा UPI PIN टाका.” खरे काय आहे?",
      "options": [
        "पैसे मिळवण्यासाठी PIN टाकावाच लागतो",
        "QR कोड आहे, म्हणून हे सुरक्षित आहे",
        "पैसे मिळवण्यासाठी कधीही PIN लागत नाही — ही फसवणूक आहे"
      ],
      "answer": 2,
      "topic": "upi",
      "lesson": "money",
      "tip": "UPI PIN फक्त पैसे पाठवण्यासाठी असतो. तुम्हाला पैसे “पाठवण्यासाठी” तो मागणारा फसवणूक करणारा असतो."
    },
    {
      "q": "तुम्ही दुकानाचा QR कोड स्कॅन केला, पण स्क्रीनवर अनोळखी व्यक्तीचे नाव आहे. तुम्ही काय कराल?",
      "options": [
        "रद्द करा आणि पैसे देण्याआधी दुकानदाराला विचारा",
        "तरीही पैसे द्या — QR कोड नेहमी बरोबर असतो",
        "खात्रीसाठी दोनदा पैसे द्या"
      ],
      "answer": 0,
      "topic": "upi",
      "lesson": "money",
      "tip": "PIN टाकण्याआधी स्क्रीनवरचे नाव आणि रक्कम नेहमी वाचा."
    },
    {
      "q": "संदेश येतो: “आज रात्री तुमची वीज कापली जाईल. आत्ताच या नंबरवर कॉल करा.” सुरक्षित पाऊल कोणते?",
      "options": [
        "लगेच त्या नंबरवर कॉल करा",
        "ते मागतील तेवढे पैसे द्या",
        "कॉल करू नका, काहीही दाबू नका — फक्त अधिकृत ॲपमध्ये किंवा कार्यालयात तपासा"
      ],
      "answer": 2,
      "topic": "fraud",
      "lesson": "safety",
      "tip": "KYC, वीज बिल किंवा पार्सलच्या नावाने घाई करायला लावणारे संदेश ही नेहमीची फसवणूक आहे."
    },
    {
      "q": "कोणीतरी तुम्हाला फसवले आणि तुमच्या बँक खात्यातून पैसे गेले. सर्वात आधी काय कराल?",
      "options": [
        "पैसे परत येतील का ते पाहण्यासाठी काही दिवस थांबा",
        "लगेच 1930 वर कॉल करा, आणि कार्ड किंवा UPI बंद करण्यासाठी बँकेला कॉल करा",
        "लाज वाटते म्हणून कोणालाही सांगू नका"
      ],
      "answer": 1,
      "topic": "fraud",
      "lesson": "safety",
      "tip": "पहिला तास सर्वात महत्त्वाचा असतो. 1930 वर कॉल करा किंवा cybercrime.gov.in वर तक्रार करा."
    },
    {
      "q": "तुमचे वडील पेन्शनधारक आहेत आणि हयातीच्या दाखल्यासाठी बँकेत जाणे त्यांना अवघड आहे. ते काय करू शकतात?",
      "options": [
        "पेन्शन घेणे बंद करा",
        "Jeevan Pramaan ॲपमध्ये चेहरा स्कॅन करून घरबसल्या जमा करा",
        "त्यांच्या आधारचा फोटो अनोळखी नंबरवर पाठवा"
      ],
      "answer": 1,
      "topic": "gov",
      "lesson": "money",
      "tip": "Jeevan Pramaan आणि AadhaarFaceRD ॲपद्वारे पेन्शनधारक फोनच्या कॅमेऱ्याने चेहरा स्कॅन करतात."
    },
    {
      "q": "तुमचे वय 72 वर्षे आहे. कोणते कार्ड तुम्हाला रुग्णालयातील मोफत उपचारांचे कवच देऊ शकते?",
      "options": [
        "आयुष्मान वय वंदना कार्ड",
        "एखाद्या दुकानाचे लॉयल्टी कार्ड",
        "नवीन सिम कार्ड"
      ],
      "answer": 0,
      "topic": "gov",
      "lesson": "money",
      "tip": "70 वर्षे व त्याहून अधिक वयाची प्रत्येक व्यक्ती ते मिळवू शकते. Ayushman ॲप, beneficiary.nha.gov.in, किंवा जवळच्या रुग्णालयात किंवा CSC मध्ये अर्ज करा."
    },
    {
      "q": "तुमच्या फोनची बॅटरी संध्याकाळपूर्वीच संपते. ती जास्त वेळ टिकण्यासाठी काय मदत करेल?",
      "options": [
        "स्क्रीनचा प्रकाश पूर्ण ठेवा",
        "Battery Saver सुरू करा आणि स्क्रीनचा प्रकाश कमी ठेवा",
        "दिवसभर सगळी ॲप्स उघडी ठेवा"
      ],
      "answer": 1,
      "topic": "solve",
      "lesson": "phone",
      "tip": "Settings → Battery → Battery Saver. गरज नसताना Location आणि Bluetooth ही बंद ठेवा."
    },
    {
      "q": "घरी तांदूळ, डाळ, कांदा आणि टोमॅटो आहेत आणि रात्रीच्या जेवणासाठी पटकन कल्पना हवी आहे. काय मदत करेल?",
      "options": [
        "अन्न फेकून बाहेरून मागवा",
        "एखाद्या AI ॲपमध्ये तुमची बँकेची माहिती लिहा",
        "AI ॲपला तुमच्याकडे काय आहे ते सांगा आणि सोपी रेसिपी विचारा"
      ],
      "answer": 2,
      "topic": "solve",
      "lesson": "ai",
      "tip": "Gemini किंवा ChatGPT सारखी AI ॲप्स रेसिपी सुचवू शकतात — पण त्यात कधीही तुमची खासगी माहिती लिहू नका."
    }
  ]
};
