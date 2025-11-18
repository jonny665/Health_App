<template>
  <view class="p-3">
    <view class="card" v-if="!groupId">
      <input v-model="form.nickname" placeholder="昵称" />
      <textarea v-model="form.info" placeholder="简介/目标" />
      <button class="mt-2" @click="create">创建小组</button>
    </view>
    <view class="card" v-else>
      <view>当前小组：{{ groupId }}</view>
      <button class="mt-2" @click="loadMembers">刷新成员</button>
      <view class="mt-2" v-for="u in members" :key="u._id">
        {{ u.nickname }} {{ u.isLeader ? "(组长)" : "" }}
      </view>
    </view>
    <view class="card mt-2">
      <view>我的资料</view>
      <input v-model="myProfile.nickname" placeholder="昵称" />
      <textarea v-model="myProfile.info" placeholder="个人简介" />
      <button
        class="mt-2"
        :disabled="!groupId || profileSaving"
        @click="saveProfile"
      >
        {{ profileSaving ? "保存中..." : "保存资料" }}
      </button>
      <view class="tips" v-if="!groupId">加入或创建小组后可保存</view>
    </view>
    <view class="card mt-2">
      <view>加入已有小组</view>
      <input v-model="joinId" placeholder="输入小组ID" />
      <input v-model="joinNickname" placeholder="你的昵称" />
      <button class="mt-2" @click="join">加入</button>
    </view>
    <view class="card mt-2">
      <button @click="list">获取可加入小组列表</button>
      <view
        class="mt-2"
        v-for="g in groups"
        :key="g.groupId"
        @click="quickJoin(g.groupId)"
      >
        #{{ g.groupId }} {{ g.leader }} ({{ g.member || 1 }}人)
      </view>
    </view>
  </view>
</template>
<script setup>
import { reactive, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { groupService } from "../../services/api.js";

const groupId = ref("");
const members = ref([]);
const groups = ref([]);
const form = reactive({ nickname: "", info: "" });
const joinId = ref("");
const joinNickname = ref("");
const myProfile = reactive({ nickname: "", info: "" });
const profileSaving = ref(false);

const applyProfile = (profile = {}) => {
  const nickname = profile.nickname || "";
  const info = profile.info || "";
  myProfile.nickname = nickname;
  myProfile.info = info;
  if (!form.nickname) form.nickname = nickname;
  if (!form.info) form.info = info;
  if (!joinNickname.value) joinNickname.value = nickname;
};

const loadMembers = async () => {
  if (!groupId.value) return;
  try {
    const res = await groupService.groupMembers(groupId.value);
    members.value = res.userList || [];
  } catch (e) {
    console.error(e);
  }
};

const loadMyGroup = async () => {
  try {
    const res = await groupService.getMyGroup();
    groupId.value = res.groupId || "";
    applyProfile(res.profile || {});
    if (groupId.value) {
      await loadMembers();
    }
  } catch (e) {
    console.error(e);
  }
};

const create = async () => {
  if (!form.nickname || !form.info) {
    uni.showToast({ title: "请填写完整", icon: "none" });
    return;
  }
  try {
    const res = await groupService.createGroup({
      nickname: form.nickname,
      info: form.info,
    });
    groupId.value = res.groupId;
    applyProfile({ nickname: form.nickname, info: form.info });
    await loadMembers();
  } catch (e) {
    console.error(e);
  }
};

const join = async () => {
  if (!joinId.value || !joinNickname.value) {
    uni.showToast({ title: "缺少信息", icon: "none" });
    return;
  }
  try {
    const res = await groupService.joinGroup({
      groupId: Number(joinId.value),
      nickname: joinNickname.value,
      info: "",
      gender: "",
      code: "",
      age: 0,
      region: [],
    });
    groupId.value = res.groupId;
    applyProfile({ nickname: joinNickname.value, info: "" });
    await loadMembers();
  } catch (e) {
    console.error(e);
  }
};

const list = async () => {
  try {
    const res = await groupService.listGroups();
    groups.value = res.groupList || [];
  } catch (e) {
    console.error(e);
  }
};

const quickJoin = (id) => {
  joinId.value = String(id);
};

const saveProfile = async () => {
  if (!groupId.value) {
    uni.showToast({ title: "加入小组后可保存", icon: "none" });
    return;
  }
  if (!myProfile.nickname) {
    uni.showToast({ title: "请输入昵称", icon: "none" });
    return;
  }
  try {
    profileSaving.value = true;
    const res = await groupService.updateProfile({
      nickname: myProfile.nickname,
      info: myProfile.info,
    });
    applyProfile(res || {});
    uni.showToast({ title: "已更新", icon: "success" });
    await loadMembers();
  } catch (e) {
    console.error(e);
  } finally {
    profileSaving.value = false;
  }
};

onShow(loadMyGroup);
</script>
<style scoped>
input,
textarea {
  border: 1px solid #eee;
  padding: 12rpx;
  border-radius: 8rpx;
  margin-top: 12rpx;
  width: 100%;
}
button {
  background: #1afa29;
  color: #fff;
  padding: 16rpx;
  border-radius: 8rpx;
}
button:disabled {
  background: #9ed6a0;
  color: #f3f3f3;
}
.tips {
  color: #888;
  font-size: 24rpx;
  margin-top: 8rpx;
}
</style>
