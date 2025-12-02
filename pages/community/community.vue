<template>
  <view class="pd20 column gap">
    <view class="card">
      <view class="fs32 fwb">发布你的健康留言</view>
      <textarea
        class="input"
        v-model="content"
        placeholder="说点什么..."
        auto-height
      ></textarea>
      <button class="mgt20" @click="publish">立即发布</button>
    </view>
    <view class="card" v-for="m in messages" :key="m._id">
      <view class="fs32">{{ m.content }}</view>
      <view class="c9 fs24 mgt10">{{ formatTime(m.createdAt) }}</view>
    </view>
  </view>
</template>
<script setup>
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { messageService } from "../../services/api.js";

const content = ref("");
const messages = ref([]);

const load = async () => {
  try {
    const res = await messageService.listPublic();
    messages.value = res.messages || res.data || [];
  } catch (e) {
    console.error(e);
  }
};

const publish = async () => {
  if (!content.value) {
    uni.showToast({ title: "请输入内容", icon: "none" });
    return;
  }
  try {
    await messageService.publish(content.value);
    content.value = "";
    await load();
  } catch (e) {
    console.error(e);
  }
};

const formatTime = (ts) => {
  if (!ts) return "";
  const date = new Date(ts);
  return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
};

onShow(load);
</script>
<style scoped>
.column.gap > .card + .card {
  margin-top: 20rpx;
}

textarea {
  width: 100%;
  min-height: 120rpx;
}
</style>
