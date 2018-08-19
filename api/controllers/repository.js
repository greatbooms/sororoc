'use strict';
/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
*/

/*
 Modules make it possible to import JavaScript files into your application.  Modules are imported
 using 'require' statements that give you a reference to the module.

  It is a good idea to list the modules that your application depends on in the package.json in the project root
 */
var util = require('util');
var repositoryIO = require('../helpers/repositoryIO');
var reponseReturn = require('../helpers/reponseReturn');

/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

 For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.

 Either:
  - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
  - Or the operationId associated with the operation in your Swagger document

  In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
  we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */
module.exports = {
  createRepositoryCode: createRepositoryCode,
  createRepository: createRepository,
  retrieveRepositoryList: retrieveRepositoryList,
  retrieveRepositoryDetail: retrieveRepositoryDetail,
  retrieveRepositoryName: retrieveRepositoryName,
  joinRepository: joinRepository,
  exitRepository: exitRepository,
  destroyRepository: destroyRepository
};

/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */

async function createRepositoryCode(req, res) {
  let returnParam = {};
  try {
    let exitFlag = true;
    let code = '';
    do {
      code = Math.floor((1 + Math.random()) * 0x100000).toString(16).toUpperCase();

      let resultCode = await repositoryIO.retrieveRepositoryCode(code);

      if (resultCode.length != 0) {
        continue;
      } else {
        exitFlag = false;
      }

      returnParam.code = code;

      reponseReturn.success(res, returnParam);
    } while (exitFlag)
  } catch (err) {
    console.log(err);
    returnParam.message = err.message;
    reponseReturn.error(res, returnParam, '500');
  }
}

async function createRepository(req, res) {
  console.log('*********************');
  console.log(req.swagger.params);
  let insertParam = {};
  let returnParam = {};
  let file = req.swagger.params.repositoryImage.value;

  try {
    if (file != undefined) {
      file.savename = repositoryIO.createNonceStr() + '_' + file.originalname;

      repositoryIO.saveImage(file);

      console.log(file)

      let resultImage = await repositoryIO.insertRepositoryImage(file);

      insertParam.idxImage = resultImage.insertId;
    }

    insertParam.name = req.swagger.params.name.value;
    insertParam.extraInfo = req.swagger.params.extraInfo.value;
    insertParam.code = req.swagger.params.code.value;

    console.log(insertParam)

    let resultRepository = await repositoryIO.insertRepositoryInfo(insertParam);

    let joinRepositoryParam = {};
    joinRepositoryParam.idxRepository = resultRepository.insertId;
    joinRepositoryParam.idxMember = req.swagger.params.memberId.value;

    console.log(joinRepositoryParam)

    await repositoryIO.insertRepositoryJoin(joinRepositoryParam);

    returnParam.repositoryId = resultRepository.insertId;
    returnParam.memberId = req.swagger.params.memberId.value;
    returnParam.name = req.swagger.params.name.value;
    returnParam.code = req.swagger.params.code.value;

    reponseReturn.success(res, returnParam);
  } catch (err) {
    console.log(err);
    returnParam.message = err.message;
    reponseReturn.error(res, returnParam, '500');
  }
}

async function retrieveRepositoryList(req, res) {
  let returnParam = {};
  try {
    let memberId = req.swagger.params.memberId.value;
    console.log(req.swagger.params)

    let resultRepositoryList = await repositoryIO.retrieveRepositoryList(memberId);

    console.log(resultRepositoryList);

    reponseReturn.success(res, resultRepositoryList);

  } catch (err) {
    console.log(err);
    returnParam.message = err.message;
    reponseReturn.error(res, returnParam, '500');
  }
}

async function retrieveRepositoryDetail(req, res) {
  let returnParam = {};
  try {
    let repositoryId = req.swagger.params.repositoryId.value;

    let resultRepositoryMemberList = await repositoryIO.retrieveRepositoryDetail(repositoryId);

    console.log(resultRepositoryMemberList);

    reponseReturn.success(res, resultRepositoryMemberList);

  } catch (err) {
    console.log(err);
    returnParam.message = err.message;
    reponseReturn.error(res, returnParam, '500');
  }
}

async function retrieveRepositoryName(req, res) {
  let returnParam = {};
  try {
    let selectParam = {};

    selectParam.repositoryName = req.swagger.params.name.value;
    selectParam.memberId = req.swagger.params.memberId.value;

    let resultRepositorySearchList = await repositoryIO.retrieveRepositoryName(selectParam);

    console.log(resultRepositorySearchList);

    reponseReturn.success(res, resultRepositorySearchList);

  } catch (err) {
    console.log(err);
    returnParam.message = err.message;
    reponseReturn.error(res, returnParam, '500');
  }
}

async function joinRepository(req, res) {
  let returnParam = {};
  try {
    let insertParam = {};

    insertParam.idxMember = req.swagger.params.data.value.memberId;
    insertParam.idxRepository = req.swagger.params.data.value.repositoryId;
    insertParam.code = req.swagger.params.data.value.code;

    let resultRetrieve = await repositoryIO.retrieveRepositoryCodeCheck(insertParam);

    console.log(resultRetrieve);

    if (resultRetrieve.length != 0) {
      let joinCheck = await repositoryIO.retrieveRepositoryJoinCheck(insertParam);
      console.log(joinCheck);
      if (joinCheck.length == 0) {
        let resultInsert = await repositoryIO.insertRepositoryJoin(insertParam);
        returnParam.repositoryId = req.swagger.params.data.value.repositoryId;
      } else {
        returnParam.repositoryId = -2;
        returnParam.message = '이미 가입된 저장소 입니다.';
      }
    } else {
      returnParam.repositoryId = -1;
      returnParam.message = '코드가 일치하지 않습니다.';
    }

    reponseReturn.success(res, returnParam);

  } catch (err) {
    console.log(err);
    returnParam.message = err.message;
    reponseReturn.error(res, returnParam, '500');
  }
}

async function retrieveRepositoryName(req, res) {
  let returnParam = {};
  try {
    let selectParam = {};

    selectParam.repositoryName = req.swagger.params.name.value;
    selectParam.memberId = req.swagger.params.memberId.value;

    let resultRepositorySearchList = await repositoryIO.retrieveRepositoryName(selectParam);

    console.log(resultRepositorySearchList);

    reponseReturn.success(res, resultRepositorySearchList);

  } catch (err) {
    console.log(err);
    returnParam.message = err.message;
    reponseReturn.error(res, returnParam, '500');
  }
}

async function exitRepository(req, res) {
  let returnParam = {};
  try {
    let updateParam = {};

    updateParam.idxRepository = req.swagger.params.data.value.repositoryId;
    updateParam.idxMember = req.swagger.params.data.value.memberId;

    let result = await repositoryIO.exitRepository(updateParam);

    console.log(result);

    if (result.changedRows == 0) {
      returnParam.code = -1;
      returnParam.message = '그룹 나가기에 실패하였습니다.'
    } else {
      returnParam.code = 0;
      returnParam.message = ''
    }

    reponseReturn.success(res, returnParam);

  } catch (err) {
    console.log(err);
    returnParam.message = err.message;
    reponseReturn.error(res, returnParam, '500');
  }
}

async function destroyRepository(req, res) {
  let returnParam = {};
  try {
    let updateParam = {};

    updateParam.idxRepository = req.swagger.params.data.value.repositoryId;
    updateParam.idxMember = req.swagger.params.data.value.memberId;

    let resultAuthority = await repositoryIO.retrieveAuthority(updateParam);

    console.log(resultAuthority);

    if (resultAuthority.length > 0 && resultAuthority[0].authority == 1) {
      let result = await repositoryIO.destroyRepository(updateParam);
      if (result.changedRows == 0) {
        returnParam.code = -2;
        returnParam.message = '그룹 폭파에 실패하였습니다.'
      } else {
        returnParam.code = 0;
        returnParam.message = ''
      }
    } else {
      returnParam.code = -1;
      returnParam.message = '그룹 폭파 권한이 없습니다.'
    }

    reponseReturn.success(res, returnParam);

  } catch (err) {
    console.log(err);
    returnParam.message = err.message;
    reponseReturn.error(res, returnParam, '500');
  }
}