import { applyInterceptors } from './interceptors';

export function withInterceptors<T extends { new (...args: any[]): object }>(
  generatedClass: T,
) {
  return class extends generatedClass {
    constructor(...args: any[]) {
      super(...args);
      if ((this as any).instance) {
        applyInterceptors((this as any).instance);
      } else console.log('Instance not found on the generated class');
    }
  } as typeof generatedClass;
}
