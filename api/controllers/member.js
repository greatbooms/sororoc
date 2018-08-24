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
var memberIo = require('../helpers/memberIO');
var reponseReturn = require('../helpers/reponseReturn');
var url = require('url');

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
  login: login,
  join: join,
  update: update,
  remove: remove
};

/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */

async function login(req, res) {
  console.log('*********************');
  console.log(req.swagger.params);
  let selectParam = {};
  let returnParam = {};

  try {
    selectParam.type = req.swagger.params.data.value.type;
    selectParam.uid = req.swagger.params.data.value.uid;
    let resultLoginInfo = await memberIo.retrieveSocialLogin(selectParam);

    console.log(resultLoginInfo);

    if (resultLoginInfo != undefined && resultLoginInfo.length != 0) {
      returnParam.memberId = resultLoginInfo[0].id;
      returnParam.email = resultLoginInfo[0].email;
      returnParam.phone = resultLoginInfo[0].phone;
      returnParam.name = resultLoginInfo[0].name;
      returnParam.imageName = resultLoginInfo[0].imageName;
    } else {
      returnParam.memberId = -1;
      returnParam.email = '';
      returnParam.phone = '';
      returnParam.name = '';
      returnParam.imageName = '';
    }

    reponseReturn.success(res, returnParam);
  } catch (err) {
    console.log(err);
    returnParam.message = err.message;
    reponseReturn.error(res, returnParam, '500');
  }
}

async function join(req, res) {
  let insertParam = {};
  let returnParam = {};
  let file = req.swagger.params.memberImage.value;

  try {
    let saveFileName = null;
    if (file != undefined) {
      console.log(file);
      saveFileName = memberIo.createNonceStr() + '_' + file.originalname
      file.savename = saveFileName;

      memberIo.saveImage(file);

      let resultImage = await memberIo.insertMemberImage(file);

      insertParam.idxImage = resultImage.insertId;
    } else if (req.swagger.params.imageUrl.value != undefined) {
      let inputUrl = req.swagger.params.imageUrl.value;
      let parsedObject = url.parse(inputUrl);
      saveFileName = memberIo.createNonceStr() + '_' + parsedObject.pathname.split('/')[parsedObject.pathname.split('/').length - 1];
      let saveImgParam = {};
      saveImgParam.url = inputUrl;
      saveImgParam.savename = saveFileName;
      let resultSaveImage = await memberIo.saveUrlImage(saveImgParam);
      saveImgParam.originalname = parsedObject.pathname.split('/')[parsedObject.pathname.split('/').length - 1]
      saveImgParam.mimetype = resultSaveImage.type;
      saveImgParam.size = resultSaveImage.size;
      let resultImage = await memberIo.insertMemberImage(saveImgParam);

      insertParam.idxImage = resultImage.insertId;
    }

    insertParam.name = req.swagger.params.name.value;
    insertParam.phone = req.swagger.params.phone.value;
    insertParam.email = req.swagger.params.email.value;

    let resultMember = await memberIo.insertMemberInfo(insertParam);

    let socialLoginParam = {};
    socialLoginParam.idxMember = resultMember.insertId;
    socialLoginParam.loginType = req.swagger.params.loginType.value;
    socialLoginParam.loginUid = req.swagger.params.loginUid.value;

    await memberIo.insertLoginInfo(socialLoginParam);

    returnParam.memberId = resultMember.insertId;
    returnParam.email = req.swagger.params.email.value;
    returnParam.phone = req.swagger.params.phone.value;
    returnParam.name = req.swagger.params.name.value;
    returnParam.imageName = saveFileName;

    reponseReturn.success(res, returnParam);
  } catch (err) {
    console.log(err);
    returnParam.message = err.message;
    reponseReturn.error(res, returnParam, '500');
  }
}

async function update(req, res) {
  let returnParam = {};
  try {
    let updateParam = {};
    let file = req.swagger.params.memberImage.value;
    if (file != undefined) {
      file.savename = memberIo.createNonceStr() + '_' + file.originalname;

      memberIo.saveImage(file);

      let resultImage = await memberIo.insertMemberImage(file);

      updateParam.idxImage = resultImage.insertId;
    }

    updateParam.name = req.swagger.params.name.value;
    updateParam.phone = req.swagger.params.phone.value;
    updateParam.email = req.swagger.params.email.value;
    updateParam.memberId = req.swagger.params.memberId.value;

    console.log(updateParam);

    let resultMember = await memberIo.updateMemberInfo(updateParam);

    returnParam = await memberIo.retrieveMemberInfo(req.swagger.params.memberId.value);

    reponseReturn.success(res, returnParam[0]);
  } catch (err) {
    console.log(err);
    returnParam.message = err.message;
    reponseReturn.error(res, returnParam, '500');
  }
}

async function remove(req, res) {
  let returnParam = {};
  try {
    let updateParam = {};
    updateParam.memberId = req.swagger.params.data.value.memberId;
    let result1 = await memberIo.removeMemberRepositoryInfo(updateParam);
    let result2 = await memberIo.removeMemberLoginInfo(updateParam);
    let result3 = await memberIo.removeMemberInfo(updateParam);

    if (result3.changedRows == 0) {
      returnParam.code = -1;
      returnParam.message = '탈퇴에 실패하였습니다.'
    } else {
      returnParam.code = 0;
      returnParam.message = '';
    }

    reponseReturn.success(res, returnParam);
  } catch (err) {
    console.log(err);
    returnParam.message = err.message;
    reponseReturn.error(res, returnParam, '500');
  }
}