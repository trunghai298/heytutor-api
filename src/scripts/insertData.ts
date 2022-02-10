import Department from "../models/department";
import Class from "../models/class";
import Course from "../models/course";
import Student from "../models/student";

export const insertDepartment = async (payload) => {
  await Department.bulkCreate(payload, {
    ignoreDuplicates: true,
    updateOnDuplicate: ["deptId", "deptName"],
  });
};

export const insertCourse = async (payload) => {
  return Course.bulkCreate(payload, {
    ignoreDuplicates: true,
    updateOnDuplicate: ["courseId", "courseName"],
  });
};

export const insertClass = async (payload) => {
  await Class.bulkCreate(payload, {
    ignoreDuplicates: true,
    updateOnDuplicate: ["classId", "className"],
  });
};

export const insertStudent = async (payload) => {
  await Student.bulkCreate(payload, {
    ignoreDuplicates: true,
    updateOnDuplicate: ["stdId", "stdCode"],
  });
};
