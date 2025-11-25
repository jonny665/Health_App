<template>
  <view class="app-container">
    <!-- 顶部个人信息卡片 -->
    <view class="card-box profile-card">
      <view class="avatar-wrapper">
        <image
          class="avatar"
          :src="userInfo.avatar || '/static/default-avatar.png'"
          mode="aspectFill"
        />
      </view>
      <view class="info-text">
        <text class="fs-36 fw-600 text-dark mb-10">{{
          userInfo.nickname || "微信用户"
        }}</text>
        <text class="fs-24 text-light"
          >ID:
          {{
            userInfo.openid ? userInfo.openid.slice(0, 6) + "..." : "--"
          }}</text
        >
      </view>
    </view>

    <!-- 健康数据设置表单 -->
    <view class="card-box settings-box">
      <view class="section-title">身体数据设置</view>

      <view class="form-item">
        <view class="label">
          <image src="/static/home/height.png" class="icon" mode="aspectFit" />
          <text>身高 (cm)</text>
        </view>
        <input
          class="input"
          type="digit"
          v-model="form.height"
          placeholder="请输入身高"
        />
      </view>

      <view class="form-item">
        <view class="label">
          <image src="/static/home/weight.png" class="icon" mode="aspectFit" />
          <text>体重 (kg)</text>
        </view>
        <input
          class="input"
          type="digit"
          v-model="form.weight"
          placeholder="请输入体重"
        />
      </view>

      <view class="form-item">
        <view class="label">
          <image src="/static/home/calorie.png" class="icon" mode="aspectFit" />
          <text>每日目标 (kcal)</text>
        </view>
        <input
          class="input"
          type="number"
          v-model="form.calorieTarget"
          placeholder="例如: 2000"
        />
      </view>

      <button class="btn-primary mt-30" :loading="loading" @tap="saveSettings">
        保存修改
      </button>
    </view>

    <view class="tips">
      <text>* 您的身高体重数据将用于计算BMI及推荐摄入量</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      userInfo: {},
      form: {
        height: "",
        weight: "",
        calorieTarget: "",
      },
    };
  },
  onShow() {
    this.loadUserProfile();
  },
  methods: {
    async loadUserProfile() {
      const cached = uni.getStorageSync("userProfile");
      if (cached) {
        this.userInfo = cached;
        this.form.height = cached.height || "";
        this.form.weight = cached.weight || "";
        this.form.calorieTarget = cached.calorieTarget || "";
      }

      // 从云端拉取最新数据
      if (cached && cached.openid) {
        try {
          const { result } = await uniCloud.callFunction({
            name: "profile",
            data: { openid: cached.openid },
          });

          if (result.code === 0 && result.data) {
            const remoteData = result.data;
            // 更新本地缓存的某些字段
            const newProfile = { ...cached, ...remoteData };
            uni.setStorageSync("userProfile", newProfile);

            this.userInfo = newProfile;
            this.form.height = remoteData.height || "";
            this.form.weight = remoteData.weight || "";
            // profile 云函数目前可能没返回 calorieTarget，如果需要显示，得确保 profile 云函数返回它
            // 暂时假设 profile 云函数会返回，或者我们只依赖本地缓存+手动更新
            if (remoteData.calorieTarget) {
              this.form.calorieTarget = remoteData.calorieTarget;
            }
          }
        } catch (e) {
          console.error("同步个人信息失败", e);
        }
      }
    },
    async saveSettings() {
      if (this.loading) return;

      const height = Number(this.form.height);
      const weight = Number(this.form.weight);
      const calorieTarget = Number(this.form.calorieTarget);

      if (!height || height <= 0 || height > 300) {
        return uni.showToast({ title: "请输入有效的身高", icon: "none" });
      }
      if (!weight || weight <= 0 || weight > 500) {
        return uni.showToast({ title: "请输入有效的体重", icon: "none" });
      }
      if (!calorieTarget || calorieTarget <= 500 || calorieTarget > 10000) {
        return uni.showToast({ title: "请输入有效的目标卡路里", icon: "none" });
      }

      this.loading = true;
      try {
        const { result } = await uniCloud.callFunction({
          name: "updateUserHealthData",
          data: {
            openid: this.userInfo.openid,
            height,
            weight,
            calorieTarget,
          },
        });

        if (result.code === 0) {
          uni.showToast({ title: "保存成功", icon: "success" });

          // 更新本地缓存
          const newProfile = {
            ...this.userInfo,
            height,
            weight,
            calorieTarget,
          };
          uni.setStorageSync("userProfile", newProfile);
          this.userInfo = newProfile;
        } else {
          throw new Error(result.message || "保存失败");
        }
      } catch (err) {
        uni.showToast({ title: err.message || "保存失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.profile-card {
  display: flex;
  align-items: center;

  .avatar-wrapper {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 30rpx;
    border: 4rpx solid #e6f7f0;

    .avatar {
      width: 100%;
      height: 100%;
    }
  }

  .info-text {
    display: flex;
    flex-direction: column;
  }
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 40rpx;
  padding-left: 20rpx;
  border-left: 8rpx solid #0eb584;
}

.form-item {
  margin-bottom: 40rpx;

  .label {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    .icon {
      width: 40rpx;
      height: 40rpx;
      margin-right: 16rpx;
    }

    text {
      font-size: 28rpx;
      color: #666;
    }
  }

  .input {
    background: #f8f9fb;
    height: 88rpx;
    border-radius: 12rpx;
    padding: 0 30rpx;
    font-size: 32rpx;
    color: #333;
    border: 2rpx solid transparent;
    transition: all 0.3s;

    &:focus {
      background: #fff;
      border-color: #0eb584;
    }
  }
}

.tips {
  margin-top: 30rpx;
  text-align: center;

  text {
    font-size: 24rpx;
    color: #999;
  }
}
</style>
