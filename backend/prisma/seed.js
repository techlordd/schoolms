// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding EduCore database...');

  // School
  const school = await prisma.school.upsert({
    where: { code: 'ECS' },
    update: {},
    create: {
      name: 'EduCore Academy',
      code: 'ECS',
      address: '12 Learning Lane, Lagos, Nigeria',
      phone: '+234-801-234-5678',
      email: 'info@educoreacademy.ng',
      currentTerm: 2,
      currentYear: '2024/2025',
    },
  });
  console.log('✓ School created:', school.name);

  const hash = (p) => bcrypt.hashSync(p, 10);

  // Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@educore.ng' },
    update: {},
    create: {
      schoolId: school.id, email: 'admin@educore.ng',
      passwordHash: hash('Admin@123'), role: 'admin',
      firstName: 'Amara', lastName: 'Osei', phone: '+234-801-000-0001',
    },
  });

  const headTeacher = await prisma.user.upsert({
    where: { email: 'head@educore.ng' },
    update: {},
    create: {
      schoolId: school.id, email: 'head@educore.ng',
      passwordHash: hash('Head@123'), role: 'head_teacher',
      firstName: 'Yaw', lastName: 'Darko', phone: '+234-801-000-0002',
    },
  });

  const teacher1 = await prisma.user.upsert({
    where: { email: 'teacher1@educore.ng' },
    update: {},
    create: {
      schoolId: school.id, email: 'teacher1@educore.ng',
      passwordHash: hash('Teacher@123'), role: 'class_teacher',
      firstName: 'Abena', lastName: 'Asante', phone: '+234-801-000-0003',
    },
  });

  const teacher2 = await prisma.user.upsert({
    where: { email: 'teacher2@educore.ng' },
    update: {},
    create: {
      schoolId: school.id, email: 'teacher2@educore.ng',
      passwordHash: hash('Teacher@123'), role: 'teacher',
      firstName: 'Kofi', lastName: 'Gyimah', phone: '+234-801-000-0004',
    },
  });

  const parent1 = await prisma.user.upsert({
    where: { email: 'parent1@educore.ng' },
    update: {},
    create: {
      schoolId: school.id, email: 'parent1@educore.ng',
      passwordHash: hash('Parent@123'), role: 'parent',
      firstName: 'Emmanuel', lastName: 'Mensah', phone: '+234-801-000-0005',
    },
  });

  console.log('✓ Users created');

  // Classes
  const classP3A = await prisma.class.upsert({
    where: { id: 'cls-p3a-2025' },
    update: {},
    create: {
      id: 'cls-p3a-2025',
      schoolId: school.id, name: 'Primary 3A', level: 'P3',
      classTeacherId: teacher1.id, capacity: 35, academicYear: '2024/2025',
    },
  });

  const classKG1 = await prisma.class.upsert({
    where: { id: 'cls-kg1-2025' },
    update: {},
    create: {
      id: 'cls-kg1-2025',
      schoolId: school.id, name: 'KG1', level: 'KG1',
      capacity: 25, academicYear: '2024/2025',
    },
  });

  const classP5 = await prisma.class.upsert({
    where: { id: 'cls-p5-2025' },
    update: {},
    create: {
      id: 'cls-p5-2025',
      schoolId: school.id, name: 'Primary 5', level: 'P5',
      capacity: 40, academicYear: '2024/2025',
    },
  });

  console.log('✓ Classes created');

  // Subjects
  const subjects = await Promise.all([
    'Mathematics', 'English Language', 'Basic Science', 'Social Studies',
    'French', 'Creative Arts', 'Physical Education', 'Religious Studies',
  ].map((name, i) =>
    prisma.subject.upsert({
      where: { id: `subj-${i + 1}` },
      update: {},
      create: {
        id: `subj-${i + 1}`,
        schoolId: school.id, name,
        code: name.split(' ').map(w => w[0]).join('').toUpperCase(),
      },
    })
  ));
  console.log('✓ Subjects created');

  // Class-Subject assignments
  for (const subject of subjects.slice(0, 6)) {
    await prisma.classSubject.upsert({
      where: { classId_subjectId: { classId: classP3A.id, subjectId: subject.id } },
      update: {},
      create: { classId: classP3A.id, subjectId: subject.id, teacherId: teacher2.id },
    });
  }

  // Students
  const studentData = [
    { firstName: 'Kofi', lastName: 'Mensah', dob: '2015-03-12', gender: 'male', id: 'ECS-2025-0001' },
    { firstName: 'Ama', lastName: 'Boateng', dob: '2015-07-22', gender: 'female', id: 'ECS-2025-0002' },
    { firstName: 'Kwame', lastName: 'Asante', dob: '2015-11-05', gender: 'male', id: 'ECS-2025-0003' },
    { firstName: 'Abena', lastName: 'Darko', dob: '2015-01-18', gender: 'female', id: 'ECS-2025-0004' },
    { firstName: 'Yaw', lastName: 'Ofori', dob: '2015-09-30', gender: 'male', id: 'ECS-2025-0005' },
    { firstName: 'Efua', lastName: 'Poku', dob: '2016-02-14', gender: 'female', id: 'ECS-2025-0006' },
  ];

  const students = await Promise.all(studentData.map(s =>
    prisma.student.upsert({
      where: { studentId: s.id },
      update: {},
      create: {
        schoolId: school.id, classId: classP3A.id,
        studentId: s.id, firstName: s.firstName, lastName: s.lastName,
        dateOfBirth: new Date(s.dob), gender: s.gender,
      },
    })
  ));

  // Link parent to first student
  await prisma.parentStudent.upsert({
    where: { parentId_studentId: { parentId: parent1.id, studentId: students[0].id } },
    update: {},
    create: { parentId: parent1.id, studentId: students[0].id, relationship: 'father', isPrimary: true },
  });

  console.log('✓ Students created');

  // Attendance (today)
  const today = new Date(); today.setHours(0, 0, 0, 0);
  await Promise.all(students.map((s, i) =>
    prisma.attendance.upsert({
      where: { studentId_date: { studentId: s.id, date: today } },
      update: {},
      create: {
        schoolId: school.id, studentId: s.id, classId: classP3A.id,
        date: today, status: i === 2 ? 'absent' : i === 3 ? 'late' : 'present',
        markedById: teacher1.id, term: 2, academicYear: '2024/2025',
      },
    })
  ));

  // Results
  const scoreData = [
    [18, 19, 58], [15, 17, 52], [12, 14, 45], [20, 18, 60], [16, 15, 50], [14, 16, 54],
  ];
  for (const subject of subjects.slice(0, 5)) {
    await Promise.all(students.map((s, i) => {
      const [ca1, ca2, exam] = scoreData[i];
      const total = ca1 + ca2 + exam;
      const grade = total >= 90 ? 'A+' : total >= 80 ? 'A' : total >= 70 ? 'B' : total >= 60 ? 'C' : total >= 50 ? 'D' : 'F';
      return prisma.result.upsert({
        where: { studentId_subjectId_term_academicYear: { studentId: s.id, subjectId: subject.id, term: 2, academicYear: '2024/2025' } },
        update: {},
        create: {
          schoolId: school.id, studentId: s.id, classId: classP3A.id,
          subjectId: subject.id, teacherId: teacher2.id,
          ca1Score: ca1, ca2Score: ca2, examScore: exam, totalScore: total, grade,
          term: 2, academicYear: '2024/2025',
        },
      });
    }));
  }

  // Fee structures
  for (const [level, amount] of [['KG1', 45000], ['KG2', 45000], ['P1', 55000], ['P2', 55000], ['P3', 60000], ['P4', 60000], ['P5', 65000]]) {
    await prisma.feeStructure.upsert({
      where: { schoolId_classLevel_term_academicYear: { schoolId: school.id, classLevel: level, term: 2, academicYear: '2024/2025' } },
      update: {},
      create: { schoolId: school.id, classLevel: level, amount, term: 2, academicYear: '2024/2025', description: `Term 2 School Fees - ${level}` },
    });
  }

  // Staff profiles
  await prisma.staffProfile.upsert({
    where: { userId: teacher1.id },
    update: {},
    create: {
      userId: teacher1.id, schoolId: school.id, staffId: 'ECS-STF-001',
      department: 'Primary', salary: 180000, hireDate: new Date('2020-09-01'),
    },
  });

  await prisma.staffProfile.upsert({
    where: { userId: headTeacher.id },
    update: {},
    create: {
      userId: headTeacher.id, schoolId: school.id, staffId: 'ECS-STF-002',
      department: 'Administration', salary: 350000, hireDate: new Date('2018-01-15'),
    },
  });

  // Announcements
  await prisma.announcement.createMany({
    data: [
      { schoolId: school.id, authorId: headTeacher.id, title: 'End-of-Term Exams begin Feb 3rd', body: 'All students are required to be present. Exam timetable attached.', audience: ['all'], pinned: true },
      { schoolId: school.id, authorId: admin.id, title: 'Parent-Teacher Meeting — Jan 28, 3pm', body: 'Parents are invited to meet with class teachers to discuss student progress.', audience: ['parent', 'teacher'] },
    ],
    skipDuplicates: true,
  });

  // Calendar events
  await prisma.calendarEvent.createMany({
    data: [
      { schoolId: school.id, createdById: headTeacher.id, title: 'Science Fair', eventType: 'activity', startDate: new Date('2025-01-21T10:00:00Z'), location: 'Main Hall', audience: ['all'] },
      { schoolId: school.id, createdById: admin.id, title: 'End-of-Term Exams', eventType: 'exam', startDate: new Date('2025-02-03T08:00:00Z'), endDate: new Date('2025-02-14T15:00:00Z'), audience: ['all'] },
    ],
    skipDuplicates: true,
  });

  console.log('✓ Announcements & calendar events created');
  console.log('\n✅ Seed complete!');
  console.log('\n📋 Login credentials:');
  console.log('  Admin:       admin@educore.ng     / Admin@123');
  console.log('  Head Teacher: head@educore.ng      / Head@123');
  console.log('  Teacher:     teacher1@educore.ng  / Teacher@123');
  console.log('  Parent:      parent1@educore.ng   / Parent@123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
