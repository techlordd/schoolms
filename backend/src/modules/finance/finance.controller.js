// src/modules/finance/finance.controller.js
const prisma = require('../../config/db');
const { ok, created, paginated } = require('../../utils/apiResponse');
const { AppError } = require('../../middleware/errorHandler');
const { generateReceiptNumber } = require('../../utils/generators');

exports.dashboard = async (req, res) => {
  const { term=2, academicYear='2024/2025' } = req.query;
  const schoolId = req.user.schoolId;

  const [payments, expenses, staffCount, studentCount] = await Promise.all([
    prisma.feePayment.aggregate({
      where: { schoolId, term:+term, academicYear },
      _sum: { amountPaid:true, amountDue:true },
      _count: { id:true },
    }),
    prisma.expense.aggregate({
      where: { schoolId },
      _sum: { amount:true },
    }),
    prisma.staffProfile.count({ where: { schoolId } }),
    prisma.student.count({ where: { schoolId, isActive:true } }),
  ]);

  const totalCollected = Number(payments._sum.amountPaid||0);
  const totalDue       = Number(payments._sum.amountDue||0);
  const totalExpenses  = Number(expenses._sum.amount||0);

  ok(res, {
    totalCollected, totalDue,
    outstanding: totalDue - totalCollected,
    totalExpenses,
    netBalance: totalCollected - totalExpenses,
    transactionCount: payments._count.id,
    staffCount, studentCount,
    collectionRate: totalDue ? Math.round(totalCollected/totalDue*100) : 0,
  });
};

exports.listPayments = async (req, res) => {
  const { page=1, limit=20, term, academicYear, studentId } = req.query;
  const skip = (page-1)*limit;
  const where = {
    schoolId: req.user.schoolId,
    ...(term && { term:+term }),
    ...(academicYear && { academicYear }),
    ...(studentId && { studentId }),
  };
  const [payments, total] = await Promise.all([
    prisma.feePayment.findMany({
      where, skip:+skip, take:+limit,
      include: { student:{ select:{ firstName:true, lastName:true, studentId:true } } },
      orderBy: { paymentDate:'desc' },
    }),
    prisma.feePayment.count({ where }),
  ]);
  paginated(res, payments, total, page, limit);
};

exports.recordPayment = async (req, res) => {
  const { studentId, amountPaid, amountDue, paymentDate, paymentMethod, term, academicYear, notes } = req.body;
  if (!studentId || !amountPaid || !amountDue) throw AppError('Required fields missing');
  const receiptNumber = await generateReceiptNumber();
  const payment = await prisma.feePayment.create({
    data: {
      schoolId:req.user.schoolId, studentId,
      amountPaid:+amountPaid, amountDue:+amountDue,
      paymentDate: new Date(paymentDate||Date.now()),
      paymentMethod: paymentMethod||'cash',
      receiptNumber, recordedById:req.user.sub,
      term:+term, academicYear, notes,
    },
    include: { student:{ select:{ firstName:true, lastName:true } } },
  });
  // Notify parent
  const io = req.app.get('io');
  const links = await prisma.parentStudent.findMany({ where:{ studentId }, select:{ parentId:true } });
  links.forEach(l => io?.to(l.parentId).emit('payment_recorded', { receiptNumber, amountPaid }));

  created(res, payment, `Payment recorded. Receipt: ${receiptNumber}`);
};

exports.studentPayments = async (req, res) => {
  const payments = await prisma.feePayment.findMany({
    where: { studentId:req.params.studentId },
    orderBy: { paymentDate:'desc' },
  });
  const totalPaid = payments.reduce((s,p) => s + Number(p.amountPaid), 0);
  const totalDue  = payments.reduce((s,p) => s + Number(p.amountDue), 0);
  ok(res, { payments, summary:{ totalPaid, totalDue, balance: totalDue - totalPaid } });
};

exports.outstanding = async (req, res) => {
  const { term=2, academicYear='2024/2025' } = req.query;
  const payments = await prisma.feePayment.findMany({
    where: { schoolId:req.user.schoolId, term:+term, academicYear },
    include: { student:{ select:{ firstName:true, lastName:true, studentId:true, class:{ select:{ name:true } } } } },
  });
  const outstanding = payments.filter(p => Number(p.amountDue) > Number(p.amountPaid));
  ok(res, outstanding.map(p => ({
    ...p, balance: Number(p.amountDue) - Number(p.amountPaid),
  })));
};

exports.receiptPdf = async (req, res) => {
  const payment = await prisma.feePayment.findUnique({ where:{ id:req.params.id } });
  if (!payment) throw AppError('Payment not found', 404);
  if (payment.receiptUrl) return res.redirect(payment.receiptUrl);
  ok(res, { message:'PDF generation requires Puppeteer setup', receipt:payment });
};

exports.feeStructures = async (req, res) => {
  const { term, academicYear } = req.query;
  const structures = await prisma.feeStructure.findMany({
    where: {
      schoolId:req.user.schoolId,
      ...(term && { term:+term }),
      ...(academicYear && { academicYear }),
    },
    orderBy: { classLevel:'asc' },
  });
  ok(res, structures);
};

exports.createFeeStructure = async (req, res) => {
  const { classLevel, amount, term, academicYear, description } = req.body;
  const structure = await prisma.feeStructure.upsert({
    where: { schoolId_classLevel_term_academicYear: { schoolId:req.user.schoolId, classLevel, term:+term, academicYear } },
    update: { amount:+amount, description },
    create: { schoolId:req.user.schoolId, classLevel, amount:+amount, term:+term, academicYear, description },
  });
  created(res, structure);
};

exports.listExpenses = async (req, res) => {
  const { page=1, limit=20, category } = req.query;
  const skip = (page-1)*limit;
  const where = { schoolId:req.user.schoolId, ...(category && { category }) };
  const [items, total] = await Promise.all([
    prisma.expense.findMany({ where, skip:+skip, take:+limit, orderBy:{ date:'desc' } }),
    prisma.expense.count({ where }),
  ]);
  paginated(res, items, total, page, limit);
};

exports.recordExpense = async (req, res) => {
  const { category, description, amount, date } = req.body;
  const expense = await prisma.expense.create({
    data: { schoolId:req.user.schoolId, category, description, amount:+amount, date:new Date(date||Date.now()), recordedById:req.user.sub },
  });
  created(res, expense);
};

exports.report = async (req, res) => {
  const { term=2, academicYear='2024/2025' } = req.query;
  const schoolId = req.user.schoolId;
  const [payments, expenses, payroll] = await Promise.all([
    prisma.feePayment.findMany({ where:{ schoolId, term:+term, academicYear } }),
    prisma.expense.findMany({ where:{ schoolId } }),
    prisma.payrollRecord.findMany({ where:{ status:'paid' } }),
  ]);
  const income     = payments.reduce((s,p) => s+Number(p.amountPaid),0);
  const expTotal   = expenses.reduce((s,e) => s+Number(e.amount),0);
  const payrollTotal = payroll.reduce((s,p) => s+Number(p.netSalary),0);
  ok(res, { income, expenses:expTotal, payroll:payrollTotal, net: income-expTotal-payrollTotal });
};
