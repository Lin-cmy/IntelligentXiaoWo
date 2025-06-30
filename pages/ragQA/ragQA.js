Page({
  data: {
    
      imgUrls: [
        '/images/pagesetting/others/jiaogui1.jpg',
        '/images/pagesetting/others/jiaogui2.jpg',
        '/images/pagesetting/others/xuzhi.png'
      ],
      swiperIdx :0,
      count: 0,
      leftitem:[
        {id:1,nad:"安防知识"},
        {id:2,nad:"植物养护"},
        {id:3,nad:"低耗节能"},
        {id:4,nad:"家居小tips"}],
   
        rightitem : [
           // 安防知识
      {id:11,nad:"智能门锁安全使用指南",tag:"安全",url:"/images/pagesetting/others/xuzhi.png",tag:0, summary: "了解智能门锁的安全设置和使用技巧", category: "安防知识"},
      {id:12,nad:"监控摄像头最佳位置布置",tag:"监控",url:"/images/pagesetting/others/xuzhi2.jpg",tag:0, summary: "科学布置摄像头，全方位保护家庭安全", category: "安防知识"},
     
      // 植物养护
      {id:21,nad:"智能浇水系统使用指南",tag:"浇水",url:"/images/pagesetting/others/jiaogui1.jpg",tag:1, summary: "让植物在智能化呵护下茁壮成长", category: "植物养护"},
      {id:22,nad:"室内空气质量与植物搭配",tag:"净化",url:"/images/pagesetting/others/jiaogui2.jpg",tag:1, summary: "选择合适的植物净化室内空气", category: "植物养护"},
      
      // 低耗节能
      {id:31,nad:"智能家电节能技巧",tag:"节能",url:"/images/pagesetting/others/touwei.png",tag:2, summary: "掌握智能家电的节能使用方法", category: "低耗节能"},
      {id:32,nad:"智能照明系统优化",tag:"照明",url:"/images/pagesetting/others/touwei2.png",tag:2, summary: "通过智能照明降低能耗", category: "低耗节能"},
      
      // 家居小tips
      {id:41,nad:"智能音响使用小技巧",tag:"音响",url:"/images/pagesetting/others/xiaomao.jpg",tag:3, summary: "发挥智能音响的最大潜力", category: "家居小tips"},
      {id:42,nad:"家庭网络优化指南",tag:"网络",url:"/images/pagesetting/others/miao.jpg",tag:3, summary: "打造稳定高速的智能家居网络", category: "家居小tips"}
    ],
    dialogVisible: false,
    userMessage: "",
    voiceSrc: "",
    swiperHeight: 300
  },

  onLoad() {
    // 计算轮播图高度
    const query = wx.createSelectorQuery();
    query.select('.swiperClass').boundingClientRect();
    query.exec((res) => {
      if (res[0]) {
        this.setData({
          swiperHeight: res[0].height || 300
        });
      }
    });
  },

  bindchange(e) {
    this.setData({
      swiperIdx: e.detail.current
    });
  },

  switchRightTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      count: index
    });
  },

  click_nav_cat(e) {
    const index = e.currentTarget.dataset.indexTwo;
    const item = this.data.rightitem[index];
    wx.showModal({
      title: item.nad,
      content: item.summary,
      confirmText: '查看详情',
      success: (res) => {
        if (res.confirm) {
          // 这里可以跳转到文章详情页
          wx.showToast({
            title: '文章详情功能待开发',
            icon: 'none'
          });
        }
      }
    });
  },

  // 悬浮球点击
  onFloatBallTap() {
    wx.showToast({
      title: '长按进入语音对话',
      icon: 'none'
    });
  },

  // 悬浮球长按
  onFloatBallLongPress() {
    wx.navigateTo({
      url: '/pages/AIchat/AIchat'
    });
  },
  showDialog() {
    this.setData({
      dialogVisible: true
    });
  },
  closeDialog() {
    this.setData({
      dialogVisible: false
    });
  },
  onInput(e) {
    this.setData({
      userMessage: e.detail.value
    });
  },
  sendMsg() {
    const message = this.data.userMessage;
    if (message.trim() === "") {
      wx.showToast({
        title: "请输入内容",
        icon: "none"
      });
      return;
    }
    // 模拟AI回复
    wx.showToast({
      title: "AI正在回复...",
      icon: "loading"
    });
    setTimeout(() => {
      wx.showToast({
        title: "AI回复：你好！",
        icon: "success"
      });
      this.setData({
        userMessage: ""
      });
    }, 1000);
  },
  startVoiceInput() {
    const that = this;
    wx.getFileSystemManager().rm({
      filePath: `${wx.env.USER_DATA_PATH}/voice.mp3`,
      success: () => {
        wx.startRecord({
          filePath: `${wx.env.USER_DATA_PATH}/voice.mp3`,
          success: (res) => {
            that.setData({
              voiceSrc: res.tempFilePath
            });
          }
        });
        setTimeout(() => {
          wx.stopRecord();
        }, 5000);
      }
    });
  },
  goToArticle(e) {
    const articleId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/article/article?id=${articleId}`
    });
  }
});