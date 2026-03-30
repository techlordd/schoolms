// src/services/pdfService.js
// Puppeteer-based PDF generation
// Requires: npm install puppeteer

let puppeteer;
try { puppeteer = require('puppeteer'); } catch { /* optional dep */ }

/**
 * Generate a PDF from an HTML string.
 * @param {string} html - Full HTML content
 * @returns {Buffer} PDF buffer
 */
async function generatePdf(html) {
  if (!puppeteer) throw new Error('Puppeteer not installed. Run: npm install puppeteer');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' } });
  await browser.close();
  return pdf;
}

/**
 * Build report card HTML from data
 */
function buildReportCardHtml({ student, card, results, school }) {
  const rows = (results || []).map(r => `
    <tr>
      <td>${r.subject?.name}</td>
      <td>${r.ca1Score ?? '—'}</td>
      <td>${r.ca2Score ?? '—'}</td>
      <td>${r.examScore ?? '—'}</td>
      <td><strong>${Number(r.totalScore || 0).toFixed(0)}</strong></td>
      <td>${r.grade || '—'}</td>
      <td>${r.teacherComment || ''}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; color: #111; }
    .header { text-align: center; border-bottom: 2px solid #1a5f4a; padding-bottom: 12px; margin-bottom: 16px; }
    .school-name { font-size: 20px; font-weight: bold; color: #1a5f4a; }
    .student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; padding: 12px; background: #f8f9fa; border-radius: 8px; }
    .info-item label { font-size: 10px; color: #666; text-transform: uppercase; display: block; }
    .info-item span { font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th { background: #1a5f4a; color: white; padding: 8px; text-align: left; font-size: 11px; }
    td { padding: 7px 8px; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) td { background: #f9fafb; }
    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
    .summary-box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; text-align: center; }
    .summary-box .val { font-size: 22px; font-weight: bold; color: #1a5f4a; }
    .summary-box .lbl { font-size: 10px; color: #666; margin-top: 4px; }
    .comments { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 16px; }
    .comments h3 { font-size: 11px; color: #1a5f4a; text-transform: uppercase; margin-bottom: 8px; }
    .comment-row { margin-bottom: 8px; }
    .comment-row label { font-size: 10px; color: #666; }
    .comment-row p { margin-top: 2px; }
    .footer { text-align: center; font-size: 10px; color: #999; border-top: 1px solid #e5e7eb; padding-top: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="school-name">${school?.name || 'EduCore Academy'}</div>
    <div>${school?.address || ''}</div>
    <div style="font-size:14px;font-weight:bold;margin-top:8px;">Student Report Card — Term ${card?.term} · ${card?.academicYear}</div>
  </div>

  <div class="student-info">
    <div class="info-item"><label>Student Name</label><span>${student?.firstName} ${student?.lastName}</span></div>
    <div class="info-item"><label>Student ID</label><span>${student?.studentId}</span></div>
    <div class="info-item"><label>Class</label><span>${card?.class?.name || '—'}</span></div>
    <div class="info-item"><label>Academic Year</label><span>${card?.academicYear}</span></div>
  </div>

  <div class="summary">
    <div class="summary-box"><div class="val">${Number(card?.averageScore || 0).toFixed(1)}%</div><div class="lbl">Average Score</div></div>
    <div class="summary-box"><div class="val">${card?.classPosition || '—'}${card?.classPosition === 1 ? 'st' : card?.classPosition === 2 ? 'nd' : card?.classPosition === 3 ? 'rd' : 'th'}</div><div class="lbl">Class Position</div></div>
    <div class="summary-box"><div class="val">${card?.classSize || '—'}</div><div class="lbl">Class Size</div></div>
  </div>

  <table>
    <thead>
      <tr><th>Subject</th><th>CA1 /20</th><th>CA2 /20</th><th>Exam /60</th><th>Total</th><th>Grade</th><th>Remark</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="comments">
    <h3>Teacher Comments</h3>
    <div class="comment-row"><label>Class Teacher:</label><p>${card?.classTeacherComment || 'No comment.'}</p></div>
    <div class="comment-row"><label>Head Teacher:</label><p>${card?.headComment || 'No comment.'}</p></div>
    ${card?.nextTermBegins ? `<div class="comment-row"><label>Next Term Begins:</label><p>${new Date(card.nextTermBegins).toDateString()}</p></div>` : ''}
  </div>

  <div class="footer">Generated by EduCore SMS · ${new Date().toDateString()}</div>
</body>
</html>`;
}

/**
 * Build payslip HTML
 */
function buildPayslipHtml({ staff, record, school }) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; color: #111; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #1a5f4a; padding-bottom: 12px; margin-bottom: 16px; }
    .school-name { font-size: 18px; font-weight: bold; color: #1a5f4a; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f3f4f6; padding: 8px; text-align: left; font-size: 11px; }
    td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
    .total-row td { font-weight: bold; background: #1a5f4a; color: white; }
  </style>
</head>
<body>
  <div class="header">
    <div><div class="school-name">${school?.name || 'EduCore Academy'}</div><div>Payslip</div></div>
    <div style="text-align:right"><div><strong>Month:</strong> ${record?.month}/${record?.year}</div><div><strong>Status:</strong> ${record?.status?.toUpperCase()}</div></div>
  </div>
  <p><strong>Staff:</strong> ${staff?.user?.firstName} ${staff?.user?.lastName} (${staff?.staffId})</p>
  <p><strong>Department:</strong> ${staff?.department || '—'}</p>
  <br/>
  <table>
    <tr><th>Description</th><th>Amount (₦)</th></tr>
    <tr><td>Gross Salary</td><td>${Number(record?.grossSalary).toLocaleString()}</td></tr>
    <tr><td>Deductions (Tax/Pension)</td><td>(${Number(record?.deductions).toLocaleString()})</td></tr>
    <tr class="total-row"><td>Net Salary</td><td>${Number(record?.netSalary).toLocaleString()}</td></tr>
  </table>
  <br/>
  <p style="font-size:10px;color:#999">Generated by EduCore SMS · ${new Date().toDateString()}</p>
</body>
</html>`;
}

module.exports = { generatePdf, buildReportCardHtml, buildPayslipHtml };
