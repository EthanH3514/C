// index.js
// 获取应用实例
var app = getApp()

Page({
  data: {
  },
  chooseLevel:function(event){
    wx.navigateTo({
      url: '/pages/mine/mine',
    })
    var level=event.currentTarget.dataset.level
    console.log(level)
    wx.setStorageSync('level', level)
  }
})
