// src/modules/payroll/payroll.controller.js
const prisma = require('../../config/db');
const { ok, created, paginated } = require('../../utils/apiResponse');
const { AppError } = require('../../middleware/errorHandler');

exports.list = async (req, res) => {
  const { page=1, limit=20, month, year, status } = req.query;
  const skip = (page-1)*limit;
  const where = {
    ...(month  && { month:+month }),
    ...(year   && { year:+year }),
    ...(status && { status }),
    staff: { schoolId: req.user.schoolId },
  };
  const [records, total] = await Promise.all([
    prisma.payrollRecord.findMany({
      where, skip:+skip, take:+limit,
      include: { staff: { include: { user:{ select:{ firstName:true, lastName:true } } } } },
      orderBy: [{ year:'desc' },{ month:'desc' }],
    }),
    prisma.payrollRecord.count({ where }),
  ]);
  paginated(res, records, total, page, limit);
};

exports.run = async (req, res) => {
  const { month, year } = req.body;
  if (!month || !year) throw AppError('month and year required');

  const staff = await prisma.staffProfile.findMany({
    where: { schoolId:req.user.schoolId },
    include: { user:{ select:{ isActive:true } } },
  });
  const activeStaff = staff.filter(s => s.user.isActive);

  const ops = activeStaff.map(s => {
    const gross = Number(s.salary);
    const deductions = Math.round(gross * 0.075); // 7.5% deduction
    const net = gross - deductions;
    return prisma.payrollRecord.upsert({
      where: { staffId_month_year: { staffId:s.id, month:+month, year:+year } },
      update: { grossSalary:gross, deductions, netSalary:net, status:'paid', paidAt:new Date() },
      create: { staffId:s.id, grossSalary:gross, deductions, netSalary:net, month:+month, year:+year, status:'paid', paidAt:new Date() },
    });
  });

  const records = await prisma.$transaction(ops);
  const totalNet = records.reduce((s,r) => s+Number(r.netSalary), 0);
  ok(res, { processed:records.length, totalNet }, `Payroll processed for ${records.length} staff`);
};

exports.byStaff = async (req, res) => {
  const records = await prisma.payrollRecord.findMany({
    where: { staffId:req.params.staffId },
    orderBy: [{ year:'desc' },{ month:'desc' }],
  });
  ok(res, records);
};

exports.payslip = async (req, res) => {
  const record = await prisma.payrollRecord.findUnique({
    where: { id:req.params.id },
    include: { staff: { include: { user:{ select:{ firstName:true, lastName:true, email:true } } } } },
  });
  if (!record) throw AppError('Payroll record not found', 404);
  ok(res, record);
};
