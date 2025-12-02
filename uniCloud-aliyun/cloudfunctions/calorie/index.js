'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
  const { openid } = event;
  
  if (!openid) {
    return { code: 400, message: '缺少 openid' };
  }

  // 1. 获取当前北京时间 (UTC+8)
  // 云函数环境通常是 UTC，直接 new Date() 可能会导致日期偏差
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const bjTime = new Date(utc + (3600000 * 8));
  
  // 2. 格式化为 YYYY-MM-DD 字符串
  const year = bjTime.getFullYear();
  const month = (bjTime.getMonth() + 1).toString().padStart(2, '0');
  const day = bjTime.getDate().toString().padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`; // 例如 "2025-12-02"

  try {
    // 3. 使用正则匹配查询当天数据
    // 只要 consumedAt 字段以 "2025-12-02" 开头，就算作今天的数据
    const res = await db.collection('daily_calorie_logs')
      .where({
        userOpenId: openid,
        consumedAt: new RegExp(`^${todayStr}`) 
      })
      .get();

    // 4. 计算总和
    let totalCalories = 0;
    if (res.data && res.data.length > 0) {
      totalCalories = res.data.reduce((sum, item) => {
        return sum + (Number(item.calories) || 0);
      }, 0);
    }

    return {
      code: 0,
      message: 'success',
      data: {
        totalCalories: Math.round(totalCalories) // 取整
      }
    };

  } catch (e) {
    console.error(e);
    return {
      code: 500,
      message: '查询失败',
      error: e
    };
  }
};