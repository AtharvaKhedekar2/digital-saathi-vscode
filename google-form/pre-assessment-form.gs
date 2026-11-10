/**
 * DIGITAL SAATHI — PRE-ASSESSMENT QUIZ (Google Form builder)
 * ----------------------------------------------------------------------------
 * Run this ONCE in Google Apps Script (script.google.com) to create the
 * Pre-Assessment Quiz as a Google Form — a self-marking quiz with an answer
 * key, 1 point per question and friendly feedback. Step-by-step instructions:
 * see GOOGLE-FORM-GUIDE.md in this folder.
 *
 *   createEnglishForm()   → makes the English form
 *   createHindiForm()     → makes the Hindi form
 *   createMarathiForm()   → makes the Marathi form
 *   createAllLanguages()  → makes all three
 *
 * After it runs, open "Execution log": it prints each form's link. Paste the
 * "Share link" into PRE_FORM in index.html.
 *
 * The 11 questions are the SAME as the website's quiz (QUIZ in index.html),
 * grouped by the six approved learning modules — so the Pre-Assessment (Google
 * Form) and the website's Post-Assessment ask the same things and can be compared.
 * ----------------------------------------------------------------------------
 */

function createEnglishForm() { return buildPreAssessmentForm_("en"); }
function createHindiForm()   { return buildPreAssessmentForm_("hi"); }
function createMarathiForm() { return buildPreAssessmentForm_("mr"); }
function createAllLanguages() { ["en", "hi", "mr"].forEach(buildPreAssessmentForm_); }

function buildPreAssessmentForm_(lang) {
  const T = TEXT[lang];
  const form = FormApp.create(T.title);
  form.setTitle(T.title)
      .setDescription(T.description)
      .setIsQuiz(true)                 // quiz mode: answer key + automatic scoring
      .setProgressBar(true)            // shows "page 2 of 7" so people know how far they are
      .setShuffleQuestions(false)
      .setCollectEmail(false)          // no email needed — easier for seniors and safer for children
      .setAllowResponseEdits(false)
      .setShowLinkToRespondAgain(true)
      .setConfirmationMessage(T.thanks);
  // Newer Google accounts create forms unpublished; publish it if this option exists
  if (typeof form.setPublished === "function") form.setPublished(true);
  form.setAcceptingResponses(true);

  // Page 1 — about you (not scored)
  form.addTextItem().setTitle(T.name).setHelpText(T.nameHelp).setRequired(false);
  form.addMultipleChoiceItem().setTitle(T.who).setChoiceValues(T.whoOptions).setRequired(true);
  form.addScaleItem().setTitle(T.confident).setBounds(1, 5).setLabels(T.low, T.high).setRequired(true);

  // Pages 2–7 — one page per learning module, 1 point per question
  let count = 0;
  MODULES.forEach(function (m) {
    const questions = QUESTIONS[lang].filter(function (q) { return q.lesson === m.id; });
    if (!questions.length) return;
    form.addPageBreakItem()
        .setTitle(T.step + " " + m.step + " · " + m.title[lang])
        .setHelpText(T.pageHelp);
    questions.forEach(function (q) {
      const item = form.addMultipleChoiceItem();
      const wrong = T.wrong.replace("{a}", q.options[q.answer]).replace("{n}", m.step).replace("{t}", m.title[lang]);
      item.setTitle(q.q)
          .setChoices(q.options.map(function (text, i) { return item.createChoice(text, i === q.answer); })
              .concat([item.createChoice(T.notSure, false)]))   // “I am not sure”: honest, and better than a guess
          .setRequired(true)
          .setPoints(1)
          .setFeedbackForCorrect(FormApp.createFeedback().setText(T.correct).build())
          .setFeedbackForIncorrect(FormApp.createFeedback().setText(wrong).build());
      count++;
    });
  });

  const shareLink = form.getPublishedUrl();
  Logger.log("✅ " + T.title + "  (" + count + " scored questions)");
  Logger.log("   Share link (paste into PRE_FORM." + lang + " in index.html): " + shareLink);
  Logger.log("   Edit link (for the team only): " + form.getEditUrl());
  return shareLink;
}

// ---------------------------------------------------------------------------
// Text of the form in each language
// ---------------------------------------------------------------------------
const TEXT = {
  "en": {
    "title": "Digital Saathi — Pre-Assessment Quiz",
    "description": "Welcome! 🙏 This short quiz shows what you already know about using a smartphone.\n\n• 11 short questions · about 5 minutes\n• Some questions are a little tricky, on purpose. If you do not know many answers, do not worry — that is what Digital Saathi is for\n• Not sure? Choose “I am not sure”. It is better than guessing\n• There is no pass or fail. At the end we show which learning steps to start with\n\n🔒 Never type your OTP, PIN, password or bank details in any form.",
    "name": "Your first name (optional)",
    "nameHelp": "So a Saathi volunteer can help you. You can leave this empty.",
    "who": "I am…",
    "whoOptions": [
      "A senior citizen (60+)",
      "A homemaker",
      "A child or student (8–14 years)",
      "Other"
    ],
    "confident": "How comfortable are you using a smartphone today?",
    "low": "Not comfortable",
    "high": "Very comfortable",
    "step": "Step",
    "pageHelp": "Choose one answer for each question.",
    "notSure": "I am not sure",
    "correct": "Correct — well done!",
    "wrong": "Not quite. The right answer is: “{a}”. You will learn this in Step {n} — {t}.",
    "thanks": "Thank you! 🎉 Click “View score” to see your result. The steps where you missed a question are the best place to start. Keep learning with Digital Saathi!"
  },
  "hi": {
    "title": "डिजिटल साथी — शुरुआती क्विज़ (Pre-Assessment)",
    "description": "स्वागत है! 🙏 यह छोटा क्विज़ बताता है कि स्मार्टफ़ोन के बारे में आप पहले से क्या जानते हैं।\n\n• 11 छोटे सवाल · लगभग 5 मिनट\n• कुछ सवाल जानबूझकर थोड़े मुश्किल हैं। बहुत जवाब न आते हों तो चिंता न करें — डिजिटल साथी इसीलिए है\n• पक्का नहीं पता? “पक्का नहीं पता” चुनें। यह अंदाज़े से बेहतर है\n• इसमें पास या फ़ेल नहीं होता। अंत में हम बताएंगे कि किन चरणों से शुरू करना है\n\n🔒 किसी भी फ़ॉर्म में कभी भी अपना OTP, PIN, पासवर्ड या बैंक की जानकारी न लिखें।",
    "name": "आपका पहला नाम (वैकल्पिक)",
    "nameHelp": "ताकि कोई साथी स्वयंसेवक आपकी मदद कर सके। आप इसे खाली भी छोड़ सकते हैं।",
    "who": "मैं हूँ…",
    "whoOptions": [
      "वरिष्ठ नागरिक (60+)",
      "गृहिणी",
      "बच्चा या विद्यार्थी (8–14 साल)",
      "अन्य"
    ],
    "confident": "आज आप स्मार्टफ़ोन इस्तेमाल करने में कितना सहज महसूस करते हैं?",
    "low": "बिल्कुल सहज नहीं",
    "high": "बहुत सहज",
    "step": "चरण",
    "pageHelp": "हर सवाल का एक जवाब चुनें।",
    "notSure": "पक्का नहीं पता",
    "correct": "सही जवाब — शाबाश!",
    "wrong": "पूरी तरह सही नहीं। सही जवाब है: “{a}”। यह आप चरण {n} — {t} में सीखेंगे।",
    "thanks": "धन्यवाद! 🎉 अपना नतीजा देखने के लिए “View score” दबाएं। जिन चरणों में कोई सवाल छूटा, वहीं से शुरू करना सबसे अच्छा है। डिजिटल साथी के साथ सीखते रहें!"
  },
  "mr": {
    "title": "डिजिटल साथी — सुरुवातीची क्विझ (Pre-Assessment)",
    "description": "स्वागत आहे! 🙏 स्मार्टफोनबद्दल तुम्हाला आधीच काय माहिती आहे, ते ही छोटी क्विझ दाखवते.\n\n• 11 छोटे प्रश्न · सुमारे 5 मिनिटे\n• काही प्रश्न जाणूनबुजून थोडे अवघड आहेत. खूप उत्तरे येत नसतील तरी काळजी करू नका — डिजिटल साथी त्यासाठीच आहे\n• खात्री नाही? “खात्री नाही” निवडा. अंदाजापेक्षा ते चांगले\n• यात पास-नापास नाही. शेवटी कोणत्या टप्प्यांपासून सुरुवात करायची ते आम्ही दाखवू\n\n🔒 कोणत्याही फॉर्ममध्ये कधीही तुमचा OTP, PIN, पासवर्ड किंवा बँकेची माहिती लिहू नका.",
    "name": "तुमचे पहिले नाव (ऐच्छिक)",
    "nameHelp": "म्हणजे साथी स्वयंसेवक तुमची मदत करू शकतील. तुम्ही हे रिकामेही ठेवू शकता.",
    "who": "मी आहे…",
    "whoOptions": [
      "ज्येष्ठ नागरिक (60+)",
      "गृहिणी",
      "मूल किंवा विद्यार्थी (8–14 वर्षे)",
      "इतर"
    ],
    "confident": "आज स्मार्टफोन वापरताना तुम्हाला किती सहज वाटते?",
    "low": "अजिबात सहज नाही",
    "high": "खूप सहज",
    "step": "टप्पा",
    "pageHelp": "प्रत्येक प्रश्नाचे एक उत्तर निवडा.",
    "notSure": "खात्री नाही",
    "correct": "बरोबर — शाब्बास!",
    "wrong": "पूर्ण बरोबर नाही. बरोबर उत्तर आहे: “{a}”. हे तुम्ही टप्पा {n} — {t} मध्ये शिकाल.",
    "thanks": "धन्यवाद! 🎉 तुमचा निकाल पाहण्यासाठी “View score” दाबा. ज्या टप्प्यांमध्ये प्रश्न चुकला, तिथून सुरुवात करणे सर्वात चांगले. डिजिटल साथीसोबत शिकत राहा!"
  }
};

// The six approved learning modules (same order and titles as the website)
const MODULES = [
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

// The 11 questions, copied from the website's QUIZ ("answer" = number of the right option, counting from 0).
// The form adds a 4th choice, TEXT[lang].notSure, to every question; it is always counted as wrong.
const QUESTIONS = {
  "en": [
    {
      "q": "Many Android phones have Emergency SOS. How do you start it fast?",
      "options": [
        "Press the volume-up button 3 times",
        "Press the power button 5 times quickly",
        "Shake the phone and say “help”"
      ],
      "answer": 1,
      "lesson": "phone"
    },
    {
      "q": "You give your phone to a child to watch one video. You want the child to stay only in that app. What helps?",
      "options": [
        "Turn on Airplane mode",
        "Turn on Battery Saver",
        "Turn on App pinning"
      ],
      "answer": 2,
      "lesson": "phone"
    },
    {
      "q": "A medicine strip is written in a language you cannot read. Which Google tool translates it when you point your camera?",
      "options": [
        "Google Lens",
        "Google Forms",
        "Google Meet"
      ],
      "answer": 0,
      "lesson": "google"
    },
    {
      "q": "On YouTube, which setting helps hide videos made for adults?",
      "options": [
        "Dark mode",
        "Restricted Mode",
        "Autoplay"
      ],
      "answer": 1,
      "lesson": "google"
    },
    {
      "q": "You are walking home and want your family to see you on the map. In a WhatsApp chat, what do you choose?",
      "options": [
        "Status → Add my location",
        "Settings → Privacy → Last seen",
        "📎 → Location → Share live location"
      ],
      "answer": 2,
      "lesson": "family"
    },
    {
      "q": "Unknown numbers keep calling you on WhatsApp. How can you stop them from ringing?",
      "options": [
        "Turn on “Silence unknown callers” in Privacy → Calls",
        "Switch off all WhatsApp notifications",
        "Show “Last seen” to nobody"
      ],
      "answer": 0,
      "lesson": "family"
    },
    {
      "q": "A call sounds exactly like your son. He asks for money in a hurry. What is the safest step?",
      "options": [
        "Send the money — it is clearly his voice",
        "Hang up and call him back on his own number, or ask for your family code word",
        "Send a small amount first to test"
      ],
      "answer": 1,
      "lesson": "safety"
    },
    {
      "q": "Which national helpline number is for reporting online money fraud?",
      "options": [
        "1930",
        "1098",
        "108"
      ],
      "answer": 0,
      "lesson": "safety"
    },
    {
      "q": "Which UPI feature lets you pay small amounts, like for tea or vegetables, with one tap and no PIN?",
      "options": [
        "AutoPay",
        "UPI Circle",
        "UPI Lite"
      ],
      "answer": 2,
      "lesson": "money"
    },
    {
      "q": "From what age can people get the Ayushman Vay Vandana card for free hospital cover?",
      "options": [
        "60 years",
        "65 years",
        "70 years"
      ],
      "answer": 2,
      "lesson": "money"
    },
    {
      "q": "Which of these can show that a photo or video was made by AI?",
      "options": [
        "Strange-looking hands or faces",
        "The picture is very bright",
        "A friend sent it to you"
      ],
      "answer": 0,
      "lesson": "ai"
    }
  ],
  "hi": [
    {
      "q": "कई Android फ़ोन में Emergency SOS होता है। इसे जल्दी चालू करने के लिए क्या करते हैं?",
      "options": [
        "वॉल्यूम-अप बटन 3 बार दबाएं",
        "पावर बटन 5 बार जल्दी दबाएं",
        "फ़ोन हिलाएं और “मदद” बोलें"
      ],
      "answer": 1,
      "lesson": "phone"
    },
    {
      "q": "आप बच्चे को एक वीडियो देखने के लिए फ़ोन देते हैं। आप चाहते हैं कि वह सिर्फ़ उसी ऐप में रहे। क्या मदद करेगा?",
      "options": [
        "Airplane mode चालू करना",
        "Battery Saver चालू करना",
        "App pinning चालू करना"
      ],
      "answer": 2,
      "lesson": "phone"
    },
    {
      "q": "दवा की पट्टी पर ऐसी भाषा में लिखा है जो आप पढ़ नहीं सकते। कैमरा सामने करने पर कौन-सा Google टूल अनुवाद करता है?",
      "options": [
        "Google Lens",
        "Google Forms",
        "Google Meet"
      ],
      "answer": 0,
      "lesson": "google"
    },
    {
      "q": "YouTube पर बड़ों के लिए बने वीडियो छिपाने में कौन-सी सेटिंग मदद करती है?",
      "options": [
        "Dark mode",
        "Restricted Mode",
        "Autoplay"
      ],
      "answer": 1,
      "lesson": "google"
    },
    {
      "q": "आप घर पैदल लौट रहे हैं और चाहते हैं कि परिवार आपको मैप पर देखे। WhatsApp चैट में आप क्या चुनेंगे?",
      "options": [
        "Status → Add my location",
        "Settings → Privacy → Last seen",
        "📎 → Location → Share live location"
      ],
      "answer": 2,
      "lesson": "family"
    },
    {
      "q": "अनजान नंबर WhatsApp पर बार-बार कॉल करते हैं। उनकी घंटी बजना कैसे रोकें?",
      "options": [
        "Privacy → Calls में “Silence unknown callers” चालू करें",
        "WhatsApp की सारी notifications बंद करें",
        "“Last seen” किसी को न दिखाएं"
      ],
      "answer": 0,
      "lesson": "family"
    },
    {
      "q": "एक कॉल की आवाज़ बिल्कुल आपके बेटे जैसी है। वह जल्दी में पैसे मांगता है। सबसे सुरक्षित कदम क्या है?",
      "options": [
        "पैसे भेज दें — यह साफ़ उसी की आवाज़ है",
        "कॉल काटकर उसके अपने नंबर पर फ़ोन करें, या परिवार का कोड वर्ड पूछें",
        "पहले थोड़े पैसे भेजकर जांचें"
      ],
      "answer": 1,
      "lesson": "safety"
    },
    {
      "q": "ऑनलाइन पैसे की धोखाधड़ी बताने के लिए राष्ट्रीय हेल्पलाइन नंबर कौन-सा है?",
      "options": [
        "1930",
        "1098",
        "108"
      ],
      "answer": 0,
      "lesson": "safety"
    },
    {
      "q": "UPI की कौन-सी सुविधा से चाय या सब्ज़ी जैसे छोटे भुगतान एक टैप में, बिना PIN के हो जाते हैं?",
      "options": [
        "AutoPay",
        "UPI Circle",
        "UPI Lite"
      ],
      "answer": 2,
      "lesson": "money"
    },
    {
      "q": "आयुष्मान वय वंदना कार्ड से मुफ़्त इलाज का कवर किस उम्र से मिलता है?",
      "options": [
        "60 साल से",
        "65 साल से",
        "70 साल से"
      ],
      "answer": 2,
      "lesson": "money"
    },
    {
      "q": "इनमें से क्या बता सकता है कि कोई फ़ोटो या वीडियो AI से बना है?",
      "options": [
        "अजीब दिखते हाथ या चेहरे",
        "तस्वीर बहुत चमकीली है",
        "किसी दोस्त ने भेजी है"
      ],
      "answer": 0,
      "lesson": "ai"
    }
  ],
  "mr": [
    {
      "q": "अनेक Android फोनमध्ये Emergency SOS असते. ते पटकन सुरू करण्यासाठी काय करता?",
      "options": [
        "व्हॉल्यूम-अप बटण 3 वेळा दाबा",
        "पॉवर बटण 5 वेळा पटकन दाबा",
        "फोन हलवा आणि “मदत” म्हणा"
      ],
      "answer": 1,
      "lesson": "phone"
    },
    {
      "q": "तुम्ही मुलाला एक व्हिडिओ पाहण्यासाठी फोन देता. त्याने फक्त त्याच ॲपमध्ये राहावे असे तुम्हाला वाटते. काय मदत करेल?",
      "options": [
        "Airplane mode सुरू करणे",
        "Battery Saver सुरू करणे",
        "App pinning सुरू करणे"
      ],
      "answer": 2,
      "lesson": "phone"
    },
    {
      "q": "औषधाच्या पट्टीवर तुम्हाला वाचता न येणाऱ्या भाषेत लिहिले आहे. कॅमेरा समोर धरल्यावर कोणते Google टूल अनुवाद करते?",
      "options": [
        "Google Lens",
        "Google Forms",
        "Google Meet"
      ],
      "answer": 0,
      "lesson": "google"
    },
    {
      "q": "YouTube वर मोठ्यांसाठीचे व्हिडिओ लपवण्यासाठी कोणती सेटिंग मदत करते?",
      "options": [
        "Dark mode",
        "Restricted Mode",
        "Autoplay"
      ],
      "answer": 1,
      "lesson": "google"
    },
    {
      "q": "तुम्ही चालत घरी जात आहात आणि कुटुंबाने तुम्हाला नकाशावर पाहावे असे वाटते. WhatsApp चॅटमध्ये तुम्ही काय निवडाल?",
      "options": [
        "Status → Add my location",
        "Settings → Privacy → Last seen",
        "📎 → Location → Share live location"
      ],
      "answer": 2,
      "lesson": "family"
    },
    {
      "q": "अनोळखी नंबर WhatsApp वर सारखे कॉल करतात. त्यांची रिंग वाजणे कसे थांबवाल?",
      "options": [
        "Privacy → Calls मध्ये “Silence unknown callers” सुरू करा",
        "WhatsApp च्या सर्व notifications बंद करा",
        "“Last seen” कोणालाही दाखवू नका"
      ],
      "answer": 0,
      "lesson": "family"
    },
    {
      "q": "एका कॉलवरचा आवाज अगदी तुमच्या मुलासारखा आहे. तो घाईत पैसे मागतो. सर्वात सुरक्षित पाऊल कोणते?",
      "options": [
        "पैसे पाठवा — हा स्पष्टपणे त्याचाच आवाज आहे",
        "कॉल कट करून त्याच्या स्वतःच्या नंबरवर फोन करा, किंवा कुटुंबाचा कोड वर्ड विचारा",
        "आधी थोडे पैसे पाठवून तपासा"
      ],
      "answer": 1,
      "lesson": "safety"
    },
    {
      "q": "ऑनलाइन पैशांच्या फसवणुकीची तक्रार करण्यासाठी राष्ट्रीय हेल्पलाइन क्रमांक कोणता?",
      "options": [
        "1930",
        "1098",
        "108"
      ],
      "answer": 0,
      "lesson": "safety"
    },
    {
      "q": "UPI ची कोणती सुविधा चहा किंवा भाजीसारखी छोटी पेमेंट्स एका टॅपमध्ये, PIN शिवाय करू देते?",
      "options": [
        "AutoPay",
        "UPI Circle",
        "UPI Lite"
      ],
      "answer": 2,
      "lesson": "money"
    },
    {
      "q": "आयुष्मान वय वंदना कार्डने मोफत उपचारांचे कवच कोणत्या वयापासून मिळते?",
      "options": [
        "60 वर्षांपासून",
        "65 वर्षांपासून",
        "70 वर्षांपासून"
      ],
      "answer": 2,
      "lesson": "money"
    },
    {
      "q": "यांपैकी काय दाखवू शकते की एखादा फोटो किंवा व्हिडिओ AI ने बनवला आहे?",
      "options": [
        "विचित्र दिसणारे हात किंवा चेहरे",
        "चित्र खूप चमकदार आहे",
        "मित्राने पाठवले आहे"
      ],
      "answer": 0,
      "lesson": "ai"
    }
  ]
};
