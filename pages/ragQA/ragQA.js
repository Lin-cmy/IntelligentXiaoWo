const { articles } = require('../../utils/articles.js');

Page({
  data: {
    
      imgUrls: [
        '/images/pagesetting/others/lunbotu1.jpg',
        '/images/pagesetting/others/lunbotu2.jpg',
        '/images/pagesetting/others/lunbotu3.png'
      ],
      swiperIdx :0,
      count: 0,
      leftitem:[
        {id:1,nad:"安防知识"},
        {id:2,nad:"植物养护"},
        {id:3,nad:"低耗节能"},
        {id:4,nad:"家居小tips"}],
   
        rightitem : articles,
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
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/article-detail/article-detail?id=${id}`
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

});