Page({
  data: {
    newRoomName: '',
    homeId: null,
    roomId: null,
    rooms: [],
    showMenu: false,
    showAddRoomPopup: false,
    deleteMode: false
  },

  onLoad(options) {
    this.setData({ homeId: Number(options.homeId) }, () => {
      this.homeview();
    })
  },

  onShow() {
    this.setData({ showMenu: false });
  },

  // 跳转到设备管理界面
  onRoomTap(e) {
    const roomId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/Devicemanager/Devicemanager?roomId=${roomId}&homeId=${this.data.homeId}`,
    })
  },

  // 打开右上角菜单
  onMenuTap() {
    this.setData({ showMenu: !this.data.showMenu })
  },

  // 添加房间
  onAddRoomTap() {
    this.setData({ 
      showAddRoomPopup: !this.data.showAddRoomPopup,
      newRoomName: ''
    })
  },

  // 输入框内容变化
  onRoomNameInput(e) {
    this.setData({
      newRoomName: e.detail.value
    });
  },

  // 取消按钮
  onAddRoomCancel() {
    this.setData({
      showAddRoomPopup: false,
      newRoomName: ''
    });
  },

  // 确定添加房间
  onAddRoomConfirm() {
    const { newRoomName, rooms } = this.data;
    if (!newRoomName.trim()) {
      wx.showToast({ title: '请输入房间名称', icon: 'none' });
      return;
    }
    this.roomcreate(() => {
      this.homeview(() => {
        this.setData({ showMenu: false, showAddRoomPopup: false, newRoomName: '' })
      })
    });
  },

  // 点击删除房间菜单
  onDeleteRoomTap() {
    this.setData({
      deleteMode: true,
      showMenu: false
    });
  },

  // 点击完成按钮
  onFinishDelete() {
    this.setData({
      deleteMode: false
    });
  },

  // 删除单个房间
  onDeleteRoom(e) {
    const roomId = e.currentTarget.dataset.id;
    const roomName = e.currentTarget.dataset.name;
    this.setData({ roomId: roomId });
    wx.showModal({
      title: '确认删除',
      content: `确定要删除"${roomName}"房间吗？`,
      success: (res) => {
        if (res.confirm) {
          // 调用删除房间的API
          this.roomdelete(() => {
            this.homeview(() => {
              this.setData({ roomId: null });
            })
          });
        }
      }
    });
  },
  
    // 删除房间API调用
    deleteRoom(roomId) {
      // 这里写调用后端API删除房间的代码
      // 删除成功后刷新房间列表
    },

  // /home/view
  homeview(callback) {
      wx.request({
        url: 'http://192.168.43.218:8080/home/view/' + this.data.homeId,
        header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token')},
        success: (res) => {
          if (res.statusCode === 200) {
            // wx.showToast({
            //   title: 'view成功',
            //   icon: 'none'
            // });
            const rooms = res.data.rooms.map(item => ({
              id: item.id,
              name: item.name
            }))
            this.setData({ rooms: rooms });
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
          })
          if (typeof callback === 'function') callback();
        }
      });
  },

  // /home/{homeId}/room/create
  roomcreate(callback) {
    wx.request({
      url: 'http://192.168.43.218:8080/home/' + this.data.homeId + '/room/create',
      method: 'POST',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token')},
      data: {
        "name": this.data.newRoomName,
        "homeId": this.data.homeId
      },
      success: (res) => {
        if (res.statusCode === 201) {
          wx.showToast({
            title: '创建成功',
            icon: 'none'
          });
          if (typeof callback === 'function') callback();
        } else {
          wx.showToast({
            title: res.data.message || '创建失败',
            icon: 'none'
          });
          if (typeof callback === 'function') callback();
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
        if (typeof callback === 'function') callback();
      }
    })
  },

  // /home/{homeId}/room/delete
  roomdelete(callback) {
    wx.request({
      url: 'http://192.168.43.218:8080/home/' + this.data.homeId + '/room/delete',
      method: 'DELETE',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token')},
      data: {
        "id": this.data.roomId,
        "homeId": this.data.homeId
      },
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({
            title: '删除成功',
            icon: 'none'
          });
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