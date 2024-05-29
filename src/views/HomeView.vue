<template>
  <div class="home">
    <router-link to="/edit-lock">
      页面编辑状态锁定，静置20min后自动释放锁定能力
    </router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "HomeView",
  components: {},
});
</script>
