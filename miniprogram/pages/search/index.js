const app = getApp();

Page({
  data: {
    value: '',
    photoSizeList: [],
    pageNum: 1,
    pageSize: 10,
    hasMoreData: true,
    isLoading: false,
    noResults: false,
  },

  onLoad: function () {},

  // 处理输入变化
  onInput: function (e) {
    const inputValue = e.detail.value.trim();
    this.setData({
      value: inputValue,
      pageNum: 1,
      photoSizeList: [],
      hasMoreData: true,
      noResults: false,
    });
    if (inputValue !== '') {
      this.searchData();
    } else {
      this.setData({
        value: '',
        pageNum: 1,
        photoSizeList: [],
        hasMoreData: false,
        noResults: false,
      });
    }
  },

  // 搜索数据
  searchData: function () {
    if (!this.data.hasMoreData || this.data.isLoading) return;

    const isInitialSearch = this.data.pageNum === 1;

    wx.showLoading({ title: isInitialSearch ? '搜索中...' : '加载中...' });
    this.setData({ isLoading: true });

    wx.request({
      url: app.url + 'item/itemList',
      data: {
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize,
        type: 0, // 固定为 0
        name: this.data.value,
      },
      method: "GET",
      success: (res) => {
        if (res.data.code == 200) {
          const newData = res.data.data.records || [];
          const totalPages = res.data.data.pages; // 总页数
          this.setData({
            photoSizeList: this.data.pageNum == 1 ? newData : this.data.photoSizeList.concat(newData),
            pageNum: this.data.pageNum + 1,
            hasMoreData: this.data.pageNum <= totalPages,
            noResults: this.data.pageNum == 1 && newData.length == 0
          });
        } else {
          if (this.data.pageNum == 1){
            this.setData({ noResults: true });
          }
          wx.showToast({
            title: '没有找到相关尺寸~',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '系统繁忙，请稍后再试',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
        this.setData({ isLoading: false });
      }
    });
  },

  // 页面触底加载更多
  onReachBottom: function () {
    this.searchData();
  },

  // 跳转到预编辑页面
  goNextPage: function (e) {
    const index = e.currentTarget.dataset.index;
    const selectedItem = this.data.photoSizeList[index];
    wx.navigateTo({
      url: `/pages/preedit/index?category=1&data=${encodeURIComponent(JSON.stringify(selectedItem))}`,
    });
  },

  // 清除搜索内容
  clearSearch: function () {
    this.setData({
      value: '',
      photoSizeList: [],
      pageNum: 1,
      hasMoreData: false,
      noResults: false,
    });
  },

  // 页面下拉刷新
  onPullDownRefresh: function () {
    this.setData({
      photoSizeList: [],
      pageNum: 1,
      hasMoreData: true,
      noResults: false,
    });
    if (this.data.value != '') {
      this.searchData();
    }
    wx.stopPullDownRefresh();
  },
});