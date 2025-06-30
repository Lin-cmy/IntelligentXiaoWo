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

  // 开始录音
  startRecording() {
    if (this.data.aiResponseInProgress) return;
    
    this.setData({ isRecording: true });

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

    this.setData({ isRecording: false });
    this.recorderManager.stop();
  },

  // 取消录音
  cancelRecording() {
    this.setData({ isRecording: false });
    this.recorderManager.stop();
  },

  // 处理语音输入
  processVoiceInput(filePath) {
      // 实际项目中应上传语音文件到服务器进行识别
      // 这里暂时使用模拟数据
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
        this.getAIResponse(randomResult);
      }, 1000);
  
      // 实际项目中，这里应该调用语音识别API
      // this.callVoiceRecognitionAPI(filePath);
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

    // 定义流式相应处理的变量
    let responseText = '';
    let lastResponseText = '';

    const requestTask = wx.request({
      url: 'http://localhost:8080/home/' + this.data.homeId + '/ai/chat',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      data: requestData,
      responseType: 'text',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          // 提取所有非空的data:后面的内容
          let aiResponse = '';
          const dataRegex = /data:([^\n]*?)(?=\nid:|$)/g;
          const matches = res.data.match(dataRegex);
          
          if (matches && matches.length > 0) {
            // 过滤掉空的data:行，只保留有内容的部分
            const validMatches = matches.filter(match => {
              const content = match.replace(/^data:/, '').trim();
              return content.length > 0; // 只保留非空内容
            });
            
            // 提取所有data:后面的内容并拼接
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

    // 标记相应完成
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

  onUnload() {
    // 清理资源
    if (this.recorderManager) {
      this.recorderManager.stop();
    }
    if (this.innerAudioContext) {
      this.innerAudioContext.destory();
    }
  }
});