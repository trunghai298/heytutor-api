import fileServices from "../services/file";

const upload = async (req, res, next) => {
  const type = req.params.type;
  if (req.files) {
    return fileServices
      .upload(req.files, type)
      .then((result) => res.json(result))
      .catch(next);
  }

  return res.status(404).send();
};

export default {
  upload,
};
