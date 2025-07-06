const plugin = requirePlugin('WechatSI');
const manager = plugin.getRecordRecognitionManager();

Page({
  data: {
    messages: [],
    inputText: '',
    inputMode: 'voice', // 'text' 或 'voice'
    isRecording: false,
    scrollTop: 0,
    scrollIntoView: '',
    messageId: 0,
    aiResponseInProgress: false,
    aiStreamResponse: '',
    aiMessageId: null,
    homeId: ''
  },

  onLoad() {
    this.setData({ homeId: wx.getStorageSync('HOMEID')});
    this.initSI();
  },

  // 初始化语音识别
  initSI() {
    const that = this;
    manager.onStart = function() {
      console.log('录音识别开始');
      that.setData({ isRecording: true });
    };
    manager.onRecognize = function(res) {
      // 实时识别内容，如果想实时显示可加如下代码
      // that.setData({ inputText: res.result });
    };
    manager.onStop = function(res) {
      console.log('识别结束', res);
      that.setData({ isRecording: false });
      if (!res.result) {
        wx.showToast({ title: '没有听清，请再说一次', icon: 'none' });
        return;
      }
      // 直接将识别内容作为用户消息发出
      that.addMessage('user', res.result);
      that.getAIResponse(res.result);
    };
    manager.onError = function(res) {
      that.setData({ isRecording: false });
      wx.showToast({ title: '识别失败，请重试', icon: 'none' });
    };
  },

  // 按下开始录音
  startRecording() {
    if (this.data.aiResponseInProgress) return;
    this.setData({ isRecording: true });
    manager.start({
      duration: 30000,
      lang: 'zh_CN',
    });
  },

  // 松开停止录音
  stopRecording() {
    if (!this.data.isRecording) return;
    manager.stop();
  },

  // 取消录音
  cancelRecording() {
    if (!this.data.isRecording) return;
    manager.stop();
  },

  // 切换到文本输入
  switchToText() {
    this.setData({ inputMode: 'text' });
  },

  // 切换到语音输入
  switchToVoice() {
    this.setData({ inputMode: 'voice' });
  },

  // 文本输入变化
  onInputChange(e) {
    this.setData({ inputText: e.detail.value });
  },

  // 发送文本消息
  sendTextMessage() {
    const text = this.data.inputText.trim();
    if (!text || this.data.aiResponseInProgress) return;

    this.addMessage('user', text);
    this.setData({ inputText: '' });
    this.getAIResponse(text);
  },

  // 发送示例消息
  sendExample(e) {
    if (this.data.aiResponseInProgress) return;

    const text = e.currentTarget.dataset.text;
    this.addMessage('user', text);
    this.getAIResponse(text);
  },

  // 调用 LLM 接口获取 AI 响应
  getAIResponse(userInput) {
    this.setData({
      aiResponseInProgress: true,
      aiStreamResponse: ''
    });

    // 创建 AI 消息
    const messageId = ++this.data.messageId;
    const aiMessage = {
      id: messageId,
      type: 'ai',
      content: '思考中...',
      time: this.formatTime(new Date())
    };

    const messages = [...this.data.messages, aiMessage];
    this.setData({
      messages: messages,
      scrollIntoView: `msg${messageId}`,
      aiMessageId: messageId
    });

    const requestData = { input: userInput };
    const token = wx.getStorageSync('token');

    const requestTask = wx.request({
      url: 'http://192.168.43.218:8080/home/' + this.data.homeId + '/ai/chat',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      data: requestData,
      responseType: 'text',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          let aiResponse = '';
          const dataRegex = /data:([^\n]*?)(?=\nid:|$)/g;
          const matches = res.data.match(dataRegex);

          if (matches && matches.length > 0) {
            const validMatches = matches.filter(match => {
              const content = match.replace(/^data:/, '').trim();
              return content.length > 0;
            });
            aiResponse = validMatches
              .map(match => match.replace(/^data:/, '').trim())
              .join('');
          }

          if (aiResponse) {
            console.log("解析后的AI回复:", aiResponse);
            this.updateAIMessage(aiResponse);
            this.setData({ aiResponseInProgress: false });
          } else {
            this.updateAIMessage('抱歉，未收到有效回复');
            this.setData({ aiResponseInProgress: false });
          }
        }
      },
      fail: (err) => {
        console.error('请求失败', err);
        this.updateAIMessage('网络错误，请稍后再试');
        this.setData({ aiResponseInProgress: false });
      },
      complete: () => {
        // 请求完成后的处理
      }
    });
  },

  // 更新 AI 消息内容
  updateAIMessage(content) {
    const { messages, aiMessageId } = this.data;
    const updateMessages = messages.map(msg => {
      if (msg.id === aiMessageId) {
        return { ...msg, content: content };
      }
      return msg;
    });

    this.setData({
      messages: updateMessages,
      scrollIntoView: `msg${aiMessageId}`
    });

    if (content.length > 10 && !content.endsWith('...')) {
      this.setData({ aiResponseInProgress: false });
    }
  },

  //  添加消息
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

  // 格式化时间
  formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}${minutes}`;
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // onUnload() {
  //   // 无需清理recorderManager和innerAudioContext
  // }
});