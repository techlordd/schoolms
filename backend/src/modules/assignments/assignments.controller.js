// src/modules/assignments/assignments.controller.js
const prisma = require('../../config/db');
const { ok, created, noContent, paginated } = require('../../utils/apiResponse');
const { AppError } = require('../../middleware/errorHandler');

exports.list = async (req, res) => {
  const { page=1, limit=20, classId, subjectId, term, academicYear } = req.query;
  const skip = (page-1)*limit;
  const where = {
    schoolId: req.user.schoolId,
    ...(classId     && { classId }),
    ...(subjectId   && { subjectId }),
    ...(term        && { term:+term }),
    ...(academicYear && { academicYear }),
    ...(req.user.role==='teacher' && { teacherId: req.user.sub }),
  };
  const [items, total] = await Promise.all([
    prisma.assignment.findMany({
      where, skip:+skip, take:+limit,
      include: {
        class:   { select:{ name:true } },
        subject: { select:{ name:true } },
        teacher: { select:{ firstName:true, lastName:true } },
        _count:  { select:{ submissions:true } },
      },
      orderBy: { dueDate:'asc' },
    }),
    prisma.assignment.count({ where }),
  ]);
  paginated(res, items, total, page, limit);
};

exports.create = async (req, res) => {
  const { classId, subjectId, title, description, dueDate, maxScore, type, term, academicYear } = req.body;
  if (!classId || !subjectId || !title || !dueDate) throw AppError('Required fields missing');
  const assignment = await prisma.assignment.create({
    data: {
      schoolId: req.user.schoolId, classId, subjectId,
      teacherId: req.user.sub, title, description,
      dueDate: new Date(dueDate), maxScore: maxScore||100,
      type: type||'homework', term:+term, academicYear,
    },
    include: {
      class:   { select:{ name:true } },
      subject: { select:{ name:true } },
    },
  });
  // Notify students in class
  const io = req.app.get('io');
  const students = await prisma.student.findMany({ where:{ classId, isActive:true }, select:{ userId:true } });
  students.forEach(s => s.userId && io?.to(s.userId).emit('new_assignment', { title, dueDate }));

  created(res, assignment, 'Assignment created');
};

exports.get = async (req, res) => {
  const assignment = await prisma.assignment.findUnique({
    where: { id:req.params.id },
    include: {
      class:   { select:{ name:true } },
      subject: { select:{ name:true } },
      teacher: { select:{ firstName:true, lastName:true } },
      _count:  { select:{ submissions:true } },
    },
  });
  if (!assignment) throw AppError('Assignment not found', 404);
  ok(res, assignment);
};

exports.update = async (req, res) => {
  const { title, description, dueDate, maxScore } = req.body;
  const assignment = await prisma.assignment.update({
    where: { id:req.params.id },
    data: { title, description, dueDate: dueDate ? new Date(dueDate):undefined, maxScore },
  });
  ok(res, assignment, 'Assignment updated');
};

exports.remove = async (req, res) => {
  await prisma.assignment.delete({ where:{ id:req.params.id } });
  noContent(res);
};

exports.submit = async (req, res) => {
  const { fileUrl } = req.body;
  // Get student profile from user
  const student = await prisma.student.findFirst({ where:{ userId:req.user.sub } });
  if (!student) throw AppError('Student profile not found', 404);
  const sub = await prisma.assignmentSubmission.upsert({
    where: { assignmentId_studentId: { assignmentId:req.params.id, studentId:student.id } },
    update: { fileUrl, submittedAt:new Date() },
    create: { assignmentId:req.params.id, studentId:student.id, fileUrl, submittedAt:new Date() },
  });
  ok(res, sub, 'Submitted successfully');
};

exports.submissions = async (req, res) => {
  const subs = await prisma.assignmentSubmission.findMany({
    where: { assignmentId:req.params.id },
    include: { student:{ select:{ firstName:true, lastName:true, studentId:true } } },
    orderBy: { submittedAt:'asc' },
  });
  ok(res, subs);
};

exports.grade = async (req, res) => {
  const { score, feedback } = req.body;
  const sub = await prisma.assignmentSubmission.update({
    where: { id:req.params.subId },
    data: { score, feedback, gradedAt:new Date(), gradedById:req.user.sub },
  });
  ok(res, sub, 'Graded');
};
