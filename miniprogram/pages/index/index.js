// 首页代码3
const app = getApp();
Page({
  data: {
    navArr: [], // 存储导航数据
    active: 0, // 当前激活的导航项
    specArr: [] // 存储规格数据
  },

  onLoad() {
    this.getSpecByType();
  },

  examineTo() {
    wx.navigateTo({
      url: '/pages/preedit/index?category=1&data={"id":1,"name":"一寸","widthPx":295,"heightPx":413,"widthMm":25,"heightMm":35,"icon":5,"sort":1,"category":1,"dpi":300}',
    });
  },

  // 导航栏点击事件
  toNavArr: function (event) {
    const index = event.currentTarget.dataset.index; // 获取当前点击项的索引
    const selectedItem = this.data.navArr[index]; // 获取点击项的数据
    this.setData({
      active: selectedItem.id
    });
  },
   // 搜索
   navigateToSearch: function () {
    wx.navigateTo({
      url: '/pages/search/index',
    });
  },

  //定制页面
  goCustom:function(){
    if (!wx.getStorageSync('token')) {
      wx.navigateTo({
        url: '/pages/login/index'
      });
    }else{
      wx.navigateTo({
        url: '/pages/custom/index',
      });
    }

  },
  
//定制列表
goCustomlist:function(){
  if (!wx.getStorageSync('token')) {
    wx.navigateTo({
      url: '/pages/login/index'
    });
  }else{
    wx.navigateTo({
      url: '/pages/customlist/index',
    });
  }

},

  // 获取规格
  getSpecByType: function () {
    wx.request({
      url: app.url + 'item/itemList',
      method: 'GET',
      data: {
        pageNum: 1,
        pageSize: 16,
        type: 1
      },
      success: (res) => {
        if (res.data.code == 200) {
          this.setData({
            specArr: res.data.data.records
          });
        }  else {
          wx.showToast({
            title: "系统繁忙，请稍后再试",
            icon: 'none',
            duration: 1500
          });
          }
      }
    });
  },


  handleSortCardTap: function (event) {
    const index = event.currentTarget.dataset.index;
    const selectedItem = this.data.specArr[index];

    const dataString = encodeURIComponent(JSON.stringify(selectedItem));
    wx.navigateTo({
      url: `/pages/preedit/index?data=${dataString}`,
    });
  },

    // 分享设置
    onShareAppMessage() {
      return {
        title: '哇塞，这个证件照小程序也太好用了吧！好清晰，还免费',
        path: 'pages/index/index',
        imageUrl: '../../assets/image/share.jpg'
      }
    }
});