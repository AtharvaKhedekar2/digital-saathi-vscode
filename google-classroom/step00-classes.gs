/**
 * DIGITAL SAATHI — STEP 00 · GET SAATHI-READY (one class per language: English, हिंदी, मराठी)
 * Needs in the SAME project: classroom-setup.gs, story-lessons-data.gs, step00-classes-data.gs (and this file).
 *
 *   step10a_previewStep00   read-only · what exists, what would be created
 *   step10b_createStep00    CREATES the three Step 00 classes (as PROVISIONED)
 *      → then accept each one at https://classroom.google.com (the same "Accept" as before)
 *   step10c_fillStep00      ADDS topics and posts to each ACTIVE Step 00 class
 *   step10d_listStep00      read-only · link and class code of each Step 00 class
 *
 * Each class, top to bottom: Start here (welcome) → 6 story lessons → Practical activities (one per lesson; activity 5
 * is the Pre-Assessment form in that class's language) → ✅ My progress (6 check-ins).
 * Safe to run again: existing classes and posts (matched by name / title) are skipped. Nothing is ever deleted.
 */
function step10a_previewStep00() {
  requireClassroomService_();
  const courses = listMyCourses_();
  STEP00_CLASSES.forEach(function (def) {
    const c = findCourse_(courses, def.name);
    const n = STORY_LESSONS.start[def.lang].items.length + def.activities.length + def.checkins.length + 1;
    log_((c ? "✅ exists (" + c.courseState + ")  " : "➕ would create  ") + def.name + "  · " + n + " posts");
  });
}

function step10b_createStep00() {
  requireClassroomService_();
  const courses = listMyCourses_();
  let created = 0, skipped = 0, failed = 0;
  STEP00_CLASSES.forEach(function (def) {
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
  if (created) log_("NEXT (by hand): open https://classroom.google.com and click Accept on each new class, then run step10c_fillStep00.");
}

function step10c_fillStep00() {
  requireClassroomService_();
  const started = Date.now();
  const courses = listMyCourses_();
  let failed = 0, complete = 0;
  for (let i = 0; i < STEP00_CLASSES.length; i++) {
    const def = STEP00_CLASSES[i];
    const c = findCourse_(courses, def.name);
    if (!c) { log_("⏭️  " + def.name + " — not created yet (run step10b)."); continue; }
    if (c.courseState !== "ACTIVE") { log_("⏭️  " + def.name + " — it is " + c.courseState + ". Accept it in Classroom first."); continue; }
    log_("──────── " + def.name);
    const r = fillStep00Class_(c.id, def, started);
    failed += r.failed;
    if (!r.finished) { log_("⏸️  Stopped safely before Google's 6-minute limit. Run step10c_fillStep00 again — it continues where it stopped."); return; }
    if (!r.failed) complete++;
  }
  log_("");
  if (failed) log_("⚠️  " + failed + " post(s) failed (see ❌). Fix the cause and run step10c_fillStep00 again.");
  log_(complete + " Step 00 classroom(s) are complete.");
}

// Created last-to-first (Classroom shows the newest first), so the class reads from the top:
// Start here → story lessons 0.1 … 0.6 → Practical activities 1 … 6 → My progress.
function fillStep00Class_(courseId, def, started) {
  const have = existingClasswork_(courseId);
  const story = STORY_LESSONS.start[def.lang];
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
  for (let k = def.checkins.length - 1; k >= 0; k--) post("work", def.topics.progress, def.checkins[k].title, def.checkins[k].description);
  for (let k = def.activities.length - 1; k >= 0; k--) post("work", def.topics.activities, def.activities[k].title, def.activities[k].description, def.activities[k].link);
  for (let k = story.items.length - 1; k >= 0; k--) post("material", story.topic, story.items[k].title, story.items[k].description);
  post("material", def.topics.start, def.welcome.title, def.welcome.description);
  log_("   Done: " + added + " added, " + skipped + " already there" + (failed ? ", " + failed + " failed." : "."));
  return { finished: !stop, failed: failed };
}

function step10d_listStep00() {
  requireClassroomService_();
  const courses = listMyCourses_();
  STEP00_CLASSES.forEach(function (def) {
    const c = findCourse_(courses, def.name);
    log_(def.lang.toUpperCase() + " · " + (c ? c.courseState : "NOT CREATED") + "\n   " + def.name +
         "\n   Link: " + ((c && c.alternateLink) || "-") + "\n   Class code: " + ((c && c.enrollmentCode) || "-"));
  });
}
