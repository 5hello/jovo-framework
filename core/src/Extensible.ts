import _merge from 'lodash.merge';
import { DeepPartial } from '.';
import { MiddlewareCollection } from './MiddlewareCollection';
import { Plugin, PluginConfig } from './Plugin';

export interface ExtensiblePluginConfig {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [key: string]: object | undefined;
}

export interface ExtensiblePlugins {
  [key: string]: Plugin | undefined;
}

export interface ExtensibleConfig extends PluginConfig {
  plugin?: ExtensiblePluginConfig;
}

export type ExtensibleInitConfig<CONFIG extends ExtensibleConfig = ExtensibleConfig> = DeepPartial<
  Omit<CONFIG, 'plugin'>
> & { plugins?: Plugin[] };

export abstract class Extensible<
  CONFIG extends ExtensibleConfig = ExtensibleConfig,
  MIDDLEWARES extends string[] = string[]
> extends Plugin<CONFIG> {
  readonly plugins: ExtensiblePlugins;

  abstract readonly middlewareCollection: MiddlewareCollection<MIDDLEWARES>;

  constructor(config?: ExtensibleInitConfig<CONFIG>) {
    super((config ? { ...config, plugins: undefined } : config) as DeepPartial<CONFIG>);
    this.plugins = {};
    if (config?.plugins && config?.plugins?.length) {
      this.use(...(config.plugins as Plugin[]));
    }
  }

  use(...plugins: Plugin[]): this {
    for (let i = 0, len = plugins.length; i < len; i++) {
      const name = plugins[i].constructor.name;
      this.plugins[name] = plugins[i];
      if (plugins[i].install) {
        plugins[i].install?.(this);
      }
    }
    return this;
  }

  protected async initializePlugins(): Promise<void> {
    for (const key in this.plugins) {
      if (this.plugins.hasOwnProperty(key)) {
        const plugin = this.plugins[key];
        if (!plugin) {
          continue;
        }

        // merge config, priority: 1. constructor, 2. parent-config, 3. default-config
        const config = plugin.initConfig
          ? _merge({}, this.config.plugin?.[key] || {}, plugin.config)
          : _merge({}, plugin.config, this.config.plugin?.[key] || {});

        Object.defineProperty(plugin, 'config', {
          enumerable: true,
          value: config,
          writable: false,
        });
        if (!this.config.plugin) {
          this.config.plugin = {};
        }
        this.config.plugin[key] = config;

        if (plugin.initialize) {
          await plugin.initialize(this);
        }

        if (plugin instanceof Extensible && Object.keys(plugin.plugins).length) {
          await plugin.initializePlugins();
        }
      }
    }
  }

  protected async mountPlugins(): Promise<void> {
    for (const key in this.plugins) {
      if (this.plugins.hasOwnProperty(key)) {
        const plugin = this.plugins[key];
        if (!plugin) {
          continue;
        }

        const config = plugin.config;

        Object.defineProperty(plugin, 'config', {
          enumerable: true,
          value: config,
          writable: false,
        });
        await plugin.mount?.(this);

        if (!this.config.plugin) {
          this.config.plugin = {};
        }
        this.config.plugin[key] = config;

        if (plugin instanceof Extensible && (plugin as Extensible).plugins) {
          await plugin.mountPlugins();
        }
      }
    }
  }
}
