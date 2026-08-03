<template>
  <v-btn icon variant="text" rounded="lg" :ripple="false" class="profile-btn">
    <v-avatar color="primary" variant="tonal" size="32" rounded="lg"
      >А</v-avatar
    >

    <v-menu activator="parent" location="bottom end" :offset="4">
      <v-list min-width="200" rounded="lg">
        <v-list-item title="Профиль" />
        <v-list-item title="Админ. панель" />
        <v-divider />
        <v-list-item
          title="Выйти"
          base-color="error"
          @click="$emit('signOut')"
        />
        <v-list-item
          title="Выйти из всех сессий"
          base-color="error"
          @click="$emit('signOutEverywhere')"
        />
      </v-list>
    </v-menu>
  </v-btn>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'signOut'): void;
  (e: 'signOutEverywhere'): void;
}>();
</script>
