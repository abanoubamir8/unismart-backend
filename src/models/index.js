const sequelize = require('../lib/db/sequelize');
const User = require('./User');
const Session = require('./Session');
const Department = require('./Department');
const Course = require('./Course');
const Prerequisite = require('./Prerequisite');
const Enrollment = require('./Enrollment');
const Grade = require('./Grade');

User.hasMany(Session, { foreignKey: 'user_id' });
Session.belongsTo(User, { foreignKey: 'user_id' });

Department.belongsTo(User, { as: 'Head', foreignKey: 'head_id' });
User.hasMany(Department, { foreignKey: 'head_id' });

Department.hasMany(Course, { foreignKey: 'department_id' });
Course.belongsTo(Department, { foreignKey: 'department_id' });

Course.belongsToMany(Course, {
  as: 'Prerequisites',
  through: Prerequisite,
  foreignKey: 'course_id',
  otherKey: 'prerequisite_id'
});

User.hasMany(Enrollment, { foreignKey: 'student_id' });
Enrollment.belongsTo(User, { foreignKey: 'student_id' });

Course.hasMany(Enrollment, { foreignKey: 'course_id' });
Enrollment.belongsTo(Course, { foreignKey: 'course_id' });

User.hasMany(Grade, { foreignKey: 'student_id' });
Grade.belongsTo(User, { foreignKey: 'student_id' });

Course.hasMany(Grade, { foreignKey: 'course_id' });
Grade.belongsTo(Course, { foreignKey: 'course_id' });

module.exports = {
  sequelize,
  User,
  Session,
  Department,
  Course,
  Prerequisite,
  Enrollment,
  Grade,
};
