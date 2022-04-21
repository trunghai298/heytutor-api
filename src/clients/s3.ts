import AWS from "aws-sdk";
AWS.config.update({
  accessKeyId: "AKIA3AW66ZNPGMZHXYPZ",
  secretAccessKey: "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",
});
AWS.config.region = "us-east-1";
export const clientS3 = new AWS.S3();
