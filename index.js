const db = require("./db")

const express = require("express")

const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

const app = express()

function handleError(error) {
    console.error(error)
    res.status(401).json({ error: "401" })
}

app.use(express.json())

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader) res.status(401).json({ error: "no token" })

    if (!(authHeader.split(" ")[1]))
        res.status(401).json({ error: "wrong token format" })
    try {
        const token = authHeader.split(" ")[1]
        const decoded = jwt.verify(token, SECRET)
        req.user = decoded
        next()
    } catch (error) {
        handleError(error)
    }
}

app.post("/register", (req, res) => {
    try {
        const { email, name, password } = req.body
        if (!email && !name && !password)
            return res.status(400).json({ error: "no reg data" })
        const syncSalt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(password, syncSalt)

        const query = db.prepare(`INSERT INTO users (email, name, password) VALUES (?,?,?)`)
        const info = query.run(email, name, hash)
        const newUser = db.prepare(`SELECT * FROM users WHERE ID = ?`).get(info.lastInsertRowid)

        res.status(201).json(newUser)
    } catch (error) {
        handleError(error)
    }
})

app.post("/login", (req, res) => {
    try {
        const { email, password } = req.body
        const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email)

        if (!user)
            res.status(401).json({ error: "no login data" })

        const valid = bcrypt.compareSync(password, user.password)

        if (!valid)
            res.status(401).json({ error: "no valid data" })

        const token = jwt.sign({ ...user }, SECRET, { expiresIn: '24h' })
        const { password: b, ...response } = user
        res.json({ "token": token, ...response })
    } catch (error) {
        handleError(error)
    }
})

app.get("/users", (_, res) => {
    try {
        const data = db.prepare("SELECT * FROM users").all()
        res.json(data)
    } catch (error) {
        handleError(error)
    }
})


app.get("/users/:id", (req, res) => {
    try {
        const { id } = req.params
        const data = db.prepare("SELECT name FROM users WHERE id = ?").all(id)

        if (data.length === 0)
            res.status(404).json({ error: "user not found" })

        res.status(200).json(data)
    } catch (error) {
        handleError(error)
    }
})

app.delete("/users/:id", authMiddleware, (req, res) => {
    try {
        const { id } = req.params
        const query = db.prepare(`DELETE FROM users WHERE id = ?`)
        const result = query.run(id)

        if (result.changes === 0) res.status(404).json({ error: "Пользователь не был найден" })

        res.status(200).json({ message: "Юзер успешно удален" })
    } catch (error) {
        handleError(error)
    }
})

app.get("/todos", (_, res) => {
    try {
        const data = db.prepare("SELECT * FROM todos").all()
        res.json(data)
    } catch (error) {
        handleError(error)
    }

})

app.delete("/todos", authMiddleware, (req, res) => {
    try {
        const { id } = req.params
        const query = db.prepare(`DELETE FROM todos WHERE id = ?`)
        const result = query.run(id)

        if (result.changes === 0) res.status(404).json({ error: "Задача не был найдена" })

        res.status(200).json({ message: "Задача успешно удалена" })
    }   catch (error) {
        handleError(error)
    }

})

app.post("/todos", authMiddleware, (req, res) => {
    const { name, status } = req.body

    try {
        if (!status || !name) {
            return res.status(400).json({ error: "Не хватает данных" })
        }
        const query = db.prepare(
            `INSERT INTO todos (status, name) VALUES (?, ?)`
        )
        const info = query.run(status, name)
        const newUser = db
            .prepare(`SELECT * FROM users WHERE ID = ?`)
            .get(info.lastInsertRowid)
        res.status(201).json(newUser)
    } catch (error) {
        console.error(error)
        res.status(401).json({ error: "401" })
    }
})

app.delete("/users/:id", authMiddleware, (req, res) => {
    try {
        const { id } = req.params
        const query = db.prepare(`DELETE FROM users WHERE id = ?`)
        const result = query.run(id)

        if (result.changes === 0) res.status(404).json({ error: "Пользователь не был найден" })

        res.status(200).json({ message: "Юзер успешно удален" })
    } catch (error) {
        console.error(error)
        res.status(401).json({ error: "401" })
    }
})

app.patch("/todos/:id/toggle", authMiddleware, (req, res) => {
    try {
        const { id } = req.params
        const query = db.prepare(`UPDATE todos SET status = status - 1 WHERE id = ?`)
        const result = query.run(id)
        result.changes === 0
        res.status(200).json({ message: "todos updated" })
    } catch (error) {
        console.error(error)
        res.status(401).json({ error: "401" })
    }
})

app.patch("/users/:id", authMiddleware, (req, res) => {
    try {
        const { id } = req.params
        const { name } = req.body
        const query = db.prepare(`UPDATE users SET name = ? WHERE id = ?`)
        const result = query.run(name, id)
        res.status(200).json({ message: "user updated" })
    } catch (error) {
        console.error(error)
        res.status(401).json({ error: "401" })
    }
})


app.listen("3000", () => {
    console.log("Сервер 3000")
})