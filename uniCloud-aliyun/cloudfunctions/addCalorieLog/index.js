'use strict';

const db = uniCloud.database();

exports.main = async (event) => {
  const { openid, foodId, foodName = '', unitCalories, weight } = event;
  if (!openid || !foodId) return { code: 400, message: '缺少 openid 或 foodId' };

  const qty = Number(weight);
  const unit = Number(unitCalories);
  if (!qty || qty <= 0 || !unit) return { code: 400, message: '重量或卡路里不合法' };

  const calories = Number(((qty / 100) * unit).toFixed(2));

  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const bj = new Date(utc + 8 * 3600000);
  const pad = (n) => String(n).padStart(2, '0');
  const consumedAt = `${bj.getFullYear()}-${pad(bj.getMonth() + 1)}-${pad(bj.getDate())} ${pad(
    bj.getHours()
  )}:${pad(bj.getMinutes())}:${pad(bj.getSeconds())}`;
  const todayStr = `${bj.getFullYear()}-${pad(bj.getMonth() + 1)}-${pad(bj.getDate())}`;

  await db.collection('daily_calorie_logs').add({
    userOpenId: openid,
    foodId,
    foodName,
    quantity: qty,
    calories,
    consumedAt
  });

  const todayRes = await db
    .collection('daily_calorie_logs')
    .where({ userOpenId: openid, consumedAt: new RegExp(`^${todayStr}`) })
    .get();

  const todayTotal = todayRes.data.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);

  return {
    code: 0,
    message: 'success',
    data: {
      calories,
      todayTotal: Number(todayTotal.toFixed(2))
    }
  };
};