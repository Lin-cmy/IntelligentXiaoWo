Page({
  data: {
    homeId: null,
    homeName: '创建家庭',
    newFamilyName: '',
    newFamilyAddress: '',
    homes: [],
    rooms: [],
    devices: [],
    filteredDevices: [],
    selectedRoomId: '0',
    showPopup: false,
    showCreatePopup: false
  },
  
  // 初始化界面，查询用户所在的家庭，默认展示第一个家庭
  onLoad() {
    this.homeget();
  },

  // 刷新页面
  onShow() {
    this.homeget();
  },

  onFilterTap(e) {
    console.log('dataset:', e.currentTarget.dataset);
    this.setData({
      selectedRoomId: String(e.currentTarget.dataset.roomid)
    }, () => {
      this.filterDevices();
    });
  },

  filterDevices() {
    const { devices, selectedRoomId } = this.data;
    this.setData({
      filteredDevices: selectedRoomId === '0'
        ? devices
        : devices.filter(item => String(item.roomId) === selectedRoomId)
    });
  },

  // 开关悬浮窗
  onTitleTap() {
    this.setData({
      showPopup: !this.data.showPopup
    });
  },

  // 选择当前家庭
  onFamilyChangeTap(e) {
    const homeId = Number(e.currentTarget.dataset.id);
    const homeName = e.currentTarget.dataset.name;
    this.setData({ homeId: homeId, homeName: homeName, showPopup: false }, () => this.homeview());
    wx.setStorageSync('HOMEID', this.data.homeId);
  },

  // 跳转到家庭管理界面
  onFamilyManagerTap() {
    wx.navigateTo({
      url: '/pages/familymanager/familymanager',
      success: () => {
        this.setData({ showPopup: false });
      }
    });
  },

  // 创建家庭
  onFamilyCreateTap() {
    this.setData({ showCreatePopup: true });
  },
  onFamilyNameInput(e) {
    this.setData({ newFamilyName: e.detail.value });
  },
  onFamilyAddressInput(e) {
    this.setData ({ newFamilyAddress: e.detail.value });
  },
  onConfirmCreate() {
    if (!this.data.newFamilyName.trim()) {
      wx.showToast({ title: '请输入家庭名称', icon: 'none' });
      return;
    }
    if (!this.data.newFamilyAddress.trim()) {
      wx.showToast({ title: '请输入家庭地址', icon: 'none' });
      return;
    }
    this.homecreate(() => {
      this.homeget(() => {
        this.setData({ showCreatePopup: false, newFamilyName: '', newFamilyAddress: '' });
      });
    });
  },
  onPopupClose() {
    this.setData({ showCreatePopup: false, newFamilyName: '', newFamilyAddress: '' });
  },

  // /home/get
  homeget(callback) {
    wx.request ({
      url: 'http://localhost:8080/home/get',
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token') },
      success: (res) => {
        if (res.statusCode === 200 ) {
          // wx.showToast({ title: '查询成功' })
          const homes = res.data.homes.map(item => ({
            id: item.id,
            name: item.name
          }));
          this.setData({ homes: homes }, () => {
            if (homes.length > 0) {
              this.setData({ homeId: homes[0].id, homeName: homes[0].name }, () => {
                this.homeview();
                this.filterDevices();
                if (typeof callback === 'function') callback();
              });
            } else {
              if (typeof callback === 'function') callback();
            }
          });
          wx.setStorageSync('HOMEID', this.data.homeId);
        } else {
          wx.showToast({
            title: res.data.message || '查询失败',
            icon: 'none'
          });
          if (typeof callback === 'function') callback();
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
        if (typeof callback === 'function') callback();
      }
    });
  },

  // /home/view
  homeview() {
    const homeId = this.data.homeId;
    wx.request({
      url: 'http://localhost:8080/home/view/' + homeId,
      method: 'GET',
      header: { 
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.statusCode === 200) {
          // wx.showToast({ title: 'view成功' });
          const rooms = res.data.rooms.map(item => ({
            id: item.id,
            name: item.name
          }));
          const devices = res.data.devices.map(item => ({
            id: item.id,
            name: item.name,
            roomId: String(item.roomId)
          }));
          this.setData({
            rooms: rooms,
            devices: devices,
            selectedRoomId: '0'
          }, this.filterDevices);
        } else {
          wx.showToast({
            title: res.data.message || 'view失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
        });
      }
    })
  },

  // /home/create
  homecreate(callback) {
    wx.request({
      url: 'http://localhost:8080/home/create',
      method: 'POST',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token')},
      data: {
        "name": this.data.newFamilyName,
        "address": this.data.newFamilyAddress
      },
      success: (res) => {
        if (res.statusCode === 201) {
          wx.showToast({
            title: '创建成功',
            icon: 'none'
          });
          if (typeof callback === 'function') callback();
        } else {
          wx.showToast({
            title: res.data.message || '创建失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
        });
      }
    })
  }
});