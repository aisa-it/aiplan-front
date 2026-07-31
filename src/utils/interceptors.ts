import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

export function applyInterceptors(instance: AxiosInstance): AxiosInstance {
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })

  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => Promise.reject(error),
  )

  return instance
}
