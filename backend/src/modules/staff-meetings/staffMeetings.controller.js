// src/modules/staff-meetings/staffMeetings.controller.js
const prisma = require('../../config/db');
const { ok, created, noContent, paginated } = require('../../utils/apiResponse');
const { AppError } = require('../../middleware/errorHandler');

exports.list = async (req, res) => {
  const { page=1, limit=10 } = req.query;
  const skip = (page-1)*limit;
  const where = { schoolId: req.user.schoolId };
  const [meetings, total] = await Promise.all([
    prisma.staffMeeting.findMany({
      where, skip:+skip, take:+limit,
      include: { createdBy: { select:{ firstName:true, lastName:true } } },
      orderBy: { date:'desc' },
    }),
    prisma.staffMeeting.count({ where }),
  ]);
  paginated(res, meetings, total, page, limit);
};

exports.create = async (req, res) => {
  const { title, date, agenda, attendeeIds, absentIds } = req.body;
  if (!title || !date) throw AppError('title and date required');
  const meeting = await prisma.staffMeeting.create({
    data: {
      schoolId: req.user.schoolId, createdById: req.user.sub,
      title, date: new Date(date), agenda,
      attendeeIds: attendeeIds||[], absentIds: absentIds||[],
    },
  });
  created(res, meeting);
};

exports.get = async (req, res) => {
  const meeting = await prisma.staffMeeting.findUnique({
    where: { id: req.params.id },
    include: { createdBy: { select:{ firstName:true, lastName:true } } },
  });
  if (!meeting) throw AppError('Meeting not found', 404);
  ok(res, meeting);
};

exports.update = async (req, res) => {
  const { title, agenda, minutes, attendeeIds, absentIds } = req.body;
  const meeting = await prisma.staffMeeting.update({
    where: { id: req.params.id },
    data: { title, agenda, minutes, attendeeIds, absentIds },
  });
  ok(res, meeting, 'Meeting updated');
};

exports.remove = async (req, res) => {
  await prisma.staffMeeting.delete({ where: { id: req.params.id } });
  noContent(res);
};
