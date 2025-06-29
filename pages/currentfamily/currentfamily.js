Page({
  data: {
    homeId: null,
    homename: '',
    homeaddress: '未设置',
    userId: '',
    userphone: '',
    newhomename: '',
    newhomeaddress: '',
    devicecnt: null,
    showChangeHomeNamePopup: false,
    showChangeHomeAddressPopup: false,
    showAddMemberPopup: false,
    homemembers: []
    // familymembers: [
    //   { id: 1, name: '陈俊烨', icon: '/images/cjy.jpg'}
    // ]
  },

  // 初始化界面
  onLoad(options) {
    this.setData({ homeId: Number(options.homeId) }, () => {
      this.homeview();
    })
  },

  // 修改家庭名称
  onNameTap() {
    this.setData({ showChangeHomeNamePopup: true });
  },
  onHomeNameInput(e) {
    this.setData({ newhomename: e.detail.value });
  },
  onConfirmChangeHomename() {
    if (!this.data.newhomename.trim()) {
      wx.showToast({ title: '请输入家庭名称', icon: 'none' });
      return;
    }
    // 修改家庭名称
  },
  onPopupCloseHomename() {
    this.setData({ showChangeHomeNamePopup: false, newhomename: '' });
  },

  // 修改家庭地址
  onAddressTap() {
    this.setData({ showChangeHomeAddressPopup: true });
  },
  onHomeAddressInput(e) {
    this.setData({ newhomeaddress: e.detail.value });
  },
  onConfirmChangeHomeaddress() {
    if (!this.data.newhomeaddress.trim()) {
      wx.showToast({ title: '请输入家庭地址', icon: 'none' });
      return;
    }
    // 修改家庭地址
  },
  onPopupCloseHomeaddress() {
    this.setData({ showChangeHomeAddressPopup: false, newhomeaddress: '' });
  },

  // 房间及设备管理
  onRandDTap(e) {
    const homeId = e.currentTarget.dataset.homeid;
    wx.navigateTo({
      url: '/pages/Roommanager/Roommanager?homeId=' + homeId
    })
  },

  // 添加成员按钮
  onAddTap() {
    this.setData({
      showAddMemberPopup: true,
      userphone: ''
    });
  },

  // 输入手机号
  onMemberPhoneInput(e) {
    this.setData({ userphone: e.detail.value });
  },

  // 取消添加成员
  onAddMemberCancel() {
    this.setData({
      showAddMemberPopup: false,
      userphone: ''
    });
  },

  // 确认添加家庭成员
  onAddMemberConfirm() {
    this.searchuser(() => {
      this.addmember(() => {
        this.homeview(() => {
          this.setData({
            showAddMemberPopup: false,
            userId: '',
            userphone: ''
          })
        })
      })
    });
  },

  // /home/view
  homeview(callback) {
    wx.request({
      url: 'http://localhost:8080/home/view/' + this.data.homeId,
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token')},
      success: (res) => {
        if (res.statusCode === 200) {
          // wx.showToast({
          //   title: 'view成功',
          //   icon: 'none'
          // });
          const roleMap = {
            0: "房主",
            1: "成员",
            2: "访客"
          };
          const homemembers = res.data.users.map(item => ({
            id: item.id,
            name: item.username,
            role: roleMap[item.role]
          }));
          this.setData({
            homename: res.data.home.name,
            homeaddress: res.data.home.address,
            devicecnt: res.data.devices.length,
            homemembers: homemembers
          });
          if (typeof callback === 'function') callback();
        } else {
          wx.showToast({
            title: res.data.message || 'view失败'
          })
          if (typeof callback === 'function') callback();
        };
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
        });
        if (typeof callback === 'function') callback();
      }
    });
  },

  // /auth/search-user-by-phone
  searchuser(callback) {
    wx.request({
      url: 'http://localhost:8080/auth/search-user-by-phone?phone=' + this.data.userphone,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({
            title: '查询成功',
            icon: 'none'
          });
          this.setData({ userId: res.data.userId });
          if (typeof callback === 'function') callback();
        } else {
          wx.showToast({
            title: res.data.message || '查询失败',
            icon: 'none'
          });
          if (typeof callback === 'function') callback();
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误1',
          icon: 'none'
        });
        if (typeof callback === 'function') callback();
      }
    })
  },

  // /home/member/add
  addmember(callback) {
    wx.request({
      url: 'http://localhost:8080/home/member/add',
      method: 'POST',
      data: {
        homeId: this.data.homeId,
        userId: this.data.userId,
        role: 1
      },
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({
            title: '添加成功',
            icon: 'none'
          });
          if (typeof callback === 'function') callback();
        } else {
          wx.showToast({
            title: res.data.message || '添加失败',
            icon: 'none'
          });
          if (typeof callback === 'function') callback();
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误2',
          icon: 'none'
        });
        if (typeof callback === 'function') callback();
      }
    })
  }
})