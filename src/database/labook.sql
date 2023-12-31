-- Active: 1690566078881@@127.0.0.1@3306
CREATE TABLE users(
    id TEXT UNIQUE PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT DEFAULT(datetime('now', 'localtime'))
);

DROP TABLE users;

SELECT * FROM users;

INSERT INTO users(id, name, email, password, role)
VALUES
('u001', 'Miguel', 'miguel@email.com', 'miguel123', 'admin');

CREATE TABLE posts(
    id TEXT UNIQUE PRIMARY KEY NOT NULL,
    creator_id TEXT NOT NULL,
    content TEXT NOT NULL,
    likes INTEGER NOT NULL,
    dislikes INTEGER NOT NULL,
    created_at TEXT DEFAULT(datetime('now', 'localtime')),
    updated_at TEXT NOT NULL,
     FOREIGN KEY (creator_id) REFERENCES users(id)
        ON UPDATE CASCADE
    ON DELETE CASCADE
);

INSERT INTO posts(id, content, likes, dislikes, creator_id)
VALUES
('p001', 'muito legal', 0, 0, 'u001');

DROP TABLE posts;

SELECT * FROM posts;

CREATE TABLE like_dislike(
    user_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    like INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


DROP TABLE like_dislike;

SELECT * FROM like_dislike;