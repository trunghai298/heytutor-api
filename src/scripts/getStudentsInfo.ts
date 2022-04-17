const axios = require("axios");
import cheerio from "cheerio";
import { getUrl } from "../utils/getUrl";
import { TERMS } from "../data/term";
import { promises as fs } from "fs";
import { map, startCase, flattenDeep, compact, find } from "lodash";
import moment from "moment";
import {
  insertClass,
  insertCourse,
  insertDepartment,
  insertStudent,
} from "./insertData";

const fapCookie =
  "G_ENABLED_IDPS=google; __utmz=213851395.1640923448.87.2.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); ASP.NET_SessionId=l5khh5baat1r1p1nwlhq3gkz; __utma=213851395.1678693079.1637601335.1644566900.1644674193.131; __utmc=213851395; __utmt=1; G_AUTHUSER_H=2; __utmb=213851395.4.10.1644674193";

const getRawHtml = async (url: string, fapCookie: string) => {
  try {
    const res = await axios.get(url, {
      headers: {
        Cookie: fapCookie,
      },
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

const getDepartmentByTerm = async (termId: number, htmlData: any) => {
  const $ = cheerio.load(htmlData);
  const tableBody = $("#ctl00_mainContent_divDepartment > table > tbody");
  const departmentList: any = [];
  $("tr", tableBody).map((index, elem) => {
    const tdData = elem.children.map((td) => {
      return $(td).text();
    });

    const deptName = startCase(tdData[0]);
    const deptId = parseInt($("a", elem).attr("href")?.split("dept=")[1]) || "";

    const departmentData = {
      termId,
      deptId,
      deptName,
    };

    departmentList.push(departmentData);
  });

  return departmentList;
};

const getCourseByDepartment = async (deptId: number, htmlData: any) => {
  const $ = cheerio.load(htmlData);
  const tableBody = $("#ctl00_mainContent_divCourse > table > tbody");
  const courseList: any = [];
  $("tr", tableBody).map((index, elem) => {
    const tdData = elem.children.map((td) => {
      return $(td).text();
    });

    const courseName = tdData[0];
    const courseCode = tdData[0].split("(")[1].split(")")[0];
    const courseId =
      parseInt($("a", elem).attr("href")?.split("course=")[1]) || "";
    const courseData = {
      deptId,
      courseId,
      courseName,
      courseCode,
    };

    courseList.push(courseData);
  });

  return courseList;
};

const getClassesByCourse = async (
  deptId: number,
  courseId: number,
  htmlData: any
) => {
  const $ = cheerio.load(htmlData);
  const tableBody = $("#ctl00_mainContent_divGroup > table > tbody");
  const classList: any = [];
  $("tr", tableBody).map((index, elem) => {
    const tdData = elem.children.map((td) => {
      const className = $(td).text();
      const classId = parseInt($("a", elem).attr("href").split("=")[1]);
      return { deptId, courseId, className, classId };
    });

    classList.push(tdData);
  });

  return flattenDeep(classList);
};

const getListStudentByClass = async (
  classId: number,
  className: string,
  htmlData: any
) => {
  const $ = cheerio.load(htmlData);
  // get student table
  const tableBody = $("#ctl00_mainContent_divStudents > table > tbody");
  const subjectBody = $(
    "#ctl00_mainContent_divCourse > table > tbody > tr > td > b"
  );

  const classList: any = [];

  $("tr", tableBody).map((index, elem) => {
    // get student data by row
    const tdData = elem.children.map((td) => {
      const imageSrc = $("center > img", elem).attr("src");
      const imageUrl = "https://fap.fpt.edu.vn/" + imageSrc.split("../")[1];
      const tdContent = $(td).text() === "" ? imageUrl : $(td).text();
      return tdContent;
    });
    // create student object
    const studentData = {
      stdCode: tdData[2],
      stdId: tdData[3],
      classId,
      className,
      semester: "Summer 2021",
      subject: $(subjectBody).text().split("(")[1].split(")")[0],
      major: tdData[3].slice(0, 2),
      fullName: tdData[4] + " " + tdData[5] + " " + tdData[6],
    };

    classList.push(studentData);
  });
  return classList;
};

export const fetchFapData = async (fapCookie: string, termId: string) => {
  try {
    console.log("fapCookie", fapCookie);
    const startAt = moment().format();
    console.log("***Start at***: ", startAt);
    const term = find(TERMS, (t) => t.termId === parseInt(termId));
    const urlGetDeptByTerm = getUrl(`&term=${term.termId}`);
    const rawDeptHtml = await getRawHtml(urlGetDeptByTerm, fapCookie);
    const dataDept = await getDepartmentByTerm(term.termId, rawDeptHtml);
    // insert department data to database
    await insertDepartment(dataDept);
    console.log(
      `*** fetching list departments of ${term.termName} ${moment().from(
        startAt
      )} ***`
    );

    if (dataDept.length === 0) {
      console.log("Cookie is expired");
      process.exit(1);
    }

    await Promise.all(
      map(dataDept, async (dept) => {
        const urlGetCourseByDept = getUrl(
          `&term=${term.termId}&dept=${dept.deptId}`
        );
        const rawCourseHtml = await getRawHtml(urlGetCourseByDept, fapCookie);
        const dataCourse = await getCourseByDepartment(
          dept.deptId,
          rawCourseHtml
        );

        // insert course data to database
        await insertCourse(dataCourse);

        console.log(
          `*** fetching list coursew of ${dept.deptName} ${moment().from(
            startAt
          )} ***`
        );

        const courseData = await Promise.all(
          map(dataCourse, async (c) => {
            const urlGetClassesByCourse = getUrl(
              `&term=${term.termId}&dept=${dept.deptId}&course=${c.courseId}`
            );
            const rawClassHtml = await getRawHtml(
              urlGetClassesByCourse,
              fapCookie
            );
            const dataClass = await getClassesByCourse(
              dept.deptId,
              c.courseId,
              rawClassHtml
            );

            // insert course data to database
            await insertClass(dataClass);

            console.log(
              `*** fetching list classes of ${c.courseName} ${moment().from(
                startAt
              )} ***`
            );
            const studentOfAClass = await Promise.all(
              map(dataClass, async (cl: any) => {
                const urlGetStudentByClass = getUrl(`&group=${cl.classId}`);
                const rawStudentHtml = await getRawHtml(
                  urlGetStudentByClass,
                  fapCookie
                );
                const dataStudent = await getListStudentByClass(
                  cl.classId,
                  cl.className,
                  rawStudentHtml
                );

                // insert student data to database
                await insertStudent(dataStudent);

                console.log(
                  `*** fetching list students of ${
                    cl.className
                  } ${moment().from(startAt)} ***`
                );
                return { ...cl, students: dataStudent };
              })
            );
            return { ...c, classes: studentOfAClass };
          })
        );
        return { ...dept, courses: compact(courseData) };
      })
      // const termData = { ...term, departments: deptData };
      // const dir = __dirname + `/../data/${term.termName}`;

      // try {
      //   const stats = await fs.lstat(dir);
      //   if (stats.isDirectory()) {
      //     console.log("Directory exists.");
      //   } else {
      //     await fs.mkdir(dir);
      //   }
      // } catch (error) {
      //   console.log(error);
      //   await fs.mkdir(dir);
      // }

      // const path = __dirname + `/../data/${term.termName}/data.json`;
      // await fs.writeFile(path, JSON.stringify(termData));
    );
    console.log(`***Done ${moment().from(startAt)}***`);
  } catch (error) {
    console.log(error);
  }
};
