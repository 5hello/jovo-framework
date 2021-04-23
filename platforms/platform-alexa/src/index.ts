import { registerPlatformSpecificJovoReference } from '@jovotech/core';
import { Alexa, AlexaConfig } from './Alexa';
import { AlexaSkill } from './AlexaSkill';

declare module '@jovotech/core/dist/Extensible' {
  interface ExtensiblePluginConfig {
    Alexa?: AlexaConfig;
  }

  interface ExtensiblePlugins {
    Alexa?: Alexa;
  }
}

declare module '@jovotech/core/dist/Jovo' {
  interface Jovo {
    $alexaSkill?: AlexaSkill;
  }
}
registerPlatformSpecificJovoReference('$alexaSkill', AlexaSkill);

export * from './Alexa';
export * from './AlexaRequest';
export type { AlexaResponse } from '@jovotech/output-alexa';
export * from './AlexaSkill';
export * from './interfaces';
