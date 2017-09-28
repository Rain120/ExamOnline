/**
 * Created by Rainy on 2017/9/28.
 */
var addCheckSQL = {
    insert: 'INSERT INTO check_subjects VALUES(0,?,?,?,?,?,?,0)',
    selectSub: 'SELECT * FROM check_subjects',
    getSubExist: 'SELECT COUNT(check_title) count FROM check_subjects WHERE check_title=?',
    getSubNums: 'SELECT COUNT(check_title) nums FROM check_subjects WHERE sub_state=?',
    getSubState: 'SELECT sub_state s_state FROM check_subjects',
    updateSubState: 'update check_subjects SET sub_state=? WHERE check_result=?'
};
module.exports = addCheckSQL;