// src/modules/assignments/teachingLog.controller.js
const prisma = require('../../config/db');
const { ok, created } = require('../../utils/apiResponse');

exports.list = async (req, res) => {
  const { classId, subjectId, term, academicYear } = req.query;
  const logs = await prisma.teachingLog.findMany({
    where: {
      ...(classId     && { classId }),
      ...(subjectId   && { subjectId }),
      ...(term        && { term:+term }),
      ...(academicYear && { academicYear }),
      ...(req.user.role === 'teacher' && { teacherId: req.user.sub }),
    },
    include: {
      class:   { select:{ name:true } },
      subject: { select:{ name:true } },
      teacher: { select:{ firstName:true, lastName:true } },
    },
    orderBy: { date:'desc' },
  });
  ok(res, logs);
};

exports.create = async (req, res) => {
  const { classId, subjectId, date, topic, notes, resources, term, academicYear } = req.body;
  const log = await prisma.teachingLog.create({
    data: {
      classId, subjectId, teacherId:req.user.sub,
      date: new Date(date), topic, notes, resources:resources||[],
      term:+term, academicYear,
    },
  });
  created(res, log);
};

exports.update = async (req, res) => {
  const { topic, notes, resources } = req.body;
  const log = await prisma.teachingLog.update({
    where:{ id:req.params.id },
    data:{ topic, notes, resources },
  });
  ok(res, log, 'Log updated');
};
