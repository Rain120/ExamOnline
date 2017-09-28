var express = require('express');
var router = express.Router();
var util = require('util');
var silly_datetime = require('silly-datetime');
/***
 * 加载mysql数据库模块
 * 导入数据库
 */
var mysql = require('mysql');
var dbConfig = require('../database/DBConfig');
var userSignupSQL = require('../database/userSignupSQL');
var userLoginSQL = require('../database/userLoginSQL');
var addCheckSQL = require('../database/addCheckSubjectsSQL');
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
/***
 * 用户登录
 * 1、判断用户是否存在(user表中)
 * 2、判断用户的登录状态(0用户未登录，1用户登录)
 * 3、用户登录后改变用户登录表中的状态，并跳转到相应的界面
 */
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
                        if (searchLoginResult[0].state == 1) {
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
                                    console.log("loginResult==>" + typeof(loginResult));
                                    responseData.message = '用户登录成功';
                                    responseData.LoginResultData = {
                                        username: searchRegisterResult[0].uname,
                                        usertype: searchLoginResult[0].utype
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
                                        responseData.LoginResultData = {
                                            username: searchRegisterResult[0].uname,
                                            usertype: searchLoginResult[0].utype
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
/**
 * 管理员添加题目
 * 判断添加题型，并加入相应的题库表，置相应的状态
 * 1、选择题
 * 2、编程题
 * 3、解答题
 */
/***
 * 1、选择题
 */
router.post('/manager/addCheck', function (req, res) {
    var nowTime = silly_datetime.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
    //var nowTime = new Date( Date.parse(timeString.replace("/-/g", "/")));
    console.log(typeof(nowTime));
    console.log(nowTime);
    var check_title = req.body.check_title;
    var sub_options_A = req.body.sub_options_A;
    var sub_options_B = req.body.sub_options_B;
    var sub_options_C = req.body.sub_options_C;
    var sub_options_D = req.body.sub_options_D;
    var check_result = req.body.check_result;
    console.log(req.body);
    if (check_title == '') {
        responseData.code = 10;
        responseData.message = '题目为空';
        res.json(responseData);
        return;
    }
    if (sub_options_A == '') {
        responseData.code = 11;
        responseData.message = '选项A为空';
        res.json(responseData);
        return;
    }
    if (sub_options_B == '') {
        responseData.code = 12;
        responseData.message = '选项B为空';
        res.json(responseData);
        return;
    }
    if (sub_options_C == '') {
        responseData.code = 13;
        responseData.message = '选项C为空';
        res.json(responseData);
        return;
    }
    if (sub_options_D == '') {
        responseData.code = 14;
        responseData.message = '选项D为空';
        res.json(responseData);
        return;
    }
    if (check_result == '') {
        responseData.code = 15;
        responseData.message = '选择题答案为空';
        res.json(responseData);
        return;
    }
    pool.getConnection(function (err, connection) {
        connection.query(addCheckSQL.getSubExist, check_title, function (err, searchSubResult) {
            if (err) {
                console.log('[SELECT ERROR] - ', err.message);
                return;
            }
            if (searchSubResult[0].count >= 1) {
                responseData.code = 9;
                responseData.message = '题目已存在';
                res.json(responseData);
            }
            else {
                connection.query(addCheckSQL.insert, [check_title, sub_options_A, sub_options_B, sub_options_C, sub_options_D, check_result, 0], function (err, insertResult) {
                    if (err) {
                        console.log('[INSERT ERROR] - ', err.message);
                        return;
                    }
                    if (insertResult) {
                        responseData.message = '添加题目成功';
                        res.json(responseData);
                    }
                    console.log('addCheckSQL.insert==>responseData.code=' + responseData.code);
                });
            }
        });
    });
});

/**
 * 查询题目，并返回JSON到前台页面
 */
router.get('/exam', function (req, res) {
    pool.getConnection(function (err, connection) {
        connection.query(addCheckSQL.getSubNums, 0, function (err, searchSubCountResult) {
            if (err) {
                console.log('[SELECT ERROR] - ', err.message);
                return;
            }
            if (searchSubCountResult[0].nums.valueOf() >= 8) {
                connection.query(addCheckSQL.selectSub, function (err, selectSubResult) {
                    if (selectSubResult) {
                        responseData.code = 0;
                        responseData.message = '取题成功';
                        responseData.subData = {
                            check: [
                                {
                                    title_num: 1,
                                    check_id: selectSubResult[0].id,
                                    check_title: selectSubResult[0].check_title,
                                    check_options_A: selectSubResult[0].check_options_A,
                                    check_options_B: selectSubResult[0].check_options_B,
                                    check_options_C: selectSubResult[0].check_options_C,
                                    check_options_D: selectSubResult[0].check_options_D,
                                    check_result_1: selectSubResult[0].check_result
                                },
                                {
                                    title_num: 2,
                                    check_id: selectSubResult[1].id,
                                    check_title: selectSubResult[1].check_title,
                                    check_options_A: selectSubResult[1].check_options_A,
                                    check_options_B: selectSubResult[1].check_options_B,
                                    check_options_C: selectSubResult[1].check_options_C,
                                    check_options_D: selectSubResult[1].check_options_D,
                                    check_result: selectSubResult[1].check_result
                                },
                                {
                                    title_num: 3,
                                    check_id: selectSubResult[2].id,
                                    check_title: selectSubResult[2].check_title,
                                    check_options_A: selectSubResult[2].check_options_A,
                                    check_options_B: selectSubResult[2].check_options_B,
                                    check_options_C: selectSubResult[2].check_options_C,
                                    check_options_D: selectSubResult[2].check_options_D,
                                    check_result: selectSubResult[2].check_result
                                },
                                {
                                    title_num: 4,
                                    check_id: selectSubResult[3].id,
                                    check_title: selectSubResult[3].check_title,
                                    check_options_A: selectSubResult[3].check_options_A,
                                    check_options_B: selectSubResult[3].check_options_B,
                                    check_options_C: selectSubResult[3].check_options_C,
                                    check_options_D: selectSubResult[3].check_options_D,
                                    check_result: selectSubResult[3].check_result
                                },
                                {
                                    title_num: 5,
                                    check_id: selectSubResult[4].id,
                                    check_title: selectSubResult[4].check_title,
                                    check_options_A: selectSubResult[4].check_options_A,
                                    check_options_B: selectSubResult[4].check_options_B,
                                    check_options_C: selectSubResult[4].check_options_C,
                                    check_options_D: selectSubResult[4].check_options_D,
                                    check_result: selectSubResult[4].check_result
                                },
                                {
                                    title_num: 6,
                                    check_id: selectSubResult[5].id,
                                    check_title: selectSubResult[5].check_title,
                                    check_options_A: selectSubResult[5].check_options_A,
                                    check_options_B: selectSubResult[5].check_options_B,
                                    check_options_C: selectSubResult[5].check_options_C,
                                    check_options_D: selectSubResult[5].check_options_D,
                                    check_result: selectSubResult[5].check_result
                                },
                                {
                                    title_num: 7,
                                    check_id: selectSubResult[6].id,
                                    check_title: selectSubResult[6].check_title,
                                    check_options_A: selectSubResult[6].check_options_A,
                                    check_options_B: selectSubResult[6].check_options_B,
                                    check_options_C: selectSubResult[6].check_options_C,
                                    check_options_D: selectSubResult[6].check_options_D,
                                    check_result: selectSubResult[6].check_result
                                },
                                {
                                    title_num: 8,
                                    check_id: selectSubResult[7].id,
                                    check_title: selectSubResult[7].check_title,
                                    check_options_A: selectSubResult[7].check_options_A,
                                    check_options_B: selectSubResult[7].check_options_B,
                                    check_options_C: selectSubResult[7].check_options_C,
                                    check_options_D: selectSubResult[7].check_options_D,
                                    check_result: selectSubResult[7].check_result
                                }
                            ]
                        };
                        /**设置响应头允许ajax跨域访问**/
                        res.setHeader("Access-Control-Allow-Origin","*");
                        /*星号表示所有的异域请求都可以接受，*/
                        res.setHeader("Access-Control-Allow-Methods","GET,POST,PUT,DELETE");
                        res.json(responseData);
                    }
                });
            }
            else {
                responseData.code = 16;
                responseData.message = '题目数量不足';
                res.json(responseData);
            }
        });
    });
});
module.exports = router;