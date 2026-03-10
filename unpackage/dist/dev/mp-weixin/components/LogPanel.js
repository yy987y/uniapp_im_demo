"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "LogPanel",
  props: {
    logs: {
      type: Array,
      default: () => []
    },
    height: {
      type: String,
      default: "400rpx"
    },
    autoScroll: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      scrollTop: 0
    };
  },
  watch: {
    logs: {
      handler() {
        if (this.autoScroll) {
          this.$nextTick(() => {
            this.scrollTop = this.logs.length * 100;
          });
        }
      },
      deep: true
    }
  },
  methods: {
    clearLogs() {
      this.$emit("clear");
    },
    copyLogs() {
      const text = this.logs.map((log) => {
        let line = `[${log.time}] [${log.type.toUpperCase()}] ${log.message}`;
        if (log.data) {
          line += "\n" + log.data;
        }
        return line;
      }).join("\n");
      common_vendor.index.setClipboardData({
        data: text || "暂无日志",
        success: () => {
          common_vendor.index.showToast({
            title: "已复制",
            icon: "success"
          });
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.copyLogs && $options.copyLogs(...args)),
    b: common_vendor.o((...args) => $options.clearLogs && $options.clearLogs(...args)),
    c: $props.logs.length === 0
  }, $props.logs.length === 0 ? {} : {
    d: common_vendor.f($props.logs, (log, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(log.time),
        b: common_vendor.t(log.type.toUpperCase()),
        c: common_vendor.t(log.message),
        d: log.data
      }, log.data ? {
        e: common_vendor.t(log.data)
      } : {}, {
        f: index,
        g: common_vendor.n("log-" + log.type)
      });
    })
  }, {
    e: $data.scrollTop,
    f: $props.height
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-ea9758ce"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/LogPanel.js.map
