/**
 * DIGITAL SAATHI — PROGRESS CHECK-INS (one "I finished this lesson" task per lesson)
 * Needs classroom-setup.gs and story-lessons-data.gs in the same project.
 *
 *   step8a_previewCheckins   read-only · shows what step8b would add
 *   step8b_addCheckins       ADDS a topic "✅ My progress" to each class, with one ungraded assignment per lesson
 *   step8c_tidyEnglishPosts  UPDATES the text of the English check-ins (English only) and of the 12 practical activities (new lesson numbers)
 *
 * Learners press "Mark as done" on each check-in. You see who is Done in Classwork → open a check-in → Student work.
 * No points, no due date. Safe to run again: check-ins that already exist are skipped. Nothing is deleted.
 */
const CHECKIN_TOPIC = "✅ My progress";

function step8a_previewCheckins() {
  requireClassroomService_();
  const courses = listMyCourses_();
  CLASSROOMS.forEach(function (def) {
    const c = findCourse_(courses, def.name);
    log_((c ? "✅ " : "⏭️  ") + def.name + (c ? " (" + c.courseState + ")" : " — not found") +
         " → would add " + checkins_(def.id).length + " check-ins");
  });
}

function step8b_addCheckins() {
  requireClassroomService_();
  const started = Date.now();
  const courses = listMyCourses_();
  let failed = 0, complete = 0;
  for (let i = 0; i < CLASSROOMS.length; i++) {
    const def = CLASSROOMS[i];
    const c = findCourse_(courses, def.name);
    if (!c) { log_("⏭️  " + def.name + " — not found."); continue; }
    if (c.courseState !== "ACTIVE") { log_("⏭️  " + def.name + " — it is " + c.courseState + ". Accept it in Classroom first."); continue; }
    log_("──────── " + def.name);
    const have = existingClasswork_(c.id);
    let topic = have.topics.filter(function (t) { return norm_(t.name) === norm_(CHECKIN_TOPIC); })[0];
    let topicId = topic && topic.topicId;
    if (!topicId) { topicId = Classroom.Courses.Topics.create({ name: CHECKIN_TOPIC }, c.id).topicId; log_("   + topic: " + CHECKIN_TOPIC); pause_(); }
    const list = checkins_(def.id);
    let added = 0, skipped = 0, bad = 0;
    for (let k = list.length - 1; k >= 0; k--) {          // last-to-first, so lesson 1 shows on top
      if (Date.now() - started > SETTINGS.TIME_LIMIT_MS) {
        log_("⏸️  Stopped safely before Google's 6-minute limit. Run step8b_addCheckins again — it continues where it stopped.");
        return;
      }
      const item = list[k];
      if (have.workTitles.indexOf(norm_(item.title)) >= 0) { skipped++; continue; }
      try {
        Classroom.Courses.CourseWork.create({ title: item.title, description: item.description, workType: "ASSIGNMENT",
          topicId: topicId, state: SETTINGS.POST_STATE }, c.id);
        have.workTitles.push(norm_(item.title)); added++; log_("   + " + item.title);
      } catch (e) { bad++; log_("   ❌ " + item.title + ": " + explainError_(e)); }
      pause_();
    }
    log_("   Done: " + added + " added, " + skipped + " already there" + (bad ? ", " + bad + " failed." : "."));
    failed += bad; if (!bad) complete++;
  }
  log_("");
  if (failed) log_("⚠️  " + failed + " check-in(s) failed (see ❌). Fix the cause and run step8b_addCheckins again.");
  log_(complete + " classroom(s) have all their check-ins. Drag \"" + CHECKIN_TOPIC + "\" below the story-lesson topics if you like.");
}

// One check-in per lesson, titled after the English story page.
function checkins_(classId) {
  const L = STORY_LESSONS[classId];
  return L.en.items.map(function (en, i) {
    const nameOf = function (it) { return it.title.replace(/^[^\s]+\s+/, ""); };   // "Story 1.1 · 🛡️ Name" → "1.1 · 🛡️ Name"
    const num = nameOf(en).split(" · ")[0];
    return {
      title: "✅ I finished " + nameOf(en),
      description: "Read the story, try the activity, then press “Mark as done”. You only need to do this once.\n\n" +
        "Lesson " + num + ": " + nameOf(en).split(" · ")[1] + "\n\n" +
        "Safety first: never write an OTP, PIN or password here."
    };
  });
}

// ---------- 8c: tidy the English posts that are already in the classes ----------
// The practical activities were written when lessons had other numbers ("Lesson 2.3"); the story lessons are numbered
// step.point (1.3, 2.2 ...). This maps the old number to the new one, class by class.
const ACTIVITY_LESSON_NUMBERS = {
  phone:  { "1.1": "1.1", "2.3": "1.3", "3.5": "1.5" },
  google: { "1.2": "2.2", "2.4": "2.4" },
  family: { "1.1": "3.1", "1.2": "3.2", "2.4": "3.4" },
  safety: { "1.3": "4.3", "3.8": "4.8", "2.6": "4.6" },
  money:  { "1.1": "5.1", "3.8": "5.8" },
  ai:     { "1.1": "6.1", "2.4": "6.4", "1.2": "6.2", "3.7": "6.7" }
};
function activityText_(def, text) {
  const map = ACTIVITY_LESSON_NUMBERS[def.id];
  return text.replace(/\(Lesson (\d\.\d)\)/g, function (all, n) { return "(Lesson " + (map[n] || n) + ")"; });
}

function step8c_tidyEnglishPosts() {
  requireClassroomService_();
  const started = Date.now();
  const courses = listMyCourses_();
  let changed = 0, same = 0, problems = 0;
  for (let i = 0; i < CLASSROOMS.length; i++) {
    const def = CLASSROOMS[i];
    const c = findCourse_(courses, def.name) || findCourse_(courses, def.name + " · English");
    if (!c) { log_("⏭️  " + def.name + " — not found."); continue; }
    log_("──────── " + def.name);
    const want = {};
    checkins_(def.id).forEach(function (x) { want[norm_(x.title)] = x.description; });
    def.sections.forEach(function (s) {
      if (s.topic !== "Practical activities") return;
      s.items.forEach(function (it) { want[norm_(it.title)] = activityText_(def, it.description); });
    });
    const work = pageAll_(function (t) {
      return Classroom.Courses.CourseWork.list(c.id, { pageToken: t, courseWorkStates: ["PUBLISHED", "DRAFT"] });
    }, "courseWork");
    for (let k = 0; k < work.length; k++) {
      const w = work[k], text = want[norm_(w.title)];
      if (text === undefined) continue;
      if ((w.description || "") === text) { same++; continue; }
      if (Date.now() - started > SETTINGS.TIME_LIMIT_MS) {
        log_("⏸️  Stopped safely before Google's 6-minute limit. Run step8c_tidyEnglishPosts again — it continues where it stopped.");
        return;
      }
      try {
        Classroom.Courses.CourseWork.patch({ description: text }, c.id, w.id, { updateMask: "description" });
        changed++; log_("   ✏️ updated: " + w.title);
      } catch (e) { problems++; log_("   ❌ " + w.title + ": " + explainError_(e)); }
      pause_();
    }
  }
  log_("");
  log_(changed + " post(s) updated, " + same + " already up to date" + (problems ? ", " + problems + " problem(s) — see ❌." : "."));
}
