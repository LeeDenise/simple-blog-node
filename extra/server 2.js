if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const Post = require('./models/post')
const postRouter = require('./routes/posts')
const User = require('./models/user')

const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

mongoose.connect('mongodb://localhost/blog', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})

// middleware
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false}))
app.use(methodOverride('_method'))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))

// passport
app.use(passport.initialize())
app.use(passport.session())

const LocalStrategy = require('passport-local').Strategy
passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser((id, done) => {
    return done(null, User.findById(id))
  })
passport.use(new LocalStrategy(async (username, password, done) => {
    const user = await User.findOne({username: username})
    if (user == null) {
      return done(null, false, { message: 'Email is not registered!' })
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user)
      } else {
        return done(null, false, { message: 'Password is incorrect.' })
      }
    } catch (e) {
      return done(e)
    }
  } ))

// routes
app.get('/', isLoggedIn, async (req, res) => {
    const posts = await Post.find().sort({ publishedDate: 'desc'})
    res.render('posts/index', { posts : posts })
})

app.use('/posts', isLoggedIn, postRouter)

app.get('/login', isLoggedOut, (req, res) => {    
    res.render('login.ejs')
  })
  
app.post('/login', isLoggedOut, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', isLoggedOut, (req, res) => {
    res.render('register.ejs', { user: new User()})
})

app.post('/register', isLoggedOut, async (req, res) => {
    req.user = new User()
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        
        let user = req.user
        user.username = req.body.username
        user.password = hashedPassword
        user = await user.save();

        res.redirect('/login')
    } catch {
        console.log('failed')
        res.redirect('/register')
    }
})

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/login')
  }
  
function isLoggedOut(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.listen(3333)