const db = require("../db/connection");

exports.checkUserExists = (username) => {
  return db
    .query("SELECT * FROM users WHERE username = $1", [username])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return db.query(
          `INSERT INTO users (username, name, avatar_url) 
        VALUES ($1, 'Anonymous', 'https://www.cats.org.uk/media/13136/220325case013.jpg?width=500&height=333.49609375') 
        RETURNING username;`,
          [username]
        );
      }
    });
};
