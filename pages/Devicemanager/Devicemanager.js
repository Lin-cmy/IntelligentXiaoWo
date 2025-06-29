Page({
  data: {
    homeId: null,
    roomId: null,
    deviceId: null,
    deviceTypeIndex: 0,
    selectedDeviceTypeId: null,
    devices: [],
    deviceTypes: [],
    showMenu: false,
    showAddDevicePopup: false,
    deleteMode: false,
    newDeviceName: '',
  },

  onLoad(options) {
    this.setData({ homeId: Number(options.homeId), roomId: Number(options.roomId)}, () => {
      this.homeview();
      this.getDeviceTypes();
    })
  },

  // 打开设备管理菜单
  onMenuTap() {
    this.setData({ showMenu: !this.data.showMenu })
  },

  // 添加设备弹窗
  onAddDeviceTap() {
    this.setData({ showAddDevicePopup: true })
  },

  // 输入设备名称
  onDeviceNameInput(e) {
    this.setData({ newDeviceName: e.detail.value })
  },

  // 设备类型选择器改变事件
  onDeviceTypeChange(e) {
    const index = e.detail.value;
    this.setData({
      deviceTypeIndex: index,
      selectedDeviceTypeId: this.data.deviceTypes[index].id
    });
  },

  // 确认添加设备
  onAddDeviceConfirm() {
    const { newDeviceName, selectedDeviceTypeId }  = this.data;
    if (!newDeviceName.trim()) {
      wx.showToast({
        title: '请输入设备名称',
        icon: 'none'
      });
      return;
    }
    if ( selectedDeviceTypeId === null ) {
      wx.showToast({
        title: '请选择设备类型',
        icon: 'none'
      });
      return;
    }
    this.createdevice(() => {
      this.homeview(() => {
        this.setData({ newDeviceName: '', selectedDeviceTypeId: '' });
      })
    });
  },

  // 取消添加设备
  onAddDeviceCancel() {
    this.setData({
      newDeviceName: '',
      selectedDeviceTypeId: '',
      showAddDevicePopup: false
    })
  },

  // 进入删除设备模式
  onDeleteDeviceTap() {
    this.setData({ deleteMode: true, showMenu: false });
  },

  // 删除设备
  onDeleteDeviceItem(e) {
    const deviceId = e.currentTarget.dataset.id;
    this.setData({ deviceId: deviceId });
    wx.showModal({
      title: '确认删除',
      content: '确定要删除此设备吗？',
      success: (res) => {
        if (res.confirm) {
          this.deletedevice(() => {
            this.homeview(() => {})
          });
        }
      }
    });
  },

  // 完成删除
  onFinishDelete() {
    this.setData({ deleteMode: false })
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
            const roomId = this.data.roomId;
            const devices = res.data.devices
              .filter(item => item.roomId === roomId)
              .map(item => ({
                id: item.id,
                name: item.name
            }));
            this.setData({ devices: devices });
            if (typeof callback === 'function') callback();
          } else {
            wx.showToast({
              title: res.data.message || 'view失败'
            });
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

  // /home/room/device/type/list
  getDeviceTypes() {
    wx.request({
      url: 'http://localhost:8080/home/room/device/type/list',
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token') },
      success: (res) => {
        if (res.statusCode === 200) {
          // wx.showToast({
          //   title: '成功获取types',
          //   icon: 'none'
          // });
          const deviceTypes = res.data.map(item => ({
            id: item.id,
            name: item.name
          }))
          this.setData({
            deviceTypes: deviceTypes,
            deviceTypeIndex: 0,
            selectedDeviceTypeId: res.data.length > 0 ? res.data[0].id : null
          });
        } else {
          wx.showToast({
            title: res.data.message || '获取失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  // /home/room/device/add
  createdevice(callback) {
    wx.request({
      url: 'http://localhost:8080/home/room/device/add',
      method: 'POST',
      data: {
        "name": this.data.newDeviceName,
        "typeId": this.data.selectedDeviceTypeId,
        "roomId": this.data.roomId,
        "homeId":  this.data.homeId
      },
      success: (res) => {
        if (res.statusCode === 200){
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
        });
        if (typeof callback === 'function') callback();
      }
    })
  },

  // /home/room/device/delete?id={deviceId}
  deletedevice(callback) {
    wx.request({
      url: 'http://localhost:8080/home/room/device/delete?id='  + this.data.deviceId,
      method: 'DELETE',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token')},
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
      }
    })
  }
})