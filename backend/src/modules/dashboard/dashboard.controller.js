// src/modules/dashboard/dashboard.controller.js
const prisma = require('../../config/db');
const { ok } = require('../../utils/apiResponse');

exports.admin = async (req, res) => {
  const schoolId = req.user.schoolId;
  const today = new Date(); today.setHours(0,0,0,0);

  const [
    totalStudents, totalStaff, totalClasses,
    todayPresent, todayAbsent, todayLate,
    recentStudents, announcements, upcomingEvents,
    feeStats, recentMeetings,
  ] = await Promise.all([
    prisma.student.count({ where: { schoolId, isActive:true } }),
    prisma.staffProfile.count({ where: { schoolId } }),
    prisma.class.count({ where: { schoolId } }),
    prisma.attendance.count({ where: { schoolId, date:today, status:'present' } }),
    prisma.attendance.count({ where: { schoolId, date:today, status:'absent'  } }),
    prisma.attendance.count({ where: { schoolId, date:today, status:'late'    } }),
    prisma.student.findMany({
      where: { schoolId, isActive:true },
      take: 5, orderBy: { enrolledAt:'desc' },
      include: { class:{ select:{ name:true } } },
      select: { id:true, firstName:true, lastName:true, studentId:true, enrolledAt:true, class:{ select:{ name:true } } },
    }),
    prisma.announcement.findMany({
      where: { schoolId },
      take: 4, orderBy: { createdAt:'desc' },
      include: { author:{ select:{ firstName:true, lastName:true, role:true } } },
    }),
    prisma.calendarEvent.findMany({
      where: { schoolId, startDate: { gte: today } },
      take: 5, orderBy: { startDate:'asc' },
    }),
    prisma.feePayment.aggregate({
      where: { schoolId, term:2, academicYear:'2024/2025' },
      _sum: { amountPaid:true, amountDue:true },
    }),
    prisma.staffMeeting.findMany({
      where: { schoolId },
      take: 3, orderBy: { date:'desc' },
      include: { createdBy:{ select:{ firstName:true, lastName:true } } },
    }),
  ]);

  const marked = todayPresent + todayAbsent + todayLate;
  const attendancePct = marked ? Math.round((todayPresent + todayLate) / marked * 100) : 0;

  // Weekly attendance (last 5 school days)
  const weeklyAtt = await prisma.$queryRaw`
    SELECT date::text, status, COUNT(*)::int as count
    FROM attendance
    WHERE school_id = ${schoolId}
      AND date >= NOW() - INTERVAL '7 days'
    GROUP BY date, status
    ORDER BY date ASC
  `;

  ok(res, {
    stats: { totalStudents, totalStaff, totalClasses, attendancePct },
    todayAttendance: { present:todayPresent, absent:todayAbsent, late:todayLate, total:marked },
    weeklyAttendance: weeklyAtt,
    feeStats: {
      collected: Number(feeStats._sum.amountPaid||0),
      due: Number(feeStats._sum.amountDue||0),
    },
    recentStudents, announcements, upcomingEvents, recentMeetings,
  });
};

exports.teacher = async (req, res) => {
  const teacherId = req.user.sub;
  const today = new Date(); today.setHours(0,0,0,0);

  const myClasses = await prisma.classSubject.findMany({
    where: { teacherId },
    include: {
      class: { include: { _count:{ select:{ students:true } } } },
      subject: { select:{ name:true, code:true } },
    },
  });

  const classIds = [...new Set(myClasses.map(cs => cs.classId))];

  const [pendingAssignments, recentLogs, todayAttendance] = await Promise.all([
    prisma.assignment.findMany({
      where: { teacherId, dueDate:{ gte: today } },
      take: 5, orderBy: { dueDate:'asc' },
      include: { class:{ select:{ name:true } }, subject:{ select:{ name:true } }, _count:{ select:{ submissions:true } } },
    }),
    prisma.teachingLog.findMany({
      where: { teacherId },
      take: 5, orderBy: { date:'desc' },
      include: { class:{ select:{ name:true } }, subject:{ select:{ name:true } } },
    }),
    prisma.attendance.groupBy({
      by: ['status'],
      where: { classId:{ in: classIds }, date:today },
      _count: { status:true },
    }),
  ]);

  ok(res, { myClasses, pendingAssignments, recentLogs, todayAttendance });
};

exports.student = async (req, res) => {
  const student = await prisma.student.findFirst({
    where: { userId: req.user.sub },
    include: { class:{ select:{ name:true, level:true } } },
  });
  if (!student) return ok(res, {});

  const [results, attendance, assignments, announcements] = await Promise.all([
    prisma.result.findMany({
      where: { studentId:student.id, term:2, academicYear:'2024/2025' },
      include: { subject:{ select:{ name:true } } },
    }),
    prisma.attendance.findMany({
      where: { studentId:student.id, term:2 },
      orderBy: { date:'desc' }, take: 30,
    }),
    prisma.assignment.findMany({
      where: { classId:student.classId, dueDate:{ gte: new Date() } },
      take: 5, orderBy: { dueDate:'asc' },
      include: { subject:{ select:{ name:true } } },
    }),
    prisma.announcement.findMany({
      where: { schoolId:student.schoolId, OR:[{ audience:{ has:'all' } },{ audience:{ has:'student' } }] },
      take: 4, orderBy: { createdAt:'desc' },
    }),
  ]);

  const attSummary = {
    present: attendance.filter(a=>a.status==='present').length,
    absent:  attendance.filter(a=>a.status==='absent').length,
    late:    attendance.filter(a=>a.status==='late').length,
    total:   attendance.length,
  };
  attSummary.pct = attSummary.total ? Math.round((attSummary.present+attSummary.late)/attSummary.total*100) : 0;

  const avgScore = results.length
    ? (results.reduce((s,r) => s+Number(r.totalScore||0),0) / results.length).toFixed(1)
    : 0;

  ok(res, { student, results, attSummary, avgScore, assignments, announcements });
};

exports.parent = async (req, res) => {
  const children = await prisma.parentStudent.findMany({
    where: { parentId: req.user.sub },
    include: {
      student: {
        include: {
          class: { select:{ name:true } },
          results: { where:{ term:2, academicYear:'2024/2025' }, include:{ subject:{ select:{ name:true } } } },
          attendance: { where:{ term:2 }, orderBy:{ date:'desc' }, take:30 },
          feePayments: { orderBy:{ paymentDate:'desc' }, take:3 },
        },
      },
    },
  });

  const data = children.map(c => {
    const s = c.student;
    const att = s.attendance;
    const attSummary = {
      present: att.filter(a=>a.status==='present').length,
      absent:  att.filter(a=>a.status==='absent').length,
      total:   att.length,
      pct: att.length ? Math.round(att.filter(a=>a.status!=='absent').length/att.length*100):0,
    };
    const avgScore = s.results.length
      ? (s.results.reduce((sum,r) => sum+Number(r.totalScore||0),0)/s.results.length).toFixed(1) : 0;
    const totalDue  = s.feePayments.reduce((x,p) => x+Number(p.amountDue),0);
    const totalPaid = s.feePayments.reduce((x,p) => x+Number(p.amountPaid),0);
    return { ...c, student:{ ...s, attSummary, avgScore, feeBalance: totalDue-totalPaid } };
  });

  const announcements = await prisma.announcement.findMany({
    where: { schoolId:req.user.schoolId, OR:[{ audience:{ has:'all' } },{ audience:{ has:'parent' } }] },
    take: 4, orderBy: { createdAt:'desc' },
  });

  ok(res, { children:data, announcements });
};
