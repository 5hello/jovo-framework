import { JovoResponse, OutputTemplateConverterStrategy } from '@jovotech/output';
import _merge from 'lodash.merge';
import {
  App,
  AppBaseMiddleware,
  AppBaseMiddlewares,
  ArrayElement,
  Constructor,
  HandleRequest,
  InvalidParentError,
  Jovo,
  JovoConstructor,
} from '.';
import { Extensible, ExtensibleConfig } from './Extensible';
import { JovoRequest } from './JovoRequest';
import { MiddlewareCollection } from './MiddlewareCollection';

export type PlatformBaseMiddlewares = [
  '$init',
  '$request',
  '$session',
  '$user',
  '$type',
  '$asr',
  '$nlu',
  '$inputs',
  '$output',
  '$response',
];

export type PlatformBaseMiddleware = ArrayElement<PlatformBaseMiddlewares>;

export const BASE_PLATFORM_MIDDLEWARES: PlatformBaseMiddlewares = [
  '$init',
  '$request',
  '$session',
  '$user',
  '$type',
  '$asr',
  '$nlu',
  '$inputs',
  '$output',
  '$response',
];

export abstract class Platform<
  REQUEST extends JovoRequest = JovoRequest,
  RESPONSE extends JovoResponse = JovoResponse,
  CONFIG extends ExtensibleConfig = ExtensibleConfig
> extends Extensible<CONFIG, PlatformBaseMiddlewares> {
  abstract readonly requestClass: Constructor<REQUEST>;
  abstract readonly jovoClass: JovoConstructor<REQUEST, RESPONSE>;

  abstract outputTemplateConverterStrategy: OutputTemplateConverterStrategy<RESPONSE>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract isRequestRelated(request: REQUEST | Record<string, any>): boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract isResponseRelated(response: RESPONSE | Record<string, any>): boolean;

  // TODO: Determine whether this should be moved into Jovo. That would require changes in BaseComponent and BaseOutput.
  abstract prepareResponse(
    response: RESPONSE | RESPONSE[],
    jovo: Jovo,
  ): RESPONSE | RESPONSE[] | Promise<RESPONSE> | Promise<RESPONSE[]>;

  abstract setResponseSessionData(response: RESPONSE | RESPONSE[], jovo: Jovo): this;

  initializeMiddlewareCollection(): MiddlewareCollection<PlatformBaseMiddlewares> {
    return new MiddlewareCollection<PlatformBaseMiddlewares>(...BASE_PLATFORM_MIDDLEWARES);
  }

  install(parent: Extensible) {
    if (!(parent instanceof App)) {
      throw new InvalidParentError();
    }
  }

  mount(parent: HandleRequest) {
    const propagateMiddleware = (
      appMiddleware: AppBaseMiddleware,
      middleware: PlatformBaseMiddleware,
    ) => {
      parent.middlewareCollection.use(appMiddleware, async (...args: unknown[]) => {
        if (parent.$platform?.constructor?.name !== this.constructor.name) {
          return;
        }
        await this.middlewareCollection.run(middleware, ...args);
      });
    };

    // TODO determine actual middleware mappings and add missing ones
    propagateMiddleware('request', '$request');
    propagateMiddleware('interpretation.asr', '$asr');
    propagateMiddleware('interpretation.nlu', '$nlu');
  }

  createJovoInstance<APP extends App>(
    app: APP,
    handleRequest: HandleRequest,
  ): Jovo<REQUEST, RESPONSE> {
    return new this.jovoClass(app, handleRequest, this);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createRequestInstance(request: REQUEST | Record<string, any>): REQUEST {
    const instance = new this.requestClass();
    _merge(instance, request);
    return instance;
  }
}
