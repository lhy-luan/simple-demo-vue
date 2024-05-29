let timer;
self.addEventListener("message", (e) => {
  // 接收到消息
  console.log(e.data); // Greeting from Main.js，主线程发送的消息

  let sum = 0;
  let msg;

  if (e.data === "start") {
    timer = setInterval(() => {
      sum += 1;
      msg = {
        text: "editing",
        sum,
      };
      self.postMessage(msg); // 向主线程发送消息 msg 对象
    }, 1 * 1000); // 每分钟 sum 加 1 标识积累了 1 分钟
  } else {
    clearInterval(timer);
  }
});
