Page({
  data: {
    homeId: null,
    homename: '',
    homeaddress: '未设置',
    newhomename: '',
    newhomeaddress: '',
    devicecnt: null,
    showChangeHomeNamePopup: false,
    showChangeHomeAddressPopup: false,
    // familymembers: [
    //   { id: 1, name: '陈俊烨', icon: '/images/cjy.jpg'}
    // ]
  },

  // 初始化界面
  onLoad(options) {
    this.setData({ homeId: Number(options.homeId) }, () => {
      this.homeview();
    })
  },

  // 修改家庭名称
  onNameTap() {
    this.setData({ showChangeHomeNamePopup: true });
  },
  onHomeNameInput(e) {
    this.setData({ newhomename: e.detail.value });
  },
  onConfirmChangeHomename() {
    if (!this.data.newhomename.trim()) {
      wx.showToast({ title: '请输入家庭名称', icon: 'none' });
      return;
    }
    // 修改家庭名称
  },
  onPopupCloseHomename() {
    this.setData({ showChangeHomeNamePopup: false, newhomename: '' });
  },

  // 修改家庭地址
  onAddressTap() {
    this.setData({ showChangeHomeAddressPopup: true });
  },
  onHomeAddressInput(e) {
    this.setData({ newhomeaddress: e.detail.value });
  },
  onConfirmChangeHomeaddress() {
    if (!this.data.newhomeaddress.trim()) {
      wx.showToast({ title: '请输入家庭地址', icon: 'none' });
      return;
    }
    // 修改家庭地址
  },
  onPopupCloseHomeaddress() {
    this.setData({ showChangeHomeAddressPopup: false, newhomeaddress: '' });
  },

  // 房间及设备管理
  onRandDTap(e) {
    const homeId = e.currentTarget.dataset.homeid;
    wx.navigateTo({
      url: '/pages/Roommanager/Roommanager?homeId=' + homeId
    })
  },

  // /home/view
  homeview() {
    wx.request({
      url: 'http://localhost:8080/home/view/' + this.data.homeId,
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token')},
      success: (res) => {
        if (res.statusCode === 200) {
          // wx.showToast({
          //   title: 'view成功',
          //   icon: 'none'
          // });
          this.setData({
            homename: res.data.home.name,
            homeaddress: res.data.home.address,
            devicecnt: res.data.devices.length
          });
        } else {
          wx.showToast({
            title: res.data.message || 'view失败'
          })
        };
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
        })
      }
    });
  }
})