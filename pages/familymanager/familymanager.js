Page({
  data: {
    myfamilies: [
      { id: 1, name: '陈俊烨的家', identity: '房主', address: '' },
      { id: 2, name: '李欣悦的家', identity: '访客', address: '' }
    ],
    showCreatePopup: false,
    newFamilyName: '',
    newFamilyAddress: ''
  },
  onFamilyTap() {
    wx.navigateTo({
      url: '/pages/currentfamily/currentfamily'
    })
  },
  onCreateTap() {
    this.setData({ showCreatePopup: true });
  },
  onPopupClose() {
    this.setData({ showCreatePopup: false, newFamilyName: '' });
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
  },
  onJoinTap() {
    wx.navigateTo ({
      url: '/pages/joinfamily/joinfamily'
    })
  }
})