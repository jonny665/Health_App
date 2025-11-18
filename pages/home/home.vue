<template>
  <!-- 父容器使用flex布局并占满全屏 -->
  <view class="container pd20 column">
    <!-- 顶部欢迎卡片 - 占满剩余空间 -->
    <view class="card colorCard pd40 flex-grow">
      <view class="fs40 fwb">欢迎来到健康监控</view>
      <view class="mgt10 fs28">今日概览</view>
      <view class="mgt20 fs32">摄入热量：{{ summary.diet }} kcal</view>
      <view class="mgt10 fs32">消耗热量：{{ summary.sport }} kcal</view>
      <view class="mgt10 fs28">小组：{{ groupId || "未加入" }}</view>
    </view>

    <!-- 快捷入口卡片 - 固定在底部 -->
    <view class="card pd40 jcc column bottom-bar">
      <view class="fs36 fwb mbg20">快捷入口</view>
      <view class="flex jcsa">
        <button class="fs28" @click="toDiet">饮食记录</button>
        <button class="fs28" @click="toSport">运动记录</button>
        <button class="fs28" @click="toCommunity">社区</button>
        <button class="fs28" @click="toGroup">小组</button>
        <button class="fs28" @click="toReport">报告总结</button>
      </view>
    </view>
  </view>
</template>

<style scoped>
  .container {
    /* 用rpx设置全屏高度（根据常见设备屏幕比例，1334rpx约等于iPhone 6/7/8的全屏高度，可根据实际需求调整） */
    height: 1334rpx;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .flex-grow {
    flex-grow: 1;
    /* 自动填充剩余空间 */
  }

  .bottom-bar {
    width: 100%;
    box-sizing: border-box;
    margin-top: auto;
  }

  button {
    min-width: 140rpx;
    text-align: center;
    white-space: nowrap;
    padding: 20rpx 0;
  }

  /* 确保页面根元素也没有滚动 */
  page {
    height: 100%;
    overflow: hidden;
  }
</style>