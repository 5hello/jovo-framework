export enum RequestType {
  Launch = 'LAUNCH',
  Intent = 'INTENT',
  End = 'END',
  Unhandled = 'UNHANDLED',
  NewUser = 'NEW_USER',
  NewSession = 'NEW_SESSION',
  AudioPlayer = 'AUDIOPLAYER',
  OnRequest = 'ON_REQUEST',
  OnError = 'ON_ERROR',
  OnText = 'ON_TEXT',
  OnElementSelected = 'ON_ELEMENT_SELECTED',
  OnDtmf = 'ON_DTMF',
  OnInactivity = 'ON_INACTIVITY',
  Undefined = 'UNDEFINED',
  Unknown = 'UNKNOWN',
}

export type RequestTypeLike = RequestType | `${RequestType}`;

export enum InternalSessionProperty {
  State = '_JOVO_STATE_',
}

export enum InternalIntent {
  Start = 'START',
  Unhandled = 'UNHANDLED',
}
