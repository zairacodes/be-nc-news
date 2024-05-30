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
        });
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
      .get("/api/articles/invalid-id")
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
  test("201: responds with the newly created comment object for a new author", () => {
    const newComment = {
      username: "catslover",
      body: "I really love cats",
    };
    return request(app)
      .post("/api/articles/11/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({
          comment_id: expect.any(Number),
          body: "I really love cats",
          article_id: 11,
          author: "catslover",
          votes: 0,
          created_at: expect.any(String),
        });
      });
  });
  test("400: responds with an error message for an invalid post request", () => {
    const newInvalidComment = {
      username: "",
      body: "I love cats",
    };
    return request(app)
      .post("/api/articles/11/comments")
      .send(newInvalidComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
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
  test("400: responds with an error message for an invalid inc_votes", () => {
    const invalidArticle = {
      inc_votes: "invalid",
    };
    return request(app)
      .patch("/api/articles/1")
      .send(invalidArticle)
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
});
