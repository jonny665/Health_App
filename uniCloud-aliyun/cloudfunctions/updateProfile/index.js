"use strict";

const db = uniCloud.database();

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
    if (!clientId) throw new Error("未获取到客户端标识");
    const { nickname, info } = args;
    if (!nickname && typeof info === "undefined") {
      throw new Error("请填写要更新的信息");
    }

    const formCollection = db.collection("form");
    const groupCollection = db.collection("group");
    const res = await formCollection.where({ clientId }).limit(1).get();
    const doc = res.data && res.data[0];
    if (!doc) {
      throw new Error("请先加入或创建小组后再修改资料");
    }

    const update = {};
    if (nickname) update.nickname = String(nickname);
    if (typeof info !== "undefined") update.info = String(info);
    if (!Object.keys(update).length) {
      throw new Error("没有可更新内容");
    }

    await formCollection.doc(doc._id).update(update);

    if (doc.isLeader && update.nickname) {
      const groupRes = await groupCollection
        .where({ groupId: doc.groupId })
        .limit(1)
        .get();
      const groupDoc = groupRes.data && groupRes.data[0];
      if (groupDoc) {
        await groupCollection
          .doc(groupDoc._id)
          .update({ leader: update.nickname });
      }
    }

    return {
      success: true,
      data: {
        nickname: update.nickname || doc.nickname,
        info: typeof update.info !== "undefined" ? update.info : doc.info,
      },
    };
  } catch (err) {
    console.error("updateProfile error", err);
    return { success: false, errorMessage: err.message || "云函数执行异常" };
  }
};
