<template>
  <view class="app-container">
    <view class="card-box">
      <view class="fs-32 fw-600 text-dark mb-20">发布你的健康留言</view>
      <textarea
        class="input-area"
        v-model="content"
        placeholder="说点什么..."
        auto-height
      ></textarea>
      <button class="btn-primary mt-30" @click="publish">立即发布</button>
    </view>

    <view class="card-box" v-for="m in messages" :key="m._id">
      <view class="fs-32 text-dark">{{ m.content }}</view>
      <view class="fs-24 text-light mt-10">{{ formatTime(m.createdAt) }}</view>
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
.input-area {
  width: 100%;
  min-height: 120rpx;
  background: #f8f9fb;
  padding: 20rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}
</style>
