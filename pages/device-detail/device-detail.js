// pages/device-detail/device-detail.js
Page({
  data: {
    deviceId: null,
    deviceName: '设备详情',
    deviceTypeId: null,
    deviceData: [],
    selectedLevel: 0,
  },

  onLoad: function(options) {
    this.setData({
      deviceData: [],
      isRefreshing: false
    });
    // 从页面参数获取设备ID
    const deviceId = options.deviceId;
    const deviceName = options.deviceName;
    const deviceTypeId = options.deviceTypeId;
    if (deviceId && deviceName && deviceTypeId) {
      this.setData({ deviceId });
      this.setData({ deviceName });
      this.setData({ deviceTypeId });
      if (!(deviceTypeId === '55' || deviceTypeId === '88' || deviceTypeId === '99')){
        this.refreshData();
      }
    } else {
      wx.showToast({
        title: '设备 ID、NAME 或 DEVICETYPEID 不存在',
        icon: 'none'
      });
    }
    this.initDeviceControl();
  },

  // 点击刷新按钮
  refreshData() {
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
      
    // 4秒后调用disconnectdevice
    setTimeout(() => {
      wx.showLoading({ title: '断开连接中...' });
      this.disconnectdevice();
      
      // 操作完成后重置状态并刷新页面
      setTimeout(() => {
        wx.hideLoading();
        this.setData({ isRefreshing: false });
        this.fetchDeviceData();
        wx.showToast({
          title: '数据已更新',
          icon: 'success'
        });
      }, 1000);
    }, 4000);
  },

  // 获取设备数据
  fetchDeviceData: function() {
    const homeId = wx.getStorageSync('HOMEID');
    
    wx.showLoading({ title: '加载中...' });
    
    wx.request({
      url: `http://localhost:8080/home/${homeId}/device/getData?deviceId=${this.data.deviceId}`,
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token') },
      success: (res) => {
        wx.hideLoading();
        
        if (res.statusCode === 200 && res.data.data) {
          this.setData({ deviceData: [] });
          // 处理时间格式
          const formattedData = res.data.data.map(item => {
            // 格式化时间 2025-07-03T15:24:10 -> 2025-07-03 15:24:10
            const formattedTime = item.dataTime.replace('T', ' ');
            return {
              ...item,
              formattedTime
            };
          });
          
          this.setData({
            deviceData: formattedData
          });
        } else {
          wx.showToast({
            title: '获取数据失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
        console.error('获取设备数据失败:', err);
      }
    });
  },

  // 初始化控制模式
  initDeviceControl: function() {
    this.setData({ selectedLevel: 0 });
  },

  // 选择控制级别
  selectLevel: function(e) {
    const level = parseInt(e.currentTarget.dataset.level);
    this.setData({ selectedLevel: level });
  },

  // 滑块变化事件
  onSliderChange: function(e) {
    const value = e.detail.value;
    this.setData({ selectedLevel: value == 0 ? 0 : value });
  },

  confirmOperation: function() {
    wx.showLoading({ title: '设置中...' });
    this.connectdevice();
    this.sendmessage(() => {
      wx.hideLoading();
    })
  },
  
  // 返回上一页
  onBack() {
    wx.navigateBack();
  },

  // /home/{homeId}/device/{deviceId}/connect
  // connect() {
  //   wx.request({
  //     url: 'http://localhost:8080/home/' + wx.getStorageSync('HOMEID') + '/device/' + this.data.deviceId + '/connect',
  //     method: 'POST',
  //     header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token')},
  //     success: (res) => {
  //       if (res.statusCode === 200) {
  //         console.log('连接成功');
  //       } else {
  //         console.log('连接失败');
  //       }
  //     },
  //     fail: () => {
  //       console.log('网络错误');
  //     }
  //   })
  // },
  
  // /sendMessage?topic={deviceId}&value={selectedLevel}
  sendmessage(callback) {
    wx.request({
      url: 'http://localhost:8080/sendMessage?topic=' + this.data.deviceId + '&value=' + this.data.selectedLevel,
      method: 'POST',
      success: (res) => {
        if (res.statusCode === 200) {
          console.log('发送成功', res.data);
          if (typeof callback === 'function') callback();
        } else {
          console.log('发送失败');
          if (typeof callback === 'function') callback();
        }
      },
      fail: () => {
        console.log('网络错误');
        if (typeof callback === 'function') callback();
      }
    })
  },

  // /home/{homeId}/device/connect
  connectdevice() {
    wx.request({
      url: 'http://localhost:8080/home/' + wx.getStorageSync('HOMEID') + '/device/' + this.data.deviceId + '/connect',
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
      url: 'http://localhost:8080/home/' + wx.getStorageSync('HOMEID') + '/device/search/disconnect',
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