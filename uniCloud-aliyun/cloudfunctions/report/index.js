"use strict";

const db = uniCloud.database();

function toUtcDate(str) {
  const date = new Date(`${str}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) throw new Error("日期格式不正确");
  return date;
}

function resolveClientId(event, context) {
  return (
    event?.clientId ||
    context?.auth?.uid ||
    context?.uniIdToken?.uid ||
    context?.CLIENTID ||
    context?.CLIENT_ID ||
    context?.uid ||
    context?.OPENID ||
    context?.WX_OPENID ||
    context?.CLIENTINFO?.clientId ||
    context?.CLIENT_INFO?.clientId ||
    context?.CLIENTIP ||
    "anonymous"
  );
}

exports.main = async (event, context) => {
  const args = event || {};
  const clientId = resolveClientId(event, context);
  try {
    const { start, end } = args;
    if (!clientId) throw new Error("未获取到客户端标识");
    if (!start || !end) throw new Error("缺少日期范围");

    const startDate = toUtcDate(String(start));
    const endDate = toUtcDate(String(end));
    if (startDate.getTime() > endDate.getTime())
      throw new Error("开始日期不能晚于结束日期");

    // 限制最大查询范围为 31 天，防止一次性读取过多
    const dayDiff = (endDate - startDate) / (1000 * 60 * 60 * 24);
    if (dayDiff > 31) {
      throw new Error("报表生成范围不能超过 31 天");
    }

    const dietCollection = db.collection("diet");
    const sportCollection = db.collection("sport");
    const dbCmd = db.command;

    // 使用范围查询一次性获取数据，减少数据库读取次数 (RU)
    const [dietRes, sportRes] = await Promise.all([
      dietCollection
        .where({
          clientId,
          date: dbCmd.gte(String(start)).and(dbCmd.lte(String(end))),
        })
        .limit(1000)
        .get(),
      sportCollection
        .where({
          clientId,
          date: dbCmd.gte(String(start)).and(dbCmd.lte(String(end))),
        })
        .limit(1000)
        .get(),
    ]);

    const totalDiet = (dietRes.data || []).reduce(
      (sum, item) => sum + Number(item.calories || 0),
      0
    );
    const totalSport = (sportRes.data || []).reduce(
      (sum, item) => sum + Number(item.calories || 0),
      0
    );

    const now = Date.now();
    const reportDoc = {
      start: String(start),
      end: String(end),
      totalDiet,
      totalSport,
      clientId,
      createdAt: now,
    };
    const res = await db.collection("report").add(reportDoc);

    return { success: true, data: { reportId: res.id, totalDiet, totalSport } };
  } catch (err) {
    console.error("report error", err);
    return { success: false, errorMessage: err.message || "云函数执行异常" };
  }
};
