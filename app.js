const express = require("express");
const app = express();
const { getEndpoints } = require("./controllers/endpoints.controllers");
const { getTopics } = require("./controllers/topics.controllers");
const {
  getArticles,
  getArticleById,
} = require("./controllers/articles.controllers");
const {
  getCommentsByArticleId,
  postCommentForArticle,
} = require("./controllers/comments.controllers");

app.use(express.json());

app.get("/api", getEndpoints);
app.get("/api/topics", getTopics);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postCommentForArticle);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Not Found" });
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad Request" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

module.exports = app;
