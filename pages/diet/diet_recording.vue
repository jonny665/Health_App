<template>
  <view class="app-container">
    <view class="card-box bg-primary text-white">
      <view class="fs-36">今日摄入热量</view>
      <view class="fs-60 fw-600 mt-10">{{ total }} kcal</view>
    </view>
    <view class="card-box">
      <view class="fs-32 fw-600 text-dark mb-20">记录今日饮食</view>
      <input class="input-field mb-20" v-model="food" placeholder="食物名称" />
      <input
        class="input-field mb-20"
        v-model.number="calories"
        type="number"
        placeholder="热量(kcal)"
      />
      <button class="btn-primary" @click="addDiet">添加记录</button>
    </view>
    <view class="card-box" v-for="item in list" :key="item._id">
      <view class="fs-32 fw-600 text-dark">{{ item.food }}</view>
      <view class="fs-28 text-gray mt-10">{{ item.calories }} kcal</view>
      <view class="fs-24 text-light mt-10">{{ item.date }}</view>
    </view>
  </view>
</template>
<script setup>
import { ref, computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { dietService } from "../../services/api.js";

const food = ref("");
const calories = ref(0);
const list = ref([]);

const total = computed(() =>
  list.value.reduce((sum, item) => sum + Number(item.calories || 0), 0)
);

const load = async () => {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const res = await dietService.dailyDiet(today);
    list.value = res.records || [];
  } catch (e) {
    console.error(e);
  }
};

const addDiet = async () => {
  if (!food.value || !calories.value) {
    uni.showToast({ title: "请填写完整", icon: "none" });
    return;
  }
  try {
    await dietService.addDiet({
      food: food.value,
      calories: Number(calories.value),
      date: new Date().toISOString().slice(0, 10),
    });
    food.value = "";
    calories.value = 0;
    await load();
  } catch (e) {
    console.error(e);
  }
};

onShow(load);
</script>
<style scoped>
.text-white { color: #fff; }
.fs-60 { font-size: 60rpx; }
.input-field {
  height: 88rpx;
  background: #f8f9fb;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  width: 100%;
  box-sizing: border-box;
}
</style>
