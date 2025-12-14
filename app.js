const express = require('express');
const mysql = require('mysql2');
const app = express();

/* =====================
   기본 미들웨어
===================== */
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');

/* =====================
   MySQL 연결
===================== */
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'portfolio_db'
});

connection.connect(err => {
  if (err) {
    console.error('MySQL 연결 실패:', err);
    return;
  }
  console.log('MySQL 연결 성공');
});

/* =====================
   라우터
===================== */
app.use('/', require('./routes/index'));
app.use('/board', require('./routes/board'));
app.use('/ui-test', require('./routes/ui'));

/* =====================
   댓글 작성
===================== */
app.post('/comment/write', (req, res) => {
  const { post_id, writer, content, password, role } = req.body;

  if (!post_id || !writer || !content) {
    return res.send('필수 값이 누락되었습니다.');
  }

  if (role === 'client' && !password) {
    return res.send('클라이언트는 비밀번호가 필요합니다.');
  }

  const sql = `
    INSERT INTO comments (post_id, writer, content, password, role, created_at)
    VALUES (?, ?, ?, ?, ?, NOW())
  `;

  connection.query(
    sql,
    [post_id, writer, content, password || null, role],
    err => {
      if (err) return res.send('댓글 저장 오류');
      res.redirect('/board');
    }
  );
});

/* =====================
   🔥 댓글 삭제 (신규)
===================== */
app.post('/comment/delete/:id', (req, res) => {
  const commentId = req.params.id;
  const { password, role } = req.body;

  // 호스트는 바로 삭제
  if (role === 'host') {
    const sql = 'DELETE FROM comments WHERE id = ?';
    return connection.query(sql, [commentId], () => {
      res.redirect('/board');
    });
  }

  // 클라이언트는 비밀번호 검증
  const sql = `
    DELETE FROM comments
    WHERE id = ? AND password = ?
  `;

  connection.query(sql, [commentId, password], (err, result) => {
    if (err) return res.send('삭제 오류');

    if (result.affectedRows === 0) {
      return res.send('비밀번호가 틀립니다.');
    }

    res.redirect('/board');
  });
});

/* =====================
   서버 시작
===================== */
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
