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
 * The 20 questions are the SAME as the website's Post-Assessment (POST_QUIZ in
 * index.html), grouped by the six learning steps (3 + 3 + 3 + 4 + 4 + 3), 4 answer choices each.
 * Eight of them re-test concepts from the Pre-Assessment in simpler everyday words, so the two
 * results can be compared; the other twelve are new practical questions on the same steps.
 * Page 1 asks the same "I am…" and "How comfortable…" questions as the Pre-Assessment
 * form, so the two forms' results can be compared (see POST-FORM-GUIDE.md, Part F).
 * ----------------------------------------------------------------------------
 */

function createPostEnglishForm() { return buildPostAssessmentForm_("en"); }
function createPostHindiForm()   { return buildPostAssessmentForm_("hi"); }
function createPostMarathiForm() { return buildPostAssessmentForm_("mr"); }
function createPostAllLanguages() { ["en", "hi", "mr"].forEach(buildPostAssessmentForm_); }

const POST_PASS_SHARE = 0.7;   // 70 % of the questions for the certificate — the same rule as the website (14 of 20)
// One emoji per learning step, shown in each page title
const POST_STEP_EMOJI = { phone: "📱", google: "🔍", family: "💬", safety: "🛡️", money: "💳", ai: "✨" };

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

  // Pages 2–7 — one page per learning step (the same six steps as the website and the Pre-Assessment), 1 point per question
  let count = 0;
  POST_MODULES.forEach(function (m) {
    const questions = POST_QUESTIONS[lang].filter(function (q) { return q.lesson === m.id; });
    if (!questions.length) return;
    form.addPageBreakItem()
        .setTitle(T.topic.replace("{n}", m.step).replace("{of}", POST_MODULES.length) + " · " + POST_STEP_EMOJI[m.id] + " " + m.title[lang])
        .setHelpText(T.pageHelp);
    questions.forEach(function (q) {
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
    "topic": "Step {n} of {of}",
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
    "topic": "चरण {n} / {of}",
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
    "topic": "टप्पा {n} / {of}",
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

// The 20 questions, copied from the website's POST_QUIZ ("answer" = number of the right option, counting from 0).
// "lesson" is the learning step the question belongs to (it decides the page) and is suggested again when it is missed.
const POST_QUESTIONS = {
  "en": [
    {
      "q": "You feel unsafe and want to call for help fast. Your Android phone has Emergency SOS turned on. What do you do?",
      "options": [
        "Press the volume button once",
        "Press the power button 5 times quickly",
        "Shake the phone twice",
        "Open the camera app"
      ],
      "answer": 1,
      "lesson": "phone",
      "tip": "With Emergency SOS turned on, pressing the power button 5 times quickly calls for help. Add emergency contacts in Settings → Safety & emergency."
    },
    {
      "q": "Your grandson wants to watch one video on your phone. You want him to stay only in that app. What helps?",
      "options": [
        "Turn on Airplane mode",
        "Turn on Battery Saver",
        "Turn on App pinning and pin the app",
        "Turn on Dark mode"
      ],
      "answer": 2,
      "lesson": "phone",
      "tip": "App pinning keeps the phone on one app. The child cannot leave it without your PIN. (iPhone: Guided Access.)"
    },
    {
      "q": "You often forget to take your medicine at 9 am. What is an easy way to remember?",
      "options": [
        "Say “Hey Google, remind me to take my medicine every day at 9 am”",
        "Switch the phone to silent",
        "Lock the screen with a PIN",
        "Turn on Battery Saver"
      ],
      "answer": 0,
      "lesson": "phone",
      "tip": "You can set a reminder just by speaking. The phone reminds you on time."
    },
    {
      "q": "A shop board is written in a language you cannot read. How can your phone camera help?",
      "options": [
        "Take a photo and email it to yourself",
        "Turn on Restricted Mode",
        "Open Google Forms",
        "Point Google Lens at the board and tap Translate"
      ],
      "answer": 3,
      "lesson": "google",
      "tip": "Tap the camera icon (Google Lens) in the Google search bar, point it at the words and choose Translate."
    },
    {
      "q": "Your 6-year-old granddaughter wants to watch videos on your phone. Which app is made for young children?",
      "options": [
        "YouTube Kids",
        "Gmail",
        "Google Maps",
        "Google Meet"
      ],
      "answer": 0,
      "lesson": "google",
      "tip": "YouTube Kids shows videos made for children. On normal YouTube you can turn on Restricted Mode."
    },
    {
      "q": "You do not want to be locked out of your Google account if you forget the password. What should you add?",
      "options": [
        "A new profile photo",
        "A longer name",
        "A recovery phone number and a recovery email",
        "A second Gmail with the same password"
      ],
      "answer": 2,
      "lesson": "google",
      "tip": "A recovery phone number and email help Google let you back in. Keep your password written down in a safe place at home."
    },
    {
      "q": "You are walking home late and want your family to follow you on the map. What do you do in a WhatsApp chat?",
      "options": [
        "Change your Status",
        "Tap 📎 → Location → Share live location",
        "Turn off “Last seen”",
        "Send a voice note every hour"
      ],
      "answer": 1,
      "lesson": "family",
      "tip": "Your family can follow you on the map until you reach home. You choose how long to share, for example 1 hour."
    },
    {
      "q": "Strangers keep adding you to WhatsApp groups. What can you do to stop it?",
      "options": [
        "Delete your WhatsApp account",
        "Reply to each stranger",
        "Mute every group",
        "Go to Settings → Privacy → Groups and choose “My contacts”"
      ],
      "answer": 3,
      "lesson": "family",
      "tip": "With “My contacts”, only people in your contacts can add you to a group."
    },
    {
      "q": "You are getting a new phone. You do not want to lose your WhatsApp chats and family photos. What should you do first?",
      "options": [
        "Turn on chat backup and photo backup",
        "Delete WhatsApp",
        "Remove your SIM card",
        "Nothing, they always come back on their own"
      ],
      "answer": 0,
      "lesson": "family",
      "tip": "Turn on WhatsApp chat backup (Google Drive on Android, iCloud on iPhone) and backup in Google Photos."
    },
    {
      "q": "A call sounds exactly like your daughter. She cries and asks for money right now. What is the safest first step?",
      "options": [
        "Send the money, then ask questions later",
        "Believe her because it is her voice",
        "Hang up and call her back on her own number, or ask for your family code word",
        "Ask her to send a selfie"
      ],
      "answer": 2,
      "lesson": "safety",
      "tip": "Scammers can copy a voice using AI. Use a family code word, or call back on the number you know."
    },
    {
      "q": "Someone cheated you online and took your money. Which helpline should you call to report it?",
      "options": [
        "108",
        "1091",
        "1098",
        "1930"
      ],
      "answer": 3,
      "lesson": "safety",
      "tip": "1930 is the National Cyber Crime Helpline. Call in the first hour, and call your bank to block your card or UPI."
    },
    {
      "q": "On a video call, a person in police uniform says you are under “digital arrest” and must pay money. What is true?",
      "options": [
        "Police never arrest anyone on a video call. Hang up and call 1930 or your local police",
        "Pay quickly to avoid jail",
        "Give your Aadhaar number to prove you are innocent",
        "Stay on the call until they finish"
      ],
      "answer": 0,
      "lesson": "safety",
      "tip": "Police, the CBI or courts never arrest anyone on a video call and never ask for money to “settle a case”."
    },
    {
      "q": "You get an SMS: “Your KYC expires today. Tap this link now.” What is the safest thing to do?",
      "options": [
        "Tap the link quickly",
        "Do not tap. Check only in your bank's official app or at the branch",
        "Call the number in the SMS",
        "Forward it to your friends"
      ],
      "answer": 1,
      "lesson": "safety",
      "tip": "Messages that rush you about KYC, bills or parcels are fake. Check only in the official app or at the office."
    },
    {
      "q": "You buy tea and vegetables every day. Which UPI feature lets you pay small amounts with one tap and no PIN?",
      "options": [
        "UPI Circle",
        "AutoPay",
        "UPI Lite",
        "Net banking"
      ],
      "answer": 2,
      "lesson": "money",
      "tip": "Add a small balance to UPI Lite once. Small payments then go through in one tap, without a PIN."
    },
    {
      "q": "A stranger says: “Scan this QR code and enter your UPI PIN to receive ₹2,000.” What is true?",
      "options": [
        "You never need your PIN to receive money. It is a scam",
        "You must enter your PIN to get the money",
        "It is safe if the amount is small",
        "It is safe because it is a QR code"
      ],
      "answer": 0,
      "lesson": "money",
      "tip": "Your UPI PIN is only for sending money. Anyone who asks for it to “send” you money is a fraud."
    },
    {
      "q": "Where can you keep official copies of your Aadhaar, PAN and certificates safely on your phone?",
      "options": [
        "In a family WhatsApp group",
        "In your photo gallery with no lock",
        "In an email to a friend",
        "In DigiLocker"
      ],
      "answer": 3,
      "lesson": "money",
      "tip": "Sign in to DigiLocker with your Aadhaar-linked mobile number. Official copies kept there are accepted as valid."
    },
    {
      "q": "Your father is a pensioner and finds it hard to go to the bank for his life certificate. What can he do?",
      "options": [
        "Send his passbook by courier",
        "Submit it from home with a face scan in the Jeevan Pramaan app",
        "Ask a neighbour to sign for him",
        "Wait until the bank calls him"
      ],
      "answer": 1,
      "lesson": "money",
      "tip": "Pensioners can submit the life certificate from home with the Jeevan Pramaan and AadhaarFaceRD apps. No bank visit is needed."
    },
    {
      "q": "A shocking photo is forwarded to you on WhatsApp. Which sign can show it was made by AI?",
      "options": [
        "It is very colourful",
        "It has strange-looking hands or faces",
        "A friend sent it",
        "It was sent in a group"
      ],
      "answer": 1,
      "lesson": "ai",
      "tip": "AI can make fake photos and videos. Look for odd hands or faces, and check trusted news websites before you forward."
    },
    {
      "q": "Which of these should you NEVER type into an AI chat app?",
      "options": [
        "A recipe question",
        "A homework question",
        "Your OTP, password or bank details",
        "A question in Marathi"
      ],
      "answer": 2,
      "lesson": "ai",
      "tip": "Treat an AI chat like a stranger. Never type your OTP, passwords, Aadhaar, bank details or family photos."
    },
    {
      "q": "Your child wears a GPS smartwatch. Which is a safe way to use it?",
      "options": [
        "Post the watch's map on social media",
        "Share the app password with neighbours",
        "Stop watching over your child, because the watch is enough",
        "Add only trusted family members as contacts and keep the location private"
      ],
      "answer": 3,
      "lesson": "ai",
      "tip": "Location is sensitive, so keep it private and use only trusted contacts. A watch never replaces an adult's care."
    }
  ],
  "hi": [
    {
      "q": "आपको डर लग रहा है और आप जल्दी मदद के लिए कॉल करना चाहते हैं। आपके Android फ़ोन में Emergency SOS चालू है। आप क्या करेंगे?",
      "options": [
        "वॉल्यूम बटन एक बार दबाएं",
        "पावर बटन 5 बार जल्दी दबाएं",
        "फ़ोन को दो बार हिलाएं",
        "कैमरा ऐप खोलें"
      ],
      "answer": 1,
      "lesson": "phone",
      "tip": "Emergency SOS चालू होने पर पावर बटन 5 बार जल्दी दबाने से मदद के लिए कॉल चला जाता है। Settings → Safety & emergency में इमरजेंसी कॉन्टैक्ट जोड़ें।"
    },
    {
      "q": "आपका पोता आपके फ़ोन पर एक वीडियो देखना चाहता है। आप चाहते हैं कि वह सिर्फ़ उसी ऐप में रहे। क्या मदद करेगा?",
      "options": [
        "Airplane mode चालू करना",
        "Battery Saver चालू करना",
        "App pinning चालू करके ऐप को पिन करना",
        "Dark mode चालू करना"
      ],
      "answer": 2,
      "lesson": "phone",
      "tip": "App pinning फ़ोन को एक ही ऐप में रोके रखता है। आपके PIN के बिना बच्चा उससे बाहर नहीं जा सकता। (iPhone: Guided Access)"
    },
    {
      "q": "आप अक्सर सुबह 9 बजे की दवा लेना भूल जाते हैं। याद रखने का आसान तरीका क्या है?",
      "options": [
        "बोलें: “Hey Google, रोज़ सुबह 9 बजे दवा लेने की याद दिलाओ”",
        "फ़ोन को साइलेंट करें",
        "स्क्रीन को PIN से लॉक करें",
        "Battery Saver चालू करें"
      ],
      "answer": 0,
      "lesson": "phone",
      "tip": "आप सिर्फ़ बोलकर रिमाइंडर लगा सकते हैं। फ़ोन सही समय पर याद दिला देता है।"
    },
    {
      "q": "दुकान के बोर्ड पर ऐसी भाषा में लिखा है जो आप पढ़ नहीं सकते। फ़ोन का कैमरा कैसे मदद कर सकता है?",
      "options": [
        "फ़ोटो खींचकर खुद को ईमेल करें",
        "Restricted Mode चालू करें",
        "Google Forms खोलें",
        "बोर्ड की ओर Google Lens करें और Translate दबाएं"
      ],
      "answer": 3,
      "lesson": "google",
      "tip": "Google सर्च बार में कैमरा आइकन (Google Lens) दबाएं, शब्दों की ओर कैमरा करें और Translate चुनें।"
    },
    {
      "q": "आपकी 6 साल की पोती आपके फ़ोन पर वीडियो देखना चाहती है। छोटे बच्चों के लिए बना ऐप कौन-सा है?",
      "options": [
        "YouTube Kids",
        "Gmail",
        "Google Maps",
        "Google Meet"
      ],
      "answer": 0,
      "lesson": "google",
      "tip": "YouTube Kids में बच्चों के लिए बने वीडियो दिखते हैं। साधारण YouTube में Restricted Mode चालू कर सकते हैं।"
    },
    {
      "q": "पासवर्ड भूलने पर आप अपने Google खाते से लॉक आउट नहीं होना चाहते। आपको क्या जोड़ना चाहिए?",
      "options": [
        "नई प्रोफ़ाइल फ़ोटो",
        "लंबा नाम",
        "रिकवरी फ़ोन नंबर और रिकवरी ईमेल",
        "उसी पासवर्ड वाला दूसरा Gmail"
      ],
      "answer": 2,
      "lesson": "google",
      "tip": "रिकवरी फ़ोन नंबर और ईमेल से Google आपको वापस अंदर आने में मदद करता है। अपना पासवर्ड लिखकर घर पर सुरक्षित जगह रखें।"
    },
    {
      "q": "आप देर शाम पैदल घर लौट रहे हैं और चाहते हैं कि परिवार आपको मैप पर देखे। WhatsApp चैट में आप क्या करेंगे?",
      "options": [
        "अपना Status बदलेंगे",
        "📎 → Location → Share live location दबाएंगे",
        "“Last seen” बंद करेंगे",
        "हर घंटे एक वॉइस नोट भेजेंगे"
      ],
      "answer": 1,
      "lesson": "family",
      "tip": "घर पहुंचने तक परिवार आपको मैप पर देख सकता है। कितनी देर शेयर करना है, यह आप तय करते हैं — जैसे 1 घंटा।"
    },
    {
      "q": "अनजान लोग आपको बार-बार WhatsApp ग्रुप में जोड़ रहे हैं। इसे रोकने के लिए आप क्या कर सकते हैं?",
      "options": [
        "अपना WhatsApp खाता डिलीट करें",
        "हर अनजान को जवाब दें",
        "हर ग्रुप म्यूट करें",
        "Settings → Privacy → Groups में “My contacts” चुनें"
      ],
      "answer": 3,
      "lesson": "family",
      "tip": "“My contacts” चुनने पर सिर्फ़ आपके कॉन्टैक्ट में मौजूद लोग ही आपको ग्रुप में जोड़ सकते हैं।"
    },
    {
      "q": "आप नया फ़ोन ले रहे हैं। आप अपने WhatsApp चैट और परिवार की फ़ोटो खोना नहीं चाहते। सबसे पहले क्या करना चाहिए?",
      "options": [
        "चैट बैकअप और फ़ोटो बैकअप चालू करें",
        "WhatsApp डिलीट करें",
        "अपना SIM कार्ड निकाल दें",
        "कुछ नहीं, वे अपने आप वापस आ जाते हैं"
      ],
      "answer": 0,
      "lesson": "family",
      "tip": "WhatsApp का चैट बैकअप (Android में Google Drive, iPhone में iCloud) और Google Photos का बैकअप चालू करें।"
    },
    {
      "q": "एक कॉल की आवाज़ बिल्कुल आपकी बेटी जैसी है। वह रोते हुए अभी पैसे मांग रही है। सबसे सुरक्षित पहला कदम क्या है?",
      "options": [
        "पहले पैसे भेज दें, सवाल बाद में पूछें",
        "उसकी आवाज़ है, इसलिए मान लें",
        "कॉल काटकर उसके अपने नंबर पर फ़ोन करें, या परिवार का कोड वर्ड पूछें",
        "उससे सेल्फ़ी भेजने को कहें"
      ],
      "answer": 2,
      "lesson": "safety",
      "tip": "ठग AI से आवाज़ की नकल कर सकते हैं। परिवार का कोड वर्ड पूछें, या अपने जाने-पहचाने नंबर पर वापस कॉल करें।"
    },
    {
      "q": "किसी ने ऑनलाइन आपके साथ धोखा करके आपके पैसे ले लिए। इसकी शिकायत के लिए आपको कौन-सी हेल्पलाइन पर कॉल करना चाहिए?",
      "options": [
        "108",
        "1091",
        "1098",
        "1930"
      ],
      "answer": 3,
      "lesson": "safety",
      "tip": "1930 राष्ट्रीय साइबर अपराध हेल्पलाइन है। पहले घंटे में कॉल करें, और बैंक को भी फ़ोन करके कार्ड या UPI ब्लॉक कराएं।"
    },
    {
      "q": "वीडियो कॉल पर वर्दी में एक व्यक्ति कहता है कि आप “डिजिटल अरेस्ट” में हैं और पैसे देने होंगे। सच क्या है?",
      "options": [
        "पुलिस कभी वीडियो कॉल पर गिरफ़्तार नहीं करती। कॉल काटें और 1930 या स्थानीय पुलिस को फ़ोन करें",
        "जेल से बचने के लिए जल्दी पैसे भरें",
        "बेगुनाही साबित करने के लिए अपना आधार नंबर बताएं",
        "वे जब तक चाहें, कॉल पर बने रहें"
      ],
      "answer": 0,
      "lesson": "safety",
      "tip": "पुलिस, CBI या अदालत कभी वीडियो कॉल पर गिरफ़्तार नहीं करती और “केस निपटाने” के लिए पैसे नहीं मांगती।"
    },
    {
      "q": "आपको SMS आता है: “आपका KYC आज खत्म हो रहा है। अभी यह लिंक दबाएं।” सबसे सुरक्षित क्या करना है?",
      "options": [
        "जल्दी से लिंक दबाएं",
        "लिंक न दबाएं। सिर्फ़ अपने बैंक के आधिकारिक ऐप में या शाखा में जाकर जांचें",
        "SMS में दिए नंबर पर कॉल करें",
        "इसे अपने दोस्तों को फॉरवर्ड करें"
      ],
      "answer": 1,
      "lesson": "safety",
      "tip": "KYC, बिल या पार्सल को लेकर जल्दी मचाने वाले संदेश नकली होते हैं। सिर्फ़ आधिकारिक ऐप में या दफ़्तर जाकर जांचें।"
    },
    {
      "q": "आप रोज़ चाय और सब्ज़ी खरीदते हैं। UPI की कौन-सी सुविधा से छोटे भुगतान एक टैप में, बिना PIN के हो जाते हैं?",
      "options": [
        "UPI Circle",
        "AutoPay",
        "UPI Lite",
        "नेट बैंकिंग"
      ],
      "answer": 2,
      "lesson": "money",
      "tip": "UPI Lite में एक बार थोड़ी राशि डालें। फिर छोटे भुगतान बिना PIN के, एक टैप में हो जाते हैं।"
    },
    {
      "q": "एक अनजान व्यक्ति कहता है: “₹2,000 पाने के लिए यह QR कोड स्कैन करें और अपना UPI PIN डालें।” सच क्या है?",
      "options": [
        "पैसे पाने के लिए PIN की कभी ज़रूरत नहीं होती। यह धोखा है",
        "पैसे पाने के लिए PIN डालना ज़रूरी है",
        "राशि छोटी हो तो यह सुरक्षित है",
        "QR कोड है, इसलिए यह सुरक्षित है"
      ],
      "answer": 0,
      "lesson": "money",
      "tip": "UPI PIN सिर्फ़ पैसे भेजने के लिए है। जो पैसे “भेजने” के लिए PIN मांगे, वह ठग है।"
    },
    {
      "q": "आधार, PAN और प्रमाणपत्रों की आधिकारिक कॉपी अपने फ़ोन में सुरक्षित कहां रख सकते हैं?",
      "options": [
        "परिवार के WhatsApp ग्रुप में",
        "बिना लॉक वाली फ़ोटो गैलरी में",
        "किसी दोस्त को भेजे ईमेल में",
        "DigiLocker में"
      ],
      "answer": 3,
      "lesson": "money",
      "tip": "आधार से जुड़े मोबाइल नंबर से DigiLocker में साइन इन करें। वहां रखी आधिकारिक कॉपी मान्य होती है।"
    },
    {
      "q": "आपके पिता पेंशनभोगी हैं और जीवन प्रमाणपत्र के लिए बैंक जाना उन्हें मुश्किल लगता है। वे क्या कर सकते हैं?",
      "options": [
        "पासबुक कूरियर से भेजें",
        "Jeevan Pramaan ऐप में चेहरा स्कैन करके घर से जमा करें",
        "पड़ोसी से उनके लिए हस्ताक्षर करवाएं",
        "बैंक के फ़ोन करने का इंतज़ार करें"
      ],
      "answer": 1,
      "lesson": "money",
      "tip": "पेंशनभोगी Jeevan Pramaan और AadhaarFaceRD ऐप से घर बैठे जीवन प्रमाणपत्र जमा कर सकते हैं — बैंक जाने की ज़रूरत नहीं।"
    },
    {
      "q": "WhatsApp पर आपको एक चौंकाने वाली फ़ोटो फॉरवर्ड होकर आई है। कौन-सा संकेत बता सकता है कि वह AI से बनी है?",
      "options": [
        "वह बहुत रंगीन है",
        "उसमें अजीब दिखते हाथ या चेहरे हैं",
        "किसी दोस्त ने भेजी है",
        "वह किसी ग्रुप में भेजी गई थी"
      ],
      "answer": 1,
      "lesson": "ai",
      "tip": "AI नकली फ़ोटो और वीडियो बना सकता है। अजीब हाथ या चेहरे देखें, और फॉरवर्ड करने से पहले भरोसेमंद समाचार वेबसाइटों पर जांचें।"
    },
    {
      "q": "इनमें से कौन-सी चीज़ AI चैट ऐप में आपको कभी नहीं लिखनी चाहिए?",
      "options": [
        "रेसिपी का सवाल",
        "होमवर्क का सवाल",
        "आपका OTP, पासवर्ड या बैंक की जानकारी",
        "मराठी में कोई सवाल"
      ],
      "answer": 2,
      "lesson": "ai",
      "tip": "AI चैट को अनजान व्यक्ति जैसा समझें। उसमें कभी OTP, पासवर्ड, आधार, बैंक की जानकारी या परिवार की फ़ोटो न डालें।"
    },
    {
      "q": "आपका बच्चा GPS स्मार्टवॉच पहनता है। इसे इस्तेमाल करने का सुरक्षित तरीका कौन-सा है?",
      "options": [
        "घड़ी का मैप सोशल मीडिया पर डालना",
        "ऐप का पासवर्ड पड़ोसियों को देना",
        "बच्चे की देखभाल छोड़ देना, क्योंकि घड़ी ही काफ़ी है",
        "कॉन्टैक्ट में सिर्फ़ भरोसेमंद परिजन जोड़ना और लोकेशन निजी रखना"
      ],
      "answer": 3,
      "lesson": "ai",
      "tip": "लोकेशन संवेदनशील जानकारी है, इसलिए इसे निजी रखें और सिर्फ़ भरोसेमंद कॉन्टैक्ट जोड़ें। घड़ी किसी बड़े की देखभाल की जगह नहीं ले सकती।"
    }
  ],
  "mr": [
    {
      "q": "तुम्हाला असुरक्षित वाटते आणि तुम्हाला पटकन मदतीसाठी कॉल करायचा आहे. तुमच्या Android फोनमध्ये Emergency SOS सुरू आहे. तुम्ही काय कराल?",
      "options": [
        "व्हॉल्यूम बटण एकदा दाबा",
        "पॉवर बटण 5 वेळा पटकन दाबा",
        "फोन दोनदा हलवा",
        "कॅमेरा ॲप उघडा"
      ],
      "answer": 1,
      "lesson": "phone",
      "tip": "Emergency SOS सुरू असताना पॉवर बटण 5 वेळा पटकन दाबल्यावर मदतीसाठी कॉल जातो. Settings → Safety & emergency मध्ये आपत्कालीन संपर्क जोडा."
    },
    {
      "q": "तुमचा नातू तुमच्या फोनवर एक व्हिडिओ पाहू इच्छितो. त्याने फक्त त्याच ॲपमध्ये राहावे असे तुम्हाला वाटते. काय मदत करेल?",
      "options": [
        "Airplane mode सुरू करणे",
        "Battery Saver सुरू करणे",
        "App pinning सुरू करून ॲप पिन करणे",
        "Dark mode सुरू करणे"
      ],
      "answer": 2,
      "lesson": "phone",
      "tip": "App pinning फोनला एकाच ॲपमध्ये ठेवते. तुमच्या PIN शिवाय मूल त्यातून बाहेर जाऊ शकत नाही. (iPhone: Guided Access)"
    },
    {
      "q": "तुम्ही सकाळी 9 वाजताचे औषध घ्यायला अनेकदा विसरता. लक्षात ठेवण्याचा सोपा मार्ग कोणता?",
      "options": [
        "बोला: “Hey Google, रोज सकाळी 9 वाजता औषध घ्यायची आठवण कर”",
        "फोन सायलेंटवर ठेवा",
        "स्क्रीन PIN ने लॉक करा",
        "Battery Saver सुरू करा"
      ],
      "answer": 0,
      "lesson": "phone",
      "tip": "तुम्ही फक्त बोलून रिमाइंडर लावू शकता. फोन वेळेवर आठवण करून देतो."
    },
    {
      "q": "दुकानाच्या पाटीवर तुम्हाला वाचता न येणाऱ्या भाषेत लिहिले आहे. फोनचा कॅमेरा कशी मदत करू शकतो?",
      "options": [
        "फोटो काढून स्वतःला ईमेल करा",
        "Restricted Mode सुरू करा",
        "Google Forms उघडा",
        "पाटीकडे Google Lens धरा आणि Translate दाबा"
      ],
      "answer": 3,
      "lesson": "google",
      "tip": "Google सर्च बारमधील कॅमेरा आयकॉन (Google Lens) दाबा, शब्दांकडे कॅमेरा धरा आणि Translate निवडा."
    },
    {
      "q": "तुमची 6 वर्षांची नात तुमच्या फोनवर व्हिडिओ पाहू इच्छिते. लहान मुलांसाठी बनवलेले ॲप कोणते?",
      "options": [
        "YouTube Kids",
        "Gmail",
        "Google Maps",
        "Google Meet"
      ],
      "answer": 0,
      "lesson": "google",
      "tip": "YouTube Kids मध्ये मुलांसाठीचे व्हिडिओ दिसतात. नेहमीच्या YouTube मध्ये Restricted Mode सुरू करता येतो."
    },
    {
      "q": "पासवर्ड विसरलात तरी तुम्हाला तुमच्या Google खात्यातून लॉक आउट व्हायचे नाही. तुम्ही काय जोडले पाहिजे?",
      "options": [
        "नवीन प्रोफाइल फोटो",
        "लांब नाव",
        "रिकव्हरी फोन नंबर आणि रिकव्हरी ईमेल",
        "त्याच पासवर्डचे दुसरे Gmail"
      ],
      "answer": 2,
      "lesson": "google",
      "tip": "रिकव्हरी फोन नंबर आणि ईमेलमुळे Google तुम्हाला पुन्हा आत येण्यास मदत करते. तुमचा पासवर्ड लिहून घरी सुरक्षित ठिकाणी ठेवा."
    },
    {
      "q": "तुम्ही उशिरा संध्याकाळी चालत घरी जात आहात आणि कुटुंबाने तुम्हाला नकाशावर पाहावे असे वाटते. WhatsApp चॅटमध्ये तुम्ही काय कराल?",
      "options": [
        "तुमचे Status बदलाल",
        "📎 → Location → Share live location दाबाल",
        "“Last seen” बंद कराल",
        "दर तासाला एक व्हॉइस नोट पाठवाल"
      ],
      "answer": 1,
      "lesson": "family",
      "tip": "घरी पोहोचेपर्यंत कुटुंब तुम्हाला नकाशावर पाहू शकते. किती वेळ शेअर करायचे ते तुम्ही ठरवता — जसे 1 तास."
    },
    {
      "q": "अनोळखी लोक तुम्हाला सारखे WhatsApp ग्रुपमध्ये जोडत आहेत. ते थांबवण्यासाठी तुम्ही काय करू शकता?",
      "options": [
        "तुमचे WhatsApp खाते डिलीट करा",
        "प्रत्येक अनोळखी व्यक्तीला उत्तर द्या",
        "प्रत्येक ग्रुप म्यूट करा",
        "Settings → Privacy → Groups मध्ये “My contacts” निवडा"
      ],
      "answer": 3,
      "lesson": "family",
      "tip": "“My contacts” निवडल्यावर फक्त तुमच्या कॉन्टॅक्टमधील लोकच तुम्हाला ग्रुपमध्ये जोडू शकतात."
    },
    {
      "q": "तुम्ही नवीन फोन घेत आहात. तुम्हाला तुमचे WhatsApp चॅट आणि कुटुंबाचे फोटो गमावायचे नाहीत. सर्वात आधी काय करावे?",
      "options": [
        "चॅट बॅकअप आणि फोटो बॅकअप सुरू करा",
        "WhatsApp डिलीट करा",
        "तुमचे SIM कार्ड काढा",
        "काही नाही, ते आपोआप परत येतात"
      ],
      "answer": 0,
      "lesson": "family",
      "tip": "WhatsApp चा चॅट बॅकअप (Android मध्ये Google Drive, iPhone मध्ये iCloud) आणि Google Photos चा बॅकअप सुरू करा."
    },
    {
      "q": "एका कॉलवरचा आवाज अगदी तुमच्या मुलीसारखा आहे. ती रडत आत्ताच पैसे मागत आहे. सर्वात सुरक्षित पहिले पाऊल कोणते?",
      "options": [
        "आधी पैसे पाठवा, प्रश्न नंतर विचारा",
        "तिचा आवाज आहे म्हणून विश्वास ठेवा",
        "कॉल कट करून तिच्या स्वतःच्या नंबरवर फोन करा, किंवा कुटुंबाचा कोड वर्ड विचारा",
        "तिला सेल्फी पाठवायला सांगा"
      ],
      "answer": 2,
      "lesson": "safety",
      "tip": "फसवणूक करणारे AI ने आवाजाची नक्कल करू शकतात. कुटुंबाचा कोड वर्ड विचारा, किंवा तुमच्या ओळखीच्या नंबरवर परत कॉल करा."
    },
    {
      "q": "कोणीतरी ऑनलाइन तुमची फसवणूक करून तुमचे पैसे घेतले. त्याची तक्रार करण्यासाठी तुम्ही कोणत्या हेल्पलाइनवर कॉल केला पाहिजे?",
      "options": [
        "108",
        "1091",
        "1098",
        "1930"
      ],
      "answer": 3,
      "lesson": "safety",
      "tip": "1930 ही राष्ट्रीय सायबर गुन्हे हेल्पलाइन आहे. पहिल्या तासात कॉल करा, आणि बँकेलाही फोन करून कार्ड किंवा UPI ब्लॉक करा."
    },
    {
      "q": "व्हिडिओ कॉलवर गणवेशातील एक व्यक्ती सांगते की तुम्ही “डिजिटल अरेस्ट” मध्ये आहात आणि पैसे द्यावे लागतील. खरे काय?",
      "options": [
        "पोलीस कधीही व्हिडिओ कॉलवर अटक करत नाहीत. कॉल कट करा आणि 1930 किंवा स्थानिक पोलिसांना फोन करा",
        "तुरुंग टाळण्यासाठी पटकन पैसे भरा",
        "निर्दोष असल्याचे सिद्ध करण्यासाठी तुमचा आधार नंबर सांगा",
        "त्यांचे बोलून होईपर्यंत कॉलवर राहा"
      ],
      "answer": 0,
      "lesson": "safety",
      "tip": "पोलीस, CBI किंवा न्यायालय कधीही व्हिडिओ कॉलवर कोणाला अटक करत नाही आणि “केस मिटवण्यासाठी” पैसे मागत नाही."
    },
    {
      "q": "तुम्हाला SMS येतो: “तुमचे KYC आज संपत आहे. आत्ता ही लिंक दाबा.” सर्वात सुरक्षित काय करावे?",
      "options": [
        "पटकन लिंक दाबा",
        "लिंक दाबू नका. फक्त तुमच्या बँकेच्या अधिकृत ॲपमध्ये किंवा शाखेत जाऊन तपासा",
        "SMS मधील नंबरवर कॉल करा",
        "तुमच्या मित्रांना फॉरवर्ड करा"
      ],
      "answer": 1,
      "lesson": "safety",
      "tip": "KYC, बिल किंवा पार्सलबद्दल घाई करायला लावणारे संदेश बनावट असतात. फक्त अधिकृत ॲपमध्ये किंवा कार्यालयात जाऊन तपासा."
    },
    {
      "q": "तुम्ही रोज चहा आणि भाजी घेता. UPI ची कोणती सुविधा छोटी पेमेंट्स एका टॅपमध्ये, PIN शिवाय करू देते?",
      "options": [
        "UPI Circle",
        "AutoPay",
        "UPI Lite",
        "नेट बँकिंग"
      ],
      "answer": 2,
      "lesson": "money",
      "tip": "UPI Lite मध्ये एकदा थोडी रक्कम टाका. मग छोटी पेमेंट्स PIN न टाकता, एका टॅपमध्ये होतात."
    },
    {
      "q": "एक अनोळखी व्यक्ती म्हणते: “₹2,000 मिळवण्यासाठी हा QR कोड स्कॅन करा आणि तुमचा UPI PIN टाका.” खरे काय?",
      "options": [
        "पैसे घेण्यासाठी PIN कधीही लागत नाही. ही फसवणूक आहे",
        "पैसे मिळवण्यासाठी PIN टाकावाच लागतो",
        "रक्कम लहान असेल तर हे सुरक्षित आहे",
        "QR कोड आहे म्हणून हे सुरक्षित आहे"
      ],
      "answer": 0,
      "lesson": "money",
      "tip": "UPI PIN फक्त पैसे पाठवण्यासाठी असतो. जो पैसे “पाठवण्यासाठी” PIN मागतो, तो फसवणूक करणारा असतो."
    },
    {
      "q": "तुमच्या आधार, PAN आणि प्रमाणपत्रांच्या अधिकृत प्रती फोनवर सुरक्षित कुठे ठेवू शकता?",
      "options": [
        "कुटुंबाच्या WhatsApp ग्रुपमध्ये",
        "लॉक नसलेल्या फोटो गॅलरीत",
        "मित्राला पाठवलेल्या ईमेलमध्ये",
        "DigiLocker मध्ये"
      ],
      "answer": 3,
      "lesson": "money",
      "tip": "आधारशी जोडलेल्या मोबाइल नंबरने DigiLocker मध्ये साइन इन करा. तिथे ठेवलेल्या अधिकृत प्रती ग्राह्य धरल्या जातात."
    },
    {
      "q": "तुमचे वडील पेन्शनधारक आहेत आणि हयातीच्या दाखल्यासाठी बँकेत जाणे त्यांना कठीण वाटते. ते काय करू शकतात?",
      "options": [
        "पासबुक कुरिअरने पाठवू शकतात",
        "Jeevan Pramaan ॲपमध्ये चेहरा स्कॅन करून घरबसल्या जमा करू शकतात",
        "शेजाऱ्याकडून त्यांच्यासाठी सही करून घेऊ शकतात",
        "बँकेचा फोन येईपर्यंत थांबू शकतात"
      ],
      "answer": 1,
      "lesson": "money",
      "tip": "पेन्शनधारक Jeevan Pramaan आणि AadhaarFaceRD ॲपद्वारे घरबसल्या हयातीचा दाखला जमा करू शकतात — बँकेत जायची गरज नाही."
    },
    {
      "q": "WhatsApp वर तुम्हाला एक धक्कादायक फोटो फॉरवर्ड होऊन आला आहे. कोणती खूण दाखवू शकते की तो AI ने बनवला आहे?",
      "options": [
        "तो खूप रंगीत आहे",
        "त्यात विचित्र दिसणारे हात किंवा चेहरे आहेत",
        "मित्राने पाठवला आहे",
        "तो ग्रुपमध्ये पाठवला होता"
      ],
      "answer": 1,
      "lesson": "ai",
      "tip": "AI बनावट फोटो आणि व्हिडिओ बनवू शकते. विचित्र हात किंवा चेहरे पाहा, आणि फॉरवर्ड करण्याआधी विश्वासार्ह बातम्यांच्या वेबसाइटवर तपासा."
    },
    {
      "q": "यांपैकी कोणती गोष्ट तुम्ही AI चॅट ॲपमध्ये कधीही टाकू नये?",
      "options": [
        "रेसिपीचा प्रश्न",
        "गृहपाठाचा प्रश्न",
        "तुमचा OTP, पासवर्ड किंवा बँकेची माहिती",
        "मराठीतील एखादा प्रश्न"
      ],
      "answer": 2,
      "lesson": "ai",
      "tip": "AI चॅटला अनोळखी व्यक्ती समजा. त्यात कधीही OTP, पासवर्ड, आधार, बँकेची माहिती किंवा कुटुंबाचे फोटो टाकू नका."
    },
    {
      "q": "तुमचे मूल GPS स्मार्टवॉच घालते. ते वापरण्याचा सुरक्षित मार्ग कोणता?",
      "options": [
        "घड्याळाचा नकाशा सोशल मीडियावर टाकणे",
        "ॲपचा पासवर्ड शेजाऱ्यांना देणे",
        "मुलावर लक्ष ठेवणे सोडून देणे, कारण घड्याळच पुरेसे आहे",
        "संपर्कांमध्ये फक्त विश्वासू नातेवाईक जोडणे आणि लोकेशन खासगी ठेवणे"
      ],
      "answer": 3,
      "lesson": "ai",
      "tip": "लोकेशन ही संवेदनशील माहिती आहे, म्हणून ती खासगी ठेवा आणि फक्त विश्वासू संपर्क जोडा. घड्याळ मोठ्या व्यक्तीच्या काळजीची जागा घेत नाही."
    }
  ]
};
