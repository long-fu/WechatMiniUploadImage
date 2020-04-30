//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    img_src: '',
    video_src: ''
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  select_image: function() {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success:(res) => {
        const tempFilePaths = res.tempFilePaths
        console.log("获取到图片露肩", tempFilePaths);
        that.setData({
          img_src: tempFilePaths
        })
      },
      complete: (res) => {},
    })
  },
  select_video: function() {
    var that = this
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 20,
      camera: "back",
      success: (res) => {
        console.log(res)
        that.setData({
          video_src : res.tempFilePath
        })
      },
      complete:(res) => {

      }
    })

  },
  get_suffix: function(filename) {
    pos = filename.lastIndexOf('.')
    suffix = ''
    if (pos != -1) {
        suffix = filename.substring(pos)
    }
    return suffix;
  },
 random_string: function(len) {
  　　len = len || 32;
  　　var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';   
  　　var maxPos = chars.length;
  　　var pwd = '';
  　　for (i = 0; i < len; i++) {
      　　pwd += chars.charAt(Math.floor(Math.random() * maxPos));
      }
      return pwd;
  },
  
  calculate_object_name:function(dir,filename, type) {
    var res = '';
    if (type == 'local_name')
    {
      res = dir + "${filename}"
    }
    else if (type == 'random_name')
    {
        suffix = get_suffix(filename)
        // return = key + random_string(10) + suffix
        res = dir + random_string(10) +"${filename}"
    }
    console.log("key",res);
    return res
},

  upload_data:function() {
    var that = this

    wx.request({
      url: 'https://test.chongchongda.com/web/index.php?store_id=2&r=api/passport/oss-sign',
      success: (res) => {
        console.log("从应用服务器请求oss数据", res);
        const filePath = that.data.img_src[0];

        const resultData = res.data.data;
        const host = resultData.host
        const accessid = resultData.accessid
        const policy = resultData.policy
        const signature = resultData.signature
        const expire = resultData.expire
        const callback = resultData.callback
        const dir = resultData.dir

        console.log("callback", callback);

        var new_multipart_params = {
          "key": dir+"${filename}",
          "policy": policy,
          "OSSAccessKeyId": accessid,
          "name": filePath, 
          "success_action_status" : '200', //让服务端返回200,不然，默认会返回204
          "callback" : callback,
          "signature": signature,
      };
  
        console.log("本地文件",filePath, new_multipart_params);

        wx.uploadFile({
          url: host,
          filePath: filePath,
          name: 'file',
          formData: new_multipart_params,
          success: function (res) {
            console.log(res);
          }
        })
        // wx.uploadFile({
        //   // header: { "Content-Type": "multipart/form-data" },
        //   filePath: filePath,
        //   // data: new_multipart_params,
        //   formData: new_multipart_params,
        //   name: "image",
        //   url: host,
        //   success:(res) => {
        //     console.log("上传成功", res);
        //   },
        //   fail:(res) => {},
        //   complete:(res) => {
        //     console.log("上传结果",res);
        //   }
        // })

      }
    });



  }
})
