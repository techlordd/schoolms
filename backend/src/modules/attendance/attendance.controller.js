// src/modules/attendance/attendance.controller.js
const prisma = require('../../config/db');
const { ok, created, paginated } = require('../../utils/apiResponse');
const { AppError } = require('../../middleware/errorHandler');

exports.list = async (req, res) => {
  const { page=1, limit=50, classId, date, term, academicYear } = req.query;
  const skip = (page-1)*limit;
  const where = {
    schoolId: req.user.schoolId,
    ...(classId && { classId }),
    ...(date    && { date: new Date(date) }),
    ...(term    && { term: +term }),
    ...(academicYear && { academicYear }),
  };
  const [records, total] = await Promise.all([
    prisma.attendance.findMany({
      where, skip:+skip, take:+limit,
      include: { student:{ select:{ firstName:true, lastName:true, studentId:true } } },
      orderBy: { date:'desc' },
    }),
    prisma.attendance.count({ where }),
  ]);
  paginated(res, records, total, page, limit);
};

exports.bulkMark = async (req, res) => {
  const { classId, date, records, term, academicYear } = req.body;
  // records = [{ studentId, status, note }]
  if (!classId || !date || !records?.length) throw AppError('classId, date and records required');

  const attendanceDate = new Date(date);

  const upsertOps = records.map(r =>
    prisma.attendance.upsert({
      where: { studentId_date: { studentId: r.studentId, date: attendanceDate } },
      update: { status: r.status, note: r.note, markedById: req.user.sub },
      create: {
        schoolId: req.user.schoolId, classId, studentId: r.studentId,
        date: attendanceDate, status: r.status, note: r.note,
        markedById: req.user.sub, term: term||2, academicYear: academicYear||'2024/2025',
      },
    })
  );

  const results = await prisma.$transaction(upsertOps);

  // Notify via socket.io
  const io = req.app.get('io');
  io?.to(req.user.schoolId).emit('attendance_marked', { classId, date, count: results.length });

  ok(res, { count: results.length }, 'Attendance saved');
};

exports.update = async (req, res) => {
  const { status, note } = req.body;
  const record = await prisma.attendance.update({
    where: { id: req.params.id },
    data: { status, note },
  });
  ok(res, record, 'Attendance updated');
};

exports.byClass = async (req, res) => {
  const { date, startDate, endDate, term, academicYear } = req.query;
  const where = {
    classId: req.params.classId,
    ...(date      && { date: new Date(date) }),
    ...(startDate && endDate && { date: { gte: new Date(startDate), lte: new Date(endDate) } }),
    ...(term      && { term: +term }),
    ...(academicYear && { academicYear }),
  };
  const records = await prisma.attendance.findMany({
    where,
    include: { student: { select: { firstName:true, lastName:true, studentId:true } } },
    orderBy: [{ date:'desc' }, { student:{ lastName:'asc' } }],
  });
  ok(res, records);
};

exports.byStudent = async (req, res) => {
  const { term, academicYear } = req.query;
  const records = await prisma.attendance.findMany({
    where: {
      studentId: req.params.studentId,
      ...(term && { term:+term }),
      ...(academicYear && { academicYear }),
    },
    orderBy: { date:'desc' },
  });
  const summary = {
    total:   records.length,
    present: records.filter(r=>r.status==='present').length,
    absent:  records.filter(r=>r.status==='absent').length,
    late:    records.filter(r=>r.status==='late').length,
  };
  summary.percentage = summary.total
    ? Math.round((summary.present + summary.late) / summary.total * 100) : 0;
  ok(res, { records, summary });
};

exports.todaySummary = async (req, res) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const [present, absent, late, totalStudents] = await Promise.all([
    prisma.attendance.count({ where: { schoolId:req.user.schoolId, date:today, status:'present' } }),
    prisma.attendance.count({ where: { schoolId:req.user.schoolId, date:today, status:'absent'  } }),
    prisma.attendance.count({ where: { schoolId:req.user.schoolId, date:today, status:'late'    } }),
    prisma.student.count({ where: { schoolId:req.user.schoolId, isActive:true } }),
  ]);
  const marked = present + absent + late;
  ok(res, {
    date: today, totalStudents, marked, unmarked: totalStudents - marked,
    present, absent, late,
    percentage: marked ? Math.round((present+late)/marked*100) : 0,
  });
};

exports.termReport = async (req, res) => {
  const { term=2, academicYear='2024/2025', classId } = req.query;
  const where = { schoolId:req.user.schoolId, term:+term, academicYear, ...(classId && { classId }) };
  const records = await prisma.attendance.groupBy({
    by: ['studentId','status'],
    where,
    _count: { status:true },
  });
  // Reshape into per-student summary
  const map = {};
  records.forEach(r => {
    if (!map[r.studentId]) map[r.studentId] = { studentId:r.studentId, present:0, absent:0, late:0 };
    map[r.studentId][r.status] = r._count.status;
  });
  const summary = Object.values(map).map(s => ({
    ...s,
    total: s.present + s.absent + s.late,
    percentage: Math.round((s.present+s.late)/(s.present+s.absent+s.late||1)*100),
  }));
  ok(res, summary);
};
