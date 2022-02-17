import { BadRequestError } from "../utils/errors";
import { uploadFile } from "../utils/file";
import sharp from "sharp";
import { map } from "lodash";

const FILE_CONFIG: any = {
  content: {
    POST_IMAGE: "posts/image",
  },
  dimension: {
    ORIGINAL: "original",
    T640: 640,
    T320: 320,
    T160: 160,
  },
};

const resizeAndUploadSingle = async (
  fileName: any,
  buffer: any,
  fileType: any
) => {
  if (!FILE_CONFIG.content[fileType.toUpperCase()]) {
    throw new BadRequestError({
      field: "filename",
      message: `${fileType.toUpperCase()} not found.`,
    });
  }
  // Convert the original image to  png with sharp
  const originalJPEG = await sharp(buffer).rotate().png().toBuffer();
  const path = FILE_CONFIG.content[fileType];

  await uploadFile(originalJPEG, `${path}/${fileName}.png`);

  return fileName;
};

const upload = (files: any, fileType: any) =>
  Promise.all(
    map(files, async (file) =>
      resizeAndUploadSingle(file.wyId, file.buffer, fileType.toUpperCase())
    )
  );

export default { upload };
