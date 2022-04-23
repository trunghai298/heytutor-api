import AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: "AKIA3AW66ZNPAEKLCXNO",
  secretAccessKey: "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",
});

AWS.config.region = "us-east-1";
export const clientS3 = new AWS.S3();
