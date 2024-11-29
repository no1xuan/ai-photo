const app = getApp();

Page({
  data: {
    workList: [],      // 数据列表
    pageNum: 1,        // 当前页码
    pageSize: 5,       // 每页显示的数据条数
    hasMore: true,     // 是否还有更多数据
    isLoading: false,  // 是否正在加载数据
    authorized: false, // 用户是否已授权
  },

  onLoad() {},

  
  goLogin: function () {
    wx.navigateTo({
      url: '/pages/login/index',
    });
  },

  onShow: function () {
    if (wx.getStorageSync("token")) {
      this.setData({
        authorized: true,
        pageNum: 1,
        workList: [],
        hasMore: true,
      });
      this.getSizeList();
    } else {
      this.setData({
        authorized: false,
      });
    }
  },

  // 获取尺寸列表
  getSizeList() {
    if (!this.data.hasMore || this.data.isLoading) {
      return; // 如果没有更多数据或正在加载中，直接返回
    }

    this.setData({ isLoading: true });
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
      success: (res) => {
        wx.hideLoading();
        if (res.data.code == 200) {
          const newData = res.data.data.records || [];
          const totalPages = res.data.data.pages || 1;

          this.setData({
            workList: this.data.workList.concat(newData),
            pageNum: this.data.pageNum + 1,
            hasMore: this.data.pageNum <= totalPages,
            isLoading: false,
          });
        } else {
          this.setData({ isLoading: false });
          wx.showToast({
            title: res.data.msg || '获取数据失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        this.setData({ isLoading: false });
        wx.showToast({
          title: '加载失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 页面触底事件，加载更多数据
  onReachBottom: function () {
    this.getSizeList();
  },

  // 下载按钮
  handleDownload(e) {
    const url = e.currentTarget.dataset.url;
    wx.downloadFile({
      url: url,
      success: function (res) {
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
    const that = this;
    const itemId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该作品吗？',
      success(res) {
        if (res.confirm) {
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
              if (res.data.code == 200) {
                // 本地移除页面元素
                const updatedList = that.data.workList.filter(item => item.id != itemId);
                that.setData({
                  workList: updatedList
                });

                // 检查当前列表长度是否小于 pageSize，如果是且有更多数据，加载更多数据
                if (updatedList.length < that.data.pageSize && that.data.hasMore) {
                  that.getSizeList(); // 加载下一页的数据并填充到当前列表
                }

                wx.showToast({
                  title: '删除成功',
                  icon: 'success',
                  duration: 2000
                });
              } else {
                wx.showToast({
                  title: res.data.msg || '删除失败',
                  icon: 'none',
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
        }
      }
    });
  }


});