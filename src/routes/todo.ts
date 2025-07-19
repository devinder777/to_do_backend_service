import express, {Request, Response} from "express";
import DB from "../db"

const router = express.Router();

// get all the todos of a user
router.get('/', (req: Request, res: Response) => {
    try {
        const getTodos = DB.prepare(`SELECT * FROM todos WHERE user_id = ?`);
        const todos = getTodos.all(req.userId!) ; // userId is added by authMiddleware
        res.status(200).json({ todos });
    } catch (err) {
        console.error('Failed to fetch todos:', err);
        res.status(500).json({ message: 'Server error while fetching todos' });
    }
});

// create a new _todo for a user
router.post("/", async (req: Request, res: Response) => {
    const {task} = req.body;

    if (!task || typeof task !== 'string') {
        return res.status(400).json({ message: 'Task is required and must be a string' });
    }

    try {
        const insertTodo = DB.prepare(`INSERT INTO todos (user_id, task) VALUES (?, ?)`);
        const result = insertTodo.run(req.userId!, task);

        res.status(201).json({
            id: result.lastInsertRowid,
            task,
            completed: 0,
        });

    } catch (err) {
        console.error('Failed to create todo:', err);
        res.status(500).json({ message: 'Server error while creating todo' });
    }
});

// update a existing _todo item
router.put("/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const { task, completed } = req.body;

    try {
        const completedValue = typeof completed === 'boolean' ? (completed ? 1 : 0) : null;


        const updateTodo = DB.prepare(`
            UPDATE todos
            SET task      = ?,
                completed = ?
            WHERE id = ?
              AND user_id = ?
        `);

        const result = updateTodo.run(task, completedValue, id, req.userId!);

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Todo not found or unauthorized' });
        }

        res.status(200).json({
            id: result.lastInsertRowid,
            task,
            completed: completedValue,
        });
    } catch (err) {
        console.error('Failed to update todo:', err);
        res.status(500).json({ message: 'Server error while updating todo' });
    }
});

// delete a existing _todo item
router.delete("/:id", async (req: Request, res: Response) => {
    const {id }  = req.params;

    try {
        const deleteTodo = DB.prepare(`DELETE FROM todos WHERE id = ? AND user_id = ?`);
        const result = deleteTodo.run(id, req.userId!);

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Todo not found or unauthorized' });
        }

        res.status(200).json({ message: 'Todo deleted' });
    } catch (err) {
        console.error('Failed to delete todo:', err);
        res.status(500).json({ message: 'Server error while deleting todo' });
    }
});


export default router;