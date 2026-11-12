/**
 * DIGITAL SAATHI — GOOGLE CLASSROOM BUILDER (Google Apps Script + the official Classroom API)
 * ----------------------------------------------------------------------------
 * Creates the six Digital Saathi classrooms (one per learning step on the website) on YOUR
 * personal Gmail account, then fills each one with topics, lessons and practical activities.
 * Full instructions: CLASSROOM-GUIDE.md in this folder. Every post's text: CLASSROOM-CONTENT.md.
 *
 * Run these one at a time, in this order (choose the name in the toolbar, then click ▶ Run):
 *
 *   step1_checkSetup          read-only · checks the Classroom API works and lists your classes
 *   step2a_previewClassrooms  read-only · shows exactly what step 2b would create
 *   step2b_createClassrooms   CREATES the six classrooms (as PROVISIONED — see below)
 *      → then accept each class at classroom.google.com (CLASSROOM-GUIDE.md, Part D)
 *   step3_checkStatus         read-only · state, link and class code of each classroom
 *   step3b_activateWithApi    OPTIONAL · asks Google to switch PROVISIONED classes to ACTIVE
 *   step4_addLessons          ADDS topics, lessons and activities to the ACTIVE classes
 *   step5_exportClassroomInfo read-only · prints the JSON for google-classroom/classrooms.json
 *
 * Why PROVISIONED: Google does not let personal (@gmail.com) accounts create ACTIVE classes
 * through the API (it answers 403 PERMISSION_DENIED). A PROVISIONED class is created but not yet
 * open to students; you, the owner, accept it in the Classroom website. This script never tries
 * to get around that rule.
 *
 * Safe to run again: every step first looks at what already exists and skips it, so nothing is
 * created twice. Nothing is ever deleted.
 *
 * No passwords, keys or tokens are stored in this file. Google handles sign-in (OAuth) itself
 * when you click "Review permissions" the first time.
 * ----------------------------------------------------------------------------
 */

// ======================= SETTINGS (you may change these) =======================
const SETTINGS = {
  POST_STATE: "PUBLISHED",   // lessons and activities: "PUBLISHED" (visible to learners) or "DRAFT"
  PAUSE_MS: 300,             // short pause between Google calls, to stay far below Google's rate limits
  TIME_LIMIT_MS: 270000      // Apps Script stops a run after 6 minutes; we stop safely at 4.5 and tell you
};

// ======================= STEP 1 — check setup (read-only) =======================
function step1_checkSetup() {
  requireClassroomService_();
  log_("Checking the Classroom API and your permission…");
  const courses = listMyCourses_();
  log_("✅ The Classroom API answered. This account teaches or owns " + courses.length + " class(es).");
  courses.forEach(function (c) { log_("   • " + c.name + "   [" + c.courseState + "]"); });
  log_("");
  log_("The six Digital Saathi classrooms:");
  CLASSROOMS.forEach(function (def) {
    const found = findCourse_(courses, def.name);
    log_("   " + pad2_(def.step) + " " + def.name + " → " +
         (found ? "already exists (" + found.courseState + "), will NOT be created again" : "not created yet"));
  });
  log_("");
  log_("Nothing was created or changed. Next: run step2a_previewClassrooms.");
}

// ======================= STEP 2a — preview (read-only) =======================
function step2a_previewClassrooms() {
  requireClassroomService_();
  const courses = listMyCourses_();
  log_("PREVIEW — nothing is created by this step.\n");
  CLASSROOMS.forEach(function (def) {
    const found = findCourse_(courses, def.name);
    log_("──────── " + pad2_(def.step) + " · " + def.name + " ────────");
    log_(found ? "WILL SKIP: it already exists (" + found.courseState + ", id " + found.id + ")"
               : "WILL CREATE as PROVISIONED (you accept it afterwards)");
    log_("Section: " + def.section);
    log_("Room: " + def.room);
    log_("Heading: " + def.descriptionHeading);
    log_("Description (start): " + def.description.split("\n")[0]);
    log_("Classwork later (step 4): " + def.sections.map(function (s) {
      return s.topic + " (" + s.items.length + ")"; }).join(" · "));
    log_("");
  });
  log_("If this looks right, run step2b_createClassrooms.");
}

// ======================= STEP 2b — create the six classrooms =======================
function step2b_createClassrooms() {
  requireClassroomService_();
  const courses = listMyCourses_();
  let created = 0, skipped = 0, failed = 0;
  CLASSROOMS.forEach(function (def) {
    const found = findCourse_(courses, def.name);
    if (found) {
      skipped++;
      log_("⏭️  " + def.name + " — already exists (" + found.courseState + "), not created again.");
      return;
    }
    try {
      const course = Classroom.Courses.create({
        name: def.name,
        section: def.section,
        descriptionHeading: def.descriptionHeading,
        description: def.description,
        room: def.room,
        ownerId: "me",
        courseState: "PROVISIONED"   // the only state personal Gmail accounts may create
      });
      pause_();
      const check = Classroom.Courses.get(course.id);   // verify with Google that it really exists
      created++;
      courses.push(check);
      log_("✅ Created " + check.name + "  [" + check.courseState + "]  id " + check.id);
    } catch (e) {
      failed++;
      log_("❌ Could not create " + def.name + ": " + explainError_(e));
    }
  });
  log_("");
  log_("Summary: " + created + " created, " + skipped + " already existed, " + failed + " failed.");
  if (created + skipped > 0) {
    log_("NEXT (by hand): open https://classroom.google.com — each new class shows an \"Accept\" button.");
    log_("Accept all six (CLASSROOM-GUIDE.md, Part D), then run step3_checkStatus.");
  }
}

// ======================= STEP 3 — status (read-only) =======================
function step3_checkStatus() {
  requireClassroomService_();
  const courses = listMyCourses_();
  let active = 0;
  CLASSROOMS.forEach(function (def) {
    const c = findCourse_(courses, def.name);
    log_("──────── " + pad2_(def.step) + " · " + def.name);
    if (!c) { log_("   Not created yet → run step2b_createClassrooms."); return; }
    log_("   State: " + c.courseState + stateHint_(c.courseState));
    log_("   Course id: " + c.id);
    log_("   Link: " + (c.alternateLink || "(none yet)"));
    log_("   Class code: " + (c.enrollmentCode || "(none yet — appears once the class is ACTIVE)"));
    if (c.courseState === "ACTIVE") {
      active++;
      const have = existingClasswork_(c.id);
      log_("   Classwork: " + have.topics.length + " topics, " + have.materialTitles.length + " materials, " +
           have.workTitles.length + " activities (the plan has " + def.sections.length + " topics, " +
           countItems_(def, "material") + " materials, " + countItems_(def, "assignment") + " activities)");
    }
  });
  log_("");
  log_(active + " of " + CLASSROOMS.length + " classrooms are ACTIVE." +
       (active < CLASSROOMS.length ? " Accept the others at https://classroom.google.com" : " Next: run step4_addLessons."));
}

// ======================= STEP 3b — OPTIONAL: activate through the API =======================
// Google's documentation names two ways to make a PROVISIONED class ACTIVE: the owner accepts it
// in the Classroom website, OR the course is updated through the API. This tries the API way.
// If Google refuses it for a personal account, nothing breaks: just accept in the website.
function step3b_activateWithApi() {
  requireClassroomService_();
  const courses = listMyCourses_();
  CLASSROOMS.forEach(function (def) {
    const c = findCourse_(courses, def.name);
    if (!c) { log_("⏭️  " + def.name + " — not created yet."); return; }
    if (c.courseState !== "PROVISIONED") { log_("⏭️  " + def.name + " — already " + c.courseState + "."); return; }
    try {
      Classroom.Courses.patch({ courseState: "ACTIVE" }, c.id, { updateMask: "courseState" });
      pause_();
      const check = Classroom.Courses.get(c.id);
      log_((check.courseState === "ACTIVE" ? "✅ " : "⚠️ ") + def.name + " is now " + check.courseState);
    } catch (e) {
      log_("❌ Google did not activate " + def.name + ": " + explainError_(e));
      log_("   → That's fine: accept it by hand at https://classroom.google.com (CLASSROOM-GUIDE.md, Part D).");
    }
  });
}

// ======================= STEP 4 — add topics, lessons and activities =======================
function step4_addLessons() {
  requireClassroomService_();
  const started = Date.now();
  const courses = listMyCourses_();
  let done = 0, failed = 0;
  for (let i = 0; i < CLASSROOMS.length; i++) {
    const def = CLASSROOMS[i];
    const c = findCourse_(courses, def.name);
    if (!c) { log_("⏭️  " + def.name + " — not created yet (run step2b_createClassrooms)."); continue; }
    if (c.courseState !== "ACTIVE") {
      log_("⏭️  " + def.name + " — it is " + c.courseState + ". Accept it at https://classroom.google.com first, then run this again.");
      continue;
    }
    log_("──────── " + def.name);
    const result = buildClasswork_(c.id, def, started);
    failed += result.failed;
    if (!result.finished) {
      log_("⏸️  Stopped safely before Google's 6-minute limit. Run step4_addLessons again — it continues where it stopped.");
      return;
    }
    if (!result.failed) done++;
  }
  log_("");
  if (failed) log_("⚠️  " + failed + " post(s) could not be added (see ❌ above). Fix the cause, then run step4_addLessons again — it only adds what is missing.");
  log_(done + " classroom(s) are complete. Run step3_checkStatus to double-check the numbers.");
}

// Adds whatever is missing to one ACTIVE class. Returns { finished: false } if it stopped because of the
// time limit, and how many posts failed.
// Classroom shows the NEWEST topic and post at the top, so we create them last-to-first:
// that way learners see "Start here" first and the lessons in order 1, 2, 3.
function buildClasswork_(courseId, def, started) {
  const have = existingClasswork_(courseId);
  const topicIds = {};
  have.topics.forEach(function (t) { topicIds[norm_(t.name)] = t.topicId; });
  let added = 0, skipped = 0, failed = 0;
  for (let s = def.sections.length - 1; s >= 0; s--) {
    const section = def.sections[s];
    let topicId = topicIds[norm_(section.topic)];
    if (!topicId) {
      const t = Classroom.Courses.Topics.create({ name: section.topic }, courseId);
      topicId = t.topicId; topicIds[norm_(section.topic)] = topicId; added++;
      log_("   + topic: " + section.topic);
      pause_();
    }
    for (let k = section.items.length - 1; k >= 0; k--) {
      if (Date.now() - started > SETTINGS.TIME_LIMIT_MS) return { finished: false, failed: failed };
      const item = section.items[k];
      const list = item.type === "assignment" ? have.workTitles : have.materialTitles;
      if (list.indexOf(norm_(item.title)) >= 0) { skipped++; continue; }
      const body = { title: item.title, description: item.description, topicId: topicId, state: SETTINGS.POST_STATE };
      if (item.links.length) body.materials = item.links.map(function (url) { return { link: { url: url } }; });
      try {
        if (item.type === "assignment") {
          body.workType = "ASSIGNMENT";            // no points → an ungraded activity learners mark as done
          Classroom.Courses.CourseWork.create(body, courseId);
        } else {
          Classroom.Courses.CourseWorkMaterials.create(body, courseId);
        }
        list.push(norm_(item.title)); added++;
        log_("   + " + (item.type === "assignment" ? "activity" : "material") + ": " + item.title);
      } catch (e) {
        failed++;
        log_("   ❌ " + item.title + ": " + explainError_(e));
      }
      pause_();
    }
  }
  log_("   Done: " + added + " added, " + skipped + " already there" + (failed ? ", " + failed + " failed." : "."));
  return { finished: true, failed: failed };
}

// ======================= STEP 5 — export for the website (read-only) =======================
function step5_exportClassroomInfo() {
  requireClassroomService_();
  const courses = listMyCourses_();
  const out = {
    about: "Digital Saathi Google Classrooms — one per learning step. Keys match the website's LESSONS ids. " +
           "Made by step5_exportClassroomInfo in classroom-setup.gs. No secrets in here.",
    exportedAt: new Date().toISOString(),
    classrooms: {}
  };
  CLASSROOMS.forEach(function (def) {
    const c = findCourse_(courses, def.name);
    out.classrooms[def.id] = {
      step: def.step,
      websiteStep: def.websiteTitle,
      name: def.name,
      courseId: c ? c.id : null,
      url: c && c.alternateLink ? c.alternateLink : null,
      enrollmentCode: c && c.enrollmentCode ? c.enrollmentCode : null,
      state: c ? c.courseState : "NOT_CREATED",
      inviteLink: null   // fill in by hand: in Classroom, class card ⋮ / Settings → "Copy class invite link"
    };
  });
  log_("Copy everything between the two lines into google-classroom/classrooms.json");
  log_("----------------------------- COPY FROM HERE -----------------------------");
  log_(JSON.stringify(out, null, 2));
  log_("------------------------------ COPY TO HERE ------------------------------");
}

// ======================= helpers =======================
function requireClassroomService_() {
  if (typeof Classroom === "undefined") {
    throw new Error("The Google Classroom service is not switched on in this project. In the editor, click " +
      "\"+\" next to Services, choose \"Google Classroom API\", keep the identifier \"Classroom\" and click Add " +
      "(CLASSROOM-GUIDE.md, Part A).");
  }
}
// Every class this account teaches (all pages, all states)
function listMyCourses_() {
  const out = [];
  let pageToken;
  do {
    const res = Classroom.Courses.list({ teacherId: "me", pageSize: 100, pageToken: pageToken });
    (res.courses || []).forEach(function (c) { out.push(c); });
    pageToken = res.nextPageToken;
  } while (pageToken);
  return out;
}
// Same name (ignoring capitals, spaces and the kind of dash). A DECLINED class is ignored.
// If there are several, the ACTIVE one wins, then PROVISIONED, then any other.
function findCourse_(courses, name) {
  const rank = { ACTIVE: 0, PROVISIONED: 1, ARCHIVED: 2, SUSPENDED: 3 };
  const matches = courses.filter(function (c) {
    return norm_(c.name) === norm_(name) && c.courseState !== "DECLINED";
  }).sort(function (a, b) { return rankOf_(rank, a.courseState) - rankOf_(rank, b.courseState); });
  if (matches.length > 1) {
    log_("⚠️  " + matches.length + " classes are called \"" + name + "\" — using the " + matches[0].courseState +
         " one (id " + matches[0].id + "). You may archive the extra one in Classroom.");
  }
  return matches[0] || null;
}
function rankOf_(rank, state) { return rank[state] !== undefined ? rank[state] : 9; }
function existingClasswork_(courseId) {
  const topics = pageAll_(function (tok) { return Classroom.Courses.Topics.list(courseId, { pageToken: tok }); }, "topic");
  const materials = pageAll_(function (tok) {
    return Classroom.Courses.CourseWorkMaterials.list(courseId, { pageToken: tok, courseWorkMaterialStates: ["PUBLISHED", "DRAFT"] });
  }, "courseWorkMaterial");
  const work = pageAll_(function (tok) {
    return Classroom.Courses.CourseWork.list(courseId, { pageToken: tok, courseWorkStates: ["PUBLISHED", "DRAFT"] });
  }, "courseWork");
  return {
    topics: topics,
    materialTitles: materials.map(function (m) { return norm_(m.title); }),
    workTitles: work.map(function (w) { return norm_(w.title); })
  };
}
function pageAll_(fetch, field) {
  const out = [];
  let tok;
  do { const res = fetch(tok) || {}; (res[field] || []).forEach(function (x) { out.push(x); }); tok = res.nextPageToken; } while (tok);
  return out;
}
function countItems_(def, type) {
  return def.sections.reduce(function (n, s) { return n + s.items.filter(function (i) { return i.type === type; }).length; }, 0);
}
function norm_(text) {
  return String(text || "").replace(/[‐-―−-]+/g, "-").replace(/\s+/g, " ").trim().toLowerCase();
}
function stateHint_(state) {
  return {
    PROVISIONED: " — created, waiting for you to accept it at https://classroom.google.com",
    ACTIVE: " — open, learners can join",
    ARCHIVED: " — archived: restore it in Classroom (Menu → Archived classes) to use it again",
    SUSPENDED: " — suspended by Google",
  }[state] || "";
}
// Turn Google's error into plain advice
function explainError_(e) {
  const msg = String((e && e.message) || e);
  if (/not enabled|has not been used|is disabled|SERVICE_DISABLED/i.test(msg))
    return msg + "\n   → The Classroom API is off for this script's project. Remove and re-add the \"Google Classroom API\" service (Part A), wait a minute and try again.";
  if (/ACTIVE/.test(msg) && /PERMISSION_DENIED|403/.test(msg))
    return msg + "\n   → Personal Gmail accounts can't switch classes to ACTIVE through the API. Accept the class at https://classroom.google.com instead.";
  if (/PERMISSION_DENIED|403|permission/i.test(msg))
    return msg + "\n   → Google said this account may not do this. Open https://classroom.google.com once with this account and accept Google's terms, then run again. If it continues, see CLASSROOM-GUIDE.md, Part H.";
  if (/UserCannotOwnCourse/.test(msg)) return msg + "\n   → This account can't own classes. Use a personal @gmail.com account that has opened Classroom at least once.";
  if (/CourseTitleCannotContainUrl/.test(msg)) return msg + "\n   → A class name may not contain a web address.";
  if (/ProjectPermissionDenied/.test(msg)) return msg + "\n   → This post was made by a different script project; change it in the Classroom website instead.";
  if (/RESOURCE_EXHAUSTED|rate|quota|429/i.test(msg)) return msg + "\n   → Google's limit for now was reached. Wait 10 minutes and run the same step again; nothing is duplicated.";
  if (/authoriz|scope|insufficient/i.test(msg)) return msg + "\n   → Permissions are missing. Run the function again and click Review permissions → Allow.";
  return msg;
}
function pause_() { Utilities.sleep(SETTINGS.PAUSE_MS); }
function pad2_(n) { return (n < 10 ? "0" : "") + n; }
function log_(text) { console.log(text); }

// ============================================================================
// DATA — generated from the website (index.html → LESSONS, PRE_FORM, POST_FORM).
// Lesson titles and "How to do it" texts are the website's, word for word.
// Each classroom: name, section, room, descriptionHeading, description, and its
// topics ("sections") in the order learners should see them, each with its posts.
// ============================================================================
const CLASSROOMS = [
  {
    "id": "phone",
    "step": 1,
    "websiteTitle": "Smartphone Basics",
    "name": "Digital Saathi – Smartphone Basics",
    "section": "Step 01 of 6 · Digital literacy",
    "room": "Online · learn at your own pace",
    "descriptionHeading": "Welcome to Step 01: Smartphone Basics",
    "description": "By the end of this class you will use the most helpful settings on your own smartphone with confidence: emergency SOS, bigger text and read-aloud, a document scanner, a child lock, voice reminders and a battery that lasts all day.\n\nWhat you will learn:\n• Send an SOS in one press and show emergency contacts on your lock screen\n• Make text bigger and let your phone read it aloud\n• Turn your camera into a document scanner\n• Lock your phone to one app before handing it to a child\n• Set medicine and bill reminders just by speaking\n• Make your battery last the whole day\n\nHow this class works:\n1. Start with the “Start here” topic.\n2. Go through Lessons 1, 2 and 3 in order. Each lesson post shows how to do it, a “Try it now” task, and a suggested video and handout.\n3. Do the practical activities on your own phone.\n4. When you have finished all six Digital Saathi classes, check your skills with the Post-Assessment.\n\nSubject: Digital literacy · Step 01 of 6 in the Digital Saathi learning path (the same as Step 01 in the Learn section of the Digital Saathi website).\n\nSafety first: never post an OTP, PIN, password, Aadhaar number or bank details in this class — not even to your teacher.",
    "sections": [
      {
        "topic": "Start here",
        "items": [
          {
            "type": "material",
            "title": "Welcome! How this class works",
            "description": "Welcome to Digital Saathi, Step 01: Smartphone Basics.\n\nBy the end of this class you will use the most helpful settings on your own smartphone with confidence: emergency SOS, bigger text and read-aloud, a document scanner, a child lock, voice reminders and a battery that lasts all day.\n\nThis class has 6 short lessons in 3 lesson topics, and 2 practical activities. Go at your own pace — you can open any lesson again whenever you like. Lesson posts can also be read in Hindi and Marathi on the Digital Saathi website.\n\nIf you get stuck, ask a question in the Stream, or ask a family member or a Digital Saathi volunteer to sit with you.\n\nSafety first: never post an OTP, PIN, password, Aadhaar number or bank details in this class — not even to your teacher.",
            "links": []
          },
          {
            "type": "material",
            "title": "Before you start: Pre-Assessment (optional)",
            "description": "Find out what you already know before you begin. It takes a few minutes and there is no pass or fail.\n\nEnglish: https://docs.google.com/forms/d/e/1FAIpQLSfHfY4z_r-fAxj1REjDyZNdBzlLxIazPjKyQFM6NQCaQEfXfQ/viewform\nहिंदी: https://docs.google.com/forms/d/e/1FAIpQLSeAjdGWkCUBztaB7AzApmxuxRQrz1DgsI5SrY0HhuWNKyzfKg/viewform\nमराठी: https://docs.google.com/forms/d/e/1FAIpQLScnGhLFj71rdn1-eZccxkHmMYrWTVVXKoMM7wPuq3vIoqAEmQ/viewform\n\nYou only need to do it once, even though it appears in all six Digital Saathi classes.",
            "links": [
              "https://docs.google.com/forms/d/e/1FAIpQLSfHfY4z_r-fAxj1REjDyZNdBzlLxIazPjKyQFM6NQCaQEfXfQ/viewform"
            ]
          }
        ]
      },
      {
        "topic": "Lesson 1 · Safety and easy reading",
        "items": [
          {
            "type": "material",
            "title": "1.1 · 🆘 Send an SOS in one press and show emergency contacts on your lock screen",
            "description": "How to do it:\nOn Android open Settings → Safety & emergency (the name varies by phone) → Emergency SOS. Pressing the power button 5 times quickly then calls for help. Add emergency contacts and medical information there so they show on your lock screen. On iPhone, use the Health app → Medical ID.\n\nTry it now:\nOpen the Emergency SOS setting, add one emergency contact, then lock your phone and check that the contact shows on the lock screen.\n\nSuggested video: A 2-minute screen recording of setting up Emergency SOS and emergency contacts on an Android phone. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A wallet card: “Press the power button 5 times for SOS”, with the emergency numbers 112 and 1930.\n\nहिंदी: एक बटन से SOS भेजें और लॉक स्क्रीन पर इमरजेंसी कॉन्टैक्ट दिखाएं\nमराठी: एका बटणाने SOS पाठवा आणि लॉक स्क्रीनवर आपत्कालीन संपर्क दाखवा",
            "links": []
          },
          {
            "type": "material",
            "title": "1.2 · 🔠 Make text bigger and let your phone read it aloud",
            "description": "How to do it:\nSettings → Display → Font size makes the letters bigger. Turn on Select to Speak in Settings → Accessibility, then tap any text to hear it read aloud. (iPhone: Spoken Content.)\n\nTry it now:\nMake the font one size bigger, then use Select to Speak to hear this lesson read aloud.\n\nSuggested video: A screen recording of changing the font size and turning on Select to Speak. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A picture guide of Settings → Display → Font size, with an arrow on each screen.\n\nहिंदी: अक्षर बड़े करें और फ़ोन से पढ़कर सुनें\nमराठी: अक्षरे मोठी करा आणि फोनकडून वाचून ऐका",
            "links": []
          }
        ]
      },
      {
        "topic": "Lesson 2 · Camera scanner and child lock",
        "items": [
          {
            "type": "material",
            "title": "2.3 · 📷 Turn your camera into a document scanner",
            "description": "How to do it:\nIn the Google Drive app tap + → Scan and point the camera at the paper. It becomes a clear PDF you can send on WhatsApp. On iPhone, use Notes → Scan Documents.\n\nTry it now:\nScan any paper at home (a bill or a recipe) and send the PDF to a family member on WhatsApp.\n\nSuggested video: A screen recording of scanning a paper with Google Drive and sharing the PDF. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A picture guide of the four taps to scan with Google Drive.\n\nहिंदी: अपने कैमरे को डॉक्यूमेंट स्कैनर बनाएं\nमराठी: तुमच्या कॅमेऱ्याला डॉक्युमेंट स्कॅनर बनवा",
            "links": []
          },
          {
            "type": "material",
            "title": "2.4 · 📌 Lock your phone to one app before handing it to a child",
            "description": "How to do it:\nTurn on App pinning in Settings → Security (search for “pin”). Open the app, go to Recent apps, tap its icon and choose Pin. The child cannot leave that app without your PIN. (iPhone: Guided Access.)\n\nTry it now:\nTurn on App pinning, pin one app, and check that the phone asks for your PIN when you try to leave it.\n\nSuggested video: A screen recording of turning on App pinning and pinning an app. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A parents' checklist: before you hand your phone to a child.\n\nहिंदी: बच्चे को फ़ोन देने से पहले उसे एक ही ऐप में लॉक करें\nमराठी: मुलाच्या हातात फोन देण्याआधी तो एकाच ॲपमध्ये लॉक करा",
            "links": []
          }
        ]
      },
      {
        "topic": "Lesson 3 · Reminders and battery",
        "items": [
          {
            "type": "material",
            "title": "3.5 · 💊 Set medicine and bill reminders just by speaking",
            "description": "How to do it:\nSay “Hey Google, remind me to take my medicine every day at 9 am” or “Remind me to pay the electricity bill on the 5th”. Your phone will remind you on time.\n\nTry it now:\nSay “Hey Google, remind me to drink water at 4 pm today” and check that the reminder arrives.\n\nSuggested video: A short clip of setting a medicine reminder by voice. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A list of ready-to-say reminder sentences for medicines and bills.\n\nहिंदी: सिर्फ़ बोलकर दवा और बिल के रिमाइंडर लगाएं\nमराठी: फक्त बोलून औषध आणि बिलांचे रिमाइंडर लावा",
            "links": []
          },
          {
            "type": "material",
            "title": "3.6 · 🔋 Make your battery last the whole day",
            "description": "How to do it:\nTurn on Battery Saver in Settings → Battery, keep the screen brightness low and close apps you are not using. Switch off Location and Bluetooth when you don't need them.\n\nTry it now:\nTurn on Battery Saver and see how many hours the battery is now expected to last.\n\nSuggested video: A screen recording of Battery Saver and of switching off Location and Bluetooth. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: Battery tips on one page.\n\nहिंदी: बैटरी पूरे दिन चलाएं\nमराठी: बॅटरी दिवसभर टिकवा",
            "links": []
          }
        ]
      },
      {
        "topic": "Practical activities",
        "items": [
          {
            "type": "assignment",
            "title": "Activity 1 · Set up your emergency SOS",
            "description": "Turn on Emergency SOS on your phone and add at least one emergency contact (Lesson 1.1). Then lock your phone and ask a family member to check that your emergency contact shows on the lock screen.\n\nWhen you have done it, click “Mark as done”.\n\nSafety first: never post an OTP, PIN, password, Aadhaar number or bank details in this class — not even to your teacher.",
            "links": []
          },
          {
            "type": "assignment",
            "title": "Activity 2 · Scan a paper and set a reminder",
            "description": "1. Scan one paper at home (a bill, a prescription or a recipe) with Google Drive and send the PDF to a family member on WhatsApp (Lesson 2.3).\n2. Set one reminder by voice, for example “Hey Google, remind me to take my medicine at 9 am” (Lesson 3.5).\n\nWhen you have done both, click “Mark as done”.\n\nSafety first: never post an OTP, PIN, password, Aadhaar number or bank details in this class — not even to your teacher.",
            "links": []
          }
        ]
      },
      {
        "topic": "Check your skills",
        "items": [
          {
            "type": "material",
            "title": "Post-Assessment: see how much you have learned",
            "description": "When you have finished all six Digital Saathi classes, take the Post-Assessment. It has 20 everyday questions. Score 14 or more out of 20 for the Digital Saathi certificate, which the team sends after a volunteer checks your result. Retakes are free.\n\nEnglish: https://docs.google.com/forms/d/e/1FAIpQLScMXcxDLqj9ukFTiKrYounSp44ukVv9IIBMUcti6-RtlfF-Sg/viewform\nहिंदी: https://docs.google.com/forms/d/e/1FAIpQLSdpz4bu2SdGTou02njvQoN1V-InaBbqR_fiLIvZU1aCsBlu8w/viewform\nमराठी: https://docs.google.com/forms/d/e/1FAIpQLSdvDSLZO8A47-su2tZkxrGFhFkFeW4o3Fkufn--LOHCEBp4Bw/viewform",
            "links": [
              "https://docs.google.com/forms/d/e/1FAIpQLScMXcxDLqj9ukFTiKrYounSp44ukVv9IIBMUcti6-RtlfF-Sg/viewform"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "google",
    "step": 2,
    "websiteTitle": "Google, Gmail & YouTube",
    "name": "Digital Saathi – Google, Gmail & YouTube",
    "section": "Step 02 of 6 · Digital literacy",
    "room": "Online · learn at your own pace",
    "descriptionHeading": "Welcome to Step 02: Google, Gmail & YouTube",
    "description": "By the end of this class you will use Google Lens, Google Maps, YouTube, Gmail, Google Forms and voice search in your own language, and you will keep your Google account safe from being locked out.\n\nWhat you will learn:\n• Point your camera to translate, identify or copy anything\n• Find the nearest hospital, pharmacy or bus route in seconds\n• Make YouTube safe for children\n• Never get locked out of your Google account\n• Create your Gmail account and use Google Forms and Classroom\n• Ask Google questions in your own language by voice\n\nHow this class works:\n1. Start with the “Start here” topic.\n2. Go through Lessons 1, 2 and 3 in order. Each lesson post shows how to do it, a “Try it now” task, and a suggested video and handout.\n3. Do the practical activities on your own phone.\n4. When you have finished all six Digital Saathi classes, check your skills with the Post-Assessment.\n\nSubject: Digital literacy · Step 02 of 6 in the Digital Saathi learning path (the same as Step 02 in the Learn section of the Digital Saathi website).\n\nSafety first: never post an OTP, PIN, password, Aadhaar number or bank details in this class — not even to your teacher.",
    "sections": [
      {
        "topic": "Start here",
        "items": [
          {
            "type": "material",
            "title": "Welcome! How this class works",
            "description": "Welcome to Digital Saathi, Step 02: Google, Gmail & YouTube.\n\nBy the end of this class you will use Google Lens, Google Maps, YouTube, Gmail, Google Forms and voice search in your own language, and you will keep your Google account safe from being locked out.\n\nThis class has 6 short lessons in 3 lesson topics, and 2 practical activities. Go at your own pace — you can open any lesson again whenever you like. Lesson posts can also be read in Hindi and Marathi on the Digital Saathi website.\n\nIf you get stuck, ask a question in the Stream, or ask a family member or a Digital Saathi volunteer to sit with you.\n\nSafety first: never post an OTP, PIN, password, Aadhaar number or bank details in this class — not even to your teacher.",
            "links": []
          },
          {
            "type": "material",
            "title": "Before you start: Pre-Assessment (optional)",
            "description": "Find out what you already know before you begin. It takes a few minutes and there is no pass or fail.\n\nEnglish: https://docs.google.com/forms/d/e/1FAIpQLSfHfY4z_r-fAxj1REjDyZNdBzlLxIazPjKyQFM6NQCaQEfXfQ/viewform\nहिंदी: https://docs.google.com/forms/d/e/1FAIpQLSeAjdGWkCUBztaB7AzApmxuxRQrz1DgsI5SrY0HhuWNKyzfKg/viewform\nमराठी: https://docs.google.com/forms/d/e/1FAIpQLScnGhLFj71rdn1-eZccxkHmMYrWTVVXKoMM7wPuq3vIoqAEmQ/viewform\n\nYou only need to do it once, even though it appears in all six Digital Saathi classes.",
            "links": [
              "https://docs.google.com/forms/d/e/1FAIpQLSfHfY4z_r-fAxj1REjDyZNdBzlLxIazPjKyQFM6NQCaQEfXfQ/viewform"
            ]
          }
        ]
      },
      {
        "topic": "Lesson 1 · Google Lens and Google Maps",
        "items": [
          {
            "type": "material",
            "title": "1.1 · 🔍 Point your camera to translate, identify or copy anything",
            "description": "How to do it:\nTap the camera icon (Google Lens) in the Google search bar and point it at a sign, a medicine strip or a plant. Choose Translate, Search or Text to translate it, find out what it is, or copy the words.\n\nTry it now:\nPoint Google Lens at a medicine strip or a sign and try Translate or Text.\n\nSuggested video: A screen recording of using Google Lens to translate a sign and copy text. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A picture guide showing where the Google Lens camera icon is.\n\nहिंदी: कैमरे से किसी भी चीज़ का अनुवाद करें, उसे पहचानें या कॉपी करें\nमराठी: कॅमेऱ्याने कशाचाही अनुवाद करा, ते ओळखा किंवा कॉपी करा",
            "links": []
          },
          {
            "type": "material",
            "title": "1.2 · 🗺️ Find the nearest hospital, pharmacy or bus route in seconds",
            "description": "How to do it:\nOpen Google Maps and type “hospital near me” or “pharmacy near me”. For buses, type where you want to go and tap the bus icon to see routes and timings, where available.\n\nTry it now:\nSearch “pharmacy near me” in Google Maps and tap Directions.\n\nSuggested video: A screen recording of finding a hospital and a bus route in Google Maps. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A picture guide to searching and getting directions in Google Maps.\n\nहिंदी: पास का अस्पताल, दवा की दुकान या बस का रास्ता पलों में खोजें\nमराठी: जवळचे रुग्णालय, औषधाचे दुकान किंवा बसचा मार्ग क्षणात शोधा",
            "links": []
          }
        ]
      },
      {
        "topic": "Lesson 2 · Safe YouTube and a safe Google account",
        "items": [
          {
            "type": "material",
            "title": "2.3 · 🧒 Make YouTube safe for children",
            "description": "How to do it:\nFor young children, use the YouTube Kids app. On regular YouTube, turn on Restricted Mode in Settings → General to hide videos meant for adults.\n\nTry it now:\nTurn on Restricted Mode in YouTube, or install YouTube Kids for a child at home.\n\nSuggested video: A screen recording of turning on Restricted Mode in YouTube. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A parents' checklist for safe YouTube.\n\nहिंदी: YouTube को बच्चों के लिए सुरक्षित बनाएं\nमराठी: YouTube मुलांसाठी सुरक्षित करा",
            "links": []
          },
          {
            "type": "material",
            "title": "2.4 · 🔐 Never get locked out of your Google account",
            "description": "How to do it:\nIn Settings → Google → Manage your Google Account → Security, add a recovery phone number and a recovery email. Write your password down and keep it somewhere safe at home.\n\nTry it now:\nCheck that your recovery phone number and recovery email are correct.\n\nSuggested video: A screen recording of adding a recovery phone and email in Manage your Google Account. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A fill-in card for your Google account details, to keep safe at home (never post it here).\n\nहिंदी: अपने Google खाते से कभी लॉक आउट न हों\nमराठी: तुमच्या Google खात्यातून कधीही लॉक आउट होऊ नका",
            "links": []
          }
        ]
      },
      {
        "topic": "Lesson 3 · Gmail, Forms, Classroom and voice search",
        "items": [
          {
            "type": "material",
            "title": "3.5 · 📧 Create your Gmail account and use Google Forms and Classroom",
            "description": "How to do it:\nIn the Gmail app tap Create account. With the same account you can fill in Google Forms sent by a school or office, and join a Google Classroom with the class code your teacher gives you.\n\nTry it now:\nSend a short email to a family member from your Gmail.\n\nSuggested video: A screen recording of creating a Gmail account and joining a Google Classroom class with a class code. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A picture guide to filling in a Google Form.\n\nहिंदी: अपना Gmail खाता बनाएं और Google Forms व Classroom इस्तेमाल करें\nमराठी: तुमचे Gmail खाते तयार करा आणि Google Forms व Classroom वापरा",
            "links": []
          },
          {
            "type": "material",
            "title": "3.6 · 🗣️ Ask Google questions in your own language by voice",
            "description": "How to do it:\nTap the microphone in the Google app and speak in Hindi, Marathi or English. To get results in your language, choose it in the Google app's Settings.\n\nTry it now:\nTap the microphone in the Google app and ask in your own language: “What is the weather today?”\n\nSuggested video: A short clip of asking Google a question by voice in Hindi or Marathi. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A list of useful voice questions to try.\n\nहिंदी: अपनी भाषा में बोलकर Google से सवाल पूछें\nमराठी: तुमच्या भाषेत बोलून Google ला प्रश्न विचारा",
            "links": []
          }
        ]
      },
      {
        "topic": "Practical activities",
        "items": [
          {
            "type": "assignment",
            "title": "Activity 1 · Find help near you",
            "description": "Open Google Maps, search “pharmacy near me” or “hospital near me”, and tap Directions to see how to get there (Lesson 1.2).\n\nWhen you have done it, click “Mark as done”.\n\nSafety first: never post an OTP, PIN, password, Aadhaar number or bank details in this class — not even to your teacher.",
            "links": []
          },
          {
            "type": "assignment",
            "title": "Activity 2 · Make your Google account safe",
            "description": "Check that your recovery phone number and recovery email are added and correct (Lesson 2.4). Write your password on paper and keep it somewhere safe at home — never post it here.\n\nWhen you have done it, click “Mark as done”.\n\nSafety first: never post an OTP, PIN, password, Aadhaar number or bank details in this class — not even to your teacher.",
            "links": []
          }
        ]
      },
      {
        "topic": "Check your skills",
        "items": [
          {
            "type": "material",
            "title": "Post-Assessment: see how much you have learned",
            "description": "When you have finished all six Digital Saathi classes, take the Post-Assessment. It has 20 everyday questions. Score 14 or more out of 20 for the Digital Saathi certificate, which the team sends after a volunteer checks your result. Retakes are free.\n\nEnglish: https://docs.google.com/forms/d/e/1FAIpQLScMXcxDLqj9ukFTiKrYounSp44ukVv9IIBMUcti6-RtlfF-Sg/viewform\nहिंदी: https://docs.google.com/forms/d/e/1FAIpQLSdpz4bu2SdGTou02njvQoN1V-InaBbqR_fiLIvZU1aCsBlu8w/viewform\nमराठी: https://docs.google.com/forms/d/e/1FAIpQLSdvDSLZO8A47-su2tZkxrGFhFkFeW4o3Fkufn--LOHCEBp4Bw/viewform",
            "links": [
              "https://docs.google.com/forms/d/e/1FAIpQLScMXcxDLqj9ukFTiKrYounSp44ukVv9IIBMUcti6-RtlfF-Sg/viewform"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "family",
    "step": 3,
    "websiteTitle": "Communication with family & friends",
    "name": "Digital Saathi – Communication with Family & Friends",
    "section": "Step 03 of 6 · Digital literacy",
    "room": "Online · learn at your own pace",
    "descriptionHeading": "Welcome to Step 03: Communication with Family & Friends",
    "description": "By the end of this class you will stay in touch with family and friends safely: share your live location, keep chats and photos backed up, control noisy groups and unknown callers, share your screen to get help, and join video calls with a link.\n\nWhat you will learn:\n• Share your live location until you reach home\n• Never lose your WhatsApp chats and family photos\n• Mute noisy groups and stop strangers adding you to groups\n• Silence calls from unknown numbers on WhatsApp\n• Share your screen on a video call to get help\n• Join a class or family meeting with just a link\n\nHow this class works:\n1. Start with the “Start here” topic.\n2. Go through Lessons 1, 2 and 3 in order. Each lesson post shows how to do it, a “Try it now” task, and a suggested video and handout.\n3. Do the practical activities on your own phone.\n4. When you have finished all six Digital Saathi classes, check your skills with the Post-Assessment.\n\nSubject: Digital literacy · Step 03 of 6 in the Digital Saathi learning path (the same as Step 03 in the Learn section of the Digital Saathi website).\n\nSafety first: never post an OTP, PIN, password, Aadhaar number or bank details in this class — not even to your teacher.",
    "sections": [
      {
        "topic": "Start here",
        "items": [
          {
            "type": "material",
            "title": "Welcome! How this class works",
            "description": "Welcome to Digital Saathi, Step 03: Communication with family & friends.\n\nBy the end of this class you will stay in touch with family and friends safely: share your live location, keep chats and photos backed up, control noisy groups and unknown callers, share your screen to get help, and join video calls with a link.\n\nThis class has 6 short lessons in 3 lesson topics, and 2 practical activities. Go at your own pace — you can open any lesson again whenever you like. Lesson posts can also be read in Hindi and Marathi on the Digital Saathi website.\n\nIf you get stuck, ask a question in the Stream, or ask a family member or a Digital Saathi volunteer to sit with you.\n\nSafety first: never post an OTP, PIN, password, Aadhaar number or bank details in this class — not even to your teacher.",
            "links": []
          },
          {
            "type": "material",
            "title": "Before you start: Pre-Assessment (optional)",
            "description": "Find out what you already know before you begin. It takes a few minutes and there is no pass or fail.\n\nEnglish: https://docs.google.com/forms/d/e/1FAIpQLSfHfY4z_r-fAxj1REjDyZNdBzlLxIazPjKyQFM6NQCaQEfXfQ/viewform\nहिंदी: https://docs.google.com/forms/d/e/1FAIpQLSeAjdGWkCUBztaB7AzApmxuxRQrz1DgsI5SrY0HhuWNKyzfKg/viewform\nमराठी: https://docs.google.com/forms/d/e/1FAIpQLScnGhLFj71rdn1-eZccxkHmMYrWTVVXKoMM7wPuq3vIoqAEmQ/viewform\n\nYou only need to do it once, even though it appears in all six Digital Saathi classes.",
            "links": [
              "https://docs.google.com/forms/d/e/1FAIpQLSfHfY4z_r-fAxj1REjDyZNdBzlLxIazPjKyQFM6NQCaQEfXfQ/viewform"
            ]
          }
        ]
      },
      {
        "topic": "Lesson 1 · Live location and backups",
        "items": [
          {
            "type": "material",
            "title": "1.1 · 📍 Share your live location until you reach home",
            "description": "How to do it:\nIn a WhatsApp chat tap 📎 → Location → Share live location and choose how long (for example 1 hour). Your family can follow you on the map until you reach home.\n\nTry it now:\nShare your live location with a family member for 15 minutes, then stop sharing.\n\nSuggested video: A screen recording of sharing and stopping live location in WhatsApp. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A picture guide: 📎 → Location → Share live location.\n\nहिंदी: घर पहुंचने तक अपनी लाइव लोकेशन शेयर करें\nमराठी: घरी पोहोचेपर्यंत तुमचे लाइव्ह लोकेशन शेअर करा",
            "links": []
          },
          {
            "type": "material",
            "title": "1.2 · 💾 Never lose your WhatsApp chats and family photos",
            "description": "How to do it:\nIn WhatsApp go to Settings → Chats → Chat backup and turn on a daily backup to Google Drive (iPhone: iCloud). Turn on backup in Google Photos too, so your photos stay safe even if the phone is lost.\n\nTry it now:\nCheck when your last WhatsApp chat backup happened, and turn on a daily backup.\n\nSuggested video: A screen recording of turning on WhatsApp chat backup and Google Photos backup. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A checklist: what to back up before changing or repairing a phone.\n\nहिंदी: WhatsApp चैट और परिवार की फ़ोटो कभी न खोएं\nमराठी: WhatsApp चॅट आणि कुटुंबाचे फोटो कधीही गमावू नका",
            "links": []
          }
        ]
      },
      {
        "topic": "Lesson 2 · Quiet groups and unknown callers",
        "items": [
          {
            "type": "material",
            "title": "2.3 · 🔕 Mute noisy groups and stop strangers adding you to groups",
            "description": "How to do it:\nTap a group's name → Mute notifications → Always. Then in WhatsApp Settings → Privacy → Groups choose “My contacts”, so strangers cannot add you.\n\nTry it now:\nMute one noisy group and set Groups privacy to “My contacts”.\n\nSuggested video: A screen recording of muting a group and changing who can add you to groups. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A picture guide to WhatsApp's group privacy setting.\n\nहिंदी: शोर करने वाले ग्रुप म्यूट करें और अनजान लोगों को आपको ग्रुप में जोड़ने से रोकें\nमराठी: गोंगाट करणारे ग्रुप म्यूट करा आणि अनोळखी लोकांना तुम्हाला ग्रुपमध्ये जोडण्यापासून थांबवा",
            "links": []
          },
          {
            "type": "material",
            "title": "2.4 · 📵 Silence calls from unknown numbers on WhatsApp",
            "description": "How to do it:\nTurn on Silence unknown callers in WhatsApp Settings → Privacy → Calls. Calls from numbers not in your contacts won't ring, but they still show in your call list.\n\nTry it now:\nTurn on Silence unknown callers in WhatsApp.\n\nSuggested video: A screen recording of turning on Silence unknown callers. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A one-page note: what to do when an unknown number calls.\n\nहिंदी: WhatsApp पर अनजान नंबरों की कॉल साइलेंट करें\nमराठी: WhatsApp वर अनोळखी नंबरचे कॉल सायलेंट करा",
            "links": []
          }
        ]
      },
      {
        "topic": "Lesson 3 · Screen sharing and joining meetings",
        "items": [
          {
            "type": "material",
            "title": "3.5 · 🖥️ Share your screen on a video call to get help",
            "description": "How to do it:\nDuring a WhatsApp video call tap the share-screen button, so a family member can see your screen and guide you. Close bank and payment apps before you share.\n\nTry it now:\nOn a video call with a family member, share your screen for one minute, then stop.\n\nSuggested video: A screen recording of sharing your screen on a WhatsApp video call. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A checklist: apps to close before you share your screen.\n\nहिंदी: मदद पाने के लिए वीडियो कॉल पर अपनी स्क्रीन शेयर करें\nमराठी: मदत मिळवण्यासाठी व्हिडिओ कॉलवर तुमची स्क्रीन शेअर करा",
            "links": []
          },
          {
            "type": "material",
            "title": "3.6 · 🔗 Join a class or family meeting with just a link",
            "description": "How to do it:\nWhen someone sends a Google Meet or Zoom link, tap it at the meeting time. Allow the camera and microphone, check your name and tap Join.\n\nTry it now:\nAsk a family member to send you a Google Meet link, and join it.\n\nSuggested video: A screen recording of joining a Google Meet from a link. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A picture guide to allowing the camera and microphone and tapping Join.\n\nहिंदी: सिर्फ़ एक लिंक से क्लास या परिवार की मीटिंग से जुड़ें\nमराठी: फक्त एका लिंकने वर्ग किंवा कुटुंबाच्या मीटिंगमध्ये सामील व्हा",
            "links": []
          }
        ]
      },
      {
        "topic": "Practical activities",
        "items": [
          {
            "type": "assignment",
            "title": "Activity 1 · Share your live location",
            "description": "In WhatsApp, share your live location with one family member for 15 minutes, then stop sharing (Lesson 1.1).\n\nWhen you have done it, click “Mark as done”.\n\nSafety first: never post an OTP, PIN, password, Aadhaar number or bank details in this class — not even to your teacher.",
            "links": []
          },
          {
            "type": "assignment",
            "title": "Activity 2 · Make WhatsApp calmer and safer",
            "description": "1. Turn on a daily chat backup (Lesson 1.2).\n2. Turn on “Silence unknown callers” (Lesson 2.4).\n\nWhen you have done both, click “Mark as done”.\n\nSafety first: never post an OTP, PIN, password, Aadhaar number or bank details in this class — not even to your teacher.",
            "links": []
          }
        ]
      },
      {
        "topic": "Check your skills",
        "items": [
          {
            "type": "material",
            "title": "Post-Assessment: see how much you have learned",
            "description": "When you have finished all six Digital Saathi classes, take the Post-Assessment. It has 20 everyday questions. Score 14 or more out of 20 for the Digital Saathi certificate, which the team sends after a volunteer checks your result. Retakes are free.\n\nEnglish: https://docs.google.com/forms/d/e/1FAIpQLScMXcxDLqj9ukFTiKrYounSp44ukVv9IIBMUcti6-RtlfF-Sg/viewform\nहिंदी: https://docs.google.com/forms/d/e/1FAIpQLSdpz4bu2SdGTou02njvQoN1V-InaBbqR_fiLIvZU1aCsBlu8w/viewform\nमराठी: https://docs.google.com/forms/d/e/1FAIpQLSdvDSLZO8A47-su2tZkxrGFhFkFeW4o3Fkufn--LOHCEBp4Bw/viewform",
            "links": [
              "https://docs.google.com/forms/d/e/1FAIpQLScMXcxDLqj9ukFTiKrYounSp44ukVv9IIBMUcti6-RtlfF-Sg/viewform"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "safety",
    "step": 4,
    "websiteTitle": "Stay safe online",
    "name": "Digital Saathi – Stay Safe Online",
    "section": "Step 04 of 6 · Digital literacy",
    "room": "Online · learn at your own pace",
    "descriptionHeading": "Welcome to Step 04: Stay Safe Online",
    "description": "By the end of this class you will recognise the most common scams, protect your phone and accounts, help children stay safe in games and chats, and know exactly what to do in the first hour if money is lost.\n\nWhat you will learn:\n• Don’t fall for the “digital arrest” scam\n• Spot fake KYC, electricity bill and parcel messages\n• Set a family code word against fake voice calls\n• Never install an app from a link someone sends you\n• Create strong passwords you can actually remember\n• Lock your WhatsApp and Gmail with two-step verification\n• Say no to strangers in games and chats\n• Lost money? Call 1930 within the first hour\n\nHow this class works:\n1. Start with the “Start here” topic.\n2. Go through Lessons 1, 2 and 3 in order. Each lesson post shows how to do it, a “Try it now” task, and a suggested video and handout.\n3. Do the practical activities on your own phone.\n4. When you have finished all six Digital Saathi classes, check your skills with the Post-Assessment.\n\nSubject: Digital literacy · Step 04 of 6 in the Digital Saathi learning path (the same as Step 04 in the Learn section of the Digital Saathi website).\n\nSafety first: never post an OTP, PIN, password, Aadhaar number or bank details in this class — not even to your teacher.",
    "sections": [
      {
        "topic": "Start here",
        "items": [
          {
            "type": "material",
            "title": "Welcome! How this class works",
            "description": "Welcome to Digital Saathi, Step 04: Stay safe online.\n\nBy the end of this class you will recognise the most common scams, protect your phone and accounts, help children stay safe in games and chats, and know exactly what to do in the first hour if money is lost.\n\nThis class has 8 short lessons in 3 lesson topics, and 2 practical activities. Go at your own pace — you can open any lesson again whenever you like. Lesson posts can also be read in Hindi and Marathi on the Digital Saathi website.\n\nIf you get stuck, ask a question in the Stream, or ask a family member or a Digital Saathi volunteer to sit with you.\n\nSafety first: never post an OTP, PIN, password, Aadhaar number or bank details in this class — not even to your teacher.",
            "links": []
          },
          {
            "type": "material",
            "title": "Before you start: Pre-Assessment (optional)",
            "description": "Find out what you already know before you begin. It takes a few minutes and there is no pass or fail.\n\nEnglish: https://docs.google.com/forms/d/e/1FAIpQLSfHfY4z_r-fAxj1REjDyZNdBzlLxIazPjKyQFM6NQCaQEfXfQ/viewform\nहिंदी: https://docs.google.com/forms/d/e/1FAIpQLSeAjdGWkCUBztaB7AzApmxuxRQrz1DgsI5SrY0HhuWNKyzfKg/viewform\nमराठी: https://docs.google.com/forms/d/e/1FAIpQLScnGhLFj71rdn1-eZccxkHmMYrWTVVXKoMM7wPuq3vIoqAEmQ/viewform\n\nYou only need to do it once, even though it appears in all six Digital Saathi classes.",
            "links": [
              "https://docs.google.com/forms/d/e/1FAIpQLSfHfY4z_r-fAxj1REjDyZNdBzlLxIazPjKyQFM6NQCaQEfXfQ/viewform"
            ]
          }
        ]
      },
      {
        "topic": "Lesson 1 · Spot the scam",
        "items": [
          {
            "type": "material",
            "title": "1.1 · 🚨 Don’t fall for the “digital arrest” scam",
            "description": "How to do it:\nPolice, the CBI or courts never arrest anyone on a video call or ask for money to “settle a case”. If someone in uniform threatens you on a call, hang up and call 1930 or your local police.\n\nTry it now:\nTell one family member about the “digital arrest” scam, and save 1930 in your contacts.\n\nSuggested video: An awareness video about the “digital arrest” scam from an official government or police source. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A poster: “Police never arrest anyone on a video call — call 1930”.\n\nहिंदी: “डिजिटल अरेस्ट” वाले धोखे में न फंसें\nमराठी: “डिजिटल अरेस्ट” फसवणुकीला बळी पडू नका",
            "links": []
          },
          {
            "type": "material",
            "title": "1.2 · 🚩 Spot fake KYC, electricity bill and parcel messages",
            "description": "How to do it:\nMessages like “your KYC is expiring”, “your electricity will be cut tonight” or “your parcel is stuck” with a link or a number are fake. Check only in the official app or at the office.\n\nTry it now:\nLook through your recent SMS for a message that could be fake, and delete it without tapping its link.\n\nSuggested video: A short explainer on spotting fake KYC, electricity bill and parcel messages. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A “spot the fake” worksheet with three example messages.\n\nहिंदी: नकली KYC, बिजली बिल और पार्सल वाले संदेश पहचानें\nमराठी: बनावट KYC, वीज बिल आणि पार्सलचे संदेश ओळखा",
            "links": []
          },
          {
            "type": "material",
            "title": "1.3 · 🎭 Set a family code word against fake voice calls",
            "description": "How to do it:\nScammers can copy a voice using AI. Agree on a secret family code word. If a “relative” calls asking for money urgently, ask for the word — or hang up and call them back on the number you know.\n\nTry it now:\nAgree on a family code word — say it out loud, never write it in a chat.\n\nSuggested video: A short role-play of a fake “relative” call and how the code word stops it. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A family card: what to do when someone calls asking for money.\n\nहिंदी: नकली आवाज़ वाली कॉल से बचने के लिए परिवार का कोड वर्ड तय करें\nमराठी: बनावट आवाजातील कॉलपासून वाचण्यासाठी कुटुंबाचा कोड वर्ड ठरवा",
            "links": []
          }
        ]
      },
      {
        "topic": "Lesson 2 · Protect your phone and accounts",
        "items": [
          {
            "type": "material",
            "title": "2.4 · 📲 Never install an app from a link someone sends you",
            "description": "How to do it:\nInstall apps only from the Play Store or App Store. An .apk file sent on WhatsApp or SMS can take over your phone and your bank account — never open one.\n\nTry it now:\nLook at the apps on your phone and remove any app you don't recognise or didn't install from the Play Store.\n\nSuggested video: A short explainer on why .apk files sent on WhatsApp are dangerous. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A poster: “Apps only from the Play Store or App Store”.\n\nहिंदी: किसी के भेजे लिंक से कभी कोई ऐप इंस्टॉल न करें\nमराठी: कोणी पाठवलेल्या लिंकवरून कधीही ॲप इन्स्टॉल करू नका",
            "links": []
          },
          {
            "type": "material",
            "title": "2.5 · 🔑 Create strong passwords you can actually remember",
            "description": "How to do it:\nJoin three or four unrelated words with numbers, like “Mango-River-Lamp-47”. It is long, strong and easy to remember. Use a different password for every account.\n\nTry it now:\nPractise making a strong password from three words and a number (don't use it for a real account and don't post it here).\n\nSuggested video: A short explainer on making passwords from three words. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A practice worksheet for building a strong password (never write your real password on it).\n\nहिंदी: ऐसे मज़बूत पासवर्ड बनाएं जो सच में याद रहें\nमराठी: खरोखर लक्षात राहतील असे मजबूत पासवर्ड तयार करा",
            "links": []
          },
          {
            "type": "material",
            "title": "2.6 · 🔐 Lock your WhatsApp and Gmail with two-step verification",
            "description": "How to do it:\nWhatsApp: Settings → Account → Two-step verification → Turn on, and set a 6-digit PIN. Gmail: Google Account → Security → 2-Step Verification.\n\nTry it now:\nTurn on two-step verification in WhatsApp.\n\nSuggested video: A screen recording of turning on two-step verification in WhatsApp and Gmail. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A picture guide: WhatsApp → Settings → Account → Two-step verification.\n\nहिंदी: WhatsApp और Gmail को टू-स्टेप वेरिफ़िकेशन से लॉक करें\nमराठी: WhatsApp आणि Gmail ला टू-स्टेप व्हेरिफिकेशनने लॉक करा",
            "links": []
          }
        ]
      },
      {
        "topic": "Lesson 3 · Children online, and what to do after a fraud",
        "items": [
          {
            "type": "material",
            "title": "3.7 · 🎮 Say no to strangers in games and chats",
            "description": "How to do it:\nChildren: never tell people you meet in games or chats your name, school, photos or address, and tell a parent if someone asks. Parents: keep chat settings to friends only.\n\nTry it now:\nParents: check one game or chat app your child uses and set chat to friends only.\n\nSuggested video: A short talk for children: what to do when a stranger messages you in a game. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A family rules poster for games and chats.\n\nहिंदी: गेम और चैट में अनजान लोगों को ना कहें\nमराठी: गेम आणि चॅटमधील अनोळखी लोकांना नाही म्हणा",
            "links": []
          },
          {
            "type": "material",
            "title": "3.8 · 📢 Lost money? Call 1930 within the first hour",
            "description": "How to do it:\nThe first hour after a fraud matters most. Call 1930 (the National Cyber Crime Helpline) or report at cybercrime.gov.in, and call your bank to block your card or UPI.\n\nTry it now:\nSave 1930 in your phone and bookmark cybercrime.gov.in in your browser.\n\nSuggested video: An official awareness video about reporting cyber fraud on 1930. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A step-by-step card: what to do in the first hour after a fraud.\n\nहिंदी: पैसे गए? पहले घंटे के अंदर 1930 पर कॉल करें\nमराठी: पैसे गेले? पहिल्या तासाच्या आत 1930 वर कॉल करा",
            "links": []
          }
        ]
      },
      {
        "topic": "Practical activities",
        "items": [
          {
            "type": "assignment",
            "title": "Activity 1 · Make a family code word",
            "description": "Agree on a secret family code word with your family (Lesson 1.3). Say it to each other in person or on a call — do NOT write it in this class or in any chat. Also save 1930 in your phone's contacts (Lesson 3.8).\n\nWhen you have done it, click “Mark as done”.\n\nSafety first: never post an OTP, PIN, password, Aadhaar number or bank details in this class — not even to your teacher.",
            "links": []
          },
          {
            "type": "assignment",
            "title": "Activity 2 · Lock your WhatsApp",
            "description": "Turn on two-step verification in WhatsApp and choose a 6-digit PIN you will remember (Lesson 2.6). Never share this PIN with anyone, including your teacher.\n\nWhen you have done it, click “Mark as done”.\n\nSafety first: never post an OTP, PIN, password, Aadhaar number or bank details in this class — not even to your teacher.",
            "links": []
          }
        ]
      },
      {
        "topic": "Check your skills",
        "items": [
          {
            "type": "material",
            "title": "Post-Assessment: see how much you have learned",
            "description": "When you have finished all six Digital Saathi classes, take the Post-Assessment. It has 20 everyday questions. Score 14 or more out of 20 for the Digital Saathi certificate, which the team sends after a volunteer checks your result. Retakes are free.\n\nEnglish: https://docs.google.com/forms/d/e/1FAIpQLScMXcxDLqj9ukFTiKrYounSp44ukVv9IIBMUcti6-RtlfF-Sg/viewform\nहिंदी: https://docs.google.com/forms/d/e/1FAIpQLSdpz4bu2SdGTou02njvQoN1V-InaBbqR_fiLIvZU1aCsBlu8w/viewform\nमराठी: https://docs.google.com/forms/d/e/1FAIpQLSdvDSLZO8A47-su2tZkxrGFhFkFeW4o3Fkufn--LOHCEBp4Bw/viewform",
            "links": [
              "https://docs.google.com/forms/d/e/1FAIpQLScMXcxDLqj9ukFTiKrYounSp44ukVv9IIBMUcti6-RtlfF-Sg/viewform"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "money",
    "step": 5,
    "websiteTitle": "Digital payments & government services",
    "name": "Digital Saathi – Digital Payments & Government Services",
    "section": "Step 05 of 6 · Digital literacy",
    "room": "Online · learn at your own pace",
    "descriptionHeading": "Welcome to Step 05: Digital Payments & Government Services",
    "description": "By the end of this class you will pay safely with UPI, handle bills and family payments, and use government services from home, such as Jeevan Pramaan, the Ayushman card and DigiLocker.\n\nWhat you will learn:\n• Check the receiver’s name before you pay by QR\n• You never need a PIN to receive money\n• Make small payments without a PIN using UPI Lite\n• Pay electricity, gas and mobile bills on time with autopay\n• Let family members pay from your UPI with a limit\n• Submit your pension life certificate from home with a face scan\n• Get free treatment cover with the Ayushman card\n• Keep Aadhaar, PAN and certificates safe in DigiLocker\n\nHow this class works:\n1. Start with the “Start here” topic.\n2. Go through Lessons 1, 2 and 3 in order. Each lesson post shows how to do it, a “Try it now” task, and a suggested video and handout.\n3. Do the practical activities on your own phone.\n4. When you have finished all six Digital Saathi classes, check your skills with the Post-Assessment.\n\nSubject: Digital literacy · Step 05 of 6 in the Digital Saathi learning path (the same as Step 05 in the Learn section of the Digital Saathi website).\n\nSafety first: never post an OTP, PIN, password, Aadhaar number or bank details in this class — not even to your teacher.",
    "sections": [
      {
        "topic": "Start here",
        "items": [
          {
            "type": "material",
            "title": "Welcome! How this class works",
            "description": "Welcome to Digital Saathi, Step 05: Digital payments & government services.\n\nBy the end of this class you will pay safely with UPI, handle bills and family payments, and use government services from home, such as Jeevan Pramaan, the Ayushman card and DigiLocker.\n\nThis class has 8 short lessons in 3 lesson topics, and 2 practical activities. Go at your own pace — you can open any lesson again whenever you like. Lesson posts can also be read in Hindi and Marathi on the Digital Saathi website.\n\nIf you get stuck, ask a question in the Stream, or ask a family member or a Digital Saathi volunteer to sit with you.\n\nSafety first: never post an OTP, PIN, password, Aadhaar number or bank details in this class — not even to your teacher.",
            "links": []
          },
          {
            "type": "material",
            "title": "Before you start: Pre-Assessment (optional)",
            "description": "Find out what you already know before you begin. It takes a few minutes and there is no pass or fail.\n\nEnglish: https://docs.google.com/forms/d/e/1FAIpQLSfHfY4z_r-fAxj1REjDyZNdBzlLxIazPjKyQFM6NQCaQEfXfQ/viewform\nहिंदी: https://docs.google.com/forms/d/e/1FAIpQLSeAjdGWkCUBztaB7AzApmxuxRQrz1DgsI5SrY0HhuWNKyzfKg/viewform\nमराठी: https://docs.google.com/forms/d/e/1FAIpQLScnGhLFj71rdn1-eZccxkHmMYrWTVVXKoMM7wPuq3vIoqAEmQ/viewform\n\nYou only need to do it once, even though it appears in all six Digital Saathi classes.",
            "links": [
              "https://docs.google.com/forms/d/e/1FAIpQLSfHfY4z_r-fAxj1REjDyZNdBzlLxIazPjKyQFM6NQCaQEfXfQ/viewform"
            ]
          }
        ]
      },
      {
        "topic": "Lesson 1 · Pay safely with UPI",
        "items": [
          {
            "type": "material",
            "title": "1.1 · 💳 Check the receiver’s name before you pay by QR",
            "description": "How to do it:\nAfter scanning a QR code, read the name that appears on the screen. If it is not the shop or person you expect, cancel. Check the amount too before you enter your PIN.\n\nTry it now:\nScan a shop's QR code, read the name shown — then cancel without paying.\n\nSuggested video: A screen recording of scanning a QR code and checking the name and amount. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A picture guide showing where the receiver's name appears.\n\nहिंदी: QR से भुगतान करने से पहले पाने वाले का नाम जांचें\nमराठी: QR ने पैसे देण्याआधी घेणाऱ्याचे नाव तपासा",
            "links": []
          },
          {
            "type": "material",
            "title": "1.2 · 🔴 You never need a PIN to receive money",
            "description": "How to do it:\nYour UPI PIN is only for sending money. If anyone asks you to enter your PIN or scan a code to “receive” money, it is a scam.\n\nTry it now:\nExplain to a family member why you never need a PIN to receive money.\n\nSuggested video: A short explainer on the “enter your PIN to receive money” scam. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A poster: “UPI PIN = only for sending money”.\n\nहिंदी: पैसे लेने के लिए कभी PIN की ज़रूरत नहीं होती\nमराठी: पैसे घेण्यासाठी कधीही PIN लागत नाही",
            "links": []
          },
          {
            "type": "material",
            "title": "1.3 · ⚡ Make small payments without a PIN using UPI Lite",
            "description": "How to do it:\nTurn on UPI Lite in your UPI app and add a small balance. Small payments, like tea or vegetables, then go through with one tap, without entering your PIN.\n\nTry it now:\nFind UPI Lite in your UPI app and read how it works (you don't have to turn it on).\n\nSuggested video: A screen recording of turning on UPI Lite. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A picture guide to UPI Lite in a UPI app.\n\nहिंदी: UPI Lite से छोटे भुगतान बिना PIN के करें\nमराठी: UPI Lite ने छोटी पेमेंट्स PIN शिवाय करा",
            "links": []
          }
        ]
      },
      {
        "topic": "Lesson 2 · Bills and family payments",
        "items": [
          {
            "type": "material",
            "title": "2.4 · 🔄 Pay electricity, gas and mobile bills on time with autopay",
            "description": "How to do it:\nIn your UPI app open Bills & recharges, choose the bill and turn on AutoPay. You get a message before each payment, and you can stop it any time.\n\nTry it now:\nOpen Bills & recharges in your UPI app and see which of your bills you can pay there.\n\nSuggested video: A screen recording of setting up AutoPay for a bill, and of stopping it. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A checklist: how to check and stop an AutoPay.\n\nहिंदी: ऑटोपे से बिजली, गैस और मोबाइल के बिल समय पर भरें\nमराठी: ऑटोपेने वीज, गॅस आणि मोबाइलची बिले वेळेवर भरा",
            "links": []
          },
          {
            "type": "material",
            "title": "2.5 · 👪 Let family members pay from your UPI with a limit",
            "description": "How to do it:\nWith UPI Circle, add a trusted family member and set a monthly limit. They can pay from your account up to that limit, and you can remove them any time.\n\nTry it now:\nFind UPI Circle in your UPI app and read how the monthly limit works.\n\nSuggested video: A screen recording of adding a family member to UPI Circle. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A one-page note: when UPI Circle helps a family.\n\nहिंदी: परिवार के सदस्यों को सीमा के साथ अपने UPI से भुगतान करने दें\nमराठी: कुटुंबातील सदस्यांना मर्यादेसह तुमच्या UPI मधून पैसे देऊ द्या",
            "links": []
          }
        ]
      },
      {
        "topic": "Lesson 3 · Government services from home",
        "items": [
          {
            "type": "material",
            "title": "3.6 · 👴 Submit your pension life certificate from home with a face scan",
            "description": "How to do it:\nPensioners can submit the life certificate with the Jeevan Pramaan and AadhaarFaceRD apps by scanning their face with the phone camera — no bank visit needed.\n\nTry it now:\nWith a helper, find the Jeevan Pramaan app and read what it needs before the face scan.\n\nSuggested video: A screen recording of submitting a life certificate with a face scan. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A checklist of what to keep ready before the face scan.\n\nहिंदी: चेहरे के स्कैन से घर बैठे पेंशन का जीवन प्रमाणपत्र जमा करें\nमराठी: चेहरा स्कॅन करून घरबसल्या पेन्शनचा हयातीचा दाखला जमा करा",
            "links": []
          },
          {
            "type": "material",
            "title": "3.7 · 🏥 Get free treatment cover with the Ayushman card",
            "description": "How to do it:\nUnder Ayushman Bharat, everyone aged 70 and above can get the Ayushman Vay Vandana card for free hospital treatment cover. Apply in the Ayushman app or at beneficiary.nha.gov.in, or at a nearby hospital or CSC.\n\nTry it now:\nCheck whether anyone in your family is 70 or older and could apply for the Ayushman Vay Vandana card.\n\nSuggested video: An official video about applying for the Ayushman card. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A checklist of the documents to keep ready.\n\nहिंदी: आयुष्मान कार्ड से मुफ़्त इलाज का कवर पाएं\nमराठी: आयुष्मान कार्डने मोफत उपचारांचे कवच मिळवा",
            "links": []
          },
          {
            "type": "material",
            "title": "3.8 · 📁 Keep Aadhaar, PAN and certificates safe in DigiLocker",
            "description": "How to do it:\nSign in to DigiLocker (the app or digilocker.gov.in) with your Aadhaar-linked mobile number. Official copies of your Aadhaar, PAN, driving licence and certificates are kept there and accepted as valid.\n\nTry it now:\nSign in to DigiLocker and open one of your documents.\n\nSuggested video: A screen recording of signing in to DigiLocker and fetching Aadhaar. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A picture guide to signing in to DigiLocker with your Aadhaar-linked mobile number.\n\nहिंदी: आधार, PAN और प्रमाणपत्र DigiLocker में सुरक्षित रखें\nमराठी: आधार, PAN आणि प्रमाणपत्रे DigiLocker मध्ये सुरक्षित ठेवा",
            "links": []
          }
        ]
      },
      {
        "topic": "Practical activities",
        "items": [
          {
            "type": "assignment",
            "title": "Activity 1 · Practise checking a QR code (no payment)",
            "description": "At a shop, scan its QR code with your UPI app and read the name that appears (Lesson 1.1). Then press Back or Cancel — do not pay and do not enter your PIN.\n\nWhen you have done it, click “Mark as done”.\n\nSafety first: never post an OTP, PIN, password, Aadhaar number or bank details in this class — not even to your teacher.",
            "links": []
          },
          {
            "type": "assignment",
            "title": "Activity 2 · Open DigiLocker",
            "description": "Sign in to DigiLocker with your Aadhaar-linked mobile number and open one of your documents (Lesson 3.8). Ask a family member to sit with you if you like. Never post your Aadhaar number or documents in this class.\n\nWhen you have done it, click “Mark as done”.\n\nSafety first: never post an OTP, PIN, password, Aadhaar number or bank details in this class — not even to your teacher.",
            "links": []
          }
        ]
      },
      {
        "topic": "Check your skills",
        "items": [
          {
            "type": "material",
            "title": "Post-Assessment: see how much you have learned",
            "description": "When you have finished all six Digital Saathi classes, take the Post-Assessment. It has 20 everyday questions. Score 14 or more out of 20 for the Digital Saathi certificate, which the team sends after a volunteer checks your result. Retakes are free.\n\nEnglish: https://docs.google.com/forms/d/e/1FAIpQLScMXcxDLqj9ukFTiKrYounSp44ukVv9IIBMUcti6-RtlfF-Sg/viewform\nहिंदी: https://docs.google.com/forms/d/e/1FAIpQLSdpz4bu2SdGTou02njvQoN1V-InaBbqR_fiLIvZU1aCsBlu8w/viewform\nमराठी: https://docs.google.com/forms/d/e/1FAIpQLSdvDSLZO8A47-su2tZkxrGFhFkFeW4o3Fkufn--LOHCEBp4Bw/viewform",
            "links": [
              "https://docs.google.com/forms/d/e/1FAIpQLScMXcxDLqj9ukFTiKrYounSp44ukVv9IIBMUcti6-RtlfF-Sg/viewform"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "ai",
    "step": 6,
    "websiteTitle": "AI tools & family digital safety",
    "name": "Digital Saathi – AI Tools & Family Digital Safety",
    "section": "Step 06 of 6 · Digital literacy",
    "room": "Online · learn at your own pace",
    "descriptionHeading": "Welcome to Step 06: AI Tools & Family Digital Safety",
    "description": "By the end of this class you will use AI tools safely in your own language, guide your child's phone, spot fake AI photos and videos, and use family safety tools such as Family Link and GPS smartwatches responsibly.\n\nWhat you will learn:\n• Talk to AI in Hindi or Marathi, just by speaking\n• Set up Family Link to guide your child’s phone\n• Use AI as a tutor, not a cheat sheet\n• Never share private details with AI chatbots\n• Spot fake AI photos, videos and news forwards\n• Plan meals with whatever is in your kitchen\n• Smartwatches for Child Safety & Location Tracking\n\nHow this class works:\n1. Start with the “Start here” topic.\n2. Go through Lessons 1, 2 and 3 in order. Each lesson post shows how to do it, a “Try it now” task, and a suggested video and handout.\n3. Do the practical activities on your own phone.\n4. When you have finished all six Digital Saathi classes, check your skills with the Post-Assessment.\n\nSubject: Digital literacy · Step 06 of 6 in the Digital Saathi learning path (the same as Step 06 in the Learn section of the Digital Saathi website).\n\nSafety first: never post an OTP, PIN, password, Aadhaar number or bank details in this class — not even to your teacher.",
    "sections": [
      {
        "topic": "Start here",
        "items": [
          {
            "type": "material",
            "title": "Welcome! How this class works",
            "description": "Welcome to Digital Saathi, Step 06: AI tools & family digital safety.\n\nBy the end of this class you will use AI tools safely in your own language, guide your child's phone, spot fake AI photos and videos, and use family safety tools such as Family Link and GPS smartwatches responsibly.\n\nThis class has 7 short lessons in 3 lesson topics, and 2 practical activities. Go at your own pace — you can open any lesson again whenever you like. Lesson posts can also be read in Hindi and Marathi on the Digital Saathi website.\n\nIf you get stuck, ask a question in the Stream, or ask a family member or a Digital Saathi volunteer to sit with you.\n\nSafety first: never post an OTP, PIN, password, Aadhaar number or bank details in this class — not even to your teacher.",
            "links": []
          },
          {
            "type": "material",
            "title": "Before you start: Pre-Assessment (optional)",
            "description": "Find out what you already know before you begin. It takes a few minutes and there is no pass or fail.\n\nEnglish: https://docs.google.com/forms/d/e/1FAIpQLSfHfY4z_r-fAxj1REjDyZNdBzlLxIazPjKyQFM6NQCaQEfXfQ/viewform\nहिंदी: https://docs.google.com/forms/d/e/1FAIpQLSeAjdGWkCUBztaB7AzApmxuxRQrz1DgsI5SrY0HhuWNKyzfKg/viewform\nमराठी: https://docs.google.com/forms/d/e/1FAIpQLScnGhLFj71rdn1-eZccxkHmMYrWTVVXKoMM7wPuq3vIoqAEmQ/viewform\n\nYou only need to do it once, even though it appears in all six Digital Saathi classes.",
            "links": [
              "https://docs.google.com/forms/d/e/1FAIpQLSfHfY4z_r-fAxj1REjDyZNdBzlLxIazPjKyQFM6NQCaQEfXfQ/viewform"
            ]
          }
        ]
      },
      {
        "topic": "Lesson 1 · Talking to AI and guiding your child's phone",
        "items": [
          {
            "type": "material",
            "title": "1.1 · 🗣️ Talk to AI in Hindi or Marathi, just by speaking",
            "description": "How to do it:\nOpen the Gemini or ChatGPT app, tap the microphone and speak in Hindi or Marathi. Ask it to reply in the same language, and listen to the answer.\n\nTry it now:\nAsk an AI app by voice, in Hindi or Marathi: “Give me 3 tips to sleep well.”\n\nSuggested video: A screen recording of talking to an AI app by voice. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A list of useful questions to ask AI in your own language.\n\nहिंदी: बस बोलकर AI से हिंदी या मराठी में बात करें\nमराठी: फक्त बोलून AI शी हिंदी किंवा मराठीत संवाद साधा",
            "links": []
          },
          {
            "type": "material",
            "title": "1.2 · 👪 Set up Family Link to guide your child’s phone",
            "description": "How to do it:\nInstall Google Family Link on your phone and link your child's phone. You can set screen-time limits, approve the apps they download and see where the phone is.\n\nTry it now:\nOpen Google Family Link and look at the screen-time settings.\n\nSuggested video: A screen recording of linking a child's phone with Family Link. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A parents' checklist for setting up Family Link.\n\nहिंदी: बच्चे के फ़ोन के मार्गदर्शन के लिए Family Link सेट करें\nमराठी: मुलाच्या फोनवर मार्गदर्शनासाठी Family Link सेट करा",
            "links": []
          }
        ]
      },
      {
        "topic": "Lesson 2 · Using AI wisely and safely",
        "items": [
          {
            "type": "material",
            "title": "2.3 · 📚 Use AI as a tutor, not a cheat sheet",
            "description": "How to do it:\nInstead of asking AI to write homework, ask it to explain a topic step by step or to test you. For example: “Explain fractions with a simple example, then give me 3 questions to try.”\n\nTry it now:\nAsk AI to explain one school topic step by step and give you 3 practice questions.\n\nSuggested video: A short demo of using AI as a tutor instead of copying answers. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: Sample questions (prompts) for learning with AI.\n\nहिंदी: AI को ट्यूटर की तरह इस्तेमाल करें, नकल के लिए नहीं\nमराठी: AI चा वापर शिक्षकासारखा करा, कॉपीसाठी नाही",
            "links": []
          },
          {
            "type": "material",
            "title": "2.4 · 🙅 Never share private details with AI chatbots",
            "description": "How to do it:\nNever type your OTP, passwords, Aadhaar, bank details or family photos into an AI chat. Treat it like talking to a stranger.\n\nTry it now:\nLook at an old AI chat and delete anything private you typed.\n\nSuggested video: A short explainer on what never to type into an AI chat. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A poster: “Never share with AI: OTP, password, Aadhaar, bank details”.\n\nहिंदी: AI चैटबॉट के साथ निजी जानकारी कभी साझा न करें\nमराठी: AI चॅटबॉटला खासगी माहिती कधीही देऊ नका",
            "links": []
          },
          {
            "type": "material",
            "title": "2.5 · 🕵️ Spot fake AI photos, videos and news forwards",
            "description": "How to do it:\nAI can make fake photos, videos and voices. Before forwarding, look for odd hands or faces, check trusted news websites, and don't share if you are not sure.\n\nTry it now:\nBefore forwarding your next news message, check it on a trusted news website.\n\nSuggested video: A short explainer on spotting fake AI photos and videos. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A checklist: four questions to ask before you forward.\n\nहिंदी: नकली AI फ़ोटो, वीडियो और फॉरवर्ड की गई खबरें पहचानें\nमराठी: बनावट AI फोटो, व्हिडिओ आणि फॉरवर्ड केलेल्या बातम्या ओळखा",
            "links": []
          }
        ]
      },
      {
        "topic": "Lesson 3 · Everyday help and child safety",
        "items": [
          {
            "type": "material",
            "title": "3.6 · 🍲 Plan meals with whatever is in your kitchen",
            "description": "How to do it:\nTell AI what you have — “I have rice, dal, onion and tomato, suggest a quick dinner” — and it will suggest simple recipes and steps.\n\nTry it now:\nTell AI what is in your kitchen and ask for a quick dinner idea.\n\nSuggested video: A short demo of planning a meal with AI. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: Sample questions (prompts) for cooking and meal planning.\n\nहिंदी: रसोई में जो है उसी से खाने की योजना बनाएं\nमराठी: स्वयंपाकघरात जे आहे त्यातूनच जेवणाचे नियोजन करा",
            "links": []
          },
          {
            "type": "material",
            "title": "3.7 · ⌚ Smartwatches for Child Safety & Location Tracking",
            "description": "How to do it:\nChoose a GPS smartwatch made for children and set it up with the watch maker’s official app. Your child can call you with one tap or hold SOS in an emergency, and you can see their location in the app. Add only trusted family members as contacts, never share the location publicly, charge it every night — and remember it never replaces an adult’s care.\n\nTry it now:\nIf your child has a GPS watch, check its trusted contacts and SOS button together with them.\n\nSuggested video: A screen recording of setting trusted contacts and SOS in a children's GPS watch app. (Suggestion for the teacher: record it yourself, or attach a video you have checked from an official source.)\n\nSuggested PDF or handout: A checklist for setting up a child's GPS watch safely.\n\nहिंदी: बच्चों की सुरक्षा और लोकेशन ट्रैकिंग के लिए स्मार्टवॉच\nमराठी: मुलांच्या सुरक्षिततेसाठी आणि लोकेशन ट्रॅकिंगसाठी स्मार्टवॉच",
            "links": []
          }
        ]
      },
      {
        "topic": "Practical activities",
        "items": [
          {
            "type": "assignment",
            "title": "Activity 1 · Ask AI in your own language",
            "description": "Open an AI app, tap the microphone and ask a question in Hindi, Marathi or English, for example “Give me 3 tips to sleep well” (Lesson 1.1). Remember: never type an OTP, password, Aadhaar or bank details into an AI chat (Lesson 2.4).\n\nWhen you have done it, click “Mark as done”.\n\nSafety first: never post an OTP, PIN, password, Aadhaar number or bank details in this class — not even to your teacher.",
            "links": []
          },
          {
            "type": "assignment",
            "title": "Activity 2 · Set up one family safety tool",
            "description": "Choose one and set it up: Google Family Link on a child's phone (Lesson 1.2), YouTube Kids, or the trusted contacts and SOS of a child's GPS smartwatch (Lesson 3.7). Talk to the child about what it does and why.\n\nWhen you have done it, click “Mark as done”.\n\nSafety first: never post an OTP, PIN, password, Aadhaar number or bank details in this class — not even to your teacher.",
            "links": []
          }
        ]
      },
      {
        "topic": "Check your skills",
        "items": [
          {
            "type": "material",
            "title": "Post-Assessment: see how much you have learned",
            "description": "When you have finished all six Digital Saathi classes, take the Post-Assessment. It has 20 everyday questions. Score 14 or more out of 20 for the Digital Saathi certificate, which the team sends after a volunteer checks your result. Retakes are free.\n\nEnglish: https://docs.google.com/forms/d/e/1FAIpQLScMXcxDLqj9ukFTiKrYounSp44ukVv9IIBMUcti6-RtlfF-Sg/viewform\nहिंदी: https://docs.google.com/forms/d/e/1FAIpQLSdpz4bu2SdGTou02njvQoN1V-InaBbqR_fiLIvZU1aCsBlu8w/viewform\nमराठी: https://docs.google.com/forms/d/e/1FAIpQLSdvDSLZO8A47-su2tZkxrGFhFkFeW4o3Fkufn--LOHCEBp4Bw/viewform",
            "links": [
              "https://docs.google.com/forms/d/e/1FAIpQLScMXcxDLqj9ukFTiKrYounSp44ukVv9IIBMUcti6-RtlfF-Sg/viewform"
            ]
          }
        ]
      }
    ]
  }
];
