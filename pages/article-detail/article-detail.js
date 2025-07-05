// pages/article-detail/article-detail.js
const app = getApp();

const { getArticleById } = require('../../utils/articles.js');

Page({
  data: {
    article: null
  },

  onLoad: function (options) {
    const articleId = Number(options.id);
    const article = getArticleById(articleId);

    if (article) {
        this.setData({
            article: article,
        });
        wx.setNavigationBarTitle({
            title: article.nad
        });
    } else {
        this.setData({
            article: null
        });
        wx.setNavigationBarTitle({
            title: '文章未找到'
        });
    }
  }
});