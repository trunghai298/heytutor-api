import { BadRequestError } from "../utils/errors";
import Term from "../models/term.model";

/**
 * To create a new term
 */
const addTerm = async (payload) => {
  try {
    const res = await Term.create({
      id: payload.id,
      termName: payload.termName,
    });
    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Failed to create this item.",
    });
  }
};

export default {
  addTerm,
};
