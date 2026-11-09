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
          .setChoices(q.options.map(function (text, i) { return item.createChoice(text, i === q.answer); }))
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
    "description": "Welcome! 🙏 This short quiz shows what you already know about using a smartphone safely.\n\n• 11 easy questions · about 5 minutes\n• There is no pass or fail — just choose the answer you think is right\n• Your score shows which learning steps to start with\n\n🔒 Never type your OTP, PIN, password or bank details in any form.",
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
    "correct": "Correct — well done!",
    "wrong": "Not quite. The right answer is: “{a}”. You will learn this in Step {n} — {t}.",
    "thanks": "Thank you! 🎉 Click “View score” to see your result. The steps where you missed a question are the best place to start. Keep learning with Digital Saathi!"
  },
  "hi": {
    "title": "डिजिटल साथी — शुरुआती क्विज़ (Pre-Assessment)",
    "description": "स्वागत है! 🙏 यह छोटा क्विज़ बताता है कि स्मार्टफ़ोन को सुरक्षित तरीके से इस्तेमाल करने के बारे में आप पहले से क्या जानते हैं।\n\n• 11 आसान सवाल · लगभग 5 मिनट\n• इसमें पास या फ़ेल नहीं होता — जो जवाब सही लगे, वह चुनें\n• आपका स्कोर बताएगा कि किन चरणों से शुरू करना है\n\n🔒 किसी भी फ़ॉर्म में कभी भी अपना OTP, PIN, पासवर्ड या बैंक की जानकारी न लिखें।",
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
    "correct": "सही जवाब — शाबाश!",
    "wrong": "पूरी तरह सही नहीं। सही जवाब है: “{a}”। यह आप चरण {n} — {t} में सीखेंगे।",
    "thanks": "धन्यवाद! 🎉 अपना नतीजा देखने के लिए “View score” दबाएं। जिन चरणों में कोई सवाल छूटा, वहीं से शुरू करना सबसे अच्छा है। डिजिटल साथी के साथ सीखते रहें!"
  },
  "mr": {
    "title": "डिजिटल साथी — सुरुवातीची क्विझ (Pre-Assessment)",
    "description": "स्वागत आहे! 🙏 स्मार्टफोन सुरक्षितपणे वापरण्याबद्दल तुम्हाला आधीच काय माहिती आहे, ते ही छोटी क्विझ दाखवते.\n\n• 11 सोपे प्रश्न · सुमारे 5 मिनिटे\n• यात पास-नापास नाही — जे उत्तर बरोबर वाटते ते निवडा\n• तुमचे गुण दाखवतील की कोणत्या टप्प्यांपासून सुरुवात करायची\n\n🔒 कोणत्याही फॉर्ममध्ये कधीही तुमचा OTP, PIN, पासवर्ड किंवा बँकेची माहिती लिहू नका.",
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

// The 11 questions, copied from the website's QUIZ ("answer" = number of the right option, counting from 0)
const QUESTIONS = {
  "en": [
    {
      "q": "The words on your phone screen are too small to read. What can you do?",
      "options": [
        "Make the text bigger in Settings → Display",
        "Buy a new phone",
        "Nothing — it cannot be changed"
      ],
      "answer": 0,
      "lesson": "phone"
    },
    {
      "q": "Strangers keep adding you to WhatsApp groups. What can you do?",
      "options": [
        "Settings → Privacy → Groups → choose “My contacts”",
        "Delete WhatsApp",
        "Reply and ask them to stop"
      ],
      "answer": 0,
      "lesson": "family"
    },
    {
      "q": "Someone messages: “Share your OTP to receive ₹5000.” What do you do?",
      "options": [
        "Share the OTP",
        "Never share it — it is a scam",
        "Share only the first 3 digits"
      ],
      "answer": 1,
      "lesson": "safety"
    },
    {
      "q": "Do you need a UPI PIN to RECEIVE money?",
      "options": [
        "Yes, always",
        "No, never",
        "Only for big amounts"
      ],
      "answer": 1,
      "lesson": "money"
    },
    {
      "q": "A video caller in police uniform says you are under “digital arrest” and must pay. What is true?",
      "options": [
        "Pay quickly to avoid jail",
        "Police never arrest anyone on a video call — hang up and call 1930",
        "Share your Aadhaar to prove you are innocent"
      ],
      "answer": 1,
      "lesson": "safety"
    },
    {
      "q": "Before paying on UPI, you should check…",
      "options": [
        "Nothing, just pay fast",
        "The name and amount on screen",
        "Only the colour of the app"
      ],
      "answer": 1,
      "lesson": "money"
    },
    {
      "q": "Where can you keep official copies of your Aadhaar and PAN safely?",
      "options": [
        "In DigiLocker",
        "In a family WhatsApp group",
        "In an email to a stranger"
      ],
      "answer": 0,
      "lesson": "money"
    },
    {
      "q": "What helps you never get locked out of your Google account?",
      "options": [
        "Using 1234 as the password",
        "Adding a recovery phone number and email",
        "Sharing the password with friends"
      ],
      "answer": 1,
      "lesson": "google"
    },
    {
      "q": "A good password is…",
      "options": [
        "1234",
        "Your name",
        "Long and hard to guess"
      ],
      "answer": 2,
      "lesson": "safety"
    },
    {
      "q": "You read shocking news in a forwarded WhatsApp message. Before believing it, you should…",
      "options": [
        "Forward it to everyone",
        "Check it on 2–3 trusted websites",
        "Believe it because a friend sent it"
      ],
      "answer": 1,
      "lesson": "ai"
    },
    {
      "q": "An AI chatbot asks for your Aadhaar number to “help” you. What do you do?",
      "options": [
        "Type it in",
        "Never share private details with AI chatbots",
        "Share only half the number"
      ],
      "answer": 1,
      "lesson": "ai"
    }
  ],
  "hi": [
    {
      "q": "फ़ोन की स्क्रीन पर अक्षर इतने छोटे हैं कि पढ़े नहीं जाते। आप क्या कर सकते हैं?",
      "options": [
        "Settings → Display में जाकर अक्षर बड़े करें",
        "नया फ़ोन खरीदें",
        "कुछ नहीं — यह बदला नहीं जा सकता"
      ],
      "answer": 0,
      "lesson": "phone"
    },
    {
      "q": "अनजान लोग आपको बार-बार WhatsApp ग्रुप में जोड़ रहे हैं। आप क्या कर सकते हैं?",
      "options": [
        "Settings → Privacy → Groups → “My contacts” चुनें",
        "WhatsApp हटा दें",
        "जवाब देकर उन्हें रुकने को कहें"
      ],
      "answer": 0,
      "lesson": "family"
    },
    {
      "q": "कोई संदेश भेजता है: “₹5000 पाने के लिए अपना OTP बताएं।” आप क्या करेंगे?",
      "options": [
        "OTP बता दें",
        "कभी न बताएं — यह धोखा है",
        "सिर्फ़ पहले 3 अंक बताएं"
      ],
      "answer": 1,
      "lesson": "safety"
    },
    {
      "q": "पैसे लेने (RECEIVE) के लिए क्या UPI PIN चाहिए?",
      "options": [
        "हाँ, हमेशा",
        "नहीं, कभी नहीं",
        "सिर्फ़ बड़ी राशि के लिए"
      ],
      "answer": 1,
      "lesson": "money"
    },
    {
      "q": "वीडियो कॉल पर वर्दी में कोई कहता है कि आप “डिजिटल अरेस्ट” में हैं और पैसे भरने होंगे। सच क्या है?",
      "options": [
        "जेल से बचने के लिए जल्दी पैसे भरें",
        "पुलिस कभी वीडियो कॉल पर गिरफ़्तार नहीं करती — कॉल काटें और 1930 पर कॉल करें",
        "बेगुनाही साबित करने के लिए आधार बताएं"
      ],
      "answer": 1,
      "lesson": "safety"
    },
    {
      "q": "UPI पर भुगतान से पहले आपको जांचना चाहिए…",
      "options": [
        "कुछ नहीं, जल्दी भुगतान करें",
        "स्क्रीन पर नाम और राशि",
        "सिर्फ़ ऐप का रंग"
      ],
      "answer": 1,
      "lesson": "money"
    },
    {
      "q": "आधार और PAN की आधिकारिक कॉपी सुरक्षित कहां रख सकते हैं?",
      "options": [
        "DigiLocker में",
        "परिवार के WhatsApp ग्रुप में",
        "किसी अनजान को ईमेल में"
      ],
      "answer": 0,
      "lesson": "money"
    },
    {
      "q": "Google खाते से कभी लॉक आउट न होने में क्या मदद करता है?",
      "options": [
        "पासवर्ड 1234 रखना",
        "रिकवरी फ़ोन नंबर और ईमेल जोड़ना",
        "दोस्तों को पासवर्ड बताना"
      ],
      "answer": 1,
      "lesson": "google"
    },
    {
      "q": "अच्छा पासवर्ड होता है…",
      "options": [
        "1234",
        "आपका नाम",
        "लंबा और मुश्किल से अंदाज़ा लगने वाला"
      ],
      "answer": 2,
      "lesson": "safety"
    },
    {
      "q": "किसी फॉरवर्ड किए गए WhatsApp संदेश में चौंकाने वाली खबर पढ़ी। मानने से पहले आपको…",
      "options": [
        "सबको फॉरवर्ड कर देना चाहिए",
        "2–3 भरोसेमंद वेबसाइटों पर जांचना चाहिए",
        "दोस्त ने भेजा इसलिए मान लेना चाहिए"
      ],
      "answer": 1,
      "lesson": "ai"
    },
    {
      "q": "कोई AI चैटबॉट “मदद” के लिए आपका आधार नंबर मांगता है। आप क्या करेंगे?",
      "options": [
        "नंबर लिख देंगे",
        "AI चैटबॉट को निजी जानकारी कभी नहीं देंगे",
        "आधा नंबर बताएंगे"
      ],
      "answer": 1,
      "lesson": "ai"
    }
  ],
  "mr": [
    {
      "q": "फोनच्या स्क्रीनवरची अक्षरे वाचता येत नाहीत इतकी लहान आहेत. तुम्ही काय करू शकता?",
      "options": [
        "Settings → Display मध्ये जाऊन अक्षरे मोठी करा",
        "नवीन फोन घ्या",
        "काहीच नाही — हे बदलता येत नाही"
      ],
      "answer": 0,
      "lesson": "phone"
    },
    {
      "q": "अनोळखी लोक तुम्हाला सारखे WhatsApp ग्रुपमध्ये जोडत आहेत. तुम्ही काय करू शकता?",
      "options": [
        "Settings → Privacy → Groups → “My contacts” निवडा",
        "WhatsApp काढून टाका",
        "उत्तर देऊन त्यांना थांबायला सांगा"
      ],
      "answer": 0,
      "lesson": "family"
    },
    {
      "q": "कोणी संदेश पाठवतो: “₹5000 मिळवण्यासाठी तुमचा OTP सांगा.” तुम्ही काय कराल?",
      "options": [
        "OTP सांगून टाका",
        "कधीही सांगू नका — ही फसवणूक आहे",
        "फक्त पहिले 3 अंक सांगा"
      ],
      "answer": 1,
      "lesson": "safety"
    },
    {
      "q": "पैसे घेण्यासाठी (RECEIVE) UPI PIN लागतो का?",
      "options": [
        "हो, नेहमी",
        "नाही, कधीच नाही",
        "फक्त मोठ्या रकमेसाठी"
      ],
      "answer": 1,
      "lesson": "money"
    },
    {
      "q": "व्हिडिओ कॉलवर गणवेशातील कोणी सांगतो की तुम्ही “डिजिटल अरेस्ट” मध्ये आहात आणि पैसे भरावे लागतील. खरे काय?",
      "options": [
        "तुरुंग टाळण्यासाठी पटकन पैसे भरा",
        "पोलीस कधीही व्हिडिओ कॉलवर अटक करत नाहीत — कॉल कट करा आणि 1930 वर कॉल करा",
        "निर्दोष असल्याचे सिद्ध करण्यासाठी आधार सांगा"
      ],
      "answer": 1,
      "lesson": "safety"
    },
    {
      "q": "UPI वर पैसे देण्याआधी तुम्ही तपासावे…",
      "options": [
        "काहीच नाही, पटकन पैसे द्या",
        "स्क्रीनवरील नाव आणि रक्कम",
        "फक्त ॲपचा रंग"
      ],
      "answer": 1,
      "lesson": "money"
    },
    {
      "q": "आधार आणि PAN च्या अधिकृत प्रती सुरक्षित कुठे ठेवता येतात?",
      "options": [
        "DigiLocker मध्ये",
        "कुटुंबाच्या WhatsApp ग्रुपमध्ये",
        "अनोळखी व्यक्तीला ईमेलमध्ये"
      ],
      "answer": 0,
      "lesson": "money"
    },
    {
      "q": "Google खात्यातून कधीही लॉक आउट न होण्यासाठी काय मदत करते?",
      "options": [
        "पासवर्ड 1234 ठेवणे",
        "रिकव्हरी फोन नंबर आणि ईमेल जोडणे",
        "मित्रांना पासवर्ड सांगणे"
      ],
      "answer": 1,
      "lesson": "google"
    },
    {
      "q": "चांगला पासवर्ड म्हणजे…",
      "options": [
        "1234",
        "तुमचे नाव",
        "लांब आणि ओळखायला कठीण"
      ],
      "answer": 2,
      "lesson": "safety"
    },
    {
      "q": "फॉरवर्ड केलेल्या WhatsApp संदेशात धक्कादायक बातमी वाचली. विश्वास ठेवण्याआधी तुम्ही…",
      "options": [
        "सगळ्यांना फॉरवर्ड करावी",
        "2–3 विश्वासार्ह वेबसाइटवर तपासावी",
        "मित्राने पाठवली म्हणून विश्वास ठेवावा"
      ],
      "answer": 1,
      "lesson": "ai"
    },
    {
      "q": "एखादा AI चॅटबॉट “मदत” करण्यासाठी तुमचा आधार नंबर मागतो. तुम्ही काय कराल?",
      "options": [
        "नंबर लिहून टाकाल",
        "AI चॅटबॉटला खासगी माहिती कधीही देणार नाही",
        "अर्धा नंबर सांगाल"
      ],
      "answer": 1,
      "lesson": "ai"
    }
  ]
};
