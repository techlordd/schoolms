// src/modules/results/reportCards.controller.js
const prisma = require('../../config/db');
const { ok, created } = require('../../utils/apiResponse');
const { AppError } = require('../../middleware/errorHandler');

exports.generate = async (req, res) => {
  const { classId, term, academicYear } = req.body;
  if (!classId || !term || !academicYear) throw AppError('classId, term, academicYear required');

  const students = await prisma.student.findMany({
    where: { classId, isActive:true },
  });

  const ops = students.map(s =>
    prisma.reportCard.upsert({
      where: { studentId_term_academicYear: { studentId:s.id, term:+term, academicYear } },
      update: {},
      create: { studentId:s.id, classId, term:+term, academicYear },
    })
  );
  const cards = await prisma.$transaction(ops);
  ok(res, { generated: cards.length }, 'Report cards generated');
};

exports.get = async (req, res) => {
  const { term, academicYear } = req.query;
  const card = await prisma.reportCard.findFirst({
    where: { studentId:req.params.studentId, term:+term, academicYear },
    include: {
      student: {
        select: { firstName:true, lastName:true, studentId:true, photoUrl:true,
          class: { select: { name:true, level:true } },
        },
      },
      class: { select: { name:true, level:true } },
    },
  });
  if (!card) throw AppError('Report card not found', 404);

  // Also get individual subject results
  const results = await prisma.result.findMany({
    where: { studentId:req.params.studentId, term:+term, academicYear },
    include: { subject: { select: { name:true, code:true } } },
    orderBy: { subject: { name:'asc' } },
  });

  ok(res, { card, results });
};

exports.publish = async (req, res) => {
  const card = await prisma.reportCard.update({
    where: { id:req.params.id },
    data: { published: true },
  });
  // Notify parent via socket.io
  const io = req.app.get('io');
  const parentLinks = await prisma.parentStudent.findMany({
    where: { studentId: card.studentId },
    select: { parentId:true },
  });
  parentLinks.forEach(p => {
    io?.to(p.parentId).emit('report_card_published', { cardId:card.id, term:card.term });
  });
  ok(res, card, 'Report card published');
};

exports.addComments = async (req, res) => {
  const { headComment, classTeacherComment, nextTermBegins } = req.body;
  const card = await prisma.reportCard.update({
    where: { id:req.params.id },
    data: {
      headComment, classTeacherComment,
      ...(nextTermBegins && { nextTermBegins: new Date(nextTermBegins) }),
    },
  });
  ok(res, card, 'Comments updated');
};

exports.pdf = async (req, res) => {
  // In production: use puppeteer to render HTML template -> PDF
  // For now return a placeholder
  const card = await prisma.reportCard.findUnique({ where:{ id:req.params.id } });
  if (!card) throw AppError('Report card not found', 404);
  if (card.pdfUrl) return res.redirect(card.pdfUrl);
  ok(res, { message: 'PDF generation requires Puppeteer setup. See services/pdfService.js' });
};
