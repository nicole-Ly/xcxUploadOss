require('hmac.js');
require('sha1.js');
const env = require('config.js');
const base64 = require('base64.js');
const Crypto = require('crypto.js');

/*  
 *上传文件到阿里云oss
 *@param - filePath :图片的本地资源路径
  @param - path :上传oss哪个文件夹下
 *@param - successc:成功回调
 *@param - failc:失败回调
 */
const uploadFile =function(filePath, path, successc, failc){
  if (!filePath) {
    failc&&failc();
    return;
  }

  wx.request({//后台提供请求接口，STS临时授权访问，获取accessKeyId、accessKeySecret、securityToken等敏感信息
    url: ``,
    header: {
      'content-type': 'application/json',
      'X-UBT-AppId': '',
      'X-UBT-Sign': sign,
      'X-UBT-Source': '',
      'X-UBT-Language':'',
      'authorization':token
    },
    success (res) {
      const {accessKeyId,accessKeySecret,securityToken} = res.data;
      const aliyunFileKey = path + new Date().getTime() + filePath.split("tmp/")[1];//文件命名
      const aliyunServerURL = env.uploadImageUrl; //OSS的访问域名
      const accessid = accessKeyId;
      const policyBase64 = getPolicyBase64();
      const signature = getSignature(policyBase64,accessKeySecret);

      //小程序直传oss
      wx.uploadFile({
        url: aliyunServerURL, //OSS地址
        filePath: filePath, //上传文件资源的路径
        name: 'file', //必须填file
        header: {
          "Content-Type": "multipart/form-data"
        },
        formData: {
          'key': aliyunFileKey,
          'policy': policyBase64,
          'OSSAccessKeyId': accessid,
          'signature': signature,
          'x-oss-security-token': securityToken,//使用STS签名时必传。
          'success_action_status': '200'
        },
        success: function(res) {
          if (res.statusCode != 200) {
            failc&&failc(new Error('上传错误:' + JSON.stringify(res)))
            return;
          }
          successc(aliyunServerURL + aliyunFileKey);
        },
        fail: function(err) {
          err.wxaddinfo = aliyunServerURL;
          failc&&failc(err);
        },
      })
    },
    fail(err){
      failc&&failc(err);
    }
  })
}

//获取policy
const getPolicyBase64 = function() {
  let date = new Date();
  date.setHours(date.getHours() + env.timeout);
  let srcT = date.toISOString();
  const policyText = {
    "expiration": srcT, //设置该Policy的失效时间，超过这个失效时间之后，就没有办法通过这个policy上传文件了 
    "conditions": [
      ["content-length-range", 0, 5 * 1024 * 1024] // 设置上传文件的大小限制,5M
    ]
  };
  const policyBase64 = base64.encode(JSON.stringify(policyText));
  return policyBase64;
}

//获取signature
const getSignature = function(policyBase64,accesskey) {
  const bytes = Crypto.HMAC(Crypto.SHA1, policyBase64, accesskey, {
    asBytes: true
  });
  const signature = Crypto.util.bytesToBase64(bytes);
  return signature;
}

module.exports = uploadFile;