const uploadFile = require('../../utils/upload/uploadImg.js');
Page({
  data: {
  },
  //上传文件
  chooseMedia(){
    let _this = this;
    wx.chooseMedia({
      count: 9,
      mediaType: ['image','video'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      sizeType:['original', 'compressed'],
      camera: 'back',
      success(res) {
        console.log("获取临时文件:",res.tempFiles)
        _this.uploadOss(res.tempFiles);
      }
    })
  },
  //
  uploadOss(tempFiles){
    let _this = this,fileList = [];
    wx.showLoading({
      title: '上传中...',
    })
    tempFiles.forEach((item)=>{
      uploadFile(item.tempFilePath,'miniProgram/',(img)=>{
        fileList.push(img); 
        if(fileList.length==tempFiles.length){
           //调用上传接口...
           wx.request({
             url: 'url',
           })
        }
      },()=>{
        console.log("阿里云上传失败")
        _this.hideUpLoading();
      })
    })
  },
  hideUpLoading(){
    wx.hideLoading()
    wx.showModal({
      title: '上传失败',
      content: '请重新上传',
      showCancel: false,
    })
  },
})
