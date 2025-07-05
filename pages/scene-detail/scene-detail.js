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
    controlDevices: [], // 控制类设备 (55, 88, 99)
    sensorDevices: [], // 传感类设备 (其他类型)
    typeMap: {
      "1":  "温度传感器",
      "2":  "湿度传感器",
      "3":  "可燃气体传感器",
      "4":  "可燃气体报警器",
      "5":  "风扇",
      "6":  "环境光照传感器",
      "7":  "人体红外传感器",
      "8":  "可调亮度灯光", 
      "9":  "水泵", 
      "10": "土壤湿度传感器",
      "55": "风扇控制器", // 0 1 2 3 >=4
      "88": "灯光控制器", // 0-100 >=100 
      "99": "水泵控制器"  // 0 1 2 3 >=4
    },
    operationMap: {},
    deviceData: [], // 存储传感器设备数据
    isRefreshing: false
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
          
          // 加载设备信息
          this.getavailableDevices(() => {
            // 加载场景已有设备
            if (data.id) {
              this.getSceneDevices(data.id);
            }
          });
        });
      } else {
        // 备用方案，当eventChannel不可用时
        const sceneId = options.sceneId;
        if (sceneId) {
          this.setData({ sceneId: sceneId });
          this.initDateTime();
          
          // 加载设备信息
          this.getavailableDevices(() => {
            this.getSceneDevices(sceneId);
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
    this.getavailableDevices(() => {
      this.setData({ showDeviceList: true });
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
      
      // 根据设备类型设置默认值
      let defaultValue = 0;
      if (device.typeId === '88') { // 灯光控制器默认50%亮度
        defaultValue = 50;
      }
      
      const newDevice = {
        ...device,
        selectedAction: firstActionName,
        operationId: operationId,
        selectedLevel: defaultValue,
        latestTime: '暂无数据',
        latestValue: '暂无数据'
      };
      
      selectedDevices.push(newDevice);
      
      // 重新分类设备
      this.categorizeDevices(selectedDevices);
      
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
    const deviceId = e.currentTarget.dataset.deviceId;
    const actionIndex = e.detail.value;
    const selectedDevices = [...this.data.selectedDevices];
    const deviceIndex = selectedDevices.findIndex(d => d.id === deviceId);
    
    if (deviceIndex !== -1) {
      const actionName = selectedDevices[deviceIndex].actions[actionIndex];
      const operationId = this.getOperationIdByName(actionName);
      
      selectedDevices[deviceIndex].selectedAction = actionName;
      selectedDevices[deviceIndex].operationId = operationId;
      
      // 重新分类设备
      this.categorizeDevices(selectedDevices);
    }
  },

  // 设备分类
  categorizeDevices(devices) {
    const controlDevices = devices.filter(device => 
      device.typeId === '55' || device.typeId === '88' || device.typeId === '99'
    );
    
    const sensorDevices = devices.filter(device => 
      device.typeId !== '55' && device.typeId !== '88' && device.typeId !== '99'
    );
    
    // 为每个传感器设备添加其最新数据
    const sensorDevicesWithData = sensorDevices.map(device => {
      let latestData = null;
      
      // 查找设备的最新数据
      for (let i = 0; i < this.data.deviceData.length; i++) {
        if (this.data.deviceData[i].deviceId === device.id) {
          latestData = this.data.deviceData[i];
          break;
        }
      }
      
      return {
        ...device,
        latestData: latestData,
        latestTime: latestData ? latestData.formattedTime : '暂无数据',
        latestValue: latestData ? latestData.dataValue : '暂无数据'
      };
    });
    
    this.setData({
      selectedDevices: devices,
      controlDevices: controlDevices,
      sensorDevices: sensorDevicesWithData
    });
    
    // 获取传感器设备数据
    if (sensorDevices.length > 0) {
      this.fetchDeviceData(sensorDevices);
    }
  },

  // 获取传感器设备数据
  fetchDeviceData(devices) {
    const homeId = wx.getStorageSync('HOMEID');
  
    // 为每个设备分别发起请求
    devices.forEach(device => {
      wx.request({
        url: `http://localhost:8080/home/${homeId}/device/getData?deviceId=${device.id}`,
        method: 'GET',
        header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token') },
        success: (res) => {
          if (res.statusCode === 200 && res.data.data && res.data.data.length > 0) {
            // 获取该设备的最新数据（第一条数据通常是最新的）
            const latestData = res.data.data[0];
            // 格式化时间
            const formattedTime = latestData.dataTime.replace('T', ' ');
          
            // 更新该设备的数据
            const sensorDevices = [...this.data.sensorDevices];
            const deviceIndex = sensorDevices.findIndex(d => d.id === device.id);
          
            if (deviceIndex !== -1) {
              sensorDevices[deviceIndex].latestTime = formattedTime;
              sensorDevices[deviceIndex].latestValue = latestData.dataValue;
            
              // 只更新该设备的数据
              this.setData({
                sensorDevices: sensorDevices
              });
              console.log(sensorDevices);
            }
          }
        },
        fail: (err) => {
          console.error(`获取设备${device.id}数据失败:`, err);
        }
      });
    });
  
    // 请求完成后取消加载状态
    this.setData({ isRefreshing: false });
  },
  
  // 刷新数据
  refreshData() {
    // 防止重复点击
    if (this.data.isRefreshing) {
      return;
    }
      
    // 设置刷新状态
    this.setData({ isRefreshing: true });
    
    // 显示连接中提示
    wx.showLoading({ title: '连接设备中...' });

    // 获取所有传感器设备
    const sensorDevices = this.data.sensorDevices;
    
    // 刷新传感器数据
    if (sensorDevices.length > 0) {
      let connectedCount = 0;

      sensorDevices.forEach(device => {
        this.connect(device.id);
        connectedCount++;

        // 当所有设备都已连接，执行数据获取
        if (connectedCount === sensorDevices.length) {
          setTimeout(() => {
            wx.showToast({
              title: '获取数据中...',
              icon: 'none'
            });
            this.fetchDeviceData(sensorDevices);
            setTimeout(() => {
              wx.hideLoading();
              this.setData({ isRefreshing: false });
              wx.showToast({
                title: '数据已更新',
                icon: 'none'
              });
            }, 1000);
          }, 3000);
        }
      });
    } else {
      wx.hideLoading();
      this.setData({ isRefreshing: false });
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
          
          // 重新分类设备
          this.categorizeDevices(selectedDevices);
  
          wx.showToast({
            title: '设备已移除',
            icon: 'success'
          });
        }
      }
    });
  },

  // 选择控制级别 (风扇/水泵)
  selectLevel(e) {
    const deviceId = e.currentTarget.dataset.deviceId;
    const level = parseInt(e.currentTarget.dataset.level);
    
    const selectedDevices = [...this.data.selectedDevices];
    const deviceIndex = selectedDevices.findIndex(d => d.id === deviceId);
    
    if (deviceIndex !== -1) {
      selectedDevices[deviceIndex].selectedLevel = level;
      
      // 重新分类设备
      this.categorizeDevices(selectedDevices);
    }
  },

  // 灯光亮度滑块变化事件
  onSliderChange(e) {
    const deviceId = e.currentTarget.dataset.deviceId;
    const value = e.detail.value;
    
    const selectedDevices = [...this.data.selectedDevices];
    const deviceIndex = selectedDevices.findIndex(d => d.id === deviceId);
    
    if (deviceIndex !== -1) {
      selectedDevices[deviceIndex].selectedLevel = value === 0 ? 0 : value;
      
      // 重新分类设备
      this.categorizeDevices(selectedDevices);
    }
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
    let deviceOperation = [];
    this.data.selectedDevices.forEach(device => {
      deviceOperation.push({
        deviceId: device.id
      });
    });

    // 构建请求体
    const requestData = {
      name: this.data.sceneName,
      description: this.data.sceneDesc,
      status: 0,
      startTime: this.data.fullStartTime,
      endTime: this.data.fullEndTime,
      deviceOperation: deviceOperation
    };

    console.log(requestData);

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

  // 获取可用设备
  getavailableDevices(callback) {
    wx.request({
      url: 'http://localhost:8080/home/view/' + wx.getStorageSync('HOMEID'),
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token')},
      success: (res) => {
        if (res.statusCode === 200) {
          const devicesRaw = res.data.devices;
          const deviceMap = {};
          const operationMap = {};
          
          devicesRaw.forEach(item => {
            if (!deviceMap[item.id]) {
              deviceMap[item.id] = {
                id: item.id,
                name: item.name,
                typeId: item.typeId.toString(),
                type: this.data.typeMap[item.typeId] || `未知类型(${item.typeId})`,
                actions: []
              };
            }
            if (!deviceMap[item.id].actions.includes(item.operationName)) {
              deviceMap[item.id].actions.push(item.operationName);
            }
            operationMap[item.operationId] = item.operationName;
          });
          
          const availableDevices = Object.values(deviceMap);
          console.log('调试：', availableDevices);

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
          // 直接使用返回的设备数组
          const devices = res.data.devices;
        
          // 转换为selectedDevices格式
          const selectedDevices = devices.map(device => {
            // 根据设备类型设置默认操作和级别
            let defaultLevel = 0;
            if (device.typeId === 88) { // 灯光控制器默认50%亮度
              defaultLevel = 50;
            }
          
            // 为每种设备类型设置默认动作
            let actions = [];
            let defaultAction = "";
          
            switch(device.typeId) {
              case 55: // 风扇控制器
                actions = ["开启", "调速", "关闭"];
                defaultAction = "开启";
                break;
              case 88: // 灯光控制器
                actions = ["开灯", "调光", "关灯"];
                defaultAction = "开灯";
                break;
              case 99: // 水泵控制器
                actions = ["开启", "调速", "关闭"];
                defaultAction = "开启";
                break;
              default: // 传感器等其他设备
                actions = ["读取数据", "校准", "重置"];
                defaultAction = "读取数据";
            }
          
            return {
              id: device.id || device.deviceId,
              name: device.name || device.deviceName,
              typeId: (device.deviceTypeId || "0").toString(),
              type: this.data.typeMap[device.deviceTypeId] || `未知类型(${device.typeId})`,
              actions: actions,
              selectedAction: defaultAction,
              operationId: 1, // 默认操作ID，因为不再使用
              selectedLevel: defaultLevel,
              latestTime: '暂无数据',
              latestValue: '暂无数据'
            };
          });
        
          // 重新分类设备
          this.categorizeDevices(selectedDevices);
        } else {
          console.error('获取场景设备失败:', res);
        }
      },
      fail: (err) => {
        console.error('请求场景设备出错:', err);
      }
    });
  },

  // 根据设备类型名称获取类型ID
  getDeviceTypeIdByName(typeName) {
    // 首先检查typeName是否存在
    if (!typeName) return '0';
  
    for (const [id, name] of Object.entries(this.data.typeMap)) {
      if (name === typeName) return id;
    }
    // 特殊处理控制器类型
    if (typeName.includes('风扇控制器')) return '55';
    if (typeName.includes('灯光控制器')) return '88';
    if (typeName.includes('水泵控制器')) return '99';
    return '0';
  },
  
  // 连接设备
  connectDevice(deviceId) {
    const homeId = wx.getStorageSync('HOMEID');
    
    wx.request({
      url: `http://localhost:8080/home/${homeId}/device/${deviceId}/connect`,
      method: 'POST',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token')},
      success: (res) => {
        if (res.statusCode === 200) {
          console.log('连接成功');
        } else {
          console.log('连接失败');
        }
      },
      fail: () => {
        console.log('网络错误');
      }
    });
  },
  
  // 发送控制消息
  sendControlMessage(deviceId, value) {
    wx.request({
      url: `http://localhost:8080/sendMessage?topic=${deviceId}&value=${value}`,
      method: 'POST',
      success: (res) => {
        if (res.statusCode === 200) {
          console.log('发送成功', res.data);
          wx.showToast({
            title: '设置成功',
            icon: 'success'
          });
        } else {
          console.log('发送失败');
          wx.showToast({
            title: '设置失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        console.log('网络错误');
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },
  
  // 确认设备操作
  confirmOperation(e) {
    const deviceId = e.currentTarget.dataset.deviceId;
    const device = this.data.selectedDevices.find(d => d.id === deviceId);
    
    if (!device) return;
    
    wx.showLoading({ title: '设置中...' });
    
    // 连接设备
    this.connectDevice(deviceId);
    
    // 发送控制消息
    setTimeout(() => {
      this.sendControlMessage(deviceId, device.selectedLevel);
      wx.hideLoading();
    }, 1000);
  },

  // /home/{homeId}/device/{deviceId}/connect
  connect(deviceId) {
    if (!deviceId) {
      console.log('设备ID未提供');
      return;
    }

    wx.request({
      url: 'http://localhost:8080/home/' + wx.getStorageSync('HOMEID') + '/device/' + deviceId + '/connect',
      method: 'POST',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token')},
      success: (res) => {
        if (res.statusCode === 200) {
          console.log('连接成功');
        } else {
          console.log('连接失败');
        }
      },
      fail: () => {
        console.log('网络错误');
      }
    })
  }
})