import FetchFactory from '@/repository/factory'
import type {IHtmlNode} from "~/types/constructor";

export default class FileManagerModule extends FetchFactory {
  async getFile(): Promise<string> {
    return await this.call('GET', '/getFile');
  }

  async saveFile({ content }: { content: Array<IHtmlNode> }) {
    return await this.call('POST', '/saveFile', { content });
  }

  async downloadFile({ content }: { content: string }): Promise<{ downloadUrl: string }> {
    return await this.call('POST', '/downloadFile', { content });
  }
}