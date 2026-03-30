// src/modules/messages/messages.controller.js
const prisma = require('../../config/db');
const { ok, created, noContent, paginated } = require('../../utils/apiResponse');

exports.inbox = async (req, res) => {
  const { page=1, limit=20, unreadOnly } = req.query;
  const skip = (page-1)*limit;
  const where = {
    receiverId: req.user.sub, parentId: null,
    ...(unreadOnly==='true' && { isRead:false }),
  };
  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where, skip:+skip, take:+limit,
      include: { sender:{ select:{ firstName:true, lastName:true, role:true, avatarUrl:true } } },
      orderBy: { createdAt:'desc' },
    }),
    prisma.message.count({ where }),
  ]);
  paginated(res, messages, total, page, limit);
};

exports.send = async (req, res) => {
  const { receiverId, subject, body, parentId } = req.body;
  const msg = await prisma.message.create({
    data: { schoolId:req.user.schoolId, senderId:req.user.sub, receiverId, subject, body, parentId },
    include: { sender:{ select:{ firstName:true, lastName:true } } },
  });
  const io = req.app.get('io');
  io?.to(receiverId).emit('new_message', { id:msg.id, from:`${msg.sender.firstName} ${msg.sender.lastName}`, subject });
  created(res, msg, 'Message sent');
};

exports.thread = async (req, res) => {
  const [message, replies] = await Promise.all([
    prisma.message.findUnique({
      where: { id:req.params.id },
      include: { sender:{ select:{ firstName:true, lastName:true, role:true, avatarUrl:true } } },
    }),
    prisma.message.findMany({
      where: { parentId:req.params.id },
      include: { sender:{ select:{ firstName:true, lastName:true, role:true, avatarUrl:true } } },
      orderBy: { createdAt:'asc' },
    }),
  ]);
  ok(res, { message, replies });
};

exports.markRead = async (req, res) => {
  await prisma.message.update({ where:{ id:req.params.id }, data:{ isRead:true, readAt:new Date() } });
  ok(res, null, 'Marked as read');
};

exports.remove = async (req, res) => {
  await prisma.message.delete({ where:{ id:req.params.id } });
  noContent(res);
};
