var fs = require('fs');
var pool = require('../../config/databaseConfig');

var ImagePath = './uploads/';

var createNonceStr = exports.createNonceStr = function() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

exports.saveImage = (file) => {
  fs.writeFile(ImagePath + file.savename, file.buffer, function(err) {
    if (err) {
      debug(err);
      var err = {
        message: 'File not uploaded'
      };
      return next(err);
    }
  });
}

exports.insertMemberImage = (param) => new Promise((resolve, reject) => {
  var queryStr = 'INSERT INTO image_file ('
  queryStr += 'save_file_name, ';
  queryStr += 'original_file_name, ';
  queryStr += 'content_type, ';
  queryStr += 'file_size, ';
  queryStr += 'status_flag, ';
  queryStr += 'insert_date) ';
  queryStr += 'VALUES (?, ?, ?, ?, ?, now())';
  var queryVar = [param.savename, param.originalname, param.mimetype, param.size, 1];
  console.log(queryVar);
  pool.query(queryStr, queryVar, function(error, rows, fields) {
    if (error) {
      reject(error)
    } else {
      if (rows != undefined && rows.length != 0) {
        resolve(rows);
      } else {
        reject(new Error('no insert member!!'));
      }
    }
  })
})

exports.insertMemberInfo = (param) => new Promise((resolve, reject) => {
  var queryStr = 'INSERT INTO member ('
  queryStr += 'idx_image, ';
  queryStr += 'name, ';
  queryStr += 'phone, ';
  queryStr += 'email, ';
  queryStr += 'status_flag, ';
  queryStr += 'insert_date) ';
  queryStr += 'VALUES (?, ?, ?, ?, ?, now())';
  var queryVar = [param.idxImage, param.name, param.phone, param.email, 1];
  console.log(queryVar);
  pool.query(queryStr, queryVar, function(error, rows, fields) {
    if (error) {
      reject(error)
    } else {
      if (rows != undefined && rows.length != 0) {
        resolve(rows);
      } else {
        reject(new Error('no insert member!!'));
      }
    }
  })
})

exports.insertLoginInfo = (param) => new Promise((resolve, reject) => {
  var queryStr = 'INSERT INTO socialLogin ('
  queryStr += 'idx_member, ';
  queryStr += 'type, ';
  queryStr += 'uid, ';
  queryStr += 'status_flag, ';
  queryStr += 'insert_date) ';
  queryStr += 'VALUES (?, ?, ?, ?, now())';
  var queryVar = [param.idxMember, param.loginType, param.loginUid, 1];
  console.log(queryVar);
  pool.query(queryStr, queryVar, function(error, rows, fields) {
    if (error) {
      reject(error)
    } else {
      if (rows != undefined && rows.length != 0) {
        resolve(rows);
      } else {
        reject(new Error('no insert member!!'));
      }
    }
  })
})

exports.retrieveSocialLogin = (param) => new Promise((resolve, reject) => {
  var queryStr = 'SELECT b.id, b.name, b.phone, b.email, b.idx_image as idxImage '
  queryStr += 'FROM socialLogin a, member b ';
  queryStr += 'WHERE a.idx_member = b.id ';
  queryStr += 'AND b.status_flag != 3 ';
  queryStr += 'AND a.type = ? ';
  queryStr += 'AND a.uid = ?';
  var queryVar = [param.type, param.uid];
  console.log(queryVar);
  pool.query(queryStr, queryVar, function(error, rows, fields) {
    if (error) {
      console.log(error);
      reject(error)
    } else {
      resolve(rows);
    }
  })
})

exports.updateMemberInfo = (param) => new Promise((resolve, reject) => {
  var queryStr = 'update member set ';
  if (param.idxImage != undefined) {
    queryStr += 'idx_image = ' + param.idxImage + ', ';
  }
  queryStr += 'name = \"' + param.name + '\", ';
  queryStr += 'phone = \"' + param.phone + '\", ';
  queryStr += 'email = \"' + param.email + '\", ';
  queryStr += 'status_flag = 2, ';
  queryStr += 'update_date = now() ';
  queryStr += 'WHERE id = ' + param.memberId;
  console.log(queryStr);
  pool.query(queryStr, function(error, rows, fields) {
    if (error) {
      reject(error)
    } else {
      if (rows != undefined && rows.length != 0) {
        resolve(rows);
      } else {
        reject(new Error('no insert member!!'));
      }
    }
  })
})

exports.retrieveMemberInfo = (param) => new Promise((resolve, reject) => {
  var queryStr = 'SELECT id, name, phone, email, idx_image as idxImage '
  queryStr += 'FROM member ';
  queryStr += 'WHERE id = ? ';
  queryStr += 'AND status_flag != 3 ';
  var queryVar = [param];
  console.log(queryVar);
  pool.query(queryStr, queryVar, function(error, rows, fields) {
    if (error) {
      console.log(error);
      reject(error)
    } else {
      resolve(rows);
    }
  })
})