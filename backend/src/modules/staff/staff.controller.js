// src/modules/staff/staff.controller.js
const bcrypt = require('bcryptjs');
const prisma  = require('../../config/db');
const { ok, created, noContent, paginated } = require('../../utils/apiResponse');
const { AppError } = require('../../middleware/errorHandler');
const { generateStaffId } = require('../../utils/generators');

const staffSelect = {
  id:true, staffId:true, department:true, qualification:true,
  hireDate:true, salary:true, bankName:true, accountNumber:true,
  user: { select:{ id:true, firstName:true, lastName:true, email:true, phone:true, role:true, avatarUrl:true, isActive:true } },
};

exports.list = async (req, res) => {
  const { page=1, limit=20, search, role } = req.query;
  const skip = (page-1)*limit;
  const where = {
    schoolId: req.user.schoolId,
    user: {
      ...(search && { OR:[
        { firstName:{ contains:search, mode:'insensitive' } },
        { lastName:{ contains:search, mode:'insensitive' } },
      ]}),
      ...(role && { role }),
    },
  };
  const [staff, total] = await Promise.all([
    prisma.staffProfile.findMany({ where, skip:+skip, take:+limit, select:staffSelect, orderBy:{ user:{ lastName:'asc' } } }),
    prisma.staffProfile.count({ where }),
  ]);
  paginated(res, staff, total, page, limit);
};

exports.create = async (req, res) => {
  const { email, firstName, lastName, phone, role, department, qualification,
          hireDate, salary, bankName, accountNumber, nin, password } = req.body;
  if (!email || !firstName || !lastName || !role || !salary) throw AppError('Required fields missing');

  const passwordHash = await bcrypt.hash(password || 'EduCore@123', 12);
  const school = await prisma.school.findUnique({ where:{ id:req.user.schoolId } });
  const staffId = await generateStaffId(school.code);

  const staffProfile = await prisma.staffProfile.create({
    data: {
      schoolId: req.user.schoolId, staffId,
      department, qualification, salary:+salary, bankName, accountNumber, nin,
      hireDate: hireDate ? new Date(hireDate) : undefined,
      user: {
        create: { schoolId:req.user.schoolId, email:email.toLowerCase(), passwordHash, role, firstName, lastName, phone },
      },
    },
    select: staffSelect,
  });
  created(res, staffProfile, `Staff created. Default password: EduCore@123`);
};

exports.get = async (req, res) => {
  const staff = await prisma.staffProfile.findUnique({ where:{ id:req.params.id }, select:staffSelect });
  if (!staff) throw AppError('Staff not found', 404);
  ok(res, staff);
};

exports.update = async (req, res) => {
  const { firstName, lastName, phone, department, qualification, salary, bankName } = req.body;
  const profile = await prisma.staffProfile.findUnique({ where:{ id:req.params.id } });
  await prisma.user.update({ where:{ id:profile.userId }, data:{ firstName, lastName, phone } });
  const updated = await prisma.staffProfile.update({
    where:{ id:req.params.id },
    data:{ department, qualification, salary:salary?+salary:undefined, bankName },
    select: staffSelect,
  });
  ok(res, updated, 'Staff updated');
};

exports.remove = async (req, res) => {
  const profile = await prisma.staffProfile.findUnique({ where:{ id:req.params.id } });
  await prisma.user.update({ where:{ id:profile.userId }, data:{ isActive:false } });
  noContent(res);
};
