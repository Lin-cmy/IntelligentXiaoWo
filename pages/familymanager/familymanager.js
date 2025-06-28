Page({
  data: {
    homeId: '',
    newFamilyName: '',
    newFamilyAddress: '',
    myfamilies: [],
    showCreatePopup: false,
    deleteMode: false
  },

  // 获取家庭信息进行初始化
  onLoad() {
    this.homeget();
  },

  //  查看当前家庭
  onFamilyTap(e) {
    const homeId = e.currentTarget.dataset.homeid; 
    wx.navigateTo({
      url: '/pages/currentfamily/currentfamily?homeId=' + homeId
    });
  },

  // 创建家庭
  onCreateTap() {
      this.setData({ showCreatePopup: true });
  },
  onFamilyNameInput(e) {
      this.setData({ newFamilyName: e.detail.value });
  },
  onFamilyAddressInput(e) {
      this.setData ({ newFamilyAddress: e.detail.value });
  },
  onConfirmCreate() {
      if (!this.data.newFamilyName.trim()) {
        wx.showToast({ title: '请输入家庭名称', icon: 'none' });
        return;
      }
      if (!this.data.newFamilyAddress.trim()) {
        wx.showToast({ title: '请输入家庭地址', icon: 'none' });
        return;
      }
      this.homecreate(() => {
        this.homeget(() => {
          this.setData({ showCreatePopup: false, newFamilyName: '', newFamilyAddress: '' });
        });
      });
  },
  onPopupClose() {
      this.setData({ showCreatePopup: false, newFamilyName: '', newFamilyAddress: '' });
  },

  // 加入家庭
  onJoinTap() {
    wx.navigateTo ({
      url: '/pages/joinfamily/joinfamily'
    })
  },

  // 进入删除家庭页面
  onDeleteTap() {
    this.setData({ deleteMode: !this.data.deleteMode })
  },

  // 删除家庭
  onDeleteFamily(e) {
    const homeId = Number(e.currentTarget.dataset.homeid);
    this.setData({ homeId: homeId});
    this.homedelete(() => {
      this.homeget(() => {
        this.setData({ homeId: '' })
      })
    });
  },

  // 删除完成
  onFinishDelete() {
    this.setData({ deleteMode: false })
  },

  // /home/get
  homeget(callback) {
    wx.request({
      url: 'http://localhost:8080/home/myHome',
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token')},
      success: (res) => {
        if (res.statusCode === 200) {
          // wx.showToast({
          //   title: 'get成功',
          //   icon: 'none'
          // });
          const roleMap = {
            0: '房主',
            1: '成员',
            2: '访客'
          };
          const myfamilies = res.data.home.map(item => ({
            id: item.homeId,
            name: item.name,
            role: roleMap[item.role] || '未知'
          }));
          this.setData({ myfamilies: myfamilies });
          if (typeof callback === 'function') callback();
        } else {
          wx.showToast({
            title: res.data.message || 'get失败',
            icon: 'none'
          });
          if (typeof callback === 'function') callback();
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
        });
        if (typeof callback === 'function') callback();
      }
    })
  },

  // /home/create
  homecreate(callback) {
    wx.request({
      url: 'http://localhost:8080/home/create',
      method: 'POST',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token')},
      data: {
        "name": this.data.newFamilyName,
        "address": this.data.newFamilyAddress
      },
      success: (res) => {
        if (res.statusCode === 201) {
          wx.showToast({
            title: '创建成功',
            icon: 'none'
          });
          if (typeof callback === 'function' ) callback();
        } else {
          wx.showToast({
            title: res.data.message || '创建失败',
            icon: 'none'
          });
          if (typeof callback === 'function' ) callback();
        };
      },
      fail: () => {
        wx.showToast({
          title: '网络错误'
        });
        if (typeof callback === 'function' ) callback();
      }
    })
  },

  // /home/delete/{homeId}
  homedelete(callback) {
    wx.request({
      url: 'http://localhost:8080/home/delete/' + this.data.homeId,
      method: 'DELETE',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token') },
      success: (res) => {
        if (res.statusCode === 200 ) {
          // wx.showToast({
          //   title: '删除成功',
          //   icon: 'none'
          // });
          if (typeof callback === 'function') callback();
        } else {
          wx.showToast({
            title: res.data.message || '删除失败',
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