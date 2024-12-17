const app = getApp()
Page({
  data: {
    imageData: {},
    dpi: 300,
    colorType:0,
    render:0,
    kb: 0,
    picUrl: "",
    color: "",
    downloadHd: 0,
    videoUnitId: 0,
    rewardedVideoAd: null,
    pick: false
  },

  onLoad() {
    this.getImageData();
    this.getvideoUnit();
  },

  getImageData() {
    const eventChannel = this.getOpenerEventChannel && this.getOpenerEventChannel();
    eventChannel &&
      eventChannel.on('sendImageData', (data) => {
        this.setData({
          imageData: data,
          dpi: data.dpi,
          "imageData.cimg": data.kimg
        });
        //某学校要求
        if(this.data.imageData.category==1 && this.data.imageData.id==759){
          this.setData({
            kb: 30
          });
        }
      });
  },

  getvideoUnit() {
    wx.request({
      url: app.url + 'api/getvideoUnit',
      method: "POST",
      success: (res) => {
        this.setData({
          downloadHd: res.data.data.downloadHd,
          videoUnitId: res.data.data.videoUnitId
        });
        this.initRewardedVideoAd(res.data.data.videoUnitId);
      }
    });
  },


  // 点击更改背景颜色
  changeBackgroundColor(e) {
    wx.showLoading({
      title: '制作中...',
    })
    this.setData({
      color: e.currentTarget.dataset.color,
      colorType: 1,
    })
    this.updateColor(this.data.color, this.data.imageData.kimg,1);
  },
  

    // 调用换背景
    updateColor(color, tu, type) {
      let requestData = {
        "image": tu,
        "colors": color,
        "kb": this.data.kb,
        "render": this.data.render
      };
      
      
      if (type == 1) {
        requestData.dpi = this.data.dpi;
      }else{
        requestData.dpi = 0;   //高清下载时不能自定义dpi
      }
      wx.request({
        url: app.url + 'api/updateIdPhoto',
        data: requestData,
        header: {
          "token": wx.getStorageSync("token")
        },
        method: "POST",
        success: (res) => {
          wx.hideLoading();
          if (res.data.code == 200) {
            this.setData({
              'imageData.cimg': res.data.data.cimg
            });
          } else if (res.data.code == 404) {
            wx.showToast({
              title: res.data.data,
              icon: 'none'
            })
          }
        }
      });
    },
  
    //下载区分，根据type区分下载，1普通，2高清
    openSavePhoto(e) {
      if (this.data.colorType == 0) {
        wx.showToast({
          title: '您还没有选择背景颜色哦~',
          icon: 'none',
          duration: 3000
        });
        return;
      }
  
      // 如果普通下载
      if (e.currentTarget.dataset.type == 1) {
        this.saveNormalPhoto();
        return;
      }
      // 如果高清下载 但 没开启广告
      if (this.data.downloadHd == 0 && e.currentTarget.dataset.type == 2) {
        this.saveHDPhoto();
        return;
      }
  
      // 如果高清下载 但 开启广告
      const rewardedVideoAd = this.data.rewardedVideoAd;
      if (rewardedVideoAd) {
        // 尝试播放广告
        rewardedVideoAd.show().catch(() => {
          // 如果广告未加载成功，则重新加载并播放广告
          this.loadRewardedVideoAd();
        });
      } else {
        console.error('广告实例不存在');
        // 防止广告权限被封或无广告权限导致用户无法下载
        this.saveHDPhoto();
      }
    },

  // 保存证件照
  saveNormalPhoto() {
    wx.showLoading({
      title: '下载中...',
    })
    wx.request({
      url: app.url + 'api/updateUserPhonto',
      data: {
        "image": this.data.imageData.cimg,
        "photoId": this.data.imageData.id2
      },
      header: {
        "token": wx.getStorageSync("token")
      },
      method: "POST",
      success: (res) => {
        if (res.data.code == 200) {
          this.setData({
            'picUrl': res.data.data.picUrl,
          });
          // 调用保存
          this.savePicUrlAndImg();
        } else if (res.data.code == 404) {
          wx.showToast({
            title: res.data.data,
            icon: 'none'
          })
        }
      }
    });
  },

  // 保存高清照
  saveHDPhoto() {
    wx.showLoading({
      title: '制作中...',
    });
    wx.request({
      url: app.url + 'api/createIdHdPhoto',
      data: {
        "image": this.data.imageData.oimg,
        "type": this.data.imageData.category == 4 ? 0 : 1,
        "itemId": this.data.imageData.id,
        "isBeautyOn": this.data.imageData.isBeautyOn
      },
      header: {
        "token": wx.getStorageSync("token")
      },
      method: "POST",
      success: (res) => {
        wx.hideLoading();
        if (res.data.code == 200) {
          this.updateColor(this.data.color, res.data.data.kimg,2);
          wx.showModal({
            title: '确认下载',
            content: '高清照已制作完成，是否立即下载？',
            success: (res) => {
              if (res.confirm) {
                this.saveNormalPhoto();
              } else if (res.cancel) {
                wx.showToast({
                  title: '已取消下载',
                  icon: 'none'
                });
              }
            }
          });
        } else if (res.data.code == 404) {
          wx.showToast({
            title: res.data.data,
            icon: 'none'
          });
        }
      }
    });
  },

  // 根据图片url下载保存
  savePicUrlAndImg() {
    const that = this;
    wx.downloadFile({
      url: this.data.picUrl,
      success: function (res) {
        wx.hideLoading();
        // 下载成功后将图片保存到本地
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function () {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            });
          },
          fail: function () {
            that.checkq(); // 解决用户拒绝相册
          }
        });
      },
      fail: function (res) {
        wx.showToast({
          title: '下载图片失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },


  // 解决用户拒绝相册问题
  checkq() {
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.showModal({
            title: '提示',
            content: '保存图片需要授权哦',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting({
                  success: (res) => {
                    this.savePicUrlAndImg();
                  },
                  fail: (res) => {
                    console.log(res);
                  }
                });
              }
            }
          });
        }
      }
    });
  },
  
    // 初始化激励视频广告
    initRewardedVideoAd(adUnitId) {
      if (wx.createRewardedVideoAd) {
        const rewardedVideoAd = wx.createRewardedVideoAd({
          adUnitId: adUnitId
        });
  
        // 确保广告事件只监听一次
        rewardedVideoAd.offLoad();
        rewardedVideoAd.offError();
        rewardedVideoAd.offClose();
  
        // 监听广告加载成功
        rewardedVideoAd.onLoad(() => {
          console.log('重新拉取广告成功');
        });
  
        // 监听广告加载失败
        rewardedVideoAd.onError((err) => {
          console.error('激励视频广告加载失败', err);
          // 用户可能观看广告上限，防止无法下载，仍发放奖励
          this.saveHDPhoto();
        });
  
        // 监听广告关闭事件
        rewardedVideoAd.onClose((res) => {
          if (res && res.isEnded) {
            // 发放奖励
            this.saveHDPhoto();
          } else {
            console.log('没看完广告，不发奖励');
            wx.showToast({
              title: "需要看完广告才能下载哦~",
              icon: 'none',
              duration: 1500
            });
          }
        });
        this.setData({
          rewardedVideoAd: rewardedVideoAd
        });
      } else {
        console.error('微信版本太低不支持激励视频广告');
        // 防止无法下载，所以仍然发放奖励
        this.saveHDPhoto();
      }
    },
  
    // 加载激励视频广告
    loadRewardedVideoAd() {
      const rewardedVideoAd = this.data.rewardedVideoAd;
      rewardedVideoAd
        .load()
        .then(() => rewardedVideoAd.show())
        .catch((err) => {
          console.error('广告加载失败', err);
          // 看广告上限/网络失败，为了防止无法下载，仍发放奖励
          this.saveHDPhoto();
        });
    },





});
