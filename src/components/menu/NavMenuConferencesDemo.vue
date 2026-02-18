 <template>
  <q-item clickable class="menu-item centered-horisontally">
    <q-item-section avatar> <UsersIcon /> </q-item-section>
    <q-item-section> Конференции </q-item-section>
    <HintTooltip> Функционал конференций доступен в полной версии </HintTooltip>
  </q-item>
</template>

<script setup lang="ts">
import UsersIcon from 'src/components/icons/UsersIcon.vue';
</script>
