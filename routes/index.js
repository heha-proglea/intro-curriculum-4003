// ----- Routerオブジェクトの記述 -----

'use strict';
var express = require('express');
var router = express.Router();

/* GET home page. */
// (GETメソッドで)"/"にアクセスされた時に第二引数のコールバック関数を実行
router.get('/', (req, res, next) => {
  // render関数で、テンプレートviews/index.pugからHTML形式の文字列を作り(=レンダリング)、レスポンスに返す
  res.render('index', { title: 'Express', user: req.user });
});

// Routerオブジェクト自身のモジュール化
module.exports = router;
