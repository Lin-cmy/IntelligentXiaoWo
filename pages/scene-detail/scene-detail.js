// pages/scene-detail/scene-detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sceneData: null,
    startdate: '',
    enddate: '',
    timeRange: '00:00 - 24:00',
    startTime: '00:00',
    endTime: '24:00',
    showTimePicker: false,
    showDeviceList: false,
    availableDevices: [
      {
        id: 1,
        name: '智能空调',
        type: '空调类',
        actions: ['开启', '关闭', '调温', '模式切换']
      },
      {
        id: 2,
        name: '智能灯具',
        type: '照明类',
        actions: ['开启', '关闭', '调光', '变色']
      },
      {
        id: 3,
        name: '智能窗帘',
        type: '遮阳类',
        actions: ['打开', '关闭', '半开']
      },
      {
        id: 4,
        name: '智能音响',
        type: '娱乐类',
        actions: ['播放', '暂停', '切歌', '调音量']
      },
      {
        id: 5,
        name: '扫地机器人',
        type: '清洁类',
        actions: ['开始清扫', '停止', '返回充电']
      }
    ],
    selectedDevices: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('sceneData', (data) => {
      this.setData({ sceneData: data });
    });
  },
  onBack() {
    wx.navigateBack();
  },
  handleDateChange(e) {
    const { startdate, enddate } = e.detail
    this.setData({
      startdate,
      enddate
    })
  },
  onAddDevice() {
    wx.showToast({
      title: '添加设备',
      icon: 'none'
    });
  },
  onTimeRange() {
    this.setData({
      showTimePicker: true
    });
  },
  onAddScene() {
    wx.showToast({
      title: '添加场景',
      icon: 'none'
    });
  },
  bindStartTimeChange(e) {
    this.setData({
      startTime: e.detail.value,
      timeRange: `${e.detail.value} - ${this.data.endTime}`
    });
  },

  bindEndTimeChange(e) {
    this.setData({
      endTime: e.detail.value,
      timeRange: `${this.data.startTime} - ${e.detail.value}`
    });
  },
  // onTimeRange() {
  //   this.setData({
  //     showTimePicker: true
  //   });
  // },
  showDeviceList() {
    this.setData({
      showDeviceList: true
    });
  },

  hideDeviceList() {
    this.setData({
      showDeviceList: false
    });
  },

  selectDevice(e) {
    const device = e.currentTarget.dataset.device;
    const selectedDevices = [...this.data.selectedDevices];
    
    // 检查设备是否已选择
    const existingIndex = selectedDevices.findIndex(d => d.id === device.id);
    if (existingIndex === -1) {
      selectedDevices.push({
        ...device,
        selectedAction: device.actions[0] // 默认选择第一个动作
      });
      
      this.setData({
        selectedDevices: selectedDevices
      });

      wx.showToast({
        title: '设备添加成功',
        icon: 'success'
      });
    } else {
      wx.showToast({
        title: '设备已存在',
        icon: 'none'
      });
    }
    
    this.hideDeviceList();
  },

  // 切换设备动作
  switchDeviceAction(e) {
    const { deviceId, actionIndex } = e.currentTarget.dataset;
    const selectedDevices = [...this.data.selectedDevices];
    const deviceIndex = selectedDevices.findIndex(d => d.id === deviceId);
    
    if (deviceIndex !== -1) {
      selectedDevices[deviceIndex].selectedAction = selectedDevices[deviceIndex].actions[actionIndex];
      this.setData({
        selectedDevices: selectedDevices
      });
    }
  },

  // 移除设备
  removeDevice(e) {
    const deviceId = e.currentTarget.dataset.deviceId;
    const selectedDevices = this.data.selectedDevices.filter(d => d.id !== deviceId);
    
    this.setData({
      selectedDevices: selectedDevices
    });

    wx.showToast({
      title: '设备移除成功',
      icon: 'success'
    });
  },

  // 创建场景
  createScene() {
    if (this.data.selectedDevices.length === 0) {
      wx.showToast({
        title: '请至少添加一个设备',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '确认创建',
      content: '确定要创建这个场景吗？',
      success: (res) => {
        if (res.confirm) {
          this.submitScene();
        }
      }
    });
  },

  // 提交场景
  submitScene() {
    const sceneData = {
      name: this.data.sceneData.title,
      devices: this.data.selectedDevices,
      timeRange: this.data.timeRange,
      dateRange: {
        start: this.data.startdate,
        end: this.data.enddate
      }
    };

    // 模拟API调用
    wx.showLoading({
      title: '创建中...'
    });

    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '创建成功',
        icon: 'success'
      });

      // 更新父页面的场景状态
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      if (prevPage) {
        const sceneKey = this.data.sceneData.title === '离家' ? 'leave' : 
                        this.data.sceneData.title === '洗晾联动' ? 'laundry' :
                        this.data.sceneData.title === '烟灶联动' ? 'yanzao' :
                        this.data.sceneData.title === '全屋灯关' ? 'lights_off' :
                        this.data.sceneData.title === '定时除湿净化' ? 'chushitime' :
                        this.data.sceneData.title === '全屋灯开' ? 'lights_on' :
                        this.data.sceneData.title === '起床' ? 'wakeup' :
                        this.data.sceneData.title === '观影' ? 'movie' : 'leave';
        
        prevPage.setData({
          [`scenes.${sceneKey}.activated`]: true
        });
      }

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }, 2000);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})