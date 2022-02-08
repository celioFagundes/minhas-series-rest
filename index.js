const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const jwt = require('jsonwebtoken')
const jwtSecret=  'abc123abc123acb123'
const User = require('./models/user')
const mongo = process.env.MONGO || 'mongodb://localhost/minhas-series-rest'
const mongoose = require('mongoose')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const seriesRouter = require('./routes/series')
const usersRouter = require('./routes/users')

app.use('/series', seriesRouter)
app.use('/users', usersRouter)

app.post('/auth', async (req, res) => {
  const user = req.body
  const userDb = await User.findOne({ username: user.username })
  if (userDb) {
    if (userDb.password === user.password) {
        const payload = {
            id: userDb._id,
            username: userDb.username,
            roles : userDb.roles
        }
        jwt.sign(payload,jwtSecret, (err,token)=>{
            res.send({
                success: true,
                token: token,
              })
        })
      
    } else {
      res.send({ success: false, message: 'Wrong credentials' })
    }
  } else {
    res.send({ success: false, message: 'Wrong credentials' })
  }
})

const createInitialUsers = async () => {
  const total = await User.count({})
  if (total === 0) {
    const user = await new User({
      username: 'celio',
      password: '1234',
      roles: ['restrito', 'admin'],
    })
    await user.save()
    const user2 = await new User({
      username: 'restrito',
      password: '1234',
      roles: ['restrito'],
    })
    await user2.save()
  }
}
mongoose
  .connect(mongo)
  .then(() => {
    createInitialUsers()
    app.listen(port, () => {
      console.log('Listening on port : ', port)
    })
  })
  .catch(e => console.log(e))
