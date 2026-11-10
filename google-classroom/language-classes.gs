/**
 * DIGITAL SAATHI — ONE CLASSROOM PER LANGUAGE
 * Needs in the SAME project: classroom-setup.gs, story-lessons-data.gs, language-classes-data.gs (and this file).
 *
 * Result: 18 classrooms = 6 steps × 3 languages. A learner joins one class and sees only their own language.
 *   English → the six classes you already have      हिंदी → 6 new classes      मराठी → 6 new classes
 *
 *   step9a_previewLanguageClasses   read-only · what exists, what would be created
 *   step9b_createLanguageClasses    CREATES the 12 Hindi and Marathi classes (as PROVISIONED)
 *      → then accept each one at https://classroom.google.com (the same "Accept" as before)
 *   step9c_fillLanguageClasses      ADDS topics and posts to each ACTIVE Hindi / Marathi class
 *   step9d_previewEnglishCleanup    read-only · lists the Hindi/Marathi posts to remove from the English classes
 *   step9e_cleanEnglishClasses      DELETES those Hindi/Marathi story posts and their (empty) topics from the English classes
 *   step9f_listAllClasses           read-only · all 18 classes with link and class code, to share with learners
 *   step9g_checkLanguageClasses     read-only · per Hindi / Marathi class: found? state? how many posts it has vs. should have
 *
 * Safe to run again: existing classes and posts (matched by name / title) are skipped. Nothing else is deleted.
 */

// ---------- 9a ----------
function step9a_previewLanguageClasses() {
  requireClassroomService_();
  const courses = listMyCourses_();
  LANG_CLASSES.forEach(function (def) {
    const c = findCourse_(courses, def.name);
    log_((c ? "✅ exists (" + c.courseState + ")  " : "➕ would create  ") + def.name +
         "  · " + (def.checkins.length + def.activities.length + STORY_LESSONS[def.baseId][def.lang].items.length + 3) + " posts");
  });
}

// ---------- 9b ----------
function step9b_createLanguageClasses() {
  requireClassroomService_();
  const courses = listMyCourses_();
  let created = 0, skipped = 0, failed = 0;
  LANG_CLASSES.forEach(function (def) {
    const found = findCourse_(courses, def.name);
    if (found) { skipped++; log_("⏭️  " + def.name + " — already exists (" + found.courseState + ")."); return; }
    try {
      const course = Classroom.Courses.create({
        name: def.name, section: def.section, descriptionHeading: def.descriptionHeading,
        description: def.description, room: def.room, ownerId: "me", courseState: "PROVISIONED"
      });
      pause_();
      const check = Classroom.Courses.get(course.id);
      created++; courses.push(check);
      log_("✅ Created " + check.name + "  [" + check.courseState + "]");
    } catch (e) { failed++; log_("❌ " + def.name + ": " + explainError_(e)); }
  });
  log_("");
  log_(created + " created, " + skipped + " already existed, " + failed + " failed.");
  if (created) log_("NEXT (by hand): open https://classroom.google.com and click Accept on each new class, then run step9c_fillLanguageClasses.");
}

// ---------- 9c ----------
function step9c_fillLanguageClasses() {
  requireClassroomService_();
  const started = Date.now();
  const courses = listMyCourses_();
  let failed = 0, complete = 0;
  for (let i = 0; i < LANG_CLASSES.length; i++) {
    const def = LANG_CLASSES[i];
    const c = findCourse_(courses, def.name);
    if (!c) { log_("⏭️  " + def.name + " — not created yet (run step9b)."); continue; }
    if (c.courseState !== "ACTIVE") { log_("⏭️  " + def.name + " — it is " + c.courseState + ". Accept it in Classroom first."); continue; }
    log_("──────── " + def.name);
    const r = fillLangClass_(c.id, def, started);
    failed += r.failed;
    if (!r.finished) { log_("⏸️  Stopped safely before Google's 6-minute limit. Run step9c_fillLanguageClasses again — it continues where it stopped."); return; }
    if (!r.failed) complete++;
  }
  log_("");
  if (failed) log_("⚠️  " + failed + " post(s) failed (see ❌). Fix the cause and run step9c_fillLanguageClasses again.");
  log_(complete + " language classroom(s) are complete.");
}

// Topics and posts are created last-to-first (Classroom shows the newest first), so each class reads:
// Start here → story lessons (1, 2, 3 …) → Practical activities → My progress → Check your skills.
function fillLangClass_(courseId, def, started) {
  const have = existingClasswork_(courseId);
  const story = STORY_LESSONS[def.baseId][def.lang];
  const topicIds = {};
  have.topics.forEach(function (t) { topicIds[norm_(t.name)] = t.topicId; });
  let added = 0, skipped = 0, failed = 0, stop = false;
  function topic(name) {
    let id = topicIds[norm_(name)];
    if (!id) { id = Classroom.Courses.Topics.create({ name: name }, courseId).topicId; topicIds[norm_(name)] = id; log_("   + topic: " + name); pause_(); }
    return id;
  }
  function post(kind, topicName, title, description, link) {
    if (stop) return;
    if (Date.now() - started > SETTINGS.TIME_LIMIT_MS) { stop = true; return; }
    const list = kind === "work" ? have.workTitles : have.materialTitles;
    if (list.indexOf(norm_(title)) >= 0) { skipped++; return; }
    const body = { title: title, description: description, topicId: topic(topicName), state: SETTINGS.POST_STATE };
    if (link) body.materials = [{ link: { url: link } }];
    try {
      if (kind === "work") { body.workType = "ASSIGNMENT"; Classroom.Courses.CourseWork.create(body, courseId); }
      else Classroom.Courses.CourseWorkMaterials.create(body, courseId);
      list.push(norm_(title)); added++; log_("   + " + title);
    } catch (e) { failed++; log_("   ❌ " + title + ": " + explainError_(e)); }
    pause_();
  }
  // bottom topic first
  post("material", def.topics.check, def.post.title, def.post.description, def.post.link);
  for (let k = def.checkins.length - 1; k >= 0; k--) post("work", def.topics.progress, def.checkins[k].title, def.checkins[k].description);
  for (let k = def.activities.length - 1; k >= 0; k--) post("work", def.topics.activities, def.activities[k].title, def.activities[k].description);
  for (let k = story.items.length - 1; k >= 0; k--) post("material", story.topic, story.items[k].title, story.items[k].description);
  post("material", def.topics.start, def.pre.title, def.pre.description, def.pre.link);
  post("material", def.topics.start, def.welcome.title, def.welcome.description);
  log_("   Done: " + added + " added, " + skipped + " already there" + (failed ? ", " + failed + " failed." : "."));
  return { finished: !stop, failed: failed };
}

// ---------- 9d / 9e ----------
function step9d_previewEnglishCleanup() { cleanEnglish_(false); }
function step9e_cleanEnglishClasses() { cleanEnglish_(true); }

function cleanEnglish_(doDelete) {
  requireClassroomService_();
  const courses = listMyCourses_();
  let posts = 0, topics = 0, problems = 0;
  CLASSROOMS.forEach(function (def) {
    const c = findCourse_(courses, def.name) || findCourse_(courses, def.name + " · English");
    if (!c) { log_("⏭️  " + def.name + " — not found."); return; }
    log_("──────── " + def.name);
    const id = c.id, lessons = STORY_LESSONS[def.id];
    const tList = pageAll_(function (t) { return Classroom.Courses.Topics.list(id, { pageToken: t }); }, "topic");
    const mats = pageAll_(function (t) {
      return Classroom.Courses.CourseWorkMaterials.list(id, { pageToken: t, courseWorkMaterialStates: ["PUBLISHED", "DRAFT"] });
    }, "courseWorkMaterial");
    const work = pageAll_(function (t) { return Classroom.Courses.CourseWork.list(id, { pageToken: t, courseWorkStates: ["PUBLISHED", "DRAFT"] }); }, "courseWork");
    const gone = {};
    ["hi", "mr"].forEach(function (lang) {
      const topic = tList.filter(function (t) { return norm_(t.name) === norm_(lessons[lang].topic); })[0];
      if (!topic) { log_("   – no " + lang + " topic here"); return; }
      const titles = lessons[lang].items.map(function (it) { return norm_(it.title); });
      mats.filter(function (m) { return m.topicId === topic.topicId && titles.indexOf(norm_(m.title)) >= 0; }).forEach(function (m) {
        if (!doDelete) { log_("   would delete post: " + m.title); gone[m.id] = true; posts++; return; }
        try { Classroom.Courses.CourseWorkMaterials.remove(id, m.id); gone[m.id] = true; posts++; log_("   🗑️ deleted post: " + m.title); }
        catch (e) { problems++; log_("   ❌ could not delete \"" + m.title + "\": " + explainError_(e)); }
        pause_();
      });
      const left = mats.filter(function (m) { return m.topicId === topic.topicId && !gone[m.id]; }).length +
                   work.filter(function (w) { return w.topicId === topic.topicId; }).length;
      if (left) { log_("   ⚠️ kept topic \"" + topic.name + "\" — it still holds " + left + " other post(s)."); return; }
      if (!doDelete) { log_("   would delete topic: " + topic.name); topics++; return; }
      try { Classroom.Courses.Topics.remove(id, topic.topicId); topics++; log_("   🗑️ deleted topic: " + topic.name); }
      catch (e) { problems++; log_("   ❌ could not delete topic: " + explainError_(e)); }
      pause_();
    });
  });
  log_("");
  log_((doDelete ? "Deleted " : "Would delete ") + posts + " post(s) and " + topics + " topic(s)." + (problems ? " " + problems + " problem(s) — see ❌." : ""));
  if (!doDelete) log_("Nothing was changed. If this looks right, run step9e_cleanEnglishClasses.");
}

// ---------- 9f ----------
function step9f_listAllClasses() {
  requireClassroomService_();
  const courses = listMyCourses_();
  const rows = [];
  CLASSROOMS.forEach(function (d) { rows.push({ lang: "English", step: d.step, name: d.name }); });
  LANG_CLASSES.forEach(function (d) { rows.push({ lang: d.lang === "hi" ? "हिंदी" : "मराठी", step: d.step, name: d.name }); });
  rows.sort(function (a, b) { return a.step - b.step; });
  rows.forEach(function (r) {
    const c = findCourse_(courses, r.name) || findCourse_(courses, r.name + " · English");
    log_("Step " + r.step + " · " + r.lang + " · " + (c ? c.courseState : "NOT CREATED") +
         "\n   " + r.name + "\n   Link: " + ((c && c.alternateLink) || "-") + "\n   Class code: " + ((c && c.enrollmentCode) || "-"));
  });
}

// ---------- 9g ----------
// Read-only. For each Hindi / Marathi class: is it found by name, is it ACTIVE, and how many posts does it have
// compared with what step9c puts in it. Tells you what to run next.
function step9g_checkLanguageClasses() {
  requireClassroomService_();
  const courses = listMyCourses_();
  let ok = 0, empty = 0, partial = 0, missing = 0, notActive = 0;
  LANG_CLASSES.forEach(function (def) {
    const c = findCourse_(courses, def.name);
    if (!c) {
      missing++;
      log_("❓ NOT FOUND: " + def.name + "\n   → No class has exactly this name. If you renamed it in Classroom, change it back, or run step9b to create it.");
      return;
    }
    if (c.courseState !== "ACTIVE") { notActive++; log_("⏸️  " + def.name + " is " + c.courseState + " → accept it at https://classroom.google.com, then run step9c."); return; }
    const have = existingClasswork_(c.id);
    const wantMat = STORY_LESSONS[def.baseId][def.lang].items.length + 3;          // stories + welcome + Pre + Post
    const wantWork = def.checkins.length + def.activities.length;                   // check-ins + practical activities
    const gotMat = have.materialTitles.length, gotWork = have.workTitles.length;
    const line = "   materials " + gotMat + "/" + wantMat + " · tasks " + gotWork + "/" + wantWork + " · topics " + have.topics.length + "/5";
    if (gotMat === 0 && gotWork === 0) { empty++; log_("⭕ EMPTY: " + def.name + "\n" + line); }
    else if (gotMat < wantMat || gotWork < wantWork) { partial++; log_("◐ PART-FILLED: " + def.name + "\n" + line); }
    else { ok++; log_("✅ " + def.name + "\n" + line); }
  });
  log_("");
  log_(ok + " complete, " + partial + " part-filled, " + empty + " empty, " + notActive + " not accepted yet, " + missing + " not found.");
  if (empty || partial) log_("NEXT: run step9c_fillLanguageClasses. If it says “Stopped safely”, run it again until it says all 12 are complete.");
  if (missing) log_("NEXT: a class name does not match. Run step9f_listAllClasses to see the names this script looks for.");
}
