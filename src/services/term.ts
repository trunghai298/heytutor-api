import Term from "../models/term";

const addTerm = async (payload) => {
  const res = await Term.create({ id: payload.id, termName: payload.termName });
  return res;
};

export default {
  addTerm,
};
