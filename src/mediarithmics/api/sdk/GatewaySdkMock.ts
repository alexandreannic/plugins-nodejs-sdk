import {IGatewaySdk} from './GatewaySdk';

// Utils type than extract type wrapped in a promise, e.g:
// const func = () => Promise.resolve(1);
// const x: ThenArg<typeof func> = await func();
type ThenArg<T> = T extends Promise<infer U>
  ? U
  : T extends ((...args: any[]) => Promise<infer V>) ? V : T

// Tell to the compiler that M is a key of IGatewaySdk and return the related function
type SdkMethod<M> = IGatewaySdk[Extract<M, keyof IGatewaySdk>];

type GatewaySdkMockProps<T> = { [K in keyof T]: ReturnType<SdkMethod<K>> | ReturnType<SdkMethod<K>>[] }

type GatewaySdkMockCall<T> = {
  [K in keyof T]: {
    getArgs: (callNumber: number) => Parameters<SdkMethod<K>> | undefined
    calledTime: () => number
  }
}

type GatewaySdkMock<T> = IGatewaySdk & {calledMethods: GatewaySdkMockCall<T>}

export const newGatewaySdkMock = <T = Partial<IGatewaySdk>>(mocks: GatewaySdkMockProps<T>): GatewaySdkMock<T> => {

  const methods = Object.keys(mocks) as (keyof GatewaySdkMockProps<T>)[];

  const initObject = <I>(initializer: (name: keyof GatewaySdkMockProps<T>) => I): { [key in keyof T]: I } => {
    return methods.reduce((acc: { [K in keyof T]: I }, funcName: keyof GatewaySdkMockProps<T>) => {
      acc[funcName] = initializer(funcName);
      return acc;
    }, {} as { [K in keyof T]: I });
  };

  const getMockedValue = (funcName: keyof GatewaySdkMockProps<T>, callCount: number): any => {
    const mock = mocks[funcName];
    return Array.isArray(mock) ? mock[callCount] : mock;
  };

  const calledArgs = initObject<any[]>(funcName => []);
  const callsCounter = initObject(funcName => 0);
  const calledMethods: GatewaySdkMockCall<T> = initObject(funcName => ({
    getArgs: (callNumber: number) => calledArgs[funcName][callNumber],
    calledTime: () => calledArgs[funcName].length,
  }));
  const mockedFunctions = initObject(funcName => (...args: any[]) => {
    calledArgs[funcName].push(args);
    return getMockedValue(funcName, callsCounter[funcName]++);
  });

  // const mocked = methods.reduce((acc: GatewaySdkMock<T>, name: keyof GatewaySdkMockProps<T>) => {
  //   callsCounter[name] = 0;
  //   calledArgs[name] = [];
  //   calledMethods[name] = {
  //     getArgs: (callNumber: number) => calledArgs[name][callNumber],
  //     calledTime: () => calledArgs[name].length,
  //   };
  //   acc[name] = ((...args: any[]) => {
  //     calledArgs[name].push(args);
  //     return Promise.resolve(mocks[name]);
  //   }) as any;
  //   return acc;
  // }, {} as GatewaySdkMock<T>);

  return {
    ...mockedFunctions as unknown as IGatewaySdk,
    calledMethods,
  };
};
