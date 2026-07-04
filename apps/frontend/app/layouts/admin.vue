<template>
  <div class="admin-layout">
    <AdminSidebar />

    <div class="admin-main">
      <Topbar />

      <section class="admin-content">
        <slot />
      </section>
    </div>

    <!-- ✅ Toast global — disponible en todas las páginas admin -->
    <Toast />
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-content {
  flex: 1;
  overflow: hidden;
}
</style>