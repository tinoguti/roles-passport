const express = require("express");
const passportRouter = express.Router();
// Require user model
const User = require("../models/user")
// Add bcrypt to encrypt passwords
const bcrypt = require("bcrypt")
const bcryptSalt = 15
// Add passport 
const passport = require("passport")

const ensureLogin = require("connect-ensure-login");

const isBoss = (req, res) => {
  if (req.user.role === "BOSS") return true
}
const isTa = (req, res) => {
  if (req.user.role === "TA") return true
}

//sign up
passportRouter.get("/signup", (req, res, next) => res.render("../views/passport/signup"))

passportRouter.post("/signup", (req, res, next) => {
  console.log("******* Llegó")
  const { username, password } = req.body
  if (username === "" || password === "") {
    res.render("../views/passport/signup", { message: "Indicate username and password" });
    return;
  }

  User.findOne({ username })
    .then(user => {
      if (user) {
        res.render("../views/passport/signup", { message: "The username already exists" });
        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);

      const newUser = new User({
        username,
        password: hashPass
      });

      newUser.save()
        .then(x => res.redirect("/"))
        .catch(err => res.render("/signup", { message: `Something went wrong: ${err}` }))
    })

})
//create
passportRouter.get("/create", ensureLogin.ensureLoggedIn(), (req, res, next) => res.render("../views/passport/private"))

passportRouter.post("/create", (req, res, next) => {
  console.log("******* Llegó a crear")
  const { username, password, role } = req.body
  console.log("**************", role)
  if (username === "" || password === "") {
    res.render("../views/passport/private", { message: "Indicate username and password" });
    return;
  }

  User.findOne({ username })
    .then(user => {
      if (user) {
        res.render("../views/passport/private", { message: "The username already exists" });
        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);
      console.log("************************", role)
      const newUser = new User({
        username,
        password: hashPass,
        role,
      });

      newUser.save()
        .then(x => res.redirect("/"))
        .catch(err => res.render("/private", { message: `Something went wrong: ${err}` }))
    })
})

//edit
passportRouter.post("/edit/:id", (req, res, next) => {
  const { username, password } = req.body
  User.findByIdAndUpdate({ _id: req.params.id }, { $set: { username, password } })
  .then(user => res.render("../views/passport/private", { message: "Campos actualizados" }))
  .catch(error => console.log(error))     
})

//login
passportRouter.get("/login", (req, res, next) => {
  res.render("../views/passport/login", { "message": req.flash("error") })
})

passportRouter.post('/login', passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true
}))

passportRouter.get("/private-page", ensureLogin.ensureLoggedIn(), (req, res) => {
  User.find()                                                                              
    .then(allUsers => {  
      console.log(allUsers)                                                                 
      if (allUsers.length == 0) { 
        res.render("passport/private", { user: req.user, boss: isBoss(req, res), ta: isTa(req, res), message: "No hay usuarios" }) 
        return
      }  
      res.render("passport/private", { user: req.user, boss: isBoss(req, res), ta: isTa(req, res), users: allUsers })                                                                
    })   
    .catch(error => console.log(error))
  
  // if (req.user.role == "BOSS") res.render("passport/private", { user: req.user });
  // else { 
  //   console.log("FALLO") 
  //   res.redirect("/")
  // }

});


passportRouter.get("/logout", (req, res, next) => {
  req.logout()
  res.redirect("/")
})


module.exports = passportRouter;