Page({
  data: {
    selectedRoom: '全部',
    showPopup: false,
    devices: [
      { id: 1, name: '卧室灯', room: '卧室', icon: '/images/卧室灯.jpg' },
      { id: 2, name: '客厅空调', room: '客厅', icon: '/images/空调.jpg' },
      { id: 3, name: '冰箱', room: '厨房', icon: '/images/冰箱.jpg' },
      { id: 4, name: '空气净化器', room: '书房', icon: '/images/空气净化器.jpg' }
    ],
    filteredDevices: []
  },
  onLoad() {
    this.filterDevices();
  },
  onFilterTap(e) {
    this.setData({
      selectedRoom: e.currentTarget.dataset.room
    }, this.filterDevices);
  },
  filterDevices() {
    const { devices, selectedRoom } = this.data;
    this.setData({
      filteredDevices: selectedRoom === '全部'
        ? devices
        : devices.filter(item => item.room === selectedRoom)
    });
  },
  onTitleTap() {
    this.setData({
      showPopup: !this.data.showPopup
    });
  },
  onFamilyManagerTap() {
    wx.navigateTo({
      url: '/pages/familymanager/familymanager',
      success: () => {
        this.setData({ showPopup: false });
      }
    });
  }
});