// src/modules/documents/documents.controller.js
const prisma = require('../../config/db');
const { ok, created, noContent, paginated } = require('../../utils/apiResponse');
const { AppError } = require('../../middleware/errorHandler');

exports.list = async (req, res) => {
  const { page=1, limit=20, category, relatedType } = req.query;
  const skip = (page-1)*limit;
  const where = {
    schoolId: req.user.schoolId,
    ...(category    && { category }),
    ...(relatedType && { relatedType }),
  };
  const [docs, total] = await Promise.all([
    prisma.document.findMany({
      where, skip:+skip, take:+limit,
      include: { uploadedBy: { select:{ firstName:true, lastName:true } } },
      orderBy: { createdAt:'desc' },
    }),
    prisma.document.count({ where }),
  ]);
  paginated(res, docs, total, page, limit);
};

exports.upload = async (req, res) => {
  const { title, category, fileUrl, fileSize, mimeType, relatedType, relatedId } = req.body;
  if (!title || !fileUrl) throw AppError('title and fileUrl required');
  const doc = await prisma.document.create({
    data: {
      schoolId: req.user.schoolId, uploadedById: req.user.sub,
      title, category: category||'other', fileUrl,
      fileSize: fileSize ? BigInt(fileSize) : undefined,
      mimeType, relatedType, relatedId,
    },
  });
  created(res, { ...doc, fileSize: doc.fileSize?.toString() });
};

exports.get = async (req, res) => {
  const doc = await prisma.document.findUnique({
    where: { id: req.params.id },
    include: { uploadedBy: { select:{ firstName:true, lastName:true } } },
  });
  if (!doc) throw AppError('Document not found', 404);
  ok(res, { ...doc, fileSize: doc.fileSize?.toString() });
};

exports.remove = async (req, res) => {
  await prisma.document.delete({ where: { id: req.params.id } });
  noContent(res);
};

exports.byStudent = async (req, res) => {
  const docs = await prisma.document.findMany({
    where: { schoolId: req.user.schoolId, relatedType: 'student', relatedId: req.params.id },
    orderBy: { createdAt:'desc' },
  });
  ok(res, docs.map(d => ({ ...d, fileSize: d.fileSize?.toString() })));
};

exports.byStaff = async (req, res) => {
  const docs = await prisma.document.findMany({
    where: { schoolId: req.user.schoolId, relatedType: 'staff', relatedId: req.params.id },
    orderBy: { createdAt:'desc' },
  });
  ok(res, docs.map(d => ({ ...d, fileSize: d.fileSize?.toString() })));
};
