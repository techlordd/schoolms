// src/modules/classes/classes.controller.js
const prisma = require('../../config/db');
const { ok, created, noContent } = require('../../utils/apiResponse');
const { AppError } = require('../../middleware/errorHandler');

exports.list = async (req, res) => {
  const { academicYear } = req.query;
  const classes = await prisma.class.findMany({
    where: { schoolId: req.user.schoolId, ...(academicYear && { academicYear }) },
    include: {
      classTeacher: { select:{ firstName:true, lastName:true } },
      _count: { select:{ students:true, classSubjects:true } },
    },
    orderBy: { level: 'asc' },
  });
  ok(res, classes);
};

exports.create = async (req, res) => {
  const { name, level, classTeacherId, capacity, academicYear } = req.body;
  if (!name || !level) throw AppError('name and level required');
  const cls = await prisma.class.create({
    data: { schoolId: req.user.schoolId, name, level, classTeacherId, capacity:capacity||40, academicYear:academicYear||'2024/2025' },
  });
  created(res, cls);
};

exports.get = async (req, res) => {
  const cls = await prisma.class.findUnique({
    where: { id: req.params.id },
    include: {
      classTeacher: { select:{ firstName:true, lastName:true, email:true } },
      classSubjects: { include: { subject:{ select:{ name:true, code:true } }, teacher:{ select:{ firstName:true, lastName:true } } } },
      _count: { select:{ students:true } },
    },
  });
  if (!cls) throw AppError('Class not found', 404);
  ok(res, cls);
};

exports.update = async (req, res) => {
  const { name, classTeacherId, capacity } = req.body;
  const cls = await prisma.class.update({
    where: { id: req.params.id },
    data: { name, classTeacherId, capacity },
  });
  ok(res, cls, 'Class updated');
};

exports.remove = async (req, res) => {
  const count = await prisma.student.count({ where: { classId: req.params.id, isActive:true } });
  if (count > 0) throw AppError('Cannot delete class with active students', 400);
  await prisma.class.delete({ where: { id: req.params.id } });
  noContent(res);
};

exports.subjects = async (req, res) => {
  const subjects = await prisma.classSubject.findMany({
    where: { classId: req.params.id },
    include: {
      subject: { select:{ name:true, code:true, description:true } },
      teacher: { select:{ firstName:true, lastName:true } },
    },
  });
  ok(res, subjects);
};

exports.assignSubject = async (req, res) => {
  const { subjectId, teacherId, periodsPerWeek } = req.body;
  const cs = await prisma.classSubject.upsert({
    where: { classId_subjectId: { classId:req.params.id, subjectId } },
    update: { teacherId, periodsPerWeek:periodsPerWeek||5 },
    create: { classId:req.params.id, subjectId, teacherId, periodsPerWeek:periodsPerWeek||5 },
  });
  ok(res, cs, 'Subject assigned');
};
