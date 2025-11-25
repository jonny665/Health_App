"use strict";

const db = uniCloud.database();
const dbCmd = db.command;

exports.main = async (event = {}) => {
  const { openid, height, weight, calorieTarget } = event;

  if (!openid) {
    return { code: 400, message: "缺少用户标识" };
  }

  const updateData = {
    updatedAt: new Date().toLocaleString("zh-CN", {
      hour12: false,
      timeZone: "Asia/Shanghai",
    }),
  };

  if (height !== undefined && height !== null && height !== "")
    updateData.height = Number(height);
  if (weight !== undefined && weight !== null && weight !== "")
    updateData.weight = Number(weight);
  if (
    calorieTarget !== undefined &&
    calorieTarget !== null &&
    calorieTarget !== ""
  )
    updateData.calorieTarget = Number(calorieTarget);

  if (Object.keys(updateData).length <= 1) {
    return { code: 0, message: "无数据更新" };
  }

  try {
    const res = await db
      .collection("user_profiles")
      .where({ openid })
      .update(updateData);

    if (res.updated === 0) {
      // 如果没有更新到，可能是没有该用户，或者数据没变
      // 检查用户是否存在
      const check = await db
        .collection("user_profiles")
        .where({ openid })
        .count();
      if (check.total === 0) {
        return { code: 404, message: "用户不存在" };
      }
    }

    return {
      code: 0,
      message: "更新成功",
      data: updateData,
    };
  } catch (err) {
    return {
      code: 500,
      message: err.message || "更新失败",
    };
  }
};
