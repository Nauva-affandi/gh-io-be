import express from 'express'
import cors from 'cors'
import { Low, JSONFile } from 'lowdb'

const app = express()
const PORT = 3001

// Setup Lowdb
const adapter = new JSONFile('./backend/database/db.json')
const db = new Low(adapter)

async function initDb(){
  await db.read()
}
initDb()
  
if (db.data === null) {
  db.data = { users: [] }
  await db.write()
}

app.use(cors())
app.use(express.json())

// GET semua user
app.get('/users', (req, res) => {
  res.json(db.data.users)
})

// GET user by id
app.get('/users/:id', (req, res) => {
  const user = db.data.users.find(u => u.id == req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json(user)
})


function reindexUsers() {
  db.data.users = db.data.users.map((u, i) => ({ ...u, id: i + 1 }))
}

// POST user baru
app.post('/users', async (req, res) => {
  const { name } = req.body
  const newUser = {
    id: db.data.users.length + 1, // boleh tetep begini
    name
  }
  db.data.users.push(newUser)
  reindexUsers() // <-- reindex di sini
  await db.write()
  res.status(201).json(db.data.users.at(-1)) // return user terakhir
})

// DELETE user
app.delete('/users/:id', async (req, res) => {
  const index = db.data.users.findIndex(u => u.id == req.params.id)
  if (index === -1) return res.status(404).json({ message: 'User not found' })
  db.data.users.splice(index, 1)
  reindexUsers() // <-- reindex juga di sini
  await db.write()
  res.json({ message: 'User deleted' })
})

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server jalan di http://localhost:${PORT}`)
})