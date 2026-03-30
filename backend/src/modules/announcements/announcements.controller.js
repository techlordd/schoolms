// src/modules/announcements/announcements.controller.js
const prisma = require('../../config/db');
const { ok, created, noContent } = require('../../utils/apiResponse');

exports.list = async (req, res) => {
  const { pinned } = req.query;
  const announcements = await prisma.announcement.findMany({
    where: {
      schoolId: req.user.schoolId,
      ...(pinned==='true' && { pinned:true }),
      OR: [
        { audience: { has: 'all' } },
        { audience: { has: req.user.role } },
      ],
    },
    include: { author: { select: { firstName:true, lastName:true, role:true } } },
    orderBy: [{ pinned:'desc' }, { createdAt:'desc' }],
  });
  ok(res, announcements);
};

exports.create = async (req, res) => {
  const { title, body, audience, pinned, expiresAt } = req.body;
  const ann = await prisma.announcement.create({
    data: {
      schoolId:req.user.schoolId, authorId:req.user.sub,
      title, body, audience:audience||['all'],
      pinned:!!pinned, expiresAt:expiresAt?new Date(expiresAt):undefined,
    },
  });
  const io = req.app.get('io');
  io?.to(req.user.schoolId).emit('new_announcement', { title });
  created(res, ann);
};

exports.update = async (req, res) => {
  const { title, body, pinned, expiresAt } = req.body;
  const ann = await prisma.announcement.update({
    where:{ id:req.params.id },
    data:{ title, body, pinned, expiresAt:expiresAt?new Date(expiresAt):undefined },
  });
  ok(res, ann, 'Updated');
};

exports.remove = async (req, res) => {
  await prisma.announcement.delete({ where:{ id:req.params.id } });
  noContent(res);
};
