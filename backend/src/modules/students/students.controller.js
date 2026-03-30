// src/modules/students/students.controller.js
const prisma = require('../../config/db');
const { ok, created, paginated, noContent } = require('../../utils/apiResponse');
const { AppError } = require('../../middleware/errorHandler');
const { generateStudentId } = require('../../utils/generators');

const studentSelect = {
  id:true, studentId:true, firstName:true, lastName:true, dateOfBirth:true,
  gender:true, bloodGroup:true, allergies:true, medicalNotes:true,
  emergencyPhone:true, photoUrl:true, enrolledAt:true, isActive:true,
  class: { select:{ id:true, name:true, level:true } },
  parents: {
    select:{ relationship:true, isPrimary:true,
      parent:{ select:{ id:true, firstName:true, lastName:true, phone:true, email:true } } }
  },
};

exports.list = async (req, res) => {
  const { page=1, limit=20, classId, search, isActive='true' } = req.query;
  const skip = (page-1)*limit;

  const where = {
    schoolId: req.user.schoolId,
    isActive: isActive === 'true',
    ...(classId && { classId }),
    ...(search && { OR:[
      { firstName:{ contains:search, mode:'insensitive' } },
      { lastName:{ contains:search, mode:'insensitive' } },
      { studentId:{ contains:search, mode:'insensitive' } },
    ]}),
  };

  const [students, total] = await Promise.all([
    prisma.student.findMany({ where, skip:+skip, take:+limit, select:studentSelect, orderBy:{ lastName:'asc' } }),
    prisma.student.count({ where }),
  ]);

  paginated(res, students, total, page, limit);
};

exports.create = async (req, res) => {
  const { firstName, lastName, dateOfBirth, gender, classId, bloodGroup,
          allergies, medicalNotes, emergencyPhone, parentId, parentRelationship } = req.body;

  const school = await prisma.school.findUnique({ where:{ id:req.user.schoolId } });
  const studentId = await generateStudentId(school.code);

  const student = await prisma.student.create({
    data: {
      schoolId: req.user.schoolId, studentId, classId,
      firstName, lastName, dateOfBirth: new Date(dateOfBirth),
      gender, bloodGroup, allergies, medicalNotes, emergencyPhone,
      ...(parentId && {
        parents: { create:{ parentId, relationship:parentRelationship||'guardian', isPrimary:true } }
      }),
    },
    select: studentSelect,
  });

  created(res, student, 'Student enrolled successfully');
};

exports.get = async (req, res) => {
  const student = await prisma.student.findFirst({
    where: { id:req.params.id, schoolId:req.user.schoolId },
    select: studentSelect,
  });
  if (!student) throw AppError('Student not found', 404);
  ok(res, student);
};

exports.update = async (req, res) => {
  const { firstName, lastName, dateOfBirth, gender, classId,
          bloodGroup, allergies, medicalNotes, emergencyPhone } = req.body;

  const student = await prisma.student.update({
    where: { id:req.params.id },
    data: { firstName, lastName, dateOfBirth: dateOfBirth ? new Date(dateOfBirth):undefined,
            gender, classId, bloodGroup, allergies, medicalNotes, emergencyPhone },
    select: studentSelect,
  });
  ok(res, student, 'Student updated');
};

exports.remove = async (req, res) => {
  await prisma.student.update({ where:{ id:req.params.id }, data:{ isActive:false } });
  noContent(res);
};

exports.getAttendance = async (req, res) => {
  const { term, academicYear, startDate, endDate } = req.query;
  const attendance = await prisma.attendance.findMany({
    where: {
      studentId: req.params.id,
      ...(term && { term:+term }),
      ...(academicYear && { academicYear }),
      ...(startDate && endDate && { date:{ gte:new Date(startDate), lte:new Date(endDate) } }),
    },
    orderBy: { date:'desc' },
  });

  const summary = {
    total: attendance.length,
    present: attendance.filter(a=>a.status==='present').length,
    absent:  attendance.filter(a=>a.status==='absent').length,
    late:    attendance.filter(a=>a.status==='late').length,
  };
  summary.percentage = summary.total ? Math.round((summary.present+summary.late)/summary.total*100) : 0;

  ok(res, { attendance, summary });
};

exports.getResults = async (req, res) => {
  const { term, academicYear } = req.query;
  const results = await prisma.result.findMany({
    where: {
      studentId: req.params.id,
      ...(term && { term:+term }),
      ...(academicYear && { academicYear }),
    },
    include: { subject:{ select:{ name:true, code:true } } },
    orderBy: { subject:{ name:'asc' } },
  });
  ok(res, results);
};

exports.getReportCard = async (req, res) => {
  const { term, academicYear } = req.query;
  const reportCard = await prisma.reportCard.findFirst({
    where: { studentId:req.params.id, term:+term, academicYear },
    include: { student:{ select:{ firstName:true, lastName:true, studentId:true } },
               class:{ select:{ name:true } } },
  });
  if (!reportCard) throw AppError('Report card not found', 404);
  ok(res, reportCard);
};

exports.transfer = async (req, res) => {
  const { newClassId } = req.body;
  if (!newClassId) throw AppError('newClassId required');
  const student = await prisma.student.update({
    where:{ id:req.params.id }, data:{ classId:newClassId }, select:studentSelect,
  });
  ok(res, student, 'Student transferred');
};

exports.byClass = async (req, res) => {
  const students = await prisma.student.findMany({
    where: { classId:req.params.classId, schoolId:req.user.schoolId, isActive:true },
    select: studentSelect,
    orderBy: { lastName:'asc' },
  });
  ok(res, students);
};
