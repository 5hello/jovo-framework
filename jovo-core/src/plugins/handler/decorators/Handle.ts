import { BaseComponent } from '../../../BaseComponent';
import { HandleOptions, HandlerMetadata } from '../metadata/HandlerMetadata';
import { MetadataStorage } from '../metadata/MetadataStorage';

export function Handle<
  COMPONENT extends BaseComponent = BaseComponent,
  KEY extends keyof COMPONENT = keyof COMPONENT
>(options?: HandleOptions<COMPONENT>): MethodDecorator {
  return function (target, propertyKey, descriptor: unknown) {
    MetadataStorage.getInstance().addHandlerMetadata(
      new HandlerMetadata<COMPONENT, KEY>(
        target.constructor,
        propertyKey as KEY,
        descriptor as TypedPropertyDescriptor<COMPONENT[KEY]>,
        options,
      ),
    );
  };
}
