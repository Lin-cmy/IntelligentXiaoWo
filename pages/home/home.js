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
    showCreatePopup: false,
    isRefreshing: false
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
    wx.setStorageSync('HOMEID', homeId);
    this.setData({ homeId: homeId, homeName: homeName, showPopup: false }, () => this.homeview());
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

  // 点击刷新按钮
  onRefreshTap() {
    // 防止重复点击
    if (this.data.isRefreshing) {
      return;
    }
    
    // 设置刷新状态
    this.setData({ isRefreshing: true });
    
    // 显示连接中提示
    wx.showLoading({ title: '连接中...' });
    
    // 先调用connectdevice
    this.connectdevice();
    
    // 5秒后调用disconnectdevice
    setTimeout(() => {
      wx.showLoading({ title: '断开连接中...' });
      this.disconnectdevice();
      
      // 操作完成后重置状态并刷新页面
      setTimeout(() => {
        wx.hideLoading();
        this.setData({ isRefreshing: false });
        this.homeview(); // 刷新设备列表
        wx.showToast({
          title: '设备已刷新',
          icon: 'success'
        });
      }, 1000);
    }, 4000);
  },

  // 跳转到设备详情页
  onDeviceTap(e) {
    const deviceId = e.currentTarget.dataset.id;
    const deviceName = e.currentTarget.dataset.name;
    wx.navigateTo({
      url: '/pages/device-detail/device-detail?deviceId=' + deviceId + '&deviceName=' + deviceName,
    })
  },

  // /home/get
  homeget(callback) {
    wx.request ({
      url: 'http://localhost:8080/home/get',
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token') },
      success: (res) => {
        if (res.statusCode === 200 ) {
          wx.showToast({ title: '查询成功' })
          const homes = res.data.homes.map(item => ({
            id: item.id,
            name: item.name
          }));
          this.setData({ homes: homes }, () => {
            let storedHomeId = wx.getStorageSync('HOMEID');
            let matchHome = homes.find(item => item.id === storedHomeId);
            if (matchHome) {
              this.setData({ homeId: matchHome.id, homeName: matchHome.name }, () => {
                this.homeview();
                this.filterDevices();
                if (typeof callback === 'function') callback();
              });
            } else if (homes.length > 0) {
              this.setData({ homeId: homes[0].id, homeName: homes[0].name }, () => {
                wx.setStorageSync('HOMEID', homes[0].id);
                this.homeview();
                this.filterDevices();
                if (typeof callback === 'function') callback();
              });
            } else {
              if (typeof callback === 'function') callback();
            }
          });
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
          const deviceMap = {};
          res.data.devices.forEach(item => {
            if (!deviceMap[item.id]) {
              deviceMap[item.id] = {
                id: item.id,
                name: item.name,
                roomId: String(item.roomId)
              };
            }
          });
          const devices = Object.values(deviceMap);
          this.setData({
            rooms: rooms,
            devices: devices,
            selectedRoomId: '0'
          }, this.filterDevices);
          wx.setStorageSync('USERID', res.data.currentUserId);
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
  },

  // /home/{homeId}/device/connect
  connectdevice() {
    wx.request({
      url: 'http://localhost:8080/home/' + this.data.homeId + '/device/connect',
      method: 'POST',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token')},
      success: (res) => {
        if (res.statusCode === 200) {
          console.log('连接成功');
          // wx.showToast({
          //   title: '连接成功',
          //   icon: 'none'
          // });
        } else {
          console.log('连接失败');
          // wx.showToast({
          //   title: '连接失败',
          //   icon: 'none'
          // });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    })
  },

  // /home/{homeId}/device/disconnect
  disconnectdevice() {
    wx.request({
      url: 'http://localhost:8080/home/' + this.data.homeId + '/device/disconnect',
      method: 'POST',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token')},
      success: (res) => {
        if (res.statusCode === 200) {
          console.log('成功断开连接');
          // wx.showToast({
          //   title: '成功断开连接',
          //   icon: 'none'
          // });
        } else {
          console.log('断开连接失败');
          // wx.showToast({
          //   title: '断开连接失败',
          //   icon: 'none'
          // });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    })
  },
});