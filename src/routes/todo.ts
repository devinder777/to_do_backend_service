import express from "express";
import DB from "../db";

const router = express.Router();

// get all the todos of a user
router.get("/", async (req, res) => {

});


// create a new _todo for a user
router.post("/", async (req, res) => {

});

// update a existing _todo item
router.put("/:id", async (req, res) => {

});

// delete a existing _todo item
router.delete("/:id", async (req, res) => {

});


export default router;