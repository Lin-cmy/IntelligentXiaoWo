// index.js
// const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

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
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
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
