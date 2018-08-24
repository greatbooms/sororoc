var fs = require('fs');
var request = require('request');
var pool = require('../../config/databaseConfig');

var ImagePath = '/uploads/';

var createNonceStr = exports.createNonceStr = function() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

exports.saveImage = (file) => {
  fs.writeFile(ImagePath + file.savename, file.buffer, function(err) {
    if (err) {
      console.log(err);
      var err = {
        message: 'File not uploaded'
      };
      return next(err);
    }
  });
}

exports.saveUrlImage = (param) => new Promise((resolve, reject) => {
  let returnParam = {};
  request.head(param.url, function(err, res, body) {
    returnParam.type = res.headers['content-type'];
    returnParam.size = res.headers['content-length'];

    request(param.url).pipe(fs.createWriteStream(ImagePath + param.savename)).on('close', function() {
      resolve(returnParam);
    });
  });
})

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
  console.log(queryStr);
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
  console.log(queryStr);
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
  console.log(queryStr);
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
  var queryStr = 'SELECT b.id, b.name, b.phone, b.email, c.save_file_name AS imageName '
  queryStr += 'FROM socialLogin a join member b ';
  queryStr += 'on a.idx_member = b.id ';
  queryStr += 'left join image_file c ';
  queryStr += 'on b.idx_image = c.id ';
  queryStr += 'WHERE b.status_flag != 3 ';
  queryStr += 'AND a.type = ? ';
  queryStr += 'AND a.uid = ?';
  var queryVar = [param.type, param.uid];
  console.log(queryStr);
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
  var queryStr = 'SELECT a.id, a.name, a.phone, a.email, c.save_file_name AS imageName '
  queryStr += 'FROM member a left join image_file c ';
  queryStr += 'on a.idx_image = c.id ';
  queryStr += 'WHERE a.id = ? ';
  queryStr += 'AND a.status_flag != 3 ';
  var queryVar = [param];
  console.log(queryStr);
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

exports.removeRepositoryMemberInfo = (param) => new Promise((resolve, reject) => {
  var queryStr = 'update memberJoinRepository set ';
  queryStr += 'status_flag = 3, ';
  queryStr += 'update_date = now() ';
  queryStr += 'WHERE idx_member = ? ';
  queryStr += 'AND status_flag != 3';
  var queryVar = [param.memberId];
  console.log(queryStr);
  console.log(queryVar);
  pool.query(queryStr, queryVar, function(error, rows, fields) {
    if (error) {
      reject(error)
    } else {
      if (rows != undefined && rows.length != 0) {
        resolve(rows);
      } else {
        reject(new Error('updateAuthority1'));
      }
    }
  })
})

exports.removeMemberRepositoryInfo = (param) => new Promise((resolve, reject) => {
  var queryStr = 'update memberJoinRepository set ';
  queryStr += 'status_flag = 3, ';
  queryStr += 'update_date = now() ';
  queryStr += 'WHERE idx_member = ? ';
  queryStr += 'AND status_flag != 3';
  var queryVar = [param.memberId];
  console.log(queryStr);
  console.log(queryVar);
  pool.query(queryStr, queryVar, function(error, rows, fields) {
    if (error) {
      reject(error)
    } else {
      if (rows != undefined && rows.length != 0) {
        resolve(rows);
      } else {
        reject(new Error('updateAuthority1'));
      }
    }
  })
})

exports.removeMemberLoginInfo = (param) => new Promise((resolve, reject) => {
  var queryStr = 'update socialLogin set ';
  queryStr += 'status_flag = 3, ';
  queryStr += 'update_date = now() ';
  queryStr += 'WHERE idx_member = ? ';
  queryStr += 'AND status_flag != 3';
  var queryVar = [param.memberId];
  console.log(queryStr);
  console.log(queryVar);
  pool.query(queryStr, queryVar, function(error, rows, fields) {
    if (error) {
      reject(error)
    } else {
      if (rows != undefined && rows.length != 0) {
        resolve(rows);
      } else {
        reject(new Error('updateAuthority1'));
      }
    }
  })
})

exports.removeMemberInfo = (param) => new Promise((resolve, reject) => {
  var queryStr = 'update member set ';
  queryStr += 'status_flag = 3, ';
  queryStr += 'update_date = now() ';
  queryStr += 'WHERE id = ? ';
  queryStr += 'AND status_flag != 3';
  var queryVar = [param.memberId];
  console.log(queryStr);
  console.log(queryVar);
  pool.query(queryStr, queryVar, function(error, rows, fields) {
    if (error) {
      reject(error)
    } else {
      if (rows != undefined && rows.length != 0) {
        resolve(rows);
      } else {
        reject(new Error('updateAuthority1'));
      }
    }
  })
})