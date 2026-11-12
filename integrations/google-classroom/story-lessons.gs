/**
 * DIGITAL SAATHI — ADD THE STORY LESSONS TO THE SIX CLASSROOMS
 * Needs classroom-setup.gs and story-lessons-data.gs in the SAME Apps Script project.
 *
 *   step6a_previewStoryLessons   read-only · shows what step 6b would add to each class
 *   step6b_addStoryLessons       ADDS 3 topics per class (English, हिंदी, मराठी) with one post per story lesson
 *   step6c_refreshStoryText      UPDATES the text of story posts that already exist (use after the text was redesigned)
 *
 * Safe to run again: posts whose title already exists are skipped. Nothing is ever deleted or changed.
 */
function step6a_previewStoryLessons() {
  requireClassroomService_();
  const courses = listMyCourses_();
  CLASSROOMS.forEach(function (def) {
    const c = findCourse_(courses, def.name);
    const lessons = STORY_LESSONS[def.id];
    const n = ["en", "hi", "mr"].reduce(function (s, l) { return s + lessons[l].items.length; }, 0);
    log_((c ? "✅ " : "⏭️  ") + def.name + (c ? " (" + c.courseState + ")" : " — not found") + " → would add " + n + " story posts in 3 topics");
  });
}

function step6b_addStoryLessons() {
  requireClassroomService_();
  const started = Date.now();
  const courses = listMyCourses_();
  let failed = 0, doneClasses = 0;
  for (let i = 0; i < CLASSROOMS.length; i++) {
    const def = CLASSROOMS[i];
    const c = findCourse_(courses, def.name);
    if (!c) { log_("⏭️  " + def.name + " — not found."); continue; }
    if (c.courseState !== "ACTIVE") { log_("⏭️  " + def.name + " — it is " + c.courseState + ". Accept it in Classroom first."); continue; }
    log_("──────── " + def.name);
    const r = addStory_(c.id, STORY_LESSONS[def.id], started);
    failed += r.failed;
    if (!r.finished) { log_("⏸️  Stopped safely before Google's 6-minute limit. Run step6b_addStoryLessons again — it continues where it stopped."); return; }
    if (!r.failed) doneClasses++;
  }
  log_("");
  if (failed) log_("⚠️  " + failed + " post(s) failed (see ❌). Fix the cause and run step6b_addStoryLessons again — it only adds what is missing.");
  log_(doneClasses + " classroom(s) now have all their story lessons.");
}

// Topics and posts are created last-to-first (Classroom shows the newest on top), so Marathi is made first,
// then Hindi, then English, and each lesson list runs 1, 2, 3 … from the top.
function addStory_(courseId, langs, started) {
  const have = existingClasswork_(courseId);
  const topicIds = {};
  have.topics.forEach(function (t) { topicIds[norm_(t.name)] = t.topicId; });
  let added = 0, skipped = 0, failed = 0;
  ["mr", "hi", "en"].forEach(function (code) {
    const block = langs[code];
    let topicId = topicIds[norm_(block.topic)];
    if (!topicId) {
      topicId = Classroom.Courses.Topics.create({ name: block.topic }, courseId).topicId;
      topicIds[norm_(block.topic)] = topicId; log_("   + topic: " + block.topic); pause_();
    }
    for (let k = block.items.length - 1; k >= 0; k--) {
      if (Date.now() - started > SETTINGS.TIME_LIMIT_MS) { block.__stop = true; return; }
      const item = block.items[k];
      if (have.materialTitles.indexOf(norm_(item.title)) >= 0) { skipped++; continue; }
      try {
        Classroom.Courses.CourseWorkMaterials.create(
          { title: item.title, description: item.description, topicId: topicId, state: SETTINGS.POST_STATE }, courseId);
        have.materialTitles.push(norm_(item.title)); added++;
        log_("   + " + item.title);
      } catch (e) { failed++; log_("   ❌ " + item.title + ": " + explainError_(e)); }
      pause_();
    }
  });
  const stopped = ["mr", "hi", "en"].some(function (c) { return langs[c].__stop; });
  ["mr", "hi", "en"].forEach(function (c) { delete langs[c].__stop; });
  log_("   Done: " + added + " added, " + skipped + " already there" + (failed ? ", " + failed + " failed." : "."));
  return { finished: !stopped, failed: failed };
}

// Rewrites the text (only the text) of story posts that are already in the classes, matching them by title.
// Google lets a script edit only posts it created itself; anything else is reported and left alone.
function step6c_refreshStoryText() {
  requireClassroomService_();
  const started = Date.now();
  const courses = listMyCourses_();
  let changed = 0, same = 0, problems = 0;
  for (let i = 0; i < CLASSROOMS.length; i++) {
    const def = CLASSROOMS[i];
    const c = findCourse_(courses, def.name);
    if (!c) { log_("⏭️  " + def.name + " — not found."); continue; }
    log_("──────── " + def.name);
    const want = {};
    ["en", "hi", "mr"].forEach(function (l) {
      STORY_LESSONS[def.id][l].items.forEach(function (it) { want[norm_(it.title)] = it.description; });
    });
    const mats = pageAll_(function (t) {
      return Classroom.Courses.CourseWorkMaterials.list(c.id, { pageToken: t, courseWorkMaterialStates: ["PUBLISHED", "DRAFT"] });
    }, "courseWorkMaterial");
    for (let k = 0; k < mats.length; k++) {
      const m = mats[k], text = want[norm_(m.title)];
      if (text === undefined) continue;
      if ((m.description || "") === text) { same++; continue; }
      if (Date.now() - started > SETTINGS.TIME_LIMIT_MS) {
        log_("⏸️  Stopped safely before Google's 6-minute limit. Run step6c_refreshStoryText again — it continues where it stopped.");
        return;
      }
      try {
        Classroom.Courses.CourseWorkMaterials.patch({ description: text }, c.id, m.id, { updateMask: "description" });
        changed++; log_("   ✏️ updated: " + m.title);
      } catch (e) { problems++; log_("   ❌ " + m.title + ": " + explainError_(e)); }
      pause_();
    }
  }
  log_("");
  log_(changed + " post(s) updated, " + same + " already up to date" + (problems ? ", " + problems + " problem(s) — see ❌." : "."));
}
