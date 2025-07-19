# 📝 Todo Backend with SQLite & Express.js

This is a simple **TypeScript-based backend** for a Todo application. It uses **Express.js**, **SQLite (via Node 22+ native module)**, and serves static frontend assets from the `public/` folder.

---

## 🚀 Features

- Built with **TypeScript**
- Uses **SQLite (Node 22 native support)**
- Persists data in `data.db`
- JWT-based authentication (using `jsonwebtoken`)
- Modular routes for `/auth` and `/todos`
- Serves static frontend from the `public` folder

---

## ⚙️ Requirements

- **Node.js v22 or later**  
  This project uses the new native `node:sqlite` module introduced in Node 22.  
  You can check your version with:

  ```bash
  node -v
