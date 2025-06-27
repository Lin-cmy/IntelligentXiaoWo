Page({
  data: {
    messages: [],
    inputText: '',
    inputMode: 'voice', // 'text' 或 'voice'
    isRecording: false,
    scrollTop: 0,
    scrollIntoView: '',
    messageId: 0
  },

  onLoad() {
    // 初始化语音识别
    this.initVoiceRecognition();
  },

  // 初始化语音识别
  initVoiceRecognition() {
    const manager = wx.getRecorderManager();
    const innerAudioContext = wx.createInnerAudioContext();

    this.recorderManager = manager;
    this.innerAudioContext = innerAudioContext;

    // 录音开始事件
    manager.onStart(() => {
      console.log('录音开始');
    });

    // 录音结束事件
    manager.onStop((res) => {
      console.log('录音结束', res);
      this.processVoiceInput(res.tempFilePath);
    });

    // 录音错误事件
    manager.onError((err) => {
      console.log('录音错误', err);
      wx.showToast({
        title: '录音失败',
        icon: 'none'
      });
    });
  },

  // 切换到文本输入
  switchToText() {
    this.setData({
      inputMode: 'text'
    });
  },

  // 切换到语音输入
  switchToVoice() {
    this.setData({
      inputMode: 'voice'
    });
  },

  // 文本输入变化
  onInputChange(e) {
    this.setData({
      inputText: e.detail.value
    });
  },

  // 发送文本消息
  sendTextMessage() {
    const text = this.data.inputText.trim();
    if (!text) return;

    this.addMessage('user', text);
    this.setData({
      inputText: ''
    });

    // 模拟AI回复
    this.simulateAIResponse(text);
  },

  // 发送示例消息
  sendExample(e) {
    const text = e.currentTarget.dataset.text;
    this.addMessage('user', text);
    this.simulateAIResponse(text);
  },

  // 开始录音
  startRecording() {
    this.setData({
      isRecording: true
    });

    const options = {
      duration: 60000, // 最长录音时间
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 96000,
      format: 'mp3'
    };

    this.recorderManager.start(options);
  },

  // 停止录音
  stopRecording() {
    if (!this.data.isRecording) return;

    this.setData({
      isRecording: false
    });

    this.recorderManager.stop();
  },

  // 取消录音
  cancelRecording() {
    this.setData({
      isRecording: false
    });
    this.recorderManager.stop();
  },

  // 处理语音输入
  processVoiceInput(filePath) {
    // 模拟语音识别结果
    const mockRecognitionResults = [
      '打开卧室空调',
      '调节温度到25度',
      '关闭客厅的灯',
      '今天天气怎么样',
      '帮我设置起床闹钟'
    ];

    const randomResult = mockRecognitionResults[Math.floor(Math.random() * mockRecognitionResults.length)];
    
    wx.showToast({
      title: '语音识别中...',
      icon: 'loading',
      duration: 1000
    });

    setTimeout(() => {
      this.addMessage('user', randomResult);
      this.simulateAIResponse(randomResult);
    }, 1000);

    // 实际项目中，这里应该调用语音识别API
    // this.callVoiceRecognitionAPI(filePath);
  },

  // 调用语音识别API（实际项目使用）
  callVoiceRecognitionAPI(filePath) {
    wx.uploadFile({
      url: 'YOUR_API_BASE_URL/voice/recognition',
      filePath: filePath,
      name: 'voice',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res) => {
        const data = JSON.parse(res.data);
        if (data.code === 200) {
          const recognizedText = data.data.text;
          this.addMessage('user', recognizedText);
          this.simulateAIResponse(recognizedText);
        } else {
          wx.showToast({
            title: '语音识别失败',
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

  // 添加消息
  addMessage(type, content) {
    const messageId = ++this.data.messageId;
    const message = {
      id: messageId,
      type: type,
      content: content,
      time: this.formatTime(new Date())
    };

    const messages = [...this.data.messages, message];
    this.setData({
      messages: messages,
      scrollIntoView: `msg${messageId}`
    });
  },

  // 模拟AI响应
  simulateAIResponse(userMessage) {
    wx.showToast({
      title: 'AI思考中...',
      icon: 'loading',
      duration: 1000
    });

    setTimeout(() => {
      let aiResponse = this.generateAIResponse(userMessage);
      this.addMessage('ai', aiResponse);
    }, 1500);
  },

  // 生成AI响应
  generateAIResponse(userMessage) {
    const responses = {
      '打开卧室空调': '好的，已为您打开卧室空调，当前温度26度',
      '打开窗帘': '窗帘已打开，今天阳光明媚呢！',
      '空调调到25度': '已将空调温度调节至25度，请稍等片刻',
      '😸有点热': '为您打开空调降温，还可以打开风扇哦',
      '今天😸可以做什么菜': '推荐您做番茄鸡蛋面，简单营养又美味！'
    };

    // 检查是否有精确匹配
    for (let key in responses) {
      if (userMessage.includes(key.replace(/😸/g, ''))) {
        return responses[key];
      }
    }

    // 默认响应
    const defaultResponses = [
      '我已经收到您的指令，正在为您处理...',
      '好的，我来帮您解决这个问题',
      '您的智能家居设备正在响应中',
      '收到！让我为您安排一下',
      '明白了，马上为您操作'
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  },

  // 格式化时间
  formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  onUnload() {
    // 清理资源
    if (this.recorderManager) {
      this.recorderManager.stop();
    }
    if (this.innerAudioContext) {
      this.innerAudioContext.destroy();
    }
  }
}); 