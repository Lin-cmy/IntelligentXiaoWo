// pages/environment/environment.js
Page({
  data: {
    scenes: {
      leave: {
        title: '离家',
        desc: '一键关闭空调灯窗帘等设备，开启扫地机',
        activated: false,
        devices: [
          {
            name: '智能扫地机W20',
            state: '工作'
          },
          {
            name: '智能窗帘',
            state: '关闭'
          },{
            name: '燃气',
            state: '关闭'
          },{
            name: '灯',
            state: '关闭'
          },
        ],
        
      },
      laundry: {
        title: '洗晾联动',
        desc: '洗涤结束，晾衣机下落',
        activated: false,
        devices: [
          {
            name: '智能晾衣机',
            state: '打开'
          },
          {
            name: '智能烘衣机',
            state: '打开'
          }
        ],
      },
     
      yanzao: {
        title: '烟灶联动',
        desc: '点火时烟机自启动',
        activated: false,
        devices: [
          {
            name: '吸油烟机',
            state: '打开'
          }
        ],
      },
       
      lights_off: {
        title: '全屋灯关',
        desc: '根据需要关闭灯',
        activated: false,
        devices: [
          {
            name: '玄关灯',
            state: '关闭'
          }
        ],
      },
         
      chushitime: {
        title: '定时除湿净化',
        desc: '固定时间段内打开空气净化器空调开启除湿',
        activated: false,
        devices: [
          {
            name: '空气净化器',
            state: '打开'
          },
          {
            name: '空调',
            state: '除湿模式'
          }
        ],
      },
            
      lights_on: {
        title: '全屋灯开',
        desc: '回家后可一键实现开灯',
        activated: false,
        devices: [
          {
            name: '客厅灯',
            state: '打开'
          },
          {
            name: '卧室灯',
            state: '打开'
          }
        ],
      },
            
      wakeup: {
        title: '起床',
        desc: '打开窗帘和净化器，清新环境开启新一天',
        activated: false,
        devices: [
          {
            name: '智能窗帘',
            state: '打开'
          },
          {
            name: '空气净化器',
            state: '打开'
          }
        ],
      },
                
      movie: {
        title: '观影',
        desc: '观影模式启动，关闭不必要的灯和窗帘，设置电影模式',
        activated: false,
        devices: [
          {
            name: '客厅灯',
            state: '关闭'
          },
          {
            name: '投影仪',
            state: '打开'
          }
        ],
      }
      // 其他场景配置...
    }
  },
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
  onLoad: function(options) {
    // 页面加载时的初始化逻辑
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
  }
});