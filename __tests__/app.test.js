const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");
const endpointsFile = require("../endpoints.json");

beforeEach(() => {
  return seed(testData);
});
afterAll(() => {
  return db.end();
});

describe("GET /api", () => {
  test("200: responds with an object listing all the available endpoints with their description", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        const expectedResult = endpointsFile;
        expect(body).toEqual(expectedResult);
      });
  });
});

describe("GET /api/topics", () => {
  test("200: responds with an array of all the topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;
        expect(topics).toHaveLength(3);
        topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
  test("404: responds with Not Found for a non-existent endpoint", () => {
    return request(app)
      .get("/api/not-an-endpoint")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
});

describe("GET /api/articles", () => {
  test("200: responds with an array of all the articles sorted by date in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(13);
        articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("200: responds with an array of all the articles filtered by the requested topic", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(1);
        articles.forEach((article) => {
          expect(article.topic).toBe("cats");
        });
      });
  });
  test("200: responds with an empty array if topic exists but there are no articles for that topic", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toEqual([]);
      });
  });
  test("404: responds with Not Found for a non-existent topic", () => {
    return request(app)
      .get("/api/articles?topic=non-existent-topic")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
  test("200: responds with articles sorted by any valid column (defaults to the created_at date)", () => {
    return request(app)
      .get("/api/articles?sort_by=title")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(13);
        expect(articles).toBeSortedBy("title", { descending: true });
      });
  });
  test("400: responds with Bad Request if sort_by query is invalid", () => {
    return request(app)
      .get("/api/articles?sort_by=invalid")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("200: responds with articles sorted by any valid column in the requested order (defaults to the created_at date DESC)", () => {
    return request(app)
      .get("/api/articles?sort_by=title&order=ASC")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(13);
        expect(articles).toBeSortedBy("title", { descending: false });
      });
  });
  test("400: responds with Bad Request if order query is invalid", () => {
    return request(app)
      .get("/api/articles?order=invalid")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: responds with a single article by article_id", () => {
    return request(app)
      .get("/api/articles/7")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          author: "icellusedkars",
          title: "Z",
          article_id: 7,
          body: "I was hungry.",
          topic: "mitch",
          created_at: "2020-01-07T14:08:00.000Z",
          votes: 0,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          comment_count: 0,
        });
      });
  });
  test("200: comment_count reflects the actual number of comments for an article", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article.comment_count).toBe(11);
      });
  });
  test("404: responds with Not Found for a non-existent article_id", () => {
    return request(app)
      .get("/api/articles/99999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
  test("400: responds with Bad Request for an invalid article_id", () => {
    return request(app)
      .get("/api/articles/not-an-id")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: responds with an array of all the comments for an article by article_id sorted by date in descending order", () => {
    return request(app)
      .get("/api/articles/5/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toHaveLength(2);
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: expect.any(Number),
          });
        });
        expect(comments).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("200: responds with an empty array if the article_id exists but there are no comments for that article", () => {
    return request(app)
      .get("/api/articles/7/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toEqual([]);
      });
  });
});

describe("GET /api/users", () => {
  test("200: responds with an array of all the users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        expect(users).toHaveLength(4);
        users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: responds with the newly created comment object for a pre-existing author", () => {
    const newComment = {
      username: "butter_bridge",
      body: "I love cats",
    };
    return request(app)
      .post("/api/articles/11/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({
          comment_id: expect.any(Number),
          body: "I love cats",
          article_id: 11,
          author: "butter_bridge",
          votes: 0,
          created_at: expect.any(String),
        });
      });
  });
  test("201: responds with the newly created comment object for a pre-existing author, ignoring unnecessary properties", () => {
    const newComment = {
      username: "butter_bridge",
      body: "I love cats",
      unnecessary_property: "ignore this property",
    };
    return request(app)
      .post("/api/articles/11/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({
          comment_id: expect.any(Number),
          body: "I love cats",
          article_id: 11,
          author: "butter_bridge",
          votes: 0,
          created_at: expect.any(String),
        });
      });
  });
  test("404: responds with Not Found for a non-existent article_id", () => {
    const newComment = {
      username: "butter_bridge",
      body: "I love cats",
    };
    return request(app)
      .post("/api/articles/99999/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
  test("400: responds with Bad Request for an invalid article_id", () => {
    const newComment = {
      username: "butter_bridge",
      body: "I love cats",
    };
    return request(app)
      .post("/api/articles/not-an-id/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("400: responds with Bad Request for an invalid post request, for example missing username", () => {
    const invalidRequest = {
      body: "I love cats",
    };
    return request(app)
      .post("/api/articles/11/comments")
      .send(invalidRequest)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("400: responds with Bad Request for an invalid post request, for example missing body", () => {
    const invalidRequest = {
      username: "butter_bridge",
    };
    return request(app)
      .post("/api/articles/11/comments")
      .send(invalidRequest)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("404: responds with Not Found for a non-existent username", () => {
    const newComment = {
      username: "non-existent-user",
      body: "I love cats",
    };
    return request(app)
      .post("/api/articles/11/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("200: responds with the updated article object, with votes incremented when inc_votes is positive", () => {
    const updatedArticle = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/articles/1")
      .send(updatedArticle)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          article_id: 1,
          votes: 101,
        });
      });
  });
  test("200: responds with the updated article object, with votes decremented when inc_votes is negative", () => {
    const updatedArticle = {
      inc_votes: -100,
    };
    return request(app)
      .patch("/api/articles/1")
      .send(updatedArticle)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          article_id: 1,
          votes: 0,
        });
      });
  });
  test("404: responds with Not Found for a non-existent article_id", () => {
    const updatedArticle = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/articles/99999")
      .send(updatedArticle)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
  test("400: responds with Bad Request for an invalid article_id", () => {
    const updatedArticle = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/articles/not-an-id")
      .send(updatedArticle)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("400: responds with Bad Request for an invalid patch request, for example inc_votes in incorrect format", () => {
    const invalidRequest = {
      inc_votes: "invalid",
    };
    return request(app)
      .patch("/api/articles/1")
      .send(invalidRequest)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("400: responds with Bad Request for an invalid patch request, for example missing inc_votes", () => {
    const invalidRequest = {};
    return request(app)
      .patch("/api/articles/1")
      .send(invalidRequest)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204: successfully deletes the comment and responds with no content", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });
  test("404: responds with an error message for a non-existent comment_id", () => {
    return request(app)
      .delete("/api/comments/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
  test("400: responds with Bad Request for an invalid comment_id", () => {
    return request(app)
      .delete("/api/comments/invalid-id")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
});
