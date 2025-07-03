// pages/device-detail/device-detail.js
Page({
  data: {
    deviceId: null,
    deviceName: '设备详情',
    deviceData: []
  },

  onLoad: function(options) {
    // 从页面参数获取设备ID
    const deviceId = options.deviceId;
    const deviceName = options.deviceName;
    if (deviceId && deviceName) {
      this.setData({ deviceId });
      this.setData({ deviceName });
      this.fetchDeviceData();
    } else {
      wx.showToast({
        title: '设备 ID 或 NAME 不存在',
        icon: 'none'
      });
    }
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
          // 处理时间格式
          const formattedData = res.data.data.map(item => {
            // 格式化时间 2025-07-03T15:24:10 -> 2025-07-03 15:24:10
            const formattedTime = item.dataTime.replace('T', ' ');
            return {
              ...item,
              formattedTime
            };
          });
          
          // 获取设备名称（从前一页传递或API获取）
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
  
  // 刷新数据
  refreshData() {
    this.fetchDeviceData();
  },
  
  // 返回上一页
  onBack() {
    wx.navigateBack();
  }
});