import fs from "fs";
import * as path from "path";
import MySQLClient from "../clients/mysql";

export const setupFakeData = async (req, res) => {
  const postQuery = fs
    .readFileSync(path.join(__dirname, "../constants/fake-data/posts.sql"), {
      encoding: "UTF-8",
    })
    .split(";\n");

  const userQuery = fs
    .readFileSync(path.join(__dirname, "../constants/fake-data/users.sql"), {
      encoding: "UTF-8",
    })
    .split(";\n");

  const studentQuery = fs
    .readFileSync(path.join(__dirname, "../constants/fake-data/students.sql"), {
      encoding: "UTF-8",
    })
    .split(";\n");

  const eventQuery = fs
    .readFileSync(path.join(__dirname, "../constants/fake-data/events.sql"), {
      encoding: "UTF-8",
    })
    .split(";\n");

  await MySQLClient.query(postQuery[0], { type: "INSERT" });
  await MySQLClient.query(userQuery[0], { type: "INSERT" });
  await MySQLClient.query(studentQuery[0], { type: "INSERT" });
  await MySQLClient.query(eventQuery[0], { type: "INSERT" });

  res.json({ message: "MySQL reset" });
};
