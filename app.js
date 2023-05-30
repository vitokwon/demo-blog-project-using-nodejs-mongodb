const path = require('path');

const express = require('express');

const blogRoutes = require('./routes/blog');
const db = require('./data/database') // 외부 펑션 import

const app = express();

// Activate EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); // Parse incoming request bodies
app.use(express.static('public')); // Serve static files (e.g. CSS files)

app.use(blogRoutes);

app.use(function (error, req, res, next) {
  // Default error handling function
  // Will become active whenever any route / middleware crashes
  console.log(error);
  res.status(500).render('500');
});

// 다른 설정이 다 적용된 후 적용
db.connectToDatabase().then(function() {
  app.listen(3000); // 데이터베이스 연결이 된 경우에만 실행
})

