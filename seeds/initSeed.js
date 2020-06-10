
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('settings').truncate()
    .then(function () {
      // Inserts seed entries
      return knex('settings').insert([
        {id: 1, label: 'welcome', value: `回复关键字/序号 获取对应服务
***陌生人发送ding加我为好友***
1.需要加入的群名如：带头大哥的群
2.场景模式
3.毒鸡汤
4.神回复(略微开车)
5.英语一句话
转小写(例：转小写PEANUT)
转大写(例：转大写peanut)
转rgb(例：转rgb#cccccc)
转16进制(例：转16进制rgb(255,255,255))
全国肺炎(实时肺炎数据)
省份/自治区 肺炎(例：河南肺炎)`, type: 'uni'},
        {id: 2, label: 'autoFriend', value: 'ding', type: 'uni'},
        {id: 3, label: 'hello', value: '你好，我是9527的哥哥1928！', type: 'uni'},
        {label: 'ignore', value: 'filehelper', type: 'multi'},
        {label: 'room', value: '带头大哥的群', type: 'multi'},
        {label: 'admin', value: '带头大哥', type: 'multi'}
      ]);
    });
};
