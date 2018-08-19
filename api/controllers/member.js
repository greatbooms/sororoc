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
  join: join
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
    selectParam.type = req.swagger.params.login.value.type;
    selectParam.uid = req.swagger.params.login.value.uid;
    let resultLoginInfo = await memberIo.retrieveSocialLogin(selectParam);

    console.log(resultLoginInfo);

    if(resultLoginInfo != undefined && resultLoginInfo.length != 0) {
      returnParam.memberId = resultLoginInfo[0].id;
      returnParam.email = resultLoginInfo[0].email;
      returnParam.phone = resultLoginInfo[0].phone;
      returnParam.name = resultLoginInfo[0].name;
    } else {
      returnParam.memberId = -1;
      returnParam.email = '';
      returnParam.phone = '';
      returnParam.name = '';
    }

    reponseReturn.success(res, returnParam);
  } catch (err) {
    console.log(err);
    returnParam.message = err.message;
    reponseReturn.error(res, returnParam, '500');
  }
}

async function join(req, res) {
  console.log('*********************');
  console.log(req.swagger.params);
  let insertParam = {};
  let returnParam = {};
  let file = req.swagger.params.memberImage.value;

  try {
    if (file != undefined) {
      file.savename = memberIo.createNonceStr() + '_' + file.originalname;

      memberIo.saveImage(file);

      let resultImage = await memberIo.insertMemberImage(file);

      console.log(resultImage)

      insertParam.idxImage = resultImage.insertId;
    } else if (req.swagger.params.imageUrl.value != undefined) {
      let imageUrlParam = {};
      imageUrlParam.savename = req.swagger.params.imageUrl.value;
      imageUrlParam.originalname = req.swagger.params.imageUrl.value;
      imageUrlParam.mimetype = 'URL';
      imageUrlParam.size = 0;
      let resultImage = await memberIo.insertMemberImage(imageUrlParam);

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

    reponseReturn.success(res, returnParam);
  } catch (err) {
    console.log(err);
    returnParam.message = err.message;
    reponseReturn.error(res, returnParam, '500');
  }
}