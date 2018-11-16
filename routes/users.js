// ----- Routerオブジェクトの記述 -----

'use strict';
const express = require('express');
const router = express.Router();

/* GET users listing. */
// (GETメソッドで)"/"にアクセスされた時に第二引数のコールバック関数を実行
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

// Routerオブジェクト自身のモジュール化
module.exports = router;
