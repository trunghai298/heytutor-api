import RankingServices from "../services/ranking.service";

const getRanking = (req, res, next) => {
  RankingServices.getUserRank(req.body)
    .then((result) => res.json(result))
    .catch(next);
};

export default {
  getRanking,
};
