import Event from "../models/event.model";
import { NotFoundError, BadRequestError } from "../utils/errors";
import { Op, Sequelize } from "sequelize";
import { map, compact, flattenDeep } from "lodash";
import Post from "../models/post.model";
import UserEvent from "../models/user-event.model";
import UserPost from "../models/user-post.model";
import Course from "../models/course.model";

const getTop3EventByMajor = async (major) => {
  return Event.findAll({
    where: {
      isApproved: 1,
      hashtag: {
        [Op.like]: `%${major}%`,
      },
    },
    raw: true,
    order: [["createdAt", "DESC"]],
    limit: 3,
    offset: 0,
  });
};

const getTop3EventBySubjects = async (userId, subjects) => {
  const subjectData = JSON.parse(subjects);
  const listEvents = await Promise.all(
    map(subjectData, async (subject) => {
      const events = await Event.findAll({
        where: {
          isApproved: 1,
          hashtag: {
            [Op.like]: `%${subject}%`,
          },
        },
        raw: true,
        order: [["createdAt", "DESC"]],
        limit: 3,
        offset: 0,
      });

      const eventWithDetail = await Promise.all(
        map(events, async (eventItem) => {
          const nbPosts = await UserPost.findAll({
            where: { eventId: eventItem.id },
            raw: true,
          });

          const nbUserJoint = await UserEvent.findAll({
            where: { eventId: eventItem.id },
            attributes: [
              [Sequelize.fn("DISTINCT", Sequelize.col("userId")), "userId"],
            ],
            raw: true,
          });

          return {
            ...eventItem,
            nbPosts: nbPosts.length,
            nbUserJoint: nbUserJoint.length,
          };
        })
      );

      return eventWithDetail;
    })
  );

  return compact(flattenDeep(listEvents));
};

const getTop3PostsBySubjects = async (subjects) => {
  const subjectData = JSON.parse(subjects);
  const listPost = await Promise.all(
    map(subjectData, async (subject) => {
      const event = await Post.findAll({
        where: {
          hashtag: {
            [Op.like]: `%${subject}%`,
          },
        },
        raw: true,
        order: [["createdAt", "DESC"]],
        limit: 3,
        offset: 0,
      });
      return event;
    })
  );

  return compact(flattenDeep(listPost));
};

const suggestHome = async (ctx) => {
  const { user } = ctx;

  const { major, subjects } = user;

  const [top3EventByMajor, top3EventBySubjects, top3Post] = await Promise.all([
    getTop3EventByMajor(major),
    getTop3EventBySubjects(user.id, subjects),
    getTop3PostsBySubjects(subjects),
  ]);

  return {
    top3EventByMajor,
    top3EventBySubjects,
    top3Post,
  };
};

const getListCourse = async () => {
  const listCourse = await Course.findAll({
    raw: true,
    attributes: ["courseId", "courseName", "courseCode"],
  });

  return listCourse;
};

export default {
  suggestHome,
  getListCourse,
};
