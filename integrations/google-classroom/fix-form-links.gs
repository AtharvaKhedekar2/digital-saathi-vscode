/**
 * DIGITAL SAATHI — ONE-TIME REPAIR OF THE FORM POSTS
 * Needs in the SAME project: classroom-setup.gs, story-lessons-data.gs, language-classes-data.gs, language-classes.gs,
 * step00-classes-data.gs, step00-classes.gs (and this file).
 *
 *   step11a_previewFixes   read-only · lists every change step11b would make
 *   step11b_applyFixes     makes the changes below
 *
 * 1. English classes: the Pre-Assessment and Post-Assessment posts list all three languages' links. Their text is
 *    changed to show only the English link (the attached link card is already the English form).
 * 2. Hindi and Marathi classes: an earlier version put a broken link (…/viewform/viewform, "page not found") in the
 *    Pre-Assessment and Post-Assessment posts. Those posts are deleted and posted again with the right link. The welcome
 *    post is posted again too, so it stays above the Pre-Assessment in "Start here".
 * 3. Step 00 classes: the "What comes next" post (and its then-empty topic) is removed, and a practical activity with
 *    the broken link is posted again. Note: if learners had already marked that one activity as done, that mark is lost.
 *
 * Only posts this script project created can be changed; anything else is reported and left alone. Safe to run again.
 */
function step11a_previewFixes() { fixAll_(false); }
function step11b_applyFixes() { fixAll_(true); }

const BROKEN_FORM_ = /viewform\/viewform/;

function englishOnly_(text) {
  return text.split("\n").filter(function (l) { return !/^(हिंदी|मराठी):/.test(l); }).join("\n");
}
function postsOf_(courseId) {
  return {
    mats: pageAll_(function (t) {
      return Classroom.Courses.CourseWorkMaterials.list(courseId, { pageToken: t, courseWorkMaterialStates: ["PUBLISHED", "DRAFT"] });
    }, "courseWorkMaterial"),
    work: pageAll_(function (t) { return Classroom.Courses.CourseWork.list(courseId, { pageToken: t, courseWorkStates: ["PUBLISHED", "DRAFT"] }); }, "courseWork"),
    topics: pageAll_(function (t) { return Classroom.Courses.Topics.list(courseId, { pageToken: t }); }, "topic")
  };
}
function isBroken_(p) {
  if (BROKEN_FORM_.test(p.description || "")) return true;
  return (p.materials || []).some(function (m) { return m.link && BROKEN_FORM_.test(m.link.url || ""); });
}

function fixAll_(apply) {
  requireClassroomService_();
  const started = Date.now();
  const courses = listMyCourses_();
  const n = { patched: 0, deleted: 0, topics: 0, problems: 0 };
  function del(kind, courseId, p) {
    if (!apply) { log_("   would delete and post again: " + p.title); n.deleted++; return true; }
    try {
      if (kind === "work") Classroom.Courses.CourseWork.remove(courseId, p.id);
      else Classroom.Courses.CourseWorkMaterials.remove(courseId, p.id);
      n.deleted++; log_("   🗑️ removed: " + p.title); pause_(); return true;
    } catch (e) { n.problems++; log_("   ❌ could not remove \"" + p.title + "\": " + explainError_(e)); return false; }
  }

  // 1. English classes: Pre / Post text → English link only
  CLASSROOMS.forEach(function (def) {
    const c = findCourse_(courses, def.name) || findCourse_(courses, def.name + " · English");
    if (!c) return;
    log_("──────── " + def.name);
    const want = {};
    def.sections.forEach(function (s) { s.items.forEach(function (it) { if (it.links.length) want[norm_(it.title)] = englishOnly_(it.description); }); });
    postsOf_(c.id).mats.forEach(function (m) {
      const text = want[norm_(m.title)];
      if (text === undefined || (m.description || "") === text) return;
      if (!apply) { log_("   would show only the English link in: " + m.title); n.patched++; return; }
      try { Classroom.Courses.CourseWorkMaterials.patch({ description: text }, c.id, m.id, { updateMask: "description" }); n.patched++; log_("   ✏️ English link only: " + m.title); }
      catch (e) { n.problems++; log_("   ❌ " + m.title + ": " + explainError_(e)); }
      pause_();
    });
  });

  // 2. Hindi / Marathi classes: replace posts with the broken link
  LANG_CLASSES.forEach(function (def) {
    const c = findCourse_(courses, def.name);
    if (!c || c.courseState !== "ACTIVE") return;
    log_("──────── " + def.name);
    const all = postsOf_(c.id), byTitle = {};
    all.mats.forEach(function (m) { byTitle[norm_(m.title)] = m; });
    const pre = byTitle[norm_(def.pre.title)], post = byTitle[norm_(def.post.title)], welcome = byTitle[norm_(def.welcome.title)];
    let changed = false;
    if (pre && isBroken_(pre) && del("mat", c.id, pre)) { changed = true; if (welcome) del("mat", c.id, welcome); }
    if (post && isBroken_(post) && del("mat", c.id, post)) changed = true;
    if (!changed) { log_("   ✓ links already fine"); return; }
    if (apply) fillLangClass_(c.id, def, started);
  });

  // 3. Step 00 classes: remove "What comes next"; replace an activity with the broken link
  STEP00_CLASSES.forEach(function (def) {
    const c = findCourse_(courses, def.name);
    if (!c || c.courseState !== "ACTIVE") return;
    log_("──────── " + def.name);
    const all = postsOf_(c.id);
    const retired = def.retired.titles.map(norm_);
    let changed = false;
    all.mats.filter(function (m) { return retired.indexOf(norm_(m.title)) >= 0; }).forEach(function (m) {
      if (!apply) { log_("   would remove: " + m.title); n.deleted++; changed = true; return; }
      try { Classroom.Courses.CourseWorkMaterials.remove(c.id, m.id); n.deleted++; changed = true; log_("   🗑️ removed: " + m.title); pause_(); }
      catch (e) { n.problems++; log_("   ❌ could not remove \"" + m.title + "\": " + explainError_(e)); }
    });
    def.retired.topics.forEach(function (name) {
      const t = all.topics.filter(function (x) { return norm_(x.name) === norm_(name); })[0];
      if (!t) return;
      const left = all.mats.filter(function (m) { return m.topicId === t.topicId && retired.indexOf(norm_(m.title)) < 0; }).length +
                   all.work.filter(function (w) { return w.topicId === t.topicId; }).length;
      if (left) { log_("   ⚠️ kept topic \"" + t.name + "\" — it still holds " + left + " other post(s)."); return; }
      if (!apply) { log_("   would remove topic: " + t.name); n.topics++; return; }
      try { Classroom.Courses.Topics.remove(c.id, t.topicId); n.topics++; log_("   🗑️ removed topic: " + t.name); pause_(); }
      catch (e) { n.problems++; log_("   ❌ could not remove topic: " + explainError_(e)); }
    });
    all.work.filter(isBroken_).forEach(function (w) { if (del("work", c.id, w)) changed = true; });
    if (!changed) { log_("   ✓ nothing to change"); return; }
    if (apply) fillStep00Class_(c.id, def, started);
  });

  log_("");
  log_((apply ? "Done: " : "Would do: ") + n.patched + " post(s) set to English link only, " + n.deleted + " post(s) removed/replaced, " +
       n.topics + " empty topic(s) removed." + (n.problems ? " " + n.problems + " problem(s) — see ❌." : ""));
  if (!apply) log_("Nothing was changed. If this looks right, run step11b_applyFixes.");
}
