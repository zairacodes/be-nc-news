const db = require("../db/connection");
//const { checkUserExists } = require("../models/users.models");

exports.checkCommentsExists = (article_id) => {
  return db
    .query(
      "SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;",
      [article_id]
    )
    .then(({ rows }) => {
      return rows;
    });
};

// exports.insertComment = (article_id, username, body) => {
//   return checkUserExists(username).then(() => {
//     return db
//       .query(
//         `INSERT INTO comments (article_id, author, body, votes, created_at)
//       VALUES ($1, $2, $3, 0, NOW())
//       RETURNING comment_id, body, article_id, author, votes, created_at;`,
//         [article_id, username, body]
//       )
//       .then(({ rows }) => {
//         return rows[0];
//       });
//   });
// };

exports.insertComment = (article_id, username, body) => {
  return db
    .query(
      `INSERT INTO comments (article_id, author, body, votes, created_at)
      VALUES ($1, $2, $3, 0, NOW())
      RETURNING comment_id, body, article_id, author, votes, created_at;`,
      [article_id, username, body]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.removeComment = (comment_id) => {
  return db
    .query("DELETE FROM comments WHERE comment_id = $1 RETURNING *;", [
      comment_id,
    ])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not Found" });
      }
    });
};
