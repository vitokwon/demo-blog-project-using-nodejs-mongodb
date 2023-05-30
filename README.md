# 섹션 26, NodeJS, MongoDB(NoSQL), & Website Backend Code

## 1) NoSQL을 활용한 데모 블로그 구축

1. 데이터베이스 구조와 레이아웃 계획
2. CRUD 작업 실행
3. 데이터베이스 데이터 가져오기

## 2) MySQL과 NoSQL(MongoDB) CRUD 작업 차이

- `MySQL` : 데이터베이스 계획 -> 테이블 생성 -> 초기데이터 추가(Workbench) -> NodeJS/ExpressJS와 연결 및 상호작용
- `NoSQL` : 데이터베이스 계획 -> 초기 데이터 추가(MongoDB Shell) - NodeJS/ExpressJs 연결 및 상호작용

## 3) NoSQL 데이터베이스 구조 계획

- `어떤 작업(CRUD)`을 많이 할 것인지? 중요한지?
- `어떤 데이터`를 쓰고 읽을 것인지?
- `쿼리 최소화`

## 4) 데모 블로그 사용

- 가끔 `쓰기 작업`이 있을 것임.
- 많은 데이터를 `가져오기 작업`가 있을 것.

## 5) 데모 블로그에 사용될 데이터베이스 구조

- `Posts 컬렉션`-`Post 문서` 저장.
  - `Id(자동 생성)`, `Title`, `Summary`, `Body`, `Date`, `AuthorId + Name`
- `Authors 클렉션` - `Author 문서`
  - `ID`, `Name`, `Email`
- `Name`은 잘 변경되지 않고 `Email`은 변경될 가능성이 있음,
- `세컨쿼리 최소화`

## 6) 첫번째 작업 - 데이터베이스 초기화

1. MongoDB 서버 실행 (윈도우-서비스-MongoDB Server 실행)
2. 데이타베이스 생성
   - `CMD` - `mongosh` - `show dbs` - `use blog` 3.
3. 셀렉션-문서 생성
   - `db.authors.insertOne({name: "Vito Kwon", email: "vito@test.com"})`
   - `db.authors.insertOne({name: "Peter Hwang", email: "peter@test.com"})`
4. 정상 생성 확인
   - `db.authors.find()`

## 7) NodeJS & MongoDB 연결

1. `NodeJS MongoDB` 구글링 - `MongoDB Node Driver` 공식문서 확인
2. `npm install mongodb` 타사패키지 설치
3. `package.json` - `"dependencise": {"mongodb": "^4.0.1"}` 종속성 추가 확인
4. `data` - `database.js` 생성
5. `다른 파일에서 단일 파일 연결 구현 및 관리`

```JavaScript
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
MongoClient.connect('mongodb://localhost:27017')
// 로컬호스트 기본값, promise를 반환
```

```JavaScript
const mongodb = require('mongodb')

let database; // 외부 파일에서 사용할 수 있도록 변수 생성

const MongoClient = mongodb.MongoClient
async function connect() {
    const client = await MongoClient.connect('mongodb://localhost:27017') // 서버 전체에 관한 연결만 설정
    database = client.db('blog') // 데이터베이스 연결
}

function getDb() {
    if(!database) {
        throw {message: 'Database connection not established!'};
    }
    return database;
}

module.exports = {
    connectToDatabase: connect,
    getDb: getDb
}
```

## 8) 연결 설정 app.js 적용

```JavaScript
//app.js

const blogRoutes = require('./routes/blog');
const db = require('./data/database') // 외부 파일 import

...

// 비동기함수안에 있지 않아서 await 사용 불가능
// 프로미스를 반환하기 떄문에 .then 사용
db.connectToDatabase().tehn(function() {
    app.listen(3000); // 데이터베이스 연결이 된 경우에만 실행
})

```

## 9) 작성자 리스트 가져오기 & 표시 (database Read)

1. `Database`의 `authors` 가져오기
2. 게시글 작성 시, 작성자 드롭 다운에 리스트 출력
3. 라우트 설정

```JavaSCript
// routes-blog.js
const db = require('../data/database'); //외부파일 import

router.get('/new-post', async function() {
    // mongosh에서 db.authors.find()에서 collection을 사용해서 authors에 접근.
    // 데이터의 양이 작기때문에 documentCursor 대신 documents(authors) 상수 사용
    // 끝에 toArray() 메서드를 추가함
    // find() 프로미스를 반환함.
    const authors =  await db.getDb().collection('authors').find().toArray();
    // db.authors.find()
    console.log(authors); // 정상 출력 확인
    res.render('create-post', { authors : authors});
})
```

```JavaScript
// views - create-post.ejs
<select id="author" name="author">
    <% for (const author of authors) { %>
    <option value=""<% author._id %>><%= author.name %></option>
    <% } %>
</select>
```

## 10) 새 게시물 생성 (문서삽입, Create)

1. `<form>`의 `action`과 `method` 설정
2. `<form>`의 각 필드값에 접근 `req.body.filedName`
3. `new Date()` 내장 객체로 현재 시간 받기
4. `id`는 `new ObjectId` 로 저장하여 DB로 전송 필요
5. `const ObjectId = mongodb.ObjectId;` 생성 후 `new ObjectId

```JavaScript
// create.ejs
<form aiction="/posts" method="POSTS">
    ...
</form>
```

```JavaScript
// blog.js

const mongodb = require('mongodb');

const ObjectId = mongodb.ObjectId;

router.post('/posts', async function(req, res) {
    const authorId = new ObjectId(req.body.author);
    const author = await db.getDb().collection('authors').findOne({ _id: authorId })

    const newPost = {
        title: req.body.title,
        summary: req.body.summary,
        body: req.body.content,
        date: new Date()
        author: {
            // ObjectID로 저장필요해서 mongdb,ObjectId 상수 생성 후 처리
            id: new ObjectId(req.body.author),
            name: author.name
            emial: author.email
        }
    };

    const result = await db.getDb().collection('posts').insertOne(newPost); //존재하지 않지만 자동 생성

    console.log(result);

    res.redirect('/posts');
})

// title: A First Post, Summary: This is a first post that I created, content: Let's see whether that works - it's MongoDB + Nodejs in action! This is shoould work!
```

## 11) 문서 가져오기 & 표시 (list출력, Read)

1. `서버대역폭 절약`을 위한 `프로젝션` 사용 `.find({}, { title: 1, summary: 1, 'author.name': 1})`
2. `if(!posts || posts.length===0)` 예외 적용
3. `<li>`에 `for문`으로 단일 게시글 내용 전달
4. `<%-include()>`로 `list-item` 게시글 페이지 분할하여 관리

```JavaScript
//blog.js
router.get('posts', async function(req.res){
    // 서버 대역폭 절약하기 위해 필요한 데이터만 리드 (프로젝션적용)
    // posts-list.ejs에 필요한 데이터 확인
    // post-item, author, summary
    // 중첩필드는 '' 사용
    const posts = await db
    .getDb()
    .collection('posts')
    .find({}, { title: 1, summary: 1, 'author.name': 1})
    .toArray();
    res.render('posts-list', { posts: posts });
    });
```

```html
<!-- posts-list.ejs -->
<h1>All Posts</h1>
<% if (!posts || posts.length === 0 ) {%>
<p>No posts found - maybe start creating some?</p>
<a class="btn" href="/new-post">Create a new Post</a>
<% } else { %>
<ol id="post-list">
  <% for(const post of posts) {%>
  <li><%- include('include/post-item', {post: post}) %></li>
  <% } %>
</ol>
<% } %>
```

```html
<!-- posts-item.ejs (include) -->
<article class="post-item">
  <h2><%= post.title %></h2>
  <p class="post-item-author">By <%=post.author.name %></p>
  <p><%=post.summary%></p>
  <div class="post-actions">...</div>
</article>
```

`프로젝션 사용`

- 몽고DB : `.find({}, { title: 1, summary: 1, 'author.name': 1 })`
- project() 사용 : `.find({}).project({ title: 1, summary: 1, 'author.name': 1 })`

## 12) 단일 문서 가져오기 (detail출력, Read)

1. `<address><a href="mailto:<% post.author.email %>"><%= post.author.name %></a></address>`
2. 날짜 형식 변경
   - `<time datetime="<%= post.date %>"><%= post.date %></time>`
   - `post.humanReadableDate = post.date.toLocaleDateString("en-US",{weekday: "long",year: "numeric",month: "long",day: "numeric",});`
   - `post.date = post.date.toISOString();`

```html
<!-- post-item.ejs -->
<a class="btn" href="/posts/<%=post._id %>">View Post</a>
```

```JavaScript
// blog.js
router.get('/posts/:id', async function(req,res){
    const postId = req.params.id;
    const post = await db
    .getDb()
    .collection('posts')
    .findOne({_id: new ObjectId(postId)}, { summary: 0});

    if(!post) {
        return res.status(404).render('404');
    }

    res.render('post-detail', {post : post})
})
```

```html
<!-- post-detail.ejs -->
<h1><%= post.title %></h1>
<section id="post-meta">
  <address>
    <a href="mailto:<% post.author.email %>"><%= post.author.name %></a>
  </address>
  | <time datetime="<%= post.date %>"><%= post.date %></time>
</section>
<hr />
<section>
  <p id="body"><%=post.body%></p>
</section>
```

`특수 스타일(posts.css)`:

1. `white-space: pre-wrap;`: 공백과 줄바꿈 유지, 랜더링

`HTML 요소`:

1. `<address>`: 모든 주소(이메일주소포함)
2. `<time datetime="">` : 시간 표시, datetime 속성이 항상 필요함.
3. 몽고DB에서 날짜를 꺼낼 떄, 자바스크립트의 내장된 날짜 객체로 자동 변환됨.

```JavaScript
// 날짜 형식 변환하여 새 속성 생성
router.get('/posts/:id', async function(req,res){
    const postId = req.params.id;
    const post = await db
    .getDb()
    .collection('posts')
    .findOne({_id: new ObjectId(postId)}, { summary: 0});

    if(!post) {
        return res.status(404).render('404');
    }

    // 내장된 객체 유형으로 새 속성 추가
    post.humanReadableDate = post.date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    post.date = post.date.toISOString(); // MAschine Readable로 변환

    res.render('post-detail', {post : post})
})

```

```html
<!-- post-detail.ejs -->
<h1><%= post.title %></h1>
<section id="post-meta">
  <address>
    <a href="mailto:<% post.author.email %>"><%= post.author.name %></a>
  </address>
  | <time datetime="<%= post.date %>"><%= post.humanReadableDate %></time>
</section>
<hr />
<section>
  <p id="body"><%=post.body%></p>
</section>
```

## 13) 문서 업데이트 (Update)

```html
<!-- post-item.ejs -->
<a href="/posts/<%=post._id/edit%>">Edit Post</a>
```

```JavaScript
//blog.js
router.get('/posts/:id/edit', async function(req,res){
    const postId = req.params.id;
    const post = await db
    .getDb()
    .collection('posts')
    .findOne({_id: new ObjectId(postId)}, { title: 1, summary: 1, body: 1});

    if(!post) {
    return res.status(404).render('404');
    }

    res.render('update-post', {post: post});
});
```

```html
<!-- update-post -->
<form action="/posts/<%=post._id%>/edit" method="POST">
  <input name="title" value="<%=post.title%>" />
  <input name="summary" value="<%=post.summary%>" />
  <textarea name="content"><%=post.body%></textarea>
</form>
```

```JavaScript
router.post('/posts/:id/edit', async function(req, res){
    const postId = new ObjectId(req.params.id);
    const result = await db
    .getDb()
    .collection('posts')
    .updateOne(
        {_id: postId},
        {
            $set: {
        title: req.body.title,
        summary: req.body.summary,
        body: req.body.content,
        },
      }
    );

    res.redirect('/posts');
})
```

## 14) 문서 삭제 (Delete)

```html
<form action="/posts/<%= post._id%>/delete" method="POST">
  <button class="btn btn-alt">Delete Post</button>
</form>
```

```JavaScript
router.post('/posts/:id/delete', async function(req,res){
    const postId = new ObjectId(req.params.id);
    const result = await db.getDb().collection('posts').deleteOne({_id: postId})
    res.redirect('/posts');
})
```

## 15) expressJS & async 오류 처리

- 비동기 라우트 핸들러 또는 라우트 미들웨어 함수가 있을 경우, 함수 내부의 오류가 발생할 때 기본 익스프레스 오류 처리 미들웨어가 작동 안함
- `잘못된 ID`가 입력됐을 때, 404 페이지 로드 안 됨.
- `try-catch`, `next` 변수 활용

```JavaScript
// try-catch 문 활용하여 오류 핸들러 설정
router.get('/posts/:id', async function(req,res,next){
    let postId = req.params.id;
    try {
       postId = new ObjectId(postId)
    } catch (error) {
        // return res.status(404).render('404');
        return next(error); // 'next' 매개 변수 활용, 다음 미들웨어로 옮기는 함수
    }

    const post = await db
    ...
})
```
