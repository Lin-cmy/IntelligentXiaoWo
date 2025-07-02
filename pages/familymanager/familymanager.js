Page({
  data: {
    homeId: '',
    selectedHomeId: null,
    selectedHome: null,
    newFamilyName: '',
    newFamilyAddress: '',
    searchfamilyname: '',
    searchInput: '',
    myfamilies: [],
    searchfamilies: [],
    showCreatePopup: false,
    deleteMode: false,
    showSearchPopup: false
  },

  // 获取家庭信息进行初始化
  onLoad() {
    this.homeget();
  },

  //  查看当前家庭
  onFamilyTap(e) {
    const homeId = e.currentTarget.dataset.homeid; 
    const role = e.currentTarget.dataset.identity;
    wx.navigateTo({
      url: '/pages/currentfamily/currentfamily?homeId=' + homeId + '&role=' + role
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

  // 访问家庭
  onEnterTap() {
    this.setData({ 
      showSearchPopup: true,
      searchfamilies: [],
      searchInput: '',
      selectedHomeId: null,
      selectedHome: null
    });
  },

  // 搜索输入变化
  onSearchInput(e) {
    this.setData({ 
      searchInput: e.detail.value,
      searchfamilyname: e.detail.value 
    });
  },

  // 执行搜索
  onSearch() {
    if (!this.data.searchInput.trim()) {
      wx.showToast({ title: '请输入家庭名称', icon: 'none' });
      return;
    }
    this.searchhome();
  },

  // 选择家庭
  onSelectHome(e) {
    const homeId = e.currentTarget.dataset.homeid;
    const selectedHome = this.data.searchfamilies.find(home => home.id === homeId);
    this.setData({ 
      selectedHomeId: homeId,
      selectedHome: selectedHome 
    });
  },

  // 申请访问家庭
  onApplyEnter() {
    if (!this.data.selectedHomeId) {
      wx.showToast({ title: '请选择要加入的家庭', icon: 'none' });
      return;
    }
    this.enterhome();
  },

  // 关闭搜索弹窗
  onSearchPopupClose() {
    this.setData({ showSearchPopup: false });
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

  // /home/search?keyword=this.data.searchfamilyname
  searchhome(callback) {
    wx.request({
      url: 'http://localhost:8080/home/search?keyword=' + this.data.searchfamilyname,
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + wx.getStorageSync('token')},
      success: (res) => {
        if (res.statusCode === 200) {
          console.log('搜索成功');
          const searchfamilies = res.data.homes.map(item => ({
            id: item.id,
            name: item.name,
            address: item.address
          }));
          this.setData({ searchfamilies: searchfamilies });
          if (typeof callback === 'function') callback();
        } else {
          console.log('搜索失败');
          if (typeof callback === 'function') callback();
        }
      },
      fail: () => {
        console.log('网络错误');
        if (typeof callback === 'function') callback();
      }
    })
  },

  // /home/{homeId}/request/put
  enterhome(callback) {
    wx.request({
      url: 'http://localhost:8080/home/' + this.data.selectedHomeId + '/request/put',
      method: 'POST',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token')},
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({
            title: '已发送申请',
            icon: 'none'
          });
          if (typeof callback === 'function') callback();
        } else {
          wx.showToast({
            title: '申请失败',
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