"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {};
function _sfc_render(_ctx, _cache) {
  return {
    a: common_vendor.t(_ctx.summary.diet),
    b: common_vendor.t(_ctx.summary.sport),
    c: common_vendor.t(_ctx.groupId || "未加入"),
    d: common_vendor.o((...args) => _ctx.toDiet && _ctx.toDiet(...args)),
    e: common_vendor.o((...args) => _ctx.toSport && _ctx.toSport(...args)),
    f: common_vendor.o((...args) => _ctx.toCommunity && _ctx.toCommunity(...args)),
    g: common_vendor.o((...args) => _ctx.toGroup && _ctx.toGroup(...args)),
    h: common_vendor.o((...args) => _ctx.toReport && _ctx.toReport(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-07e72d3c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/home.js.map
