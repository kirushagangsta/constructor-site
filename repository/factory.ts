import {type $Fetch, type FetchOptions} from 'ofetch'

abstract class FetchFactory {
  constructor(fetcher: $Fetch, resource = "") {
    this.$fetch = fetcher
    this.resource = resource;
  }

  readonly $fetch: $Fetch

  resource: string;

  async call<T>(method: string, url: string, data?: any, fetchOptions?: FetchOptions<'json'>): Promise<T> {
    return this.$fetch<{ content: T }>(this.resource + url, {
      method,
      body: data,
      ...fetchOptions
    })
      .then((res) => Promise.resolve(res?.content))
  }
}

export default FetchFactory
