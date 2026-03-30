// src/modules/calendar/calendar.controller.js
const prisma = require('../../config/db');
const { ok, created, noContent } = require('../../utils/apiResponse');

exports.list = async (req, res) => {
  const { month, year, eventType } = req.query;
  const where = {
    schoolId: req.user.schoolId,
    ...(eventType && { eventType }),
    ...(month && year && {
      startDate: {
        gte: new Date(+year, +month - 1, 1),
        lt:  new Date(+year, +month, 1),
      },
    }),
  };
  const events = await prisma.calendarEvent.findMany({
    where,
    include: { createdBy: { select: { firstName:true, lastName:true } } },
    orderBy: { startDate: 'asc' },
  });
  ok(res, events);
};

exports.create = async (req, res) => {
  const { title, description, eventType, startDate, endDate, allDay, location, audience } = req.body;
  const event = await prisma.calendarEvent.create({
    data: {
      schoolId: req.user.schoolId, createdById: req.user.sub,
      title, description, eventType: eventType||'other',
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      allDay: allDay !== false, location,
      audience: audience||['all'],
    },
  });
  const io = req.app.get('io');
  io?.to(req.user.schoolId).emit('new_event', { title, startDate });
  created(res, event);
};

exports.update = async (req, res) => {
  const { title, description, eventType, startDate, endDate, location } = req.body;
  const event = await prisma.calendarEvent.update({
    where: { id: req.params.id },
    data: { title, description, eventType, location,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    },
  });
  ok(res, event, 'Event updated');
};

exports.remove = async (req, res) => {
  await prisma.calendarEvent.delete({ where: { id: req.params.id } });
  noContent(res);
};
