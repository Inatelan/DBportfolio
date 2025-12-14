const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

/* =====================
   MySQL 연결
===================== */
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'portfolio_db'
});

/* =====================
   게시판 메인
===================== */
router.get('/', (req, res) => {
  // 현재 접속 역할
  const currentRole = req.query.role || 'client';

  const postSql = `
    SELECT post_id, author, content, created_at, role
    FROM posts
    ORDER BY post_id DESC
  `;

  connection.query(postSql, (err, posts) => {
    if (err) {
      console.error(err);
      return res.send('게시글 조회 오류');
    }

    const commentSql = `
      SELECT *
      FROM comments
      ORDER BY id ASC
    `;

    connection.query(commentSql, (err, comments) => {
      if (err) {
        console.error(err);
        return res.send('댓글 조회 오류');
      }

      posts.forEach(post => {
        /* ===== 댓글 연결 ===== */
        post.comments = comments.filter(
          c => String(c.post_id) === String(post.post_id)
        );

        /* ===== 게시글 삭제 버튼 노출 ===== */
        if (currentRole === 'host') {
          post.canDelete = true;
        } else {
          post.canDelete = post.role === 'client';
        }

        /* ===== 댓글 삭제 버튼 노출 ===== */
        post.comments.forEach(comment => {
          if (currentRole === 'host') {
            comment.canDelete = true;
          } else {
            comment.canDelete = comment.role === 'client';
          }
        });
      });

      res.render('board', {
        posts,
        currentRole
      });
    });
  });
});

/* =====================
   게시글 작성
===================== */
router.post('/write', (req, res) => {
  const { writer, content, password, role } = req.body;

  if (!writer || !content) {
    return res.send('필수 항목 누락');
  }

  if (role === 'client' && !password) {
    return res.send('비밀번호 필요');
  }

  const sql = `
    INSERT INTO posts (author, content, password, role, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;

  connection.query(
    sql,
    [writer, content, password || null, role],
    err => {
      if (err) {
        console.error(err);
        return res.send('게시글 저장 오류');
      }
      res.redirect(`/board?role=${role}`);
    }
  );
});

/* =====================
   게시글 삭제
===================== */
router.post('/delete/:id', (req, res) => {
  const postId = req.params.id;
  const { password, role } = req.body;

  if (role === 'host') {
    return connection.query(
      'DELETE FROM posts WHERE post_id = ?',
      [postId],
      err => {
        if (err) return res.send('삭제 오류');
        res.redirect('/board?role=host');
      }
    );
  }

  const sql = `
    DELETE FROM posts
    WHERE post_id = ? AND password = ?
  `;

  connection.query(sql, [postId, password], (err, result) => {
    if (err) return res.send('삭제 오류');
    if (result.affectedRows === 0) {
      return res.send('비밀번호 불일치');
    }
    res.redirect('/board?role=client');
  });
});

module.exports = router;
