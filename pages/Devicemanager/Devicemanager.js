Page({
  data: {
    roomId: null,
    devices: [],
    showMenu: false
  },

  onLoad(options) {
    this.setData({ roomId: Number(options.roomId)}, () => {
      this.homeview();
    })
  },

  onMenuTap() {
    this.setData({ showMenu: !this.data.showMenu })
  },

    // /home/view
    homeview() {
      wx.request({
        url: 'http://localhost:8080/home/view/' + this.data.roomId,
        header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token')},
        success: (res) => {
          if (res.statusCode === 200) {
            // wx.showToast({
            //   title: 'view成功',
            //   icon: 'none'
            // });
            const roomId = this.data.roomId;
            const devices = res.data.devices
              .filter(item => item.roomId === roomId)
              .map(item => ({
                id: item.id,
                name: item.name
            }));
            this.setData({ devices: devices });
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