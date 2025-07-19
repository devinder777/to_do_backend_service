import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import DB from "../db";

const router = express.Router();

// Register a new user endpoint
router.post("/register", (req: Request, res: Response) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    // hash the password
    const hashPassword = bcrypt.hashSync(password, 12);

    // save the new user into db
    try {
         const insertUser = DB.prepare(`INSERT INTO users (email, password) VALUES (?, ?)`);
         const result = insertUser.run(email, hashPassword);

         // create a default _todo
        const defaultTodo = 'Hello! Create your first todo';
        const insertTodo = DB.prepare(`INSERT INTO todos (user_id, task) VALUES (? , ?)`);
        insertTodo.run(result.lastInsertRowid, defaultTodo);

        // create a token
        const token = jwt.sign({id: result.lastInsertRowid}, process.env.JWT_SECRET as string, {expiresIn: "1d"});
        res.status(200).send({token: token, userId: result.lastInsertRowid});
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
})

// login the existing user
router.post("/login", (req: Request, res: Response) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    // get the user with email id
    try {
        const getUser = DB.prepare(`SELECT * FROM users WHERE email = ?;`);
        const user = getUser.get( email);

        if (!user ) return res.status(404).send({message: 'User not found'});

        const isValidPassword = bcrypt.compareSync(password, <string>user.password);
        if (!isValidPassword) return res.status(401).send({message: 'Invalid password'});

        // Generate token and send response
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
            expiresIn: '1d',
        });

        return res.status(200).send({ token: token, userId: user.id });

    }catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }

})

export default router;
