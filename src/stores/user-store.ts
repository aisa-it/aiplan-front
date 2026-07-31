import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts'
import { Users } from '@aisa-it/aiplan-api-ts/src/Users'
import { withInterceptors } from '@/utils/interceptorsWithInstanceClass'

const usersApi = new (withInterceptors(Users))()

export const useUserStore = defineStore('user', () => {
  const user = ref<DtoUser | null>(null)

  const getMe = async () => {
    const { data } = await usersApi.getCurrentUser()
    user.value = data
    return data
  }

  return {
    user,
    getMe,
  }
})
