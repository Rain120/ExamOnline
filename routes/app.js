/***
 *  应用程序入口
 */
/**
 *   加载express模块
 */
var express = require('express');
/**
 * 加载模板处理模块
 */
var swig = require("swig");
/**
 * 加载body-parser，用来处理post提交过来的数据
 */
var bodyParser = require('body-parser');
/**
 * 创建app应用 => nodejs http.createServer();
 */
var app = express();
console.log("createServer");
/**
 * 设置静态文件托管
 * 当用户访问的URL以public开始，那么直接返回对应__dirname + '/public'下的文件
 */
app.use('./public', express.static(__dirname + '/public'));
/*配置应用模板
 * 定义当前应用所使用的模板引擎
 * 第一个参数：模板引擎的名称， 同时也是模板文件的后缀
 * 第二个参数： 表示用于解析处理模板内容的方法
 */
app.engine('html', swig.renderFile);
/* 设置模板文件存放的目录
 * 第一个参数：必须是views
 * 第二个参数是目录
 */
app.set('views', './views');
/**
 * 注册所使用的模板引擎
 * 第一个参数：必须是view engine
 * 第二个参数： 和app engine这个方法中定义的模板引擎的名称（第一个参数）是一致的
 */
app.set('view engine', 'html');
swig.setDefaults({cache:false});

/**
 * body-parser设置
 * 返回中间件，只解析urlencoded主体，只查看Content-Type标题与type选项匹配的请求。
 * 此解析器仅接受身体的UTF-8编码，并支持自动通膨gzip和deflate编码。
 * body包含解析的数据的新对象request 在中间件（即req.body）之后被填充在对象上。
 * 该对象将包含键值对，其中值可以是字符串或数组（当extended为 false）或任何类型（何时extended为true）。
 */
app.use(bodyParser.urlencoded({extended: true}));

/**
 * 根据不同的功能划分模块
 */
app.use('/manager', require('./manager'));
app.use('/admin', require('./admin'));
app.use('/api', require('./api'));
app.use('/', require('./main'));

app.listen(3000);
console.log("Listen 127.0.0.1:3000");
module.exports = app;
