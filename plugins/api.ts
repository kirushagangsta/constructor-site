import { $fetch } from 'ofetch'
import FileManagerModule from "~/repository/modules/fileManager";

export default defineNuxtPlugin({
  name: 'api',
  setup(nuxtApp) {
    const config = useRuntimeConfig()

    const apiFetcher = $fetch.create({ // создаем экземпляр фетчера
      baseURL: config.public.apiUrl as string,
      // если сервер не отвечает, запрос должен упасть, а не висеть вечно
      timeout: 10000,
    })

    const modules = {
      fileManager: new FileManagerModule(apiFetcher, ''),
    }

    return {
      provide: {
        api: modules
      }
    }
  }
})
