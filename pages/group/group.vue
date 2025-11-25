<template>
  <view class="app-container">
    <!-- 创建小组 -->
    <view class="card-box" v-if="!groupId">
      <view class="fs-32 fw-600 text-dark mb-20">创建小组</view>
      <input class="input-field mb-20" v-model="form.nickname" placeholder="昵称" />
      <textarea
        class="input-area mb-20"
        v-model="form.info"
        placeholder="简介/目标"
      ></textarea>
      <button class="btn-primary" @click="create">创建小组</button>
    </view>

    <!-- 当前小组 -->
    <view class="card-box" v-else>
      <view class="flex-between mb-20">
        <view class="fs-32 fw-600 text-dark">当前小组 #{{ groupId }}</view>
        <view class="fs-24 text-light" v-if="members.length">共 {{ members.length }} 人</view>
      </view>
      
      <view class="member-list">
        <view class="member-item flex-between mb-10" v-for="u in members" :key="u._id">
          <view class="fs-32 text-dark">{{ u.nickname }}</view>
          <view class="fs-24 text-primary bg-light-primary px-2 py-1 rounded">{{ u.isLeader ? "组长" : "成员" }}</view>
        </view>
      </view>
      
      <button class="btn-primary mt-30" @click="loadMembers">刷新成员</button>
    </view>

    <!-- 我的资料 -->
    <view class="card-box">
      <view class="fs-32 fw-600 text-dark mb-20">我的资料</view>
      <input class="input-field mb-20" v-model="myProfile.nickname" placeholder="昵称" />
      <textarea
        class="input-area mb-20"
        v-model="myProfile.info"
        placeholder="个人简介"
      ></textarea>
      <button
        class="btn-primary"
        :disabled="!groupId || profileSaving"
        @click="saveProfile"
      >
        {{ profileSaving ? "保存中..." : "保存资料" }}
      </button>
      <view class="fs-24 text-light mt-20 text-center" v-if="!groupId">加入或创建小组后可保存</view>
    </view>

    <!-- 加入小组 -->
    <view class="card-box">
      <view class="fs-32 fw-600 text-dark mb-20">加入已有小组</view>
      <input class="input-field mb-20" v-model="joinId" placeholder="输入小组ID" />
      <input class="input-field mb-20" v-model="joinNickname" placeholder="你的昵称" />
      <button class="btn-primary" @click="join">加入</button>
    </view>

    <!-- 可加入列表 -->
    <view class="card-box">
      <view class="fs-32 fw-600 text-dark mb-20">可加入小组</view>
      <button class="btn-primary mb-20" @click="list">获取可加入小组列表</button>
      <view
        class="group-item"
        v-for="g in groups"
        :key="g.groupId"
        @click="quickJoin(g.groupId)"
      >
        <text class="text-primary fw-600">#{{ g.groupId }}</text> 
        <text class="ml-2 text-dark">{{ g.leader }}</text>
        <text class="ml-2 text-gray">({{ g.member || 1 }}人)</text>
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
.column.gap > .card + .card {
  margin-top: 20rpx;
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
.input-field {
  height: 88rpx;
  background: #f8f9fb;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  width: 100%;
  box-sizing: border-box;
}
.input-area {
  width: 100%;
  min-height: 120rpx;
  background: #f8f9fb;
  padding: 20rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}
.bg-light-primary {
  background-color: rgba(14, 181, 132, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}
.group-item {
  padding: 20rpx;
  background: #f8f9fb;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}
.ml-2 { margin-left: 16rpx; }
</style>
