const {
  checkCommentsExist,
  insertComment,
  removeComment,
} = require("../models/comments.models");
const { checkArticleExists } = require("../models/articles.models");

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;

  const promises = [checkCommentsExist(article_id)];

  Promise.all(promises)
    .then((resolvedPromises) => {
      const comments = resolvedPromises[0];
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postCommentForArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;

  if (!username || !body) {
    return res.status(400).send({ msg: "Bad Request" });
  }

  checkArticleExists(article_id)
    .then(() => {
      return insertComment(article_id, username, body);
    })
    .then((newComment) => {
      res.status(201).send({ comment: newComment });
    })
    .catch(next);
};

exports.deleteCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  removeComment(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};
