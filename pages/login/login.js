Page({
  data: {
    phone: '',
    password: '',
    loginMsg: '',
    isLoading: false,
    canLogin: false
  },

  onLoad() {
    // 检查是否已登录
    const token = wx.getStorageSync('token');
    if (token) {
      this.redirectToMain();
    }
  },

  onPhoneInput(e) {
    const phone = e.detail.value;
    this.setData({
      phone,
      canLogin: this.validateForm(phone, this.data.password)
    });
  },

  onPasswordInput(e) {
    const password = e.detail.value;
    this.setData({
      password,
      canLogin: this.validateForm(this.data.phone, password)
    });
  },

  validateForm(phone, password) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone) && password.length >= 6;
  },

  async handleLogin() {
    if (!this.data.canLogin || this.data.isLoading) return;

    this.setData({ isLoading: true });

    wx.request({
      url: 'http://localhost:8080/auth/login',
      method: 'POST',
      data: {
        phone: this.data.phone,
        password: this.data.password
      },
      header: { 'content-type': 'application/json' },
      success: (res) => {
        if (res.statusCode === 200 ) {
          wx.showToast({ title: '登录成功', icon: 'success' });
          wx.setStorageSync('token', res.data.token);
          // wx.setStorageSync('userId', res.data.data.userId);
          // wx.setStorageSync('userInfo', res.data.data.userInfo);
          wx.switchTab({ url: '/pages/home/home' });
        } else {
          wx.showToast({ title: res.data.message || '登录失败', icon: 'none' });
        }
        this.setData({ isLoading: false });
      },
      fail: () => {
        wx.showToast({ title: '网络错误', icon: 'none' });
        this.setData({ isLoading: false });
      }
    })
  },

  redirectToMain() {
    wx.switchTab({
      url: '/pages/home/home'
    });
  },

  goToRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    });
  },

  forgotPassword() {
    wx.showToast({
      title: '请联系客服重置密码',
      icon: 'none'
    });
  }
}); 