import { ComponentData, StateStack } from './index';
import { Jovo } from './Jovo';
import { JovoProxy } from './JovoProxy';
import { ComponentOptions, RegisteredComponentMetadata } from './metadata/ComponentMetadata';

export interface RegisteredComponents {
  [key: string]: RegisteredComponentMetadata | undefined;
}

export type ComponentConstructor<COMPONENT extends BaseComponent = BaseComponent> = new (
  jovo: Jovo,
  ...args: unknown[]
) => COMPONENT;

export type ComponentConfig<
  COMPONENT extends BaseComponent = BaseComponent
> = COMPONENT['$component']['$config'];

export class ComponentDeclaration<
  COMPONENT_CONSTRUCTOR extends ComponentConstructor = ComponentConstructor
> {
  constructor(
    readonly component: COMPONENT_CONSTRUCTOR,
    readonly options?: ComponentOptions<InstanceType<COMPONENT_CONSTRUCTOR>>,
  ) {}
}

export abstract class BaseComponent<
  CONFIG extends Record<string, unknown> = Record<string, unknown>
> extends JovoProxy {
  get $component(): { $data: ComponentData; $config: CONFIG | undefined } {
    return super.$component as { $data: ComponentData; $config: CONFIG | undefined };
  }
}
