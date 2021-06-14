const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const Post = require('./models/post')
const postRouter = require('./routes/posts')
const methodOverride = require('method-override')
const app = express()

mongoose.connect('mongodb://localhost/blog', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})

app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: false}))

app.use(methodOverride('_method'))

/* portfolio */
app.get('/', async (req, res) => {
    res.sendFile(path.resolve("frontend", "home.html"));
});

app.get('/about', async (req, res) => {
    res.sendFile(path.resolve("frontend", "home.html"));
});

app.get('/skills', async (req, res) => {
    res.sendFile(path.resolve("frontend", "home.html"));
});

app.use("/static", express.static(path.resolve(__dirname, "frontend", "static")));

/* blog */
app.get('/posts', async (req, res) => {
    const posts = await Post.find().sort({ publishedDate: 'desc'})
    res.render('posts/index', { posts : posts })
})

app.use('/posts', postRouter)

app.listen(process.env.PORT || 5000)