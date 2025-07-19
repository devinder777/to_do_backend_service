import {DatabaseSync} from "node:sqlite";

const db = new DatabaseSync('./data.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS users 
    (
        id       INTEGER PRIMARY KEY AUTOINCREMENT,
        email    TEXT UNIQUE NOT NULL,
        password TEXT        NOT NULL
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id   INTEGER NOT NULL,
        task      TEXT,
        completed BOOLEAN DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
`);


export default db;
