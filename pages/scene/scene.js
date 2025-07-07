// pages/environment/environment.js
Page({
  data: {
    // scenes: {
    //   leave: {
    //     title: '离家',
    //     desc: '一键关闭空调灯窗帘等设备，开启扫地机',
    //     activated: false,
    //     devices: [
    //       {
    //         name: '智能扫地机W20',
    //         state: '工作'
    //       },
    //       {
    //         name: '智能窗帘',
    //         state: '关闭'
    //       },{
    //         name: '燃气',
    //         state: '关闭'
    //       },{
    //         name: '灯',
    //         state: '关闭'
    //       },
    //     ],
        
    //   },
    //   laundry: {
    //     title: '洗晾联动',
    //     desc: '洗涤结束，晾衣机下落',
    //     activated: false,
    //     devices: [
    //       {
    //         name: '智能晾衣机',
    //         state: '打开'
    //       },
    //       {
    //         name: '智能烘衣机',
    //         state: '打开'
    //       }
    //     ],
    //   },
     
    //   yanzao: {
    //     title: '烟灶联动',
    //     desc: '点火时烟机自启动',
    //     activated: false,
    //     devices: [
    //       {
    //         name: '吸油烟机',
    //         state: '打开'
    //       }
    //     ],
    //   },
       
    //   lights_off: {
    //     title: '全屋灯关',
    //     desc: '根据需要关闭灯',
    //     activated: false,
    //     devices: [
    //       {
    //         name: '玄关灯',
    //         state: '关闭'
    //       }
    //     ],
    //   },
         
    //   chushitime: {
    //     title: '定时除湿净化',
    //     desc: '固定时间段内打开空气净化器空调开启除湿',
    //     activated: false,
    //     devices: [
    //       {
    //         name: '空气净化器',
    //         state: '打开'
    //       },
    //       {
    //         name: '空调',
    //         state: '除湿模式'
    //       }
    //     ],
    //   },
            
    //   lights_on: {
    //     title: '全屋灯开',
    //     desc: '回家后可一键实现开灯',
    //     activated: false,
    //     devices: [
    //       {
    //         name: '客厅灯',
    //         state: '打开'
    //       },
    //       {
    //         name: '卧室灯',
    //         state: '打开'
    //       }
    //     ],
    //   },
            
    //   wakeup: {
    //     title: '起床',
    //     desc: '打开窗帘和净化器，清新环境开启新一天',
    //     activated: false,
    //     devices: [
    //       {
    //         name: '智能窗帘',
    //         state: '打开'
    //       },
    //       {
    //         name: '空气净化器',
    //         state: '打开'
    //       }
    //     ],
    //   },
                
    //   movie: {
    //     title: '观影',
    //     desc: '观影模式启动，关闭不必要的灯和窗帘，设置电影模式',
    //     activated: false,
    //     devices: [
    //       {
    //         name: '客厅灯',
    //         state: '关闭'
    //       },
    //       {
    //         name: '投影仪',
    //         state: '打开'
    //       }
    //     ],
    //   }
    //   // 其他场景配置...
    // },
    homeId: '',
    userId: '',
    newSceneName: '',
    newSceneDesc: '',
    showAddScenePopup: false,
    isDeleteMode: false,
    scenes: []
  },

  // 初始化场景列表
  onLoad() {
    const homeId = wx.getStorageSync('HOMEID');
    const userId = wx.getStorageSync('USERID');
    this.setData({ homeId: homeId, userId: userId });
    this.getscenes();
  },

  // 刷新页面
  onShow() {
    const homeId = wx.getStorageSync('HOMEID');
    this.setData({ homeId: homeId }, () => {
      this.getscenes();
    });
  },

  // 查看场景
  onSceneDetail(e) {
    const scene = e.currentTarget.dataset.scene;
    const sceneData = this.data.scenes[scene];
    
    wx.navigateTo({
      url: `/pages/scene-detail/scene-detail?scene=${scene}`,
      success: (res) => {
        res.eventChannel.emit('sceneData', sceneData)
      }
    });
  },

  // 显示添加场景弹窗
  showAddScenePopup() {
    this.setData({
      showAddScenePopup: true,
      newSceneName: '',
      newSceneDesc: ''
    });
  },

  // 隐藏添加场景弹窗
  hideAddScenePopup() {
    this.setData({
      showAddScenePopup: false,
      newSceneName: '',
      newSceneDesc: ''
    });
  },

  // 场景名称输入
  onSceneNameInput(e) {
    this.setData({ newSceneName: e.detail.value });
  },

  // 场景描述输入
  onSceneDescInput(e) {
    this.setData({ newSceneDesc: e.detail.value });
  },

  // 确认添加场景
  confirmAddScene() {
    const { homeId, userId, newSceneName, newSceneDesc } = this.data;
    
    if (!newSceneName.trim()) {
      wx.showToast({
        title: '请输入场景名称',
        icon: 'none'
      });
      return;
    }
    this.addscene(homeId, userId, newSceneName, newSceneDesc, () => {
      this.getscenes(() => {
        this.setData({
          showAddScenePopup: false,
          newSceneName: '',
          newSceneDesc: '',
        });
      })
    });
  },

  // 进入删除模式
  toggleDeleteMode() {
    this.setData({ isDeleteMode: true });
  },
  
  // 退出删除模式
  exitDeleteMode() {
    this.setData({ isDeleteMode: false });
  },

  // 删除场景
  onDeleteScene(e) {
    const homeId = this.data.homeId;
    const sceneId = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个场景吗？',
      success: (res) => {
        if (res.confirm) {
          this.deletescene(homeId, sceneId, () => {
            this.getscenes();
          });
        }
      }
    });
  },

  // 切换导航栏
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab
    });
  },

  // 点击场景项
  onSceneClick: function(e) {
    const sceneId = e.currentTarget.dataset.id;
    // 处理场景点击事件
    wx.showToast({
      title: '场景已启动',
      icon: 'success'
    });
  },

  // /home/{homeId}/scene/view
  getscenes(callback) {
    const homeId = wx.getStorageSync('HOMEID');
    wx.request({
      url: 'http://localhost:8080/home/' + homeId + '/scene/view',
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token')},
      success: (res) => {
        if (res.statusCode === 200) {
          // wx.showToast({
          //   title: '成功获取场景',
          //   icon: 'none'
          // });
          const scenes = res.data.scenes.map(item => ({
            id: item.id,
            name: item.name,
            desc: item.description
          }));
          this.setData({ scenes: scenes });
          if (typeof callback === 'function') callback();
        } else {
          wx.showToast({
            title: '获取场景失败',
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

  // /home/{homeId}/scene/add
  addscene(homeId, userId, newSceneName, newSceneDesc, callback) {
    wx.request({
      url: 'http://localhost:8080/home/' + this.data.homeId + '/scene/add',
      method: 'POST',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token')},
      data: {
        homeId: homeId,
        userId: userId,
        name: newSceneName,
        description: newSceneDesc,
        deviceOperation: []
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

  // /home/{homeId}/scene/delete/{sceneId}
  deletescene(homeId, sceneId, callback) {
    wx.request({
      url: 'http://localhost:8080/home/' + homeId + '/scene/delete/' + sceneId,
      method: 'DELETE',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token')},
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({
            title: '删除成功',
            icon: 'none'
          });
          if (typeof callback === 'function') callback();
        } else {
          wx.showToast({
            title: '删除失败',
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
  }
});