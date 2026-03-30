// src/modules/results/results.controller.js
const prisma = require('../../config/db');
const { ok, created, paginated } = require('../../utils/apiResponse');
const { AppError } = require('../../middleware/errorHandler');
const { computeGrade } = require('../../utils/generators');

exports.list = async (req, res) => {
  const { page=1, limit=50, classId, subjectId, term, academicYear } = req.query;
  const skip = (page-1)*limit;
  const where = {
    schoolId: req.user.schoolId,
    ...(classId     && { classId }),
    ...(subjectId   && { subjectId }),
    ...(term        && { term: +term }),
    ...(academicYear && { academicYear }),
  };
  const [results, total] = await Promise.all([
    prisma.result.findMany({
      where, skip:+skip, take:+limit,
      include: {
        student: { select:{ firstName:true, lastName:true, studentId:true } },
        subject: { select:{ name:true, code:true } },
      },
      orderBy: { totalScore:'desc' },
    }),
    prisma.result.count({ where }),
  ]);
  paginated(res, results, total, page, limit);
};

exports.bulkUpsert = async (req, res) => {
  // scores = [{ studentId, subjectId, ca1Score, ca2Score, examScore, teacherComment }]
  const { classId, scores, term, academicYear } = req.body;
  if (!classId || !scores?.length) throw AppError('classId and scores required');

  const ops = scores.map(s => {
    const ca1 = parseFloat(s.ca1Score)||0;
    const ca2 = parseFloat(s.ca2Score)||0;
    const exam = parseFloat(s.examScore)||0;
    const total = ca1 + ca2 + exam;
    const grade = computeGrade(total);
    return prisma.result.upsert({
      where: {
        studentId_subjectId_term_academicYear: {
          studentId: s.studentId, subjectId: s.subjectId,
          term: +term, academicYear,
        },
      },
      update: { ca1Score:ca1, ca2Score:ca2, examScore:exam, totalScore:total, grade, teacherComment:s.teacherComment, teacherId:req.user.sub },
      create: {
        schoolId: req.user.schoolId, classId, studentId:s.studentId, subjectId:s.subjectId,
        teacherId: req.user.sub, ca1Score:ca1, ca2Score:ca2, examScore:exam,
        totalScore:total, grade, teacherComment:s.teacherComment,
        term:+term, academicYear,
      },
    });
  });

  const saved = await prisma.$transaction(ops);
  ok(res, { count: saved.length }, 'Scores saved');
};

exports.update = async (req, res) => {
  const { ca1Score, ca2Score, examScore, teacherComment } = req.body;
  const ca1 = parseFloat(ca1Score)||0;
  const ca2 = parseFloat(ca2Score)||0;
  const exam = parseFloat(examScore)||0;
  const total = ca1 + ca2 + exam;
  const grade = computeGrade(total);
  const result = await prisma.result.update({
    where: { id: req.params.id },
    data: { ca1Score:ca1, ca2Score:ca2, examScore:exam, totalScore:total, grade, teacherComment },
  });
  ok(res, result, 'Result updated');
};

exports.byClass = async (req, res) => {
  const { subjectId, term, academicYear } = req.query;
  const results = await prisma.result.findMany({
    where: {
      classId: req.params.classId,
      ...(subjectId   && { subjectId }),
      ...(term        && { term: +term }),
      ...(academicYear && { academicYear }),
    },
    include: {
      student: { select:{ firstName:true, lastName:true, studentId:true } },
      subject: { select:{ name:true, code:true } },
    },
    orderBy: { totalScore:'desc' },
  });
  ok(res, results);
};

exports.byStudent = async (req, res) => {
  const { term, academicYear } = req.query;
  const results = await prisma.result.findMany({
    where: {
      studentId: req.params.studentId,
      ...(term        && { term: +term }),
      ...(academicYear && { academicYear }),
    },
    include: { subject: { select:{ name:true, code:true } } },
    orderBy: { subject:{ name:'asc' } },
  });
  ok(res, results);
};

exports.computePositions = async (req, res) => {
  const { classId, subjectId, term, academicYear } = req.body;
  if (!classId || !term || !academicYear) throw AppError('classId, term, academicYear required');

  // Get all results for the class/term, grouped by subject
  const results = await prisma.result.findMany({
    where: { classId, term:+term, academicYear, ...(subjectId && { subjectId }) },
    orderBy: { totalScore:'desc' },
  });

  // Group by subject and rank
  const bySubject = {};
  results.forEach(r => {
    if (!bySubject[r.subjectId]) bySubject[r.subjectId] = [];
    bySubject[r.subjectId].push(r);
  });

  const updates = [];
  Object.values(bySubject).forEach(group => {
    group.sort((a,b) => Number(b.totalScore) - Number(a.totalScore));
    group.forEach((r, i) => {
      updates.push(prisma.result.update({ where:{ id:r.id }, data:{ position: i+1 } }));
    });
  });

  await prisma.$transaction(updates);

  // Now compute overall class positions per student
  const allResults = await prisma.result.findMany({
    where: { classId, term:+term, academicYear },
  });

  const studentTotals = {};
  allResults.forEach(r => {
    if (!studentTotals[r.studentId]) studentTotals[r.studentId] = 0;
    studentTotals[r.studentId] += Number(r.totalScore||0);
  });

  const ranked = Object.entries(studentTotals).sort((a,b) => b[1]-a[1]);
  const reportUpdates = ranked.map(([studentId, total], i) =>
    prisma.reportCard.upsert({
      where: { studentId_term_academicYear: { studentId, term:+term, academicYear } },
      update: { totalScore:total, averageScore:+(total/Object.keys(bySubject).length).toFixed(2), classPosition:i+1, classSize:ranked.length },
      create: {
        studentId, classId, term:+term, academicYear,
        totalScore:total,
        averageScore:+(total/Object.keys(bySubject).length).toFixed(2),
        classPosition:i+1, classSize:ranked.length,
      },
    })
  );
  await prisma.$transaction(reportUpdates);

  ok(res, { positionsComputed: updates.length }, 'Positions computed successfully');
};
