// ----- Routerオブジェクトの記述 -----

'use strict';
const express = require('express');
const router = express.Router();


// ----- 書き方1 ↓ -----
// (GETメソッドで)"/photos"にアクセスされた時に第二引数のコールバック関数を実行
router.get('/', (req, res, next) => {
  res.send('Some photos');
});

// パラメータtitleに対して行う共通の処理を記述
router.param('title', (req, res, next, title) => {
  // TODO: 変数titleに対してファイル存在チェックをする for XSS対策
  res.send(title); // 単なる文字列としてレスポンス返す
  next();
});

// プレースホルダを使ってルーティング
router.get('/:title', (req, res, next) => { // プレースホルダ:titleを設定 => titleがパラメータとして使える
  res.end();
});
// ----- 書き方1 ↑ -----


// ----- 書き方2 ↓ -----
// まとめて次のように書くこともできる
router.get('/:title?', (req, res, next) => {
  // if (req.params.title) {
  //   res.send(req.params.title);
  // } else {
  //   res.send('Some photos');
  // }
  (req.params.title)? res.send(req.params.title) : res.send('Some photos'); // 三項演算子で記述
  res.end();
});
// ----- 書き方2 ↑ -----


// Routerオブジェクト自身のモジュール化
module.exports = router;