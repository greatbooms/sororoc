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

exports.insertRepositoryImage = (param) => new Promise((resolve, reject) => {
  var queryStr = 'INSERT INTO image_file ('
  queryStr += 'save_file_name, ';
  queryStr += 'original_file_name, ';
  queryStr += 'content_type, ';
  queryStr += 'file_size, ';
  queryStr += 'status_flag, ';
  queryStr += 'insert_date) ';
  queryStr += 'VALUES (?, ?, ?, ?, ?, now())';
  var queryVar = [param.savename, param.originalname, param.mimetype, param.size, 1];
  pool.query(queryStr, queryVar, function(error, rows, fields) {
    if (error) {
      reject(error)
    } else {
      if (rows != undefined && rows.length != 0) {
        resolve(rows);
      } else {
        reject(new Error('insertRepositoryImage Error'));
      }
    }
  })
})

exports.insertRepositoryInfo = (param) => new Promise((resolve, reject) => {
  var queryStr = 'INSERT INTO repository ('
  queryStr += 'idx_image, ';
  queryStr += 'name, ';
  queryStr += 'extra_info, ';
  queryStr += 'code, ';
  queryStr += 'down_permission_flag, ';
  queryStr += 'status_flag, ';
  queryStr += 'insert_date) ';
  queryStr += 'VALUES (?, ?, ?, ?, 1, ?, now())';
  var queryVar = [param.idxImage, param.name, param.extraInfo, param.code, 1];
  pool.query(queryStr, queryVar, function(error, rows, fields) {
    if (error) {
      reject(error)
    } else {
      if (rows != undefined && rows.length != 0) {
        resolve(rows);
      } else {
        reject(new Error('insertRepositoryInfo Error'));
      }
    }
  })
})

exports.insertRepositoryJoin = (param) => new Promise((resolve, reject) => {
  var queryStr = 'INSERT INTO memberJoinRepository ('
  queryStr += 'idx_member, ';
  queryStr += 'idx_repository, ';
  queryStr += 'authority, ';
  queryStr += 'status_flag, ';
  queryStr += 'insert_date) ';
  queryStr += 'VALUES (?, ?, ?, ?, now())';
  var queryVar = [param.idxMember, param.idxRepository, 1, 1];
  pool.query(queryStr, queryVar, function(error, rows, fields) {
    if (error) {
      reject(error)
    } else {
      if (rows != undefined && rows.length != 0) {
        resolve(rows);
      } else {
        reject(new Error('insertRepositoryJoin Error'));
      }
    }
  })
})

exports.retrieveRepositoryCode = (code) => new Promise((resolve, reject) => {
  var queryStr = 'SELECT code '
  queryStr += 'FROM repository ';
  queryStr += 'WHERE code = ? ';
  queryStr += 'AND status_flag != 3 ';
  var queryVar = [code];
  pool.query(queryStr, queryVar, function(error, rows, fields) {
    if (error) {
      reject(error)
    } else {
      resolve(rows);
    }
  })
})

exports.retrieveRepositoryList = (code) => new Promise((resolve, reject) => {
  var queryStr = 'SELECT b.id as repositoryId, b.name, b. extra_info, b.idx_image '
  queryStr += 'FROM memberJoinRepository a, repository b ';
  queryStr += 'WHERE a.idx_repository = b.id ';
  queryStr += 'AND a.status_flag != 3 ';
  queryStr += 'AND b.status_flag != 3 ';
  queryStr += 'AND a.idx_member = ? ';
  var queryVar = [code];
  pool.query(queryStr, queryVar, function(error, rows, fields) {
    if (error) {
      reject(error)
    } else {
      resolve(rows);
    }
  })
})

exports.retrieveRepositoryDetail = (repositoryId) => new Promise((resolve, reject) => {
  var queryStr = 'SELECT b.id as memberId, b.name, b.phone, b.email, a.authority '
  queryStr += 'FROM memberJoinRepository a, member b ';
  queryStr += 'WHERE a.idx_member = b.id ';
  queryStr += 'AND a.status_flag != 3 ';
  queryStr += 'AND b.status_flag != 3 ';
  queryStr += 'AND a.idx_repository = ? ';
  var queryVar = [repositoryId];
  pool.query(queryStr, queryVar, function(error, rows, fields) {
    if (error) {
      reject(error)
    } else {
      resolve(rows);
    }
  })
})

exports.retrieveRepositoryName = (param) => new Promise((resolve, reject) => {
  var queryStr = 'SELECT b.id as repositoryId, b.idx_image, b.name, b.extra_info, IF(a.idx_member=?, true, false) as joinFlag '
  queryStr += 'FROM memberJoinRepository a left join repository b on a.idx_repository = b.id ';
  queryStr += "WHERE b.name like CONCAT('%', ?, '%') ";
  queryStr += 'AND b.status_flag != 3 ';
  var queryVar = [param.memberId, param.repositoryName];
  pool.query(queryStr, queryVar, function(error, rows, fields) {
    if (error) {
      reject(error)
    } else {
      resolve(rows);
    }
  })
})

exports.insertRepositoryJoin = (param) => new Promise((resolve, reject) => {
  var queryStr = 'INSERT INTO memberJoinRepository ('
  queryStr += 'idx_member, ';
  queryStr += 'idx_repository, ';
  queryStr += 'authority, ';
  queryStr += 'status_flag, ';
  queryStr += 'insert_date) ';
  queryStr += 'VALUES (?, ?, ?, ?, now())';
  var queryVar = [param.idxMember, param.idxRepository, 1, 1];
  pool.query(queryStr, queryVar, function(error, rows, fields) {
    if (error) {
      reject(error)
    } else {
      if (rows != undefined && rows.length != 0) {
        resolve(rows);
      } else {
        reject(new Error('insertRepositoryJoin Error'));
      }
    }
  })
})