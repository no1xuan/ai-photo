const app = getApp();

Page({
  data: {
    workList: [],
    pageNum: 1,
    pageSize: 5,
    hasMore: true,
    authorized:false
  },

  onLoad() {

  },
  goLogin:function(){
    wx.navigateTo({
      url: '/pages/login/index',
    });
  },
  
  onShow: function () {
    if (wx.getStorageSync("token") != "") {
      this.setData({
        authorized: true
      });
      this.getSizeList();
    }

  },
  getSizeList() {
    const that = this;
    if (!this.data.hasMore) {
      return; // 如果没有更多数据，直接返回
    }
    wx.showLoading({
      title: '加载中...',
    });
    wx.request({
      url: app.url + 'item/photoList',
      data: {
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize,
      },
      header: {
        "token": wx.getStorageSync("token")
      },
      method: "GET",
      success(res) {
        wx.hideLoading();
        if (res.data.code === 200) {
          const newData = res.data.data;
          that.setData({
            workList: that.data.pageNum === 1 ? newData : that.data.workList.concat(newData),  // 拼接新数据
            hasMore: newData.length === that.data.pageSize  // 如果返回的数据少于 pageSize，表示没有更多数据了
          });
        } else if (res.data.code === 404) {
          that.setData({
            hasMore: false 
          });
        }else if(res.data.code === 500){
          wx.navigateTo({
            url: '/pages/login/index',
          });
        }
      },
      fail() {
        wx.hideLoading();
        wx.showToast({
          title: '加载失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 下载按钮事件
  handleDownload(e) {
    wx.downloadFile({
      url: e.target.dataset.url,
      success: function (res) {
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
            wx.showToast({
              title: '保存失败，请开启相册权限',
              icon: 'none',
              duration: 2000
            });
          }
        });
      },
      fail: function (e) {
        console.log(e)
        wx.showToast({
          title: '下载图片失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 删除按钮事件
  handleDelete(e) {
    let that = this;
    const itemId = e.target.dataset.id;
    wx.request({
      url: app.url + 'item/deletePhotoId',
      data: {
        id: itemId,
      },
      header: {
        "token": wx.getStorageSync("token")
      },
      method: "GET",
      success(res) {
        wx.hideLoading();
        if (res.data.code === 200) {
          // 本地移除页面元素
          const updatedList = that.data.workList.filter(item => item.id !== itemId);
          that.setData({
            workList: updatedList
          });
          wx.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 2000
          });
        }
      },
      fail() {
        wx.showToast({
          title: '系统繁忙，请稍后再试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
  
  onShareAppMessage() {
    // 分享功能
  },
});
