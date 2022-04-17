import Event from "../models/event.model";
import { NotFoundError, BadRequestError } from "../utils/errors";
import { Op } from "sequelize";
import { map, compact, flattenDeep } from "lodash";
import Post from "../models/post.model";

const getTop3EventByMajor = async (major) => {
  return Event.findAll({
    where: {
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

const getTop3EventBySubjects = async (subjects) => {
  const subjectData = JSON.parse(subjects);
  const listEvents = await Promise.all(
    map(subjectData, async (subject) => {
      const event = await Event.findAll({
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
    getTop3EventBySubjects(subjects),
    getTop3PostsBySubjects(subjects),
  ]);

  return {
    top3EventByMajor,
    top3EventBySubjects,
    top3Post,
  };
};

export default {
  suggestHome,
};
