// pages/register/register.js
Page({
  data: {
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
    registerMsg: '',
    isLoading: false,
    canRegister: false
  },

  onUsernameInput(e) {
    const username = e.detail.value;
    this.setData({
      username,
      canRegister: this.validateForm()
    });
  },

  onPhoneInput(e) {
    const phone = e.detail.value;
    this.setData({
      phone,
      canRegister: this.validateForm()
    });
  },

  onPasswordInput(e) {
    const password = e.detail.value;
    this.setData({ password }, this.updateCanRegister);
  },
  onConfirmPasswordInput(e) {
    const confirmPassword = e.detail.value;
    this.setData({ confirmPassword }, this.updateCanRegister);
  },
  updateCanRegister() {
    this.setData({ canRegister: this.validateForm() });
  },

  validateForm() {
    const { username, phone, password, confirmPassword } = this.data;
    const phoneRegex = /^1[3-9]\d{9}$/;
    
    return username.length >= 2 &&
           phoneRegex.test(phone) &&
           password.length >= 6 &&
           password === confirmPassword;
  },

  async handleRegister() {
    if (!this.data.canRegister || this.data.isLoading) return;

    this.setData({ isLoading: true });

    wx.request({
      url: 'http://localhost:8080/auth/register',
      method: 'POST',
      data: {
        username: this.data.username,
        phone: this.data.phone,
        password: this.data.password
      },
      header: { 'content-type': 'application/json'},
      success: (res)=> {
        if (res.statusCode === 201) {
          this.setData({ registerMsg: '注册成功，请登录' });
          wx.navigateTo({ url: '/pages/login/login' });
        } else {
          this.setData({ registerMsg: res.data.message || '注册失败' });
        }
        this.setData({ isLoading: false });
      },
      fail: () => {
        this.setData({ registerMsg: '网络错误', isLoading: false });
      }
    });

    // try {
    //   const res = await this.requestRegister();
      
    //   if (res.statusCode === 201) {
    //     wx.showToast({
    //       title: '注册成功',
    //       icon: 'success'
    //     });

    //     setTimeout(() => {
    //       wx.navigateTo({
    //         url: '/pages/login/login'
    //       });
    //     }, 1500);
    //   } else {
    //     wx.showToast({
    //       title: res.data.message || '注册失败',
    //       icon: 'none'
    //     });
    //   }
    // } catch (error) {
    //   wx.showToast({
    //     title: '网络错误，请重试',
    //     icon: 'none'
    //   });
    // } finally {
    //   this.setData({ isLoading: false });
    // }
  },

  // requestRegister() {
  //   return new Promise((resolve, reject) => {
  //     wx.request({
  //       url: 'http://localhost:8080/auth/register', // 替换为实际API地址
  //       method: 'POST',
  //       header: {
  //         'Content-Type': 'application/json'
  //       },
  //       data: {
  //         username: this.data.username,
  //         phone: this.data.phone,
  //         password: this.data.password
  //       },
  //       success: resolve,
  //       fail: reject
  //     });
  //   });
  // },

  goToLogin() {
    wx.navigateBack();
  }
}); 