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


app.listen("3000", () =>
{
    console.log("Сервер 3000")
})