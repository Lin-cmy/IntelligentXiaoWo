Page({
  data: {
    homeId: null,
    homename: '',
    homeaddress: '未设置',
    role: null,
    userId: '',
    userphone: '',
    newhomename: '',
    newhomeaddress: '',
    devicecnt: null,
    showRequestsPopup: false,
    showChangeHomeNamePopup: false,
    showChangeHomeAddressPopup: false,
    showAddMemberPopup: false,
    homemembers: [],
    requests: []
  },

  // 初始化界面
  onLoad(options) {
    this.setData({ homeId: Number(options.homeId), role: options.role }, () => {
      this.homeview();
    })
  },

  // 显示访客申请弹窗
  showRequests() {
    this.getRequests(() => {
      this.setData({ showRequestsPopup: true });
    })
  },

  // 处理访客申请
  handleRequest(e) {
    const { requestId, userId, status } = e.currentTarget.dataset;
    this.handlerequest(requestId, userId, status, () => {
      this.getRequests();
    })
  },

  // 关闭访客申请弹窗
  closeRequests() {
    this.setData({ showRequestsPopup: false });
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
    this.updateHomeName(() => {
      this.homeview(() => {
        this.setData({ showChangeHomeNamePopup: false, newhomename: '' });
      })
    })
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
    this.updateHomeAddress(() => {
      this.homeview(() => {
        this.setData({ showChangeHomeAddressPopup: false, newhomeaddress: '' });
      })
    })
  },
  onPopupCloseHomeaddress() {
    this.setData({ showChangeHomeAddressPopup: false, newhomeaddress: '' });
  },

  // 房间及设备管理
  onRandDTap(e) {
    if (this.data.role === '访客') {
      wx.showToast({
        title: '您无权访问该页面',
        icon: 'none'
      });
      return;
    }
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
          const devicecnt = Array.from(new Set(res.data.devices.map(item => item.id))).length;
          this.setData({
            homename: res.data.home.name,
            homeaddress: res.data.home.address,
            devicecnt: devicecnt,
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

  // /home/{homeId}/updateName
  updateHomeName(callback) {
    wx.request({
      url: 'http://localhost:8080/home/' + this.data.homeId + '/updateName',
      method: 'POST',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token')},
      data: { "name": this.data.newhomename },
      success: (res) => {
        if (res.statusCode === 200) {
          console.log('修改成功');
          if (typeof callback === 'function') callback();
        } else {
          console.log(res.data.message || '修改失败');
          if (typeof callback === 'function') callback();
        }
      },
      fail: () => {
        console.log('网络错误');
        if (typeof callback === 'function') callback();
      }
    })
  },

  // /home/{homeId}/updateAddress
  updateHomeAddress(callback) {
    wx.request({
      url: 'http://localhost:8080/home/' + this.data.homeId + '/updateAddress',
      method: 'POST',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token')},
      data: { address: this.data.newhomeaddress },  
      success: (res) => {
        if (res.statusCode === 200) {
          console.log('修改成功');
          if (typeof callback === 'function') callback();
        } else {
          console.log(res.data.message || '修改失败');
          if (typeof callback === 'function') callback();
        }
      },
      fail: () => {
        console.log('网络错误');
        if (typeof callback === 'function') callback();
      }
    })
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
  },

  // /home/{homeId}/request/receive
  getRequests(callback) {
    wx.request({
      url: 'http://localhost:8080/home/' + this.data.homeId + '/request/receive',
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token')},
      success: (res) => {
        if (res.statusCode === 200) {
          // wx.showToast({
          //   title: '查询成功',
          //   icon: 'none'
          // });
          const requests = res.data.requests
          .filter( item => item.status === 0)
          .map( item => ({
            requestId: item.requestId,
            userId: item.userId,
            userName: item.userName
          }));
          this.setData({ requests: requests});
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
          title: '网络错误',
          icon: 'none'
        });
        if (typeof callback === 'function') callback();
      }
    })
  },

  // /home/{homeId}/request/receive/handle
  handlerequest(requestId, userId, status, callback) {
    wx.request({
      url: 'http://localhost:8080/home/' + this.data.homeId + '/request/receive/handle',
      method: 'POST',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token') },
      data: {
        requestId: requestId,
        userId: userId,
        status: status
      },
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({
            title: '处理成功',
            icon: 'none'
          });
          if (typeof callback === 'function') callback();
        } else {
          wx.showToast({
            title: res.data.message || '处理失败',
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
})