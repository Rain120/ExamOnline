var express = require('express');
var router = express.Router();
var util = require('util');
/***
 * 加载mysql数据库模块
 * 导入数据库
 */
var mysql = require('mysql');
var dbConfig = require('../database/DBConfig');
var userSignupSQL = require('../database/userSignupSQL');
var userLoginSQL = require('../database/userLoginSQL');
/**
 * 使用DBConfig.js的配置信息创建一个MySQL连接池
 */
var pool = mysql.createPool(dbConfig.mysql);
console.log("DataBase connect successful");
/***
 * 统一返回格式
 */
var responseData;

router.use(function (req, res, next) {
    responseData = {
        code: 0,
        message: ''
    };
    next();
});
/***
 * 用户注册
 *  1.用户名不能为null 3-16位
 *  2.密码不能为null   6-16位
 *  3.两次密码输入必须一致
 *      （前端JQuery Validate验证）
 *  4.用户是否已经被注册（数据库查询）
 */
router.post('/user/register', function (req, res) {
    console.log("router.post('/user/register'====>");
    util.log(util.inspect(req.method));
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;
    var occupation = req.body.occupation;
    console.log(req.body);
    if (username == '') {
        responseData.code = 1;
        responseData.message = '用户名为空';
        // 以json形式，把操作结果返回给前台页面
        res.json(responseData);
        return;
    }
    if (password == '') {
        responseData.code = 2;
        responseData.message = '密码为空';
        // 以json形式，把操作结果返回给前台页面
        res.json(responseData);
        return;
    }
    if (repassword == '') {
        responseData.code = 3;
        responseData.message = '确认密码为空';
        // 以json形式，把操作结果返回给前台页面
        res.json(responseData);
        return;
    }
    if (password !== repassword) {
        responseData.code = 4;
        responseData.message = '输入两次密码不一';
        // 以json形式，把操作结果返回给前台页面
        res.json(responseData);
        return;
    }
    /**
     * 用户名是否已经被注册，如果数据库中已经存在和我们要注册的用户名同名的数据，表示该用户名已经被注册了
     */
    pool.getConnection(function (err, connection) {
        connection.query(userSignupSQL.getUserNumber, username, function (err, result) {
            if (err) {
                console.log('[SELECT ERROR] - ', err.message);
                return;
            }
            if (result[0].nums.valueOf() >= 1) {
                responseData.code = 5;
                responseData.message = '用户名已存在';
                // 以json形式，把操作结果返回给前台页面
                res.json(responseData);
            }
            else {
                // 建立连接 增加一个用户信息
                connection.query(userSignupSQL.insert, [username, password, repassword, occupation], function (err, result) {
                    if (err) {
                        console.log('[INSERT ERROR] - ', err.message);
                        return;
                    }
                    if (result) {
                        console.log('userSQL.insert=' + JSON.stringify(result));
                        responseData.message = '用户注册成功';
                        // 以json形式，把操作结果返回给前台页面
                        res.json(responseData);
                    }
                    console.log('Register==>responseData.code=' + responseData.code);
                });
            }
        });
    });
});
router.post('/user/login', function (req, res) {
    console.log("router.post('/user/login'====>");
    util.log(util.inspect(req.method));
    var username = req.body.username;
    var password = req.body.password;
    var user_type = req.body.user_type;
    console.log(req.body);
    if (username == '') {
        responseData.code = 1;
        responseData.message = '用户名为空';
        // 以json形式，把操作结果返回给前台页面
        res.json(responseData);
        return;
    }
    if (password == '') {
        responseData.code = 2;
        responseData.message = '密码为空';
        // 以json形式，把操作结果返回给前台页面
        res.json(responseData);
        return;
    }
    /**
     * 用户名是否存在
     */
    pool.getConnection(function (err, connection) {
        connection.query(userLoginSQL.getUserExist, username, function (err, searchRegisterResult) {
            if (err) {
                console.log('[SELECT ERROR] - ', err.message);
                return;
            }
            console.log("searchRegisterResult==>" + searchRegisterResult[0].uname);
            if (searchRegisterResult[0].users < 1) {
                responseData.code = 6;
                responseData.message = '用户名未注册';
                // 以json形式，把操作结果返回给前台页面
                res.json(responseData);
            } else {
                /***
                 * 用户是否登录
                 */
                connection.query(userLoginSQL.getUserLoginExist, username, function (err, searchLoginResult) {
                    if (err) {
                        console.log('[SELECT ERROR] - ', err.message);
                        return;
                    }
                    if (searchLoginResult[0].count >= 1) {
                        console.log('用户已存在');
                        if(searchLoginResult[0].state == 1) {
                            responseData.code = 7;
                            responseData.message = '用户已经登录';
                            // 以json形式，把操作结果返回给前台页面
                            res.json(responseData);
                        }
                        else {
                            connection.query(userLoginSQL.updateState, [1, username], function (err, loginResult) {
                                if (err) {
                                    console.log('[INSERT ERROR] - ', err.message);
                                    return;
                                }
                                if (loginResult) {
                                    console.log("loginResult==>" + typeof(loginResult) );
                                    responseData.message = '用户登录成功';
                                    responseData.searchRegisterResult = {
                                        username: searchRegisterResult[0].uname
                                    };
                                    res.json(responseData);
                                }
                            });
                        }
                    } else {
                        connection.query(userLoginSQL.insert, [username, password, user_type], function (err, insertResult) {
                            if (err) {
                                console.log('[INSERT ERROR] - ', err.message);
                                return;
                            }
                            if (insertResult) {
                                connection.query(userLoginSQL.updateState, [1, username], function (err, loginResult) {
                                    if (err) {
                                        console.log('[INSERT ERROR] - ', err.message);
                                        return;
                                    }
                                    if (loginResult) {
                                        console.log("loginResult==>" + typeof(loginResult));
                                        responseData.message = '用户登录成功';
                                        responseData.loginResult = {
                                            username: searchRegisterResult[0].uname
                                        };
                                        // 以json形式，把操作结果返回给前台页面
                                        res.json(responseData);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
    console.log('Login===>responseData.code=' + responseData.code);
    //// 释放连接
    //connection.release();
    //console.log('connection.release()');
});
module.exports = router;