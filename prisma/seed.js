const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log("Starting DB seed from JSON files...");
  
  const dataDir = path.join(__dirname, '../data');
  const loadData = (filename) => {
      const filePath = path.join(dataDir, filename);
      if (fs.existsSync(filePath)) {
          return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
      return [];
  };

  const admins = loadData('admins.json');
  const courses = loadData('courses.json');
  const students = loadData('students.json');
  const logs = loadData('logs.json');

  // Seed Admins
  for (const admin of admins) {
    await prisma.admin.upsert({
      where: { username: admin.username },
      update: {},
      create: {
        username: admin.username,
        password: admin.password,
        name: admin.name
      }
    });
  }
  console.log(`Seeded ${admins.length} admins.`);

  // Seed Courses
  for (const course of courses) {
    const courseData = {
      code: course.code,
      name: course.name,
      creditHours: course.creditHours,
      level: course.level,
      term: course.term || 1,
      prerequisites: course.prerequisites || "",
      professor: course.professor || "TBA",
      capacity: course.capacity || 60,
      status: course.status || "Available",
      department: course.department || "General"
    };

    await prisma.course.upsert({
      where: { code: course.code },
      update: courseData,
      create: courseData
    });
  }
  console.log(`Seeded ${courses.length} courses.`);

  // Seed Students
  for (const student of students) {
    await prisma.student.upsert({
      where: { universityId: student.studentId },
      update: {},
      create: {
        universityId: student.studentId,
        name: student.name,
        password: student.password,
        email: student.email,
        gpa: student.gpa,
        passedHours: student.passedHours,
        department: student.department || 'General',
        registeredCourses: student.registeredCourses || [],
        academicHistory: student.academicHistory || []
      }
    });
  }
  console.log(`Seeded ${students.length} students.`);

  // Seed Logs
  if (logs.length > 0) {
    await prisma.adminLog.deleteMany({});
    
    // Map to the Prisma model
    const logData = logs.map(l => ({
        studentId: l.studentId,
        studentName: l.studentName || l.studentId,
        courseCode: l.courseCode,
        courseName: l.courseName || l.courseCode,
        timestamp: l.timestamp ? new Date(l.timestamp) : new Date()
    }));
    await prisma.adminLog.createMany({ data: logData });
    console.log(`Seeded ${logs.length} logs.`);
  }

  console.log("Seeding finished successfully.");
}

main()
  .catch(e => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
