var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var helmet = require('helmet');


// ----- GitHub認証の設定コード ここから-----
var session = require('express-session'); // 認証保持のために使う、セッション周りのモジュール
var passport = require('passport'); // 外部認証用のプラットフォームライブラリ
var GitHubStrategy = require('passport-github2').Strategy; // passportでGitHub認証するためのStrategyモジュールpassport-github2を読み込み、Strategyオブジェクトを取得

// Client IDとClient Secretの設定
var GITHUB_CLIENT_ID = '331d57edd13456a43191';
var GITHUB_CLIENT_SECRET = 'f6da630085218124f47417eeb958df28921743b4';

// 認証したユーザ情報をセッションにまとめて保存する
passport.serializeUser(function (user, done) {
  done(null, user); // done関数: done(エラー, 結果)
});

// 保存されたユーザ情報をまとめて読み出す
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

// passportモジュールに、GitHub認証用のStrategyオブジェクトを設定する
passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:8000/auth/github/callback'
},
  function (accessToken, refreshToken, profile, done) {
    // 認証後に実行する処理
    process.nextTick(function () { // process.nextTic関数に渡されたコールバック関数はすぐには実行されない？？Node.jsのイベントループがどうとか？？
      return done(null, profile);
    });
  }
));
// ----- GitHubを使った外部認証用のコード ここまで-----


// 外部('./routers')に書いたRouterオブジェクト(=ミドルウェア関数)の読み込み
var index = require('./routes/index');
var users = require('./routes/users');
var photos = require('./routes/photos');

// Applicationオブジェクトの作成
var app = express();
// クライアントからのリクエスト全てに対して、引数のミドルウェア関数を実行
app.use(helmet());

// view engine setup
// set関数でシステム全体に関わる設定を行う
// テンプレートファイルの場所をディレクトリ'views'に指定
app.set('views', path.join(__dirname, 'views'));
// テンプレートエンジンをPugに設定
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// use関数の引数にパスを渡さなかった場合、クライアントからのリクエスト全てに対して引数のミドルウェア関数が実行される
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// ----- GitHub認証の処理コード ここから-----
// express-sessionでセッションを利用するための設定
app.use(session({ secret: '417cce55dcfcfaeb', resave: false, saveUninitialized: false })); // セッションID作成時の秘密鍵、セッションは必ずストアに保存しない、セッションが初期化されてなくてもストアに保存しない を設定 for セキュリティ
// passportでセッションを利用するための設定
app.use(passport.initialize());
app.use(passport.session());
// ----- GitHub認証の処理コード ここまで-----


// use関数の引数にパスを渡した場合、そのパスへのリクエストがあった際に引数のミドルウェア関数が実行される
app.use('/', index);
app.use('/users', ensureAuthenticated, users); // パスへのアクセス前に、ユーザー認証済みであることを確認する
app.use('/photos', photos);


// ----- GitHub認証の処理コード ここから-----
// パスに対するHTTPリクエストのハンドラの設定
app.get('/auth/github',
  // GETで'/auth/github'にアクセスされた時に行う処理
  passport.authenticate('github', { scope: ['user:email'] }), //スコープ(認可範囲)の設定
  // リクエストあった場合に行う処理(「何もしない」として記述してある)
  function (req, res) { // 認証実行時のログなんかを記述する
});

app.get('/auth/github/callback',
  // GETで'/auth/github/callback'にアクセスされた時に行う処理 ※このパスにGitHubから認証結果の可否が送られてくる
  passport.authenticate('github', { failureRedirect: '/login' }), // 認証失敗した際には、/loginにリダイレクトしてサイド認証を促す
  function (req, res) {
    res.redirect('/'); // 認証成功したら/へリダイレクト
});

app.get('/login', function (req, res) {
  // GET/loginにアクセスがあった時に行う処理
  // テンプレートlogin.pugからログインページをレンダリングする
  res.render('login');
});

app.get('/logout', function (req, res) {
  // GET/logoutにアクセスがあった時に行う処理
  // ログアウトする
  req.logout();
  // /にリダイレクトする
  res.redirect('/');
});
// ----- GitHub認証の処理コード ここまで-----


// ユーザー認証が済んでいることの確認
function ensureAuthenticated(req, res, next) {
  // 認証済みである場合には、次の処理へとnextする
  if (req.isAuthenticated()) { return next(); }
  // 認証済みで無い場合は、'/login'へリダイレクトする
  res.redirect('/login');
}


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
