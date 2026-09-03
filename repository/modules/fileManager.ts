import FetchFactory from '@/repository/factory'
import type {IHtmlNode} from "~/types/constructor";
import {DEFAULT_PROJECT_ID, DEFAULT_USER_ID} from "~/constants/constructor/project";

export interface IUploadedAsset {
  /** id файла в проекте: по нему он и отдаётся, и попадает в архив */
  id: string;
  /** Собственный размер файла, если его удалось прочитать */
  width?: number;
  height?: number;
}

export default class FileManagerModule extends FetchFactory {
  /**
   * Пользователь и его проект, с которыми сейчас работает редактор: и страница,
   * и картинки лежат в этой паре папок. Пока значения по умолчанию, а когда
   * появятся пользователи, они будут приходить сюда извне — остальному коду
   * это заметно не будет.
   */
  userId = DEFAULT_USER_ID;
  projectId = DEFAULT_PROJECT_ID;

  /** Чей проект — этим сопровождается каждый запрос к файлам */
  get owner() {
    return {user: this.userId, project: this.projectId};
  }

  async getFile(): Promise<string> {
    return await this.call('GET', '/getFile', undefined, {query: this.owner});
  }

  async saveFile({ content }: { content: Array<IHtmlNode> }) {
    return await this.call('POST', '/saveFile', { content, ...this.owner });
  }

  /**
   * content — разметка страницы, css — её стили: на сервере из них собирается
   * архив и уезжает прямо в ответ, минуя диск. Поэтому здесь не json, и общий
   * call с его распаковкой content не подходит.
   */
  async downloadFile({ content, css }: { content: string, css: string }): Promise<Blob> {
    return await this.$fetch<Blob>(this.resource + '/downloadFile', {
      method: 'POST',
      body: { content, css, ...this.owner },
      responseType: 'blob',
      // архив тяжелее json, поэтому общего таймаута ему может не хватить
      timeout: 60000,
    });
  }

  /** Картинка уезжает на сервер файлом: в дереве от неё остаётся только id */
  async uploadImage(file: File): Promise<IUploadedAsset> {
    const body = new FormData();
    body.append('file', file);

    // картинка тяжелее json, поэтому общего таймаута ей может не хватить
    return await this.call('POST', '/upload', body, {
      query: this.owner,
      timeout: 60000,
    });
  }
}
