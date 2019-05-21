const mongoose = require('mongoose');
const user = require('../models/user')

const dbName = 'lab-passport-roles'
mongoose.connect(`mongodb://localhost/${dbName}`);

const bcrypt = require("bcrypt")
const bcryptSalt = 10

const salt = bcrypt.genSaltSync(bcryptSalt)
const hashPass = bcrypt.hashSync("1234", salt)

const users = [
  {
    username: "pepito",
    password: hashPass,
    role: "BOSS"
  },
]

user.create(users)
  .then(usersCreated => {
    console.log(`**** Creados ${usersCreated.length} usuarios **** `)
    mongoose.connection.close()
  })
  .catch(err => console.log(`**** ! Hubo un error: ${err}`))