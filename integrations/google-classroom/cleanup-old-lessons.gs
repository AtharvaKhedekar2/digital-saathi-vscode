/**
 * DIGITAL SAATHI — REMOVE THE OLD "LESSON 1/2/3" POSTS (Option A: keep only the story lessons)
 * Needs classroom-setup.gs in the same project.
 *
 *   step7a_previewCleanup   read-only · lists exactly what step7b would delete
 *   step7b_removeOldLessons DELETES the old lesson posts and their (then empty) topics
 *
 * What it deletes: only posts whose TITLE is one of the old lesson titles from classroom-setup.gs AND that sit in
 * one of the old "Lesson …" topics; then each of those topics, but only if it is empty afterwards.
 * What it never touches: "Start here", Pre/Post-Assessment, "Practical activities", "Check your skills",
 * the story-lesson topics, and any post or topic you added yourself.
 * Google only lets a script delete posts that this same script project created; anything else is reported, not deleted.
 * Deleted posts cannot be brought back. Run the preview first.
 */
function step7a_previewCleanup() { cleanupOld_(false); }
function step7b_removeOldLessons() { cleanupOld_(true); }

function oldLessonSections_(def) {
  return def.sections.filter(function (s) { return /^lesson\s*\d/i.test(s.topic); });
}

function cleanupOld_(doDelete) {
  requireClassroomService_();
  const courses = listMyCourses_();
  let removedPosts = 0, removedTopics = 0, problems = 0;
  CLASSROOMS.forEach(function (def) {
    const c = findCourse_(courses, def.name);
    if (!c) { log_("⏭️  " + def.name + " — not found."); return; }
    log_("──────── " + def.name + " (" + c.courseState + ")");
    const id = c.id;
    const topics = pageAll_(function (t) { return Classroom.Courses.Topics.list(id, { pageToken: t }); }, "topic");
    const mats = pageAll_(function (t) {
      return Classroom.Courses.CourseWorkMaterials.list(id, { pageToken: t, courseWorkMaterialStates: ["PUBLISHED", "DRAFT"] });
    }, "courseWorkMaterial");
    const work = pageAll_(function (t) {
      return Classroom.Courses.CourseWork.list(id, { pageToken: t, courseWorkStates: ["PUBLISHED", "DRAFT"] });
    }, "courseWork");
    const gone = {};   // ids of posts removed (or that would be) in this class
    oldLessonSections_(def).forEach(function (section) {
      const topic = topics.filter(function (t) { return norm_(t.name) === norm_(section.topic); })[0];
      if (!topic) { log_("   – topic not present: " + section.topic); return; }
      const titles = section.items.map(function (i) { return norm_(i.title); });
      mats.filter(function (m) { return m.topicId === topic.topicId && titles.indexOf(norm_(m.title)) >= 0; })
        .forEach(function (m) {
          if (!doDelete) { log_("   would delete post: " + m.title); gone[m.id] = true; removedPosts++; return; }
          try { Classroom.Courses.CourseWorkMaterials.remove(id, m.id); gone[m.id] = true; removedPosts++; log_("   🗑️ deleted post: " + m.title); }
          catch (e) { problems++; log_("   ❌ could not delete \"" + m.title + "\": " + explainError_(e)); }
          pause_();
        });
      const left = mats.filter(function (m) { return m.topicId === topic.topicId && !gone[m.id]; }).length +
                   work.filter(function (w) { return w.topicId === topic.topicId; }).length;
      if (left) { log_("   ⚠️ kept topic \"" + topic.name + "\" — it still holds " + left + " other post(s)."); return; }
      if (!doDelete) { log_("   would delete topic: " + topic.name); removedTopics++; return; }
      try { Classroom.Courses.Topics.remove(id, topic.topicId); removedTopics++; log_("   🗑️ deleted topic: " + topic.name); }
      catch (e) { problems++; log_("   ❌ could not delete topic \"" + topic.name + "\": " + explainError_(e)); }
      pause_();
    });
  });
  log_("");
  log_((doDelete ? "Deleted " : "Would delete ") + removedPosts + " post(s) and " + removedTopics + " topic(s)." + (problems ? " " + problems + " problem(s) — see ❌." : ""));
  if (!doDelete) log_("Nothing was changed. If this list looks right, run step7b_removeOldLessons.");
  else log_("Next: in Classroom, drag the topics into order — Start here, Story lessons (English, हिंदी, मराठी), Practical activities, Check your skills.");
}
