<template>
  <view class="pd20 column gap">
    <view class="card">
      <view class="fs36 fwb">报告生成</view>
      <picker mode="date" @change="onStart" :value="start">
        <view class="mgt10">开始日期：{{ start || "请选择" }}</view>
      </picker>
      <picker mode="date" @change="onEnd" :value="end">
        <view class="mgt10">结束日期：{{ end || "请选择" }}</view>
      </picker>
      <button class="mgt20" @click="generate">生成基础报告</button>
    </view>
    <view v-if="report" class="card">
      <view class="fs32 fwb">基础统计</view>
      <view class="mgt10">总摄入：{{ report.totalDiet }} kcal</view>
      <view class="mgt10">总消耗：{{ report.totalSport }} kcal</view>
      <button class="mgt20" @click="ai">AI 总结</button>
    </view>
    <view v-if="aiText" class="card">
      <view class="fs32 fwb">AI 分析</view>
      <text class="mgt10 lh17">{{ aiText }}</text>
    </view>
  </view>
</template>
<script setup>
import { ref } from "vue";
import {
  reportService,
  dietService,
  sportService,
} from "../../services/api.js";

const start = ref("");
const end = ref("");
const report = ref(null);
const aiText = ref("");

const onStart = (e) => {
  start.value = e.detail.value;
};

const onEnd = (e) => {
  end.value = e.detail.value;
};

const generate = async () => {
  if (!start.value || !end.value) {
    uni.showToast({ title: "选择日期", icon: "none" });
    return;
  }
  const days = [];
  const endDate = new Date(end.value);
  const cursor = new Date(start.value);
  while (cursor <= endDate) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  let dietTotal = 0;
  let sportTotal = 0;
  for (const d of days) {
    try {
      const diet = await dietService.dailyDiet(d);
      dietTotal += (diet.records || []).reduce((s, i) => s + i.calories, 0);
    } catch (e) {
      console.error(e);
    }
    try {
      const sport = await sportService.dailySport(d);
      sportTotal += (sport.records || []).reduce((s, i) => s + i.calories, 0);
    } catch (e) {
      console.error(e);
    }
  }
  report.value = { totalDiet: dietTotal, totalSport: sportTotal };
  aiText.value = "";
};

const ai = async () => {
  if (!report.value) return;
  try {
    const generated = await reportService.generate({
      start: start.value,
      end: end.value,
    });
    const aiRes = await reportService.aiSummary(generated.reportId);
    aiText.value = aiRes.text || "暂无AI返回";
  } catch (e) {
    console.error(e);
  }
};
</script>
<style scoped>
.column.gap > .card + .card {
  margin-top: 20rpx;
}
</style>
