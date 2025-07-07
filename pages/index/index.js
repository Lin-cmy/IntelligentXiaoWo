Page({
  data: {
    currentIndex: 0,
    showButton: false
  },
    // //定义按钮的事件处理函数
    // btnTapHandler(){
    //    wx.switchTab({
    //     url: '/pages/environment/environment'
	  //   })
      
    // },
    // hasUserInfo: false,
    // canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    // canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    handleSwiperChange(e) {
      const { current } = e.detail
      this.setData({
        currentIndex: current,
        showButton: current === 2
      })
    },
    handleStart() {
      // 检查用户是否已登录
      const token = wx.getStorageSync('token');
      //console.log(token);
      if (token) {
        wx.switchTab({
          url: '/pages/home/home'
        });
      } else {
        wx.navigateTo({
          url: '/pages/login/login'
        });
      }
    },

 
  getUserProfile(e) {
    wx.getUserProfile({
      desc: '展示用户信息',
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
})
