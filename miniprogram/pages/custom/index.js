import tool from '././util';
const app = getApp();

Page({
  data: {
    width: '',
    height: '',
    dpi: '300',
    name: '',
    px: '0*0 px',
    size: '0*0 mm'
  },

  onLoad: function () {
  },

  // 名称输入处理
  changeName(e) {
    const value = e.detail.value || '';
    this.setData({
      name: value
    });
  },
  
  // 宽度输入处理（防抖）
  changeWidth: tool.debounce(function (e) {
    const value = e.detail.value;
    this.setData({
      width: value
    });
    this.updateSize();
  }, 300),

  // 高度输入处理（防抖）
  changeHeight: tool.debounce(function (e) {
    const value = e.detail.value;
    this.setData({
      height: value
    });
    this.updateSize();
  }, 300),

  changeDpi(e) {
    const value = e.detail.value || '';
    this.setData({
      dpi: value
    });
  },

  // 更新尺寸和像素显示
  updateSize() {
    let width = parseInt(this.data.width, 10);
    let height = parseInt(this.data.height, 10);
    let width_px = isNaN(width) ? 0 : width;
    let height_px = isNaN(height) ? 0 : height;
    let width_mm = Math.floor(width_px / 11.8);
    let height_mm = Math.floor(height_px / 11.8);
    this.setData({
      px: `${width_px}*${height_px} px`,
      size: `${width_mm}*${height_mm} mm`
    });
  },

  // 保存定制尺寸
  addSize() {
    const name = this.data.name.trim();
    const width = parseInt(this.data.width, 10);
    const height = parseInt(this.data.height, 10);
    const dpi = parseInt(this.data.dpi, 10);
    console.log(dpi)
    
    // 输入验证
    if (!name) {
      wx.showToast({
        title: '名称为必填',
        icon: 'none',
        duration: 2000,
        mask: true
      });
      return;
    }

    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
      wx.showToast({
        title: '宽或高必须大于0',
        icon: 'none',
        duration: 2000,
        mask: true
      });
      return;
    }

    if (isNaN(dpi) || dpi < 75) {
      wx.showToast({
        title: '分辨率最低75',
        icon: 'none',
        duration: 2000,
        mask: true
      });
      return;
    }

    if (dpi > 1000) {
      wx.showToast({
        title: '分辨率最高只能1000',
        icon: 'none',
        duration: 2000,
        mask: true
      });
      return;
    }

    if (!this.isValidName(name)) {
      wx.showToast({
        title: '名称不能包含特殊符号',
        icon: 'none',
        duration: 2000,
        mask: true
      });
      return;
    }

    // 发起保存请求
    wx.showLoading({ title: '保存中...' });
    wx.request({
      url: app.url + 'item/saveCustom',
      method: 'POST',
      data: {
        name: name,
        widthPx: width,
        heightPx: height,
        size: this.data.size,
        dpi: dpi
      },
      header: {
        token: wx.getStorageSync('token')
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code === 200) {
          wx.showToast({
            title: '定制成功',
            duration: 2000,
            mask: true
          });
          // 重置表单
          this.setData({
            name: '',
            width: '',
            height: '',
            dpi: '300',
            px: '0*0 px',
            size: '0*0 mm'
          });
        } else if(res.data.code === 404){
          wx.showToast({
            title: res.data.data,
            duration: 2000,
            icon: 'none',
            mask: true
          });
        } else {
          wx.navigateTo({
            url: "/pages/login/index",
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '系统繁忙，请稍后再试',
          icon: 'none',
          duration: 2000,
          mask: true
        });
      }
    });
  },

  // 验证名称是否有效
  isValidName(name) {
    const reg = /^[a-zA-Z0-9\u4e00-\u9fa5]+$/;
    return reg.test(name);
  }
});
