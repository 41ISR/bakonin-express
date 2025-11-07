const db = require("./db")

const express = require("express")

const app = express()

app.use(express.json())

app.get("/", (_, res) =>
{
    res.send("12345")
})



app.post("/", (req, res) =>
{
    console.log(req.body)
    res.send("Success")
})

app.get("/users", (_, res) =>
{
    const data = db.prepare("SELECT * FROM users").all()
    res.json(data)
})


app.get("/users/:id", (req, res) =>
{  
    const { id } = req.params
    const data = db.prepare("SELECT name FROM users WHERE id = ?").all(id)

    if (data.length === 0) 
        res.status(404).json({error: "user not found"})

    res.status(200).json(data)
})

app.post("/users", (req, res) =>
{
    const {email, name} = req.body

    try {
        if (!email || !name) 
            {
                return res.status(400).json({"error": "no data"})
    }
    const query = db.prepare(`INSERT INTO users (email, name) VALUES (?, ?)`)
    const info = query.run(email, name)
    const newUser = db.prepare(`SELECT * FROM users WHERE ID = ?`).get(info.lastInsertRowid)
    res.status(201).json(newUser)
    } catch (error) {}
})


app.delete("/users/:id", (req, res) => {
    const { id } = req.params
    const query = db.prepare(`DELETE FROM users WHERE id = ?`)
    const result = query.run(id)

    if (result.changes === 0) res.status(404).json({error: "Пользователь не был найден"})

    res.status(200).json({message: "Юзер успешно удален"})
})

app.get("/todos", (_, res) => {
    const data = db.prepare("SELECT * FROM todos").all()
    res.json(data)
})

app.delete("/todos", (req, res) => {
    const { id } = req.params
    const query = db.prepare(`DELETE FROM todos WHERE id = ?`)
    const result = query.run(id)

    if (result.changes === 0) res.status(404).json({error: "Задача не был найдена"})

    res.status(200).json({message: "Задача успешно удалена"})

})

app.post("/todos", (req, res) => {
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
    }
})

app.delete("/users/:id", (req, res) => {
    const { id } = req.params
    const query = db.prepare(`DELETE FROM users WHERE id = ?`)
    const result = query.run(id)

    if (result.changes === 0) res.status(404).json({error: "Пользователь не был найден"})

    res.status(200).json({message: "Юзер успешно удален"})
})

app.patch("/todos/:id/toggle", (req, res) => {
    try {
        const { id } = req.params
        const query = db.prepare(`UPDATE todos SET status = status - 1 WHERE id = ?`)
        const result = query.run(id)
        result.changes === 0
        res.status(200).json({message: "todos updated"})
    } catch (error) {
        console.error(error)
    }
})

app.patch("/users/:id", (req, res) => {
    try {
        const { id } = req.params
        const { name } = req.body
        const query = db.prepare(`UPDATE users SET name = ? WHERE id = ?`)
        const result = query.run(name, id)
        res.status(200).json({message: "user updated"})
    } catch (error) {
        console.error(error)
    }
})


app.listen("3000", () =>
{
    console.log("Сервер 3000")
})