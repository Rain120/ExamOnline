/**
 * Created by Rainy on 2017/9/21.
 */
var userLoginSQL = {
    insert: 'INSERT INTO test_user_login VALUES(0,?,?,?,0)',
    updateName: 'update test_user_login set username=? where username=?',
    updatePassword: 'update test_user_login set password=? where username=?',
    updateState: 'update test_user_login set user_state=? where username=?',
    getUserExist: 'SELECT COUNT(username) AS users, username uname  FROM test_user WHERE username=?',
    getUserLoginExist: 'SELECT COUNT(username) AS count, id, user_state state,user_type utype FROM test_user_login WHERE username=?'
};
module.exports = userLoginSQL;