// pages/subscribe/subscribe.js
let app = getApp();
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    access_by_code: {},
    current_school_code: "1",
    style_front: "transform: rotateY(0deg)",
    style_back: "transform: rotateY(180deg)"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log("page subscribe onLoad")
    console.log("app.globalData.get_subscribed_info")
    console.log(app.globalData.get_subscribed_info)
    this.setData({
      access_by_code: app.globalData.access_by_code
    })
    if (app.globalData.get_subscribed_info) {
      return
    }
    if (app.globalData.acc == "" || app.globalData.open_id == "") {
      console.log("没有有效的access_token或open_id")
      wx.redirectTo({
        url: '/pages/login/login',
        success: function () {
          wx.showToast({
            title: '您需要先进行登录',
            icon: "error"
          })
        }
      })
      return
    }
    let that = this
    var func = async function() {
      let e = await app.request_post({
        url: 'https://rinka-kujou.uk/get_user_subscribe',
        method: "POST",
        data: {
          access_token: app.globalData.acc,
          open_id: app.globalData.open_id
        }
      })
      console.log("get_user_subscribe")
      console.log("参数(access_token, open_id)：")
      console.log(app.globalData.acc)
      console.log(app.globalData.open_id)
      console.log("结果：")
      console.log(e)
      if (e.data.err_code == 0) {
        for (let subscribe_school_code in e.data.info) {
          that.data.access_by_code[subscribe_school_code].subscribed_num = e.data.info[subscribe_school_code].length
          for (let n = 0; n < e.data.info[subscribe_school_code].length; ++n) {
            that.data.access_by_code[subscribe_school_code].department[e.data.info[subscribe_school_code][n]].subscribe_status = true
          }
        }
        that.setData({
          access_by_code: that.data.access_by_code
        })
        app.globalData.access_by_code = that.data.access_by_code
        app.globalData.get_subscribed_info = true
      } else if (e.data.err_code == 104) {
        wx.removeStorageSync('acc')
        wx.removeStorageSync('open_id')
        wx.removeStorageSync('avatarUrl')
        wx.removeStorageSync('nickname')
        app.globalData.acc = ""
        app.globalData.open_id = ""
        app.globalData.login_status = false
        app.globalData.avatarUrl = defaultAvatarUrl
        app.globalData.nickname = ""

        wx.redirectTo({
          url: '/pages/login/login',
          success: function () {
            wx.showToast({
              title: '您需要先进行登录',
              icon: "error"
            })
          }
        });
      }
    }
    func()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  show_front: function () {
    this.setData({
      style_front: "transform: rotateY(180deg)",
      style_back: "transform: rotateY(0deg)"
    })
  },

  show_back: function () {
    this.setData({
      style_front: "transform: rotateY(0deg)",
      style_back: "transform: rotateY(180deg)"
    })
  },

  change_current_school_code: function(e) {
    console.log("change_school_list_index")
    console.log(e)
    this.setData({
      current_school_code: e.detail.currentItemId
    })
  },

  ok: function(args) {
    let that = this
    console.log("点击订阅按钮")
    console.log("结果：")
    console.log(args)
    let school_code = parseInt(this.data.current_school_code)
    let department_code = parseInt(args.currentTarget.dataset.department_code)
    // tmplIds: ['GtfweX744wEk1OFMOLivAM15GRYkL6x1Dsgkwcjjd6M']
    wx.requestSubscribeMessage({
      tmplIds: ['TMFuXpbbjg21tEN1c4D_kHGtsNuRccqo7ft3aBC2J6s'],
      success: function(res) {
        console.log("requestSubscribeMessage")
        console.log("结果")
        console.log(res);
        if (!(res.TMFuXpbbjg21tEN1c4D_kHGtsNuRccqo7ft3aBC2J6s == "accept")) {
          wx.showToast({
            title: "请授权通知权限",
            icon: "error"
          })
          return
        } else {
          wx.request({
            url: 'https://rinka-kujou.uk/subscribe',
            method: "POST",
            data: {
              info: [{
                school_code: school_code,
                department_code: department_code,
                oper: 0
              }],
              open_id: wx.getStorageSync('open_id'),
              access_token: wx.getStorageSync('acc')
            },
            success: function(e) {
              console.log("subscribe")
              console.log("参数(school_code, department_code, oper)：")
              console.log(school_code.toString())
              console.log(department_code.toString())
              console.log("订阅")
              console.log("结果")
              console.log(e);
              if (e.data.err_code == 0) {
                that.data.access_by_code[school_code.toString()].subscribed_num += 1 
                that.data.access_by_code[school_code.toString()].department[department_code.toString()].subscribe_status = true
                that.setData({
                  access_by_code: that.data.access_by_code
                });
                app.globalData.access_by_code = that.data.access_by_code
                wx.showToast({
                  title: "订阅成功",
                  icon: "success"
                });
              }
            }
          })
        }
      }
    });
  },

  cancel: function(args) {
    let that = this
    console.log("点击取消订阅按钮")
    console.log("结果：")
    console.log(args)
    let school_code = parseInt(this.data.current_school_code)
    let department_code = parseInt(args.currentTarget.dataset.department_code)
    wx.request({
      url: 'https://rinka-kujou.uk/subscribe',
      method: "POST",
      data: {
        info: [{
          school_code: school_code,
          department_code: department_code,
          oper: 1
        }],
        open_id: wx.getStorageSync('open_id'),
        access_token: wx.getStorageSync('acc')
      },
      success: function(e) {
        console.log("subscribe")
        console.log("参数(school_code, department_code, oper)：")
        console.log(school_code.toString())
        console.log(department_code.toString())
        console.log("取消订阅")
        console.log("结果")
        console.log(e);
        if (e.data.err_code == 0) {
          that.data.access_by_code[school_code.toString()].subscribed_num -= 1
          that.data.access_by_code[school_code.toString()].department[department_code.toString()].subscribe_status = false
          that.setData({
            access_by_code: that.data.access_by_code
          })
          app.globalData.access_by_code = that.data.access_by_code
          wx.showToast({
            title: "退订成功",
            icon: "success"
          });
        } 
      }
    });
  }
})