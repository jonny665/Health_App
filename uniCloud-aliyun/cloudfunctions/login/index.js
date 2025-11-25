"use strict";

const createConfig = require("uni-config-center");
const shareConfig = createConfig({ pluginId: "mp-config" });
const mpConfig = shareConfig.config()["mp-weixin"];

const db = uniCloud.database();

const normalizeSportRecord = (record, timestamp) => {
  if (
    !record ||
    typeof record !== "object" ||
    !record.sportType ||
    typeof record.distance !== "number" ||
    typeof record.duration !== "number"
  ) {
    return null;
  }
  return {
    sportType: record.sportType,
    distance: record.distance,
    duration: record.duration,
    recordedAt: record.recordedAt || timestamp,
  };
};

const formatCNTime = (date) =>
  date.toLocaleString("zh-CN", { hour12: false, timeZone: "Asia/Shanghai" });

exports.main = async (event = {}) => {
  const { code, profile = {}, appId } = event;
  const loginDate = new Date();
  const nowISO = formatCNTime(loginDate); // 改用本地可读格式
  const sportRecord = normalizeSportRecord(profile.sportRecord, nowISO);

  if (!code) return { code: 400, message: "缺少登录凭证" };

  // 获取对应 AppID 的 Secret
  const secret = mpConfig[appId];
  if (!appId || !secret) {
    return { code: 500, message: `未配置小程序 AppID: ${appId} 或 Secret` };
  }

  const authUrl =
    `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}` +
    `&secret=${secret}&js_code=${code}&grant_type=authorization_code`;

  const authRes = await uniCloud.httpclient.request(authUrl, {
    method: "GET",
    dataType: "json",
    timeout: 5000,
  });

  if (authRes.status !== 200 || authRes.data.errcode) {
    return {
      code: authRes.data.errcode || 500,
      message: authRes.data.errmsg || "openid 获取失败",
    };
  }

  const openid = authRes.data.openid;
  const userCollection = db.collection("user_profiles");
  const userRes = await userCollection.where({ openid }).limit(1).get();

  const sanitizedProfile = {
    nickname: profile.nickName || "",
    avatar: profile.avatarUrl || "",
    height: typeof profile.height === "number" ? profile.height : null,
    weight: typeof profile.weight === "number" ? profile.weight : null,
    calorieTarget:
      typeof profile.calorieTarget === "number" ? profile.calorieTarget : null,
  };

  let userDoc;

  if (!userRes.data.length) {
    userDoc = {
      openid,
      nickname: sanitizedProfile.nickname,
      avatar: sanitizedProfile.avatar,
      height: sanitizedProfile.height,
      weight: sanitizedProfile.weight,
      calorieTarget: sanitizedProfile.calorieTarget,
      createdAt: nowISO,
      updatedAt: nowISO,
    };
    const addRes = await userCollection.add(userDoc);
    userDoc._id = addRes.id || addRes.insertedId;
  } else {
    userDoc = userRes.data[0];
    const updatePayload = { updatedAt: nowISO };
    let needUpdate = false;

    if (!userDoc.nickname && sanitizedProfile.nickname) {
      updatePayload.nickname = sanitizedProfile.nickname;
      needUpdate = true;
    }
    if (!userDoc.avatar && sanitizedProfile.avatar) {
      updatePayload.avatar = sanitizedProfile.avatar;
      needUpdate = true;
    }
    if (
      sanitizedProfile.height !== null &&
      sanitizedProfile.height !== userDoc.height
    ) {
      updatePayload.height = sanitizedProfile.height;
      needUpdate = true;
    }
    if (
      sanitizedProfile.weight !== null &&
      sanitizedProfile.weight !== userDoc.weight
    ) {
      updatePayload.weight = sanitizedProfile.weight;
      needUpdate = true;
    }
    if (
      sanitizedProfile.calorieTarget !== null &&
      sanitizedProfile.calorieTarget !== userDoc.calorieTarget
    ) {
      updatePayload.calorieTarget = sanitizedProfile.calorieTarget;
      needUpdate = true;
    }

    if (needUpdate) {
      await userCollection.doc(userDoc._id).update(updatePayload);
      userDoc = { ...userDoc, ...updatePayload };
    }
  }

  if (sportRecord) {
    const sportCollection = db.collection("sport_records");
    await sportCollection.add({ userOpenId: openid, ...sportRecord });
  }
  if (profile.post) {
    const postsCollection = db.collection("posts");
    await postsCollection.add({
      userOpenId: openid,
      content: profile.post,
      media: profile.media || [],
      likeCount: 0,
      createdAt: nowISO,
      updatedAt: nowISO,
    });
  }
  if (profile.comment && profile.postId) {
    const commentCollection = db.collection("post_comments");
    await commentCollection.add({
      postId: profile.postId,
      userOpenId: openid,
      content: profile.comment,
      createdAt: nowISO,
    });
  }

  return {
    code: 0,
    message: "登录成功",
    data: { openid, user: userDoc },
  };
};
