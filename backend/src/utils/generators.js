// src/utils/generators.js
const prisma = require('../config/db');

async function generateStudentId(schoolCode) {
  const year = new Date().getFullYear();
  const count = await prisma.student.count();
  const seq = String(count + 1).padStart(4, '0');
  return `${schoolCode}-${year}-${seq}`;
}

async function generateStaffId(schoolCode) {
  const count = await prisma.staffProfile.count();
  const seq = String(count + 1).padStart(3, '0');
  return `${schoolCode}-STF-${seq}`;
}

async function generateReceiptNumber() {
  const count = await prisma.feePayment.count();
  const seq = String(count + 1).padStart(5, '0');
  return `RCP-${Date.now().toString().slice(-6)}-${seq}`;
}

function computeGrade(total) {
  if (total >= 90) return 'A+';
  if (total >= 80) return 'A';
  if (total >= 70) return 'B';
  if (total >= 60) return 'C';
  if (total >= 50) return 'D';
  return 'F';
}

module.exports = { generateStudentId, generateStaffId, generateReceiptNumber, computeGrade };
