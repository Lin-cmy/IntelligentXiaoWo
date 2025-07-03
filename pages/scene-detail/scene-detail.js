// pages/scene-detail/scene-detail.js
Page({
  data: {
    sceneId: null,
    sceneName: '',
    sceneDesc: '',
    isEditingName: false,
    isEditingDesc: false,
    startDate: '',
    endDate: '',
    timeRange: '00:00 - 23:59',
    startTime: '00:00',
    endTime: '23:59',
    fullStartTime: '', // 完整的开始时间 (ISO格式)
    fullEndTime: '',   // 完整的结束时间 (ISO格式)
    showTimePicker: false,
    showDeviceList: false,
    availableDevices: [],
    selectedDevices: [],
    typeMap: {},
    operationMap: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    try {
      const eventChannel = this.getOpenerEventChannel();
      if (eventChannel && typeof eventChannel.on === 'function') {
        eventChannel.on('sceneData', (data) => {
          this.setData({ 
            sceneId: data.id,
            sceneName: data.name,
            sceneDesc: data.desc,
            homeId: wx.getStorageSync('HOMEID')
          });
          
          // 初始化日期时间
          this.initDateTime();
          
          // 加载类型和设备信息
          this.gettypemap(() => {
            this.getavailableDevices(() => {
              // 加载场景已有设备
              if (data.id) {
                this.getSceneDevices(data.id);
              }
            });
          });
        });
      } else {
        // 备用方案，当eventChannel不可用时
        const sceneId = options.sceneId;
        if (sceneId) {
          this.setData({ sceneId: sceneId });
          this.initDateTime();
          
          // 加载类型和设备信息
          this.gettypemap(() => {
            this.getavailableDevices(() => {
              this.getSceneDevices(sceneId);
            });
          });
        } else {
          this.initDateTime();
        }
      }
    } catch (error) {
      console.error('页面加载出错:', error);
      this.initDateTime();
    }
  },
  
  // 初始化日期时间
  initDateTime() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const tomorrow = new Date(now.getTime() + 24*60*60*1000).toISOString().split('T')[0];
    
    this.setData({
      startDate: today,
      endDate: tomorrow,
      fullStartTime: `${today}T${this.data.startTime}:00Z`,
      fullEndTime: `${today}T${this.data.endTime}:00Z`
    });
  },
  
  // 根据操作名获取操作ID
  getOperationIdByName(operationName) {
    for (const [id, name] of Object.entries(this.data.operationMap)) {
      if (name === operationName) return Number(id);
    }
    return 1; // 默认返回1，实际应该根据API调整
  },

  onBack() {
    wx.navigateBack();
  },
  
  // 场景名称编辑
  editSceneName() {
    this.setData({ isEditingName: true });
  },
  
  // 场景描述编辑
  editSceneDesc() {
    this.setData({ isEditingDesc: true });
  },
  
  // 保存场景名称
  saveSceneName(e) {
    this.setData({
      sceneName: e.detail.value,
      isEditingName: false
    });
  },
  
  // 保存场景描述
  saveSceneDesc(e) {
    this.setData({
      sceneDesc: e.detail.value,
      isEditingDesc: false
    });
  },
  
  // 日期选择器处理
  bindStartDateChange(e) {
    this.setData({
      startDate: e.detail.value,
      fullStartTime: `${e.detail.value}T${this.data.startTime}:00Z`
    });
  },

  bindEndDateChange(e) {
    this.setData({
      endDate: e.detail.value,
      fullEndTime: `${e.detail.value}T${this.data.endTime}:00Z`
    });
  },
  
  // 时间选择器变化处理
  bindStartTimeChange(e) {
    const time = e.detail.value;
    this.setData({
      startTime: time,
      timeRange: `${time} - ${this.data.endTime}`,
      fullStartTime: `${this.data.startDate}T${time}:00Z`
    });
  },

  bindEndTimeChange(e) {
    const time = e.detail.value;
    this.setData({
      endTime: time,
      timeRange: `${this.data.startTime} - ${time}`,
      fullEndTime: `${this.data.endDate}T${time}:00Z`
    });
  },
  
  // 显示时间选择器
  onTimeRange() {
    this.setData({ showTimePicker: true });
  },
  
  // 隐藏时间选择器
  hideTimePicker() {
    this.setData({ showTimePicker: false });
  },
  
  // 显示设备列表
  showDeviceList() {
    this.gettypemap(() => {
      this.getavailableDevices(() => {
        this.setData({ showDeviceList: true });
      });
    });
  },

  // 隐藏设备列表
  hideDeviceList() {
    this.setData({ showDeviceList: false });
  },

  // 选择设备
  selectDevice(e) {
    const device = e.currentTarget.dataset.device;
    const selectedDevices = [...this.data.selectedDevices];
    
    // 检查设备是否已选择
    const existingIndex = selectedDevices.findIndex(d => d.id === device.id);
    if (existingIndex === -1) {
      // 获取第一个操作的ID
      const firstActionName = device.actions[0];
      const operationId = this.getOperationIdByName(firstActionName);
      
      selectedDevices.push({
        ...device,
        selectedAction: firstActionName,
        operationId: operationId
      });
      
      this.setData({ selectedDevices: selectedDevices });

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
    // const { deviceId, actionIndex } = e.currentTarget.dataset;
    const deviceId = e.currentTarget.dataset.deviceId;
    const actionIndex = e.detail.value;
    const selectedDevices = [...this.data.selectedDevices];
    const deviceIndex = selectedDevices.findIndex(d => d.id === deviceId);
    
    if (deviceIndex !== -1) {
      const actionName = selectedDevices[deviceIndex].actions[actionIndex];
      const operationId = this.getOperationIdByName(actionName);
      
      selectedDevices[deviceIndex].selectedAction = actionName;
      selectedDevices[deviceIndex].operationId = operationId;
      
      this.setData({ selectedDevices: selectedDevices });
    }
  },

   // 删除设备
  removeDevice(e) {
    const deviceId = e.currentTarget.dataset.deviceId;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要移除此设备吗？',
      success: (res) => {
        if (res.confirm) {
          const selectedDevices = this.data.selectedDevices.filter(d => d.id !== deviceId);
          this.setData({ 
            selectedDevices: selectedDevices
          });
  
          wx.showToast({
            title: '设备已移除',
            icon: 'success'
          });
          
          // 可选：添加一个提示
          if (!this.unsavedChangesTimer) {
            this.unsavedChangesTimer = setTimeout(() => {
              wx.showToast({
                title: '记得点击"保存场景"',
                icon: 'none',
                duration: 2000
              });
              this.unsavedChangesTimer = null;
            }, 1500);
          }
        }
      }
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

  // 提交场景到后端
  submitScene() {
    // 构建deviceOperation数组
    const deviceOperation = this.data.selectedDevices.map(device => ({
      deviceId: device.id,
      operationId: device.operationId
    }));
    
    // 构建请求体
    const requestData = {
      name: this.data.sceneName,
      description: this.data.sceneDesc,
      status: 0,
      startTime: this.data.fullStartTime,
      endTime: this.data.fullEndTime,
      deviceOperation: deviceOperation
    };

    const homeId = wx.getStorageSync('HOMEID');
    const sceneId = this.data.sceneId;
    
    wx.showLoading({ title: '保存中...' });
    
    wx.request({
      url: `http://localhost:8080/home/${homeId}/scene/update/${sceneId}`,
      method: 'POST',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token') },
      data: requestData,
      success: (res) => {
        wx.hideLoading();
        
        if (res.statusCode === 200) {
          wx.showToast({
            title: '创建成功',
            icon: 'success'
          });
          
          // 更新场景设备列表
          this.getSceneDevices(this.data.sceneId);

          // 更新父页面场景状态
          this.updateParentPage();
          
          // 返回上一页
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        } else {
          wx.showToast({
            title: res.data.message || '创建失败',
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
        console.error('保存场景失败:', err);
      }
    });
  },
  
  // 更新父页面
  updateParentPage() {
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage) {
      // 刷新父页面的场景列表
      if (typeof prevPage.getscenes === 'function') {
        prevPage.getscenes();
      }
    }
  },

  // 获取设备类型映射
  gettypemap(callback) {
    wx.request({
      url: 'http://localhost:8080/home/' + wx.getStorageSync('HOMEID') + '/room/device/type/list',
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token')},
      success: (res) => {
        if (res.statusCode === 200) {
          const typeMap = {};
          res.data.forEach(item => {
            typeMap[item.id] = item.name;
          });
          this.setData({ typeMap: typeMap });
          if (typeof callback === 'function') callback();
        } else {
          wx.showToast({
            title: '建立类型映射失败',
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
    })
  },

  // 获取可用设备
  getavailableDevices(callback) {
    wx.request({
      url: 'http://localhost:8080/home/view/' + wx.getStorageSync('HOMEID'),
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token')},
      success: (res) => {
        if (res.statusCode === 200) {
          const devicesRaw = res.data.devices;
          const typeMap = this.data.typeMap;
          const deviceMap = {};
          const operationMap = {};
          
          devicesRaw.forEach(item => {
            if (!deviceMap[item.id]) {
              deviceMap[item.id] = {
                id: item.id,
                name: item.name,
                type: typeMap[item.typeId],
                actions: []
              };
            }
            if (!deviceMap[item.id].actions.includes(item.operationName)) {
              deviceMap[item.id].actions.push(item.operationName);
            }
            operationMap[item.operationId] = item.operationName;
          });
          
          const availableDevices = Object.values(deviceMap);
          this.setData({
            availableDevices: availableDevices,
            operationMap: operationMap
          });
          
          if (typeof callback === 'function') callback();
        } else {
          wx.showToast({
            title: 'view失败',
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
    })
  },

  // 获取场景已添加的设备
  getSceneDevices(sceneId) {
    const homeId = wx.getStorageSync('HOMEID');
  
    wx.request({
     url: `http://localhost:8080/home/${homeId}/scene/view/${sceneId}/device`,
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token') },
      success: (res) => {
        if (res.statusCode === 200 && res.data.devices) {
          // 数据预处理：去重（相同设备ID和操作ID只保留一个）
          const uniqueDevices = {};
        
          res.data.devices.forEach(item => {
            const key = `${item.deviceId}_${item.operationId}`;
            uniqueDevices[key] = item;
          });
        
          // 按设备ID分组
          const deviceGroups = {};
        
          Object.values(uniqueDevices).forEach(device => {
            if (!deviceGroups[device.deviceId]) {
              deviceGroups[device.deviceId] = {
                id: device.deviceId,
                name: device.deviceName,
                operations: [],
                type: this.getDeviceTypeById(device.deviceId)
              };
            }
          
            deviceGroups[device.deviceId].operations.push({
              id: device.operationId,
              name: device.operationName
            });
          });
        
          // 转换为selectedDevices格式
          const selectedDevices = Object.values(deviceGroups).map(device => {
            // 提取操作名称列表
            const actions = device.operations.map(op => op.name);
            // 默认选中第一个操作
            const selectedOperation = device.operations[0];
          
            return {
              id: device.id,
              name: device.name,
              type: device.type,
              actions: actions,
              selectedAction: selectedOperation.name,
              operationId: selectedOperation.id
            };
          });
        
          this.setData({ selectedDevices });
        } else {
          console.error('获取场景设备失败:', res);
        }
      },
      fail: (err) => {
        console.error('请求场景设备出错:', err);
      }
    });
  },

  // 根据设备ID获取设备类型
  getDeviceTypeById(deviceId) {
    // 查找设备类型，可能需要再次调用getavailableDevices来获取所有设备信息
    const devices = this.data.availableDevices;
    const device = devices.find(d => d.id === deviceId);
    return device ? device.type : '未知类型';
  }
})