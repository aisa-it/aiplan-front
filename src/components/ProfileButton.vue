<template>
  <v-btn icon variant="text" rounded="lg" :ripple="false" class="profile-btn">
    <v-avatar color="primary" variant="tonal" size="32" rounded="lg">А</v-avatar>

    <v-menu activator="parent" location="bottom end" :offset="4">
      <v-list min-width="200" rounded="lg">
        <v-list-item title="Профиль" />
        <v-list-item title="Админ. панель" />
        <v-divider />
        <v-list-item title="Выйти" base-color="error" />
        <v-list-item title="Выйти из всех сессий" base-color="error" />
      </v-list>
    </v-menu>
  </v-btn>
</template>

<style scoped>
.profile-btn {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  padding: 0 !important;
  margin-right: 4px;
}
</style>
