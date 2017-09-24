/**
 * Created by Rainy on 2017/9/20.
 */
var userSignupSQL ={
    insert: 'INSERT INTO test_user VALUES(0,?,?,?,?)',
    updateName: 'update test_user set name=? where id=?',
    queryAll: 'SELECT * FROM test_user',
    getUserByName: 'SELECT * FROM test_user WHERE username = ? ',
    getUserNumber: 'SELECT COUNT(username) AS nums FROM test_user WHERE username = ?'
};
module.exports = userSignupSQL;