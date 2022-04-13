import { BadRequestError } from "../utils/errors";
import Term from "../models/term.model";

/**
 * To create a new term
 */
const addTerm = async (payload) => {
  const { termId, termName, startDate, endDate } = payload;
  try {
    const res = await Term.create({
      termId,
      termName,
      startDate,
      endDate,
    });
    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Failed to create this item.",
    });
  }
};

const updateTerm = async (id, payload) => {
  const { termId, termName, startDate, endDate } = payload;

  try {
    const res = await Term.update(
      { termId, termName, startDate, endDate },
      {
        where: {
          id,
        },
      }
    );
    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Failed to update this item.",
    });
  }
};

export default {
  addTerm,
  updateTerm,
};
