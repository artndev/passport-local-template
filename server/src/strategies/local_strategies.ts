import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import db from '../db.js'

passport.serializeUser((user, done) => {
  done(undefined, (user as IUser).id)
})

passport.deserializeUser((id, done) => {
  try {
    const user = db.users.find(user => user.id === id)
    if (!user) throw new Error('User is not found')

    done(undefined, user)
  } catch (err) {
    done(err, undefined)
  }
})

export default [
  passport.use(
    'local-login',
    new LocalStrategy(
      {
        usernameField: 'username',
        passwordField: 'password',
      },
      (username, password, done) => {
        try {
          const user = db.users.find(user => user.username === username)
          if (!user) throw new Error('User is not found')
          if (user.password !== password)
            throw new Error('Your credentials are invalid')

          done(undefined, user)
        } catch (err) {
          done(err, undefined)
        }
      }
    )
  ),
  passport.use(
    'local-register',
    new LocalStrategy(
      {
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true,
      },
      (req, username, password, done) => {
        try {
          if (!req.body?.email) throw new Error('There is no email field')

          const isUsername = db.users.find(user => user.username === username)
          if (isUsername)
            throw new Error('This username has already been taken')

          const isEmail = db.users.find(user => user.email === req.body.email)
          if (isEmail) throw new Error('This email has already been taken')

          const user = {
            id: db.users.length + 1,
            username: username,
            password: password,
            email: req.body.email,
          }
          db.users.push(user)

          done(undefined, user)
        } catch (err) {
          done(err, undefined)
        }
      }
    )
  ),
]
