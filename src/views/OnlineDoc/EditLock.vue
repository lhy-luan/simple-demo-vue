<template>
  <div>正在编辑中...</div>
  <input @change="onChange" />
</template>
<script lang="ts">
/**
 * https://juejin.cn/post/7340636105765535796
 * 需求背景：
  1、任意邮件同时;间段只允许一个运营编辑，后续编辑被拒绝
  运营a编辑中，运营b点击编提，提示"**正在编辑中，不支持
  多人编辑〞，**指的是邮箱人员前缀简拼
  2、编辑功能县有默认超时机制，进入编辑状态后，停止操作20分钟
  后，自动退出编辑，提示〝页面己失效〞，回退到列表页面：
    • 计时规则：用户在编辑界面停留最后一次操作行为超过20分
  钟
    • 在计时区间内，监测到用户有操作行为清零上次失效计时直到
  下次监测到有未操作行为重新计时，行为包括不限于：点击、输入内容、提交等
    • 超时时间非法，邮件发送时间为当下
  3、编辑可点击的权限同原需求
  4、a点了编辑，b随后点了发送，点击发送按钮要提示"**正在编辑
  中，不支持多人编賴"。非编辑状态才能进行发送
 */
/**
 * 实现思路：
 * 1、setInterval进行时间计时，20分钟后自动释放页面编辑权限
 * 2、每1min像服务端发送一次请求，用来维持当前页面编辑状态（若1min中后未接到续租请求，服务端释放页面编辑状态，允许其他人进行页面编辑）
 * 2、由于setInterval在页面切换时会出现计时暂停（线程被停止），所以需要使用到Web Worker来持续线程活跃状态，保证倒计时在页面切换时继续
 */
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    console.log("renderrrrrr");
    const myWorker = new Worker("/worker.ts"); // 创建worker，函数里的值为 webWorker 文件名

    // 向 worker.js 线程发送消息，对应 worker.js 线程中的 e.data
    myWorker.postMessage("start");

    // 开启定时
    const onTimeStart = () => {
      myWorker.postMessage("start");
    };
    // 停止定时
    const onTimeEnd = () => {
      myWorker.postMessage("end");
    };
    // 重置定时
    const onTime = () => {
      onTimeEnd();
      onTimeStart();
    };
    const campaignListLock = () => {
      // 向服务端发起请求，锁定编辑状态
      console.log("向服务端发起请求，续租编辑状态");
    };

    myWorker.addEventListener("message", (e) => {
      // 从 worker.js 那接收消息，每隔一秒都会接收到
      console.log(e.data); // {text: 'editing', sum: sum}，worker线程发送的消息
      // TODO, 发起续租请求
      campaignListLock(); // 发起续租请求
      let timeCount = 0;

      if (e.data.sum >= 20) {
        // 超过 20 分钟，终止续租并提示页面失效
        onTimeEnd();
        if (document.visibilityState === "visible") {
          console.log("页面已失效"); // 提示页面已失效
          // TODO，处理页面失效后其它处理逻辑
          timeCount = 1; // 触发了提示就禁止它后续再触发
        }
        document.addEventListener("visibilitychange", function () {
          if (document.visibilityState == "visible" && timeCount == 0) {
            console.log("页面已失效"); // 提示页面已失效
            // TODO，处理页面失效后其它处理逻辑
            timeCount = 1; // 触发了提示就禁止它后续再触发
          }
        });
      }
    });

    const onChange = () => {
      onTime();
    };
    return {
      onChange,
    };
  },
});
</script>

<style lang="less" scoped></style>
