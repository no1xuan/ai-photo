const app = getApp();

Page({
  data: {
    customList: [], // 用户定制的尺寸列表
    pageNum: 1,     // 当前页码
    pageSize: 10,   // 每页数量
    hasMoreData: true, // 是否还有更多数据
    isLoading: false,  // 是否正在加载
  },

  onLoad: function () {
    if (!wx.getStorageSync('token')) {
      wx.navigateTo({
        url: '/pages/login/index'
      });
      return;
    }
    this.fetchCustomList();
  },

  // 获取定制列表
  fetchCustomList() {
    if (!this.data.hasMoreData || this.data.isLoading) return;

    this.setData({ isLoading: true });

    wx.request({
      url: app.url + 'item/itemList',
      method: "GET",
      header: {
        token: wx.getStorageSync('token')
      },
      data: {
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize,
        type: 4,
      },
      success: (res) => {
        if (res.data.code === 200) {
          const newData = res.data.data || [];
          this.setData({
            customList: this.data.pageNum === 1 ? newData : this.data.customList.concat(newData),
            pageNum: this.data.pageNum + 1,
            hasMoreData: newData.length >= this.data.pageSize,
          });
        } else {
          if (this.data.pageNum === 1) {
            this.setData({ customList: [], hasMoreData: false });
          }
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误，请稍后再试',
          icon: 'none',
          duration: 2000
        });
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 页面触底加载更多
  onReachBottom: function () {
    this.fetchCustomList();
  },

  // 去制作按钮点击事件
  goMake: function (event) {
    const item = event.currentTarget.dataset.item; 
    const dataString = encodeURIComponent(JSON.stringify(item));
    wx.navigateTo({
      url: `/pages/preedit/index?data=${dataString}`,
    });
  },

});
