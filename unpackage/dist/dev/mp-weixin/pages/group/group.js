"use strict";
const common_vendor = require("../../common/vendor.js");
const services_api = require("../../services/api.js");
const _sfc_main = {
  __name: "group",
  setup(__props) {
    const groupId = common_vendor.ref("");
    const members = common_vendor.ref([]);
    const groups = common_vendor.ref([]);
    const form = common_vendor.reactive({ nickname: "", info: "" });
    const joinId = common_vendor.ref("");
    const joinNickname = common_vendor.ref("");
    const myProfile = common_vendor.reactive({ nickname: "", info: "" });
    const profileSaving = common_vendor.ref(false);
    const applyProfile = (profile = {}) => {
      const nickname = profile.nickname || "";
      const info = profile.info || "";
      myProfile.nickname = nickname;
      myProfile.info = info;
      if (!form.nickname)
        form.nickname = nickname;
      if (!form.info)
        form.info = info;
      if (!joinNickname.value)
        joinNickname.value = nickname;
    };
    const loadMembers = async () => {
      if (!groupId.value)
        return;
      try {
        const res = await services_api.groupService.groupMembers(groupId.value);
        members.value = res.userList || [];
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/group/group.vue:77", e);
      }
    };
    const loadMyGroup = async () => {
      try {
        const res = await services_api.groupService.getMyGroup();
        groupId.value = res.groupId || "";
        applyProfile(res.profile || {});
        if (groupId.value) {
          await loadMembers();
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/group/group.vue:90", e);
      }
    };
    const create = async () => {
      if (!form.nickname || !form.info) {
        common_vendor.index.showToast({ title: "请填写完整", icon: "none" });
        return;
      }
      try {
        const res = await services_api.groupService.createGroup({
          nickname: form.nickname,
          info: form.info
        });
        groupId.value = res.groupId;
        applyProfile({ nickname: form.nickname, info: form.info });
        await loadMembers();
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/group/group.vue:108", e);
      }
    };
    const join = async () => {
      if (!joinId.value || !joinNickname.value) {
        common_vendor.index.showToast({ title: "缺少信息", icon: "none" });
        return;
      }
      try {
        const res = await services_api.groupService.joinGroup({
          groupId: Number(joinId.value),
          nickname: joinNickname.value,
          info: "",
          gender: "",
          code: "",
          age: 0,
          region: []
        });
        groupId.value = res.groupId;
        applyProfile({ nickname: joinNickname.value, info: "" });
        await loadMembers();
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/group/group.vue:131", e);
      }
    };
    const list = async () => {
      try {
        const res = await services_api.groupService.listGroups();
        groups.value = res.groupList || [];
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/group/group.vue:140", e);
      }
    };
    const quickJoin = (id) => {
      joinId.value = String(id);
    };
    const saveProfile = async () => {
      if (!groupId.value) {
        common_vendor.index.showToast({ title: "加入小组后可保存", icon: "none" });
        return;
      }
      if (!myProfile.nickname) {
        common_vendor.index.showToast({ title: "请输入昵称", icon: "none" });
        return;
      }
      try {
        profileSaving.value = true;
        const res = await services_api.groupService.updateProfile({
          nickname: myProfile.nickname,
          info: myProfile.info
        });
        applyProfile(res || {});
        common_vendor.index.showToast({ title: "已更新", icon: "success" });
        await loadMembers();
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/group/group.vue:167", e);
      } finally {
        profileSaving.value = false;
      }
    };
    common_vendor.onShow(loadMyGroup);
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !groupId.value
      }, !groupId.value ? {
        b: form.nickname,
        c: common_vendor.o(($event) => form.nickname = $event.detail.value),
        d: form.info,
        e: common_vendor.o(($event) => form.info = $event.detail.value),
        f: common_vendor.o(create)
      } : {
        g: common_vendor.t(groupId.value),
        h: common_vendor.o(loadMembers),
        i: common_vendor.f(members.value, (u, k0, i0) => {
          return {
            a: common_vendor.t(u.nickname),
            b: common_vendor.t(u.isLeader ? "(组长)" : ""),
            c: u._id
          };
        })
      }, {
        j: myProfile.nickname,
        k: common_vendor.o(($event) => myProfile.nickname = $event.detail.value),
        l: myProfile.info,
        m: common_vendor.o(($event) => myProfile.info = $event.detail.value),
        n: common_vendor.t(profileSaving.value ? "保存中..." : "保存资料"),
        o: !groupId.value || profileSaving.value,
        p: common_vendor.o(saveProfile),
        q: !groupId.value
      }, !groupId.value ? {} : {}, {
        r: joinId.value,
        s: common_vendor.o(($event) => joinId.value = $event.detail.value),
        t: joinNickname.value,
        v: common_vendor.o(($event) => joinNickname.value = $event.detail.value),
        w: common_vendor.o(join),
        x: common_vendor.o(list),
        y: common_vendor.f(groups.value, (g, k0, i0) => {
          return {
            a: common_vendor.t(g.groupId),
            b: common_vendor.t(g.leader),
            c: common_vendor.t(g.member || 1),
            d: g.groupId,
            e: common_vendor.o(($event) => quickJoin(g.groupId), g.groupId)
          };
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3945b5f1"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/group/group.js.map
