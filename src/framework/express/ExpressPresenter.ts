import { Response } from 'express';

class ExpressPresenter {
  public static NEW_ENTITY_HTTP_STATUS_CODE = 201;
  public static ENTITY_HTTP_STATUS_CODE = 200;
  public static LIST_HTTP_STATUS_CODE = 200;
  public static NOT_COMPLETED_ASYNC_PROCESS_HTTP_STATUS_CODE = 202;
  public static EMPTY_HTTP_STATUS_CODE = 204;

  private mapper: ((input: any) => any) | null;
  private response: Response;

  constructor(response: Response, mapper?: (input: any) => any) {
    this.mapper = mapper ? mapper : null;
    this.response = response;
  }

  returnNewEntity(entity: any): void {
    const result = this.mapper ? this.mapper(entity) : entity;

    this.response.status(ExpressPresenter.NEW_ENTITY_HTTP_STATUS_CODE).json(result);
  }

  returnOk(): void {
    this.response.status(ExpressPresenter.EMPTY_HTTP_STATUS_CODE).send();
  }

  /* returnEntity(entity: D | object): void {
    const result = this.mapper ? this.mapper.toDTO(entity as D) : entity;

    this.response.status(ExpressPresenter.ENTITY_HTTP_STATUS_CODE).json(result);
  }

  returnList(entities: D[] | object[]): void {
    const _entities = entities.map((entity) => {
      return this.mapper ? this.mapper.toDTO(entity as D) : entity;
    });

    this.response.status(ExpressPresenter.LIST_HTTP_STATUS_CODE).json(_entities);
  }

  returnEmpty(): void {
    this.response.status(ExpressPresenter.EMPTY_HTTP_STATUS_CODE).send();
  } */
}

export default ExpressPresenter;
