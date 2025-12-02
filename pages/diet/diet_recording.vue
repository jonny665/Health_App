<template>
  <view class="diet-page">
    <view class="diet-layout">
      <scroll-view class="diet-categories" scroll-y :scroll-top="leftScrollTop" scroll-with-animation>
        <view
          v-for="(cat, index) in categories"
          :key="cat"
          class="category-item"
          :class="{ active: curIndex === index }"
          @tap="handleSelectNav(index)"
        >
          {{ cat }}
        </view>
      </scroll-view>

      <scroll-view
        class="diet-content"
        scroll-y
        :scroll-into-view="activeAnchor"
        scroll-with-animation
        @scroll="onScroll"
      >
        <view
          v-for="(group, catIndex) in foodGroups"
          :key="group.category"
          :id="`category-${catIndex}`"
          class="category-block"
        >
          <view class="category-header">{{ group.category }}</view>
          <view v-for="food in group.items" :key="food.foodId" class="food-card">
            <view class="food-row">
              <image v-if="food.image" :src="food.image" class="food-img" mode="aspectFit" />
              <view class="food-info">
                <view class="food-name">{{ food.name }}</view>
                <view class="food-meta">
                  热量: <text class="meta-val">{{ food.calories }}kcal/{{ food.unit }}</text>
                </view>
              </view>
            </view>
            <view class="food-actions">
              <button class="food-btn" @click="selectFood(food)">添加记录</button>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <view v-if="showDialog" class="dialog-mask">
      <view class="dialog-box">
        <view class="dialog-title">添加饮食记录</view>
        <view class="dialog-content">
          <view>食物：{{ selectedFood.name }}</view>
          <view>热量：{{ selectedFood.calories }}kcal/{{ selectedFood.unit }}</view>
          <input
            v-model="inputWeight"
            type="number"
            placeholder="请输入重量(g)"
            class="dialog-input"
          />
        </view>
        <view class="dialog-actions">
          <button class="dialog-btn" :disabled="submitting" @click="addDietRecord">
            {{ submitting ? '提交中...' : '确定' }}
          </button>
          <button class="dialog-btn cancel" @click="showDialog = false" :disabled="submitting">取消</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { onShow } from '@dcloudio/uni-app';

const categories = ref([]);
const foodGroups = ref([]);
const curIndex = ref(0);
const leftScrollTop = ref(0);
const activeAnchor = ref('');
const leftItemHeight = ref(0);

const showDialog = ref(false);
const selectedFood = ref({});
const inputWeight = ref('');
const submitting = ref(false);

const fetchFoodReference = async () => {
  try {
    const { result } = await uniCloud.callFunction({ name: 'foodReference' });
    const { categories: catList = [], groups = [] } = result?.data || {};
    categories.value = catList;
    foodGroups.value = groups;
    nextTick(calculateLeftItemHeight);
  } catch (err) {
    uni.showToast({ title: '食物数据加载失败', icon: 'none' });
  }
};

function calculateLeftItemHeight() {
  uni.createSelectorQuery()
    .select('.category-item')
    .boundingClientRect(rect => {
      if (rect) leftItemHeight.value = rect.height;
    })
    .exec();
}

function handleSelectNav(index) {
  curIndex.value = index;
  activeAnchor.value = `category-${index}`;
  scrollLeftMenu();
}

function scrollLeftMenu() {
  if (!leftItemHeight.value) return;
  const visibleCount = Math.floor(600 / leftItemHeight.value);
  const middleIndex = Math.floor(visibleCount / 2);
  leftScrollTop.value = curIndex.value > middleIndex ? (curIndex.value - middleIndex) * leftItemHeight.value : 0;
}

function onScroll() {
  uni.createSelectorQuery()
    .selectAll('.category-block')
    .boundingClientRect(rects => {
      for (let i = 0; i < rects.length; i++) {
        if (rects[i] && rects[i].top >= 0) {
          curIndex.value = i;
          scrollLeftMenu();
          activeAnchor.value = `category-${i}`;
          break;
        }
      }
    })
    .exec();
}

function selectFood(food) {
  selectedFood.value = food;
  inputWeight.value = '';
  showDialog.value = true;
}

async function addDietRecord() {
  if (submitting.value) return;
  const weight = Number(inputWeight.value);
  if (!weight || weight <= 0) {
    uni.showToast({ title: '请输入大于0的重量', icon: 'none' });
    return;
  }
  const profile = uni.getStorageSync('userProfile');
  const openid = profile?.openid;
  if (!openid) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return;
  }

  submitting.value = true;
  try {
    await uniCloud.callFunction({
      name: 'addCalorieLog',
      data: {
        openid,
        foodId: selectedFood.value.foodId,
        foodName: selectedFood.value.name,
        unitCalories: Number(selectedFood.value.calories),
        weight
      }
    });
    uni.showToast({ title: '记录成功', icon: 'success' });
    showDialog.value = false;
    inputWeight.value = '';
  } catch (err) {
    console.error('[diet_recording] addCalorieLog error:', err);
    uni.showToast({ title: '记录失败', icon: 'none' });
  } finally {
    submitting.value = false;
  }
}

onShow(fetchFoodReference);
</script>


<style scoped>
.diet-page {
  min-height: 100vh;
  background: #f5f6fa;
  padding: 0;
}
.diet-layout {
  display: flex;
  height: 100vh;
}
.diet-categories {
  width: 180rpx;
  background: #fff;
  border-radius: 20rpx 0 0 20rpx;
  box-shadow: 0 10rpx 25rpx rgba(15, 23, 42, 0.08);
  padding: 16rpx 0;
  box-sizing: border-box;
  height: 600rpx; /* 用于计算可视区域高度 */
}
.category-item {
  padding: 20rpx 12rpx;
  border-radius: 14rpx;
  font-size: 26rpx;
  text-align: center;
  color: #48693c;
  margin-bottom: 12rpx;
  cursor: pointer;
  transition: background 0.2s;
}
.category-item.active {
  background: #b1c3b7;
  color: #48693c;
  border-radius: 0
}
.diet-content {
  flex: 1;
  background: #f8f9fb;
  border-radius: 0 20rpx 20rpx 0;
  padding: 24rpx;
  box-sizing: border-box;
  overflow-y: auto;
}
.category-block + .category-block {
  margin-top: 32rpx;
}
.category-header {
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
  color: #0f172a;
}
.food-card {
  background: #e6f7ee;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  padding: 18rpx 16rpx;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4rpx 12rpx rgba(15, 23, 42, 0.04);
}
.food-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
}
.food-img {
  width: 72rpx;
  height: 72rpx;
  border-radius: 12rpx;
  background: #fff;
  object-fit: cover;
  margin-right: 10rpx;
}
.food-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.food-name {
  font-size: 35rpx;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8rpx;
}
.food-meta {
  font-size: 24rpx;
  color: #3b3b3b;
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.meta-val {
  color: #0eb584;
  font-weight: 600;
  margin-left: 4rpx;
}
.food-actions {
  margin-top: 10rpx;
  text-align: right;
}
.food-btn {
  padding: 8rpx 24rpx;
  border-radius: 12rpx;
  background: #0eb584;
  color: #fff;
  font-size: 24rpx;
  border: none;
}
.dialog-mask {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dialog-box {
  background: #fff;
  border-radius: 18rpx;
  padding: 40rpx 32rpx;
  min-width: 480rpx;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.12);
}
.dialog-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 24rpx;
  color: #0eb584;
}
.dialog-content {
  font-size: 28rpx;
  margin-bottom: 24rpx;
}
.dialog-input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 12rpx;
  margin-top: 16rpx;
  font-size: 28rpx;
  padding: 0 16rpx;
  box-sizing: border-box;
}
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 24rpx;
}
.dialog-btn {
  padding: 12rpx 36rpx;
  border-radius: 12rpx;
  background: #0eb584;
  color: #fff;
  font-size: 28rpx;
  border: none;
}
.dialog-btn.cancel {
  background: #e5e7eb;
  color: #333;
}
</style>