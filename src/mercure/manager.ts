import createSubscription from './createSubscription';
import type {
  ApiPlatformAdminRecord,
  DataTransformer,
  MercureOptions,
  MercureSubscription,
} from '../types';

// store mercure subscriptions
const subscriptions: Record<string, MercureSubscription> = {};
let mercure: MercureOptions = {
  hub: null,
  jwt: null,
  topicUrl: '',
};
let dataTransform: DataTransformer = (parsedData) =>
  parsedData as ApiPlatformAdminRecord;

const stopSubscription = (sub: MercureSubscription) => {
  if (sub.subscribed && sub.eventSource && sub.eventListener) {
    sub.eventSource.removeEventListener('message', sub.eventListener);
    sub.eventSource.close();
  }
};

export default {
  subscribe: (
    resourceId: string,
    topic: string,
    callback: (document: ApiPlatformAdminRecord) => void,
  ) => {
    const sub = subscriptions[resourceId];
    if (sub !== undefined) {
      sub.count += 1;
      return;
    }

    subscriptions[resourceId] = createSubscription(
      mercure,
      topic,
      callback,
      dataTransform,
    );
  },
  unsubscribe: (resourceId: string) => {
    const sub = subscriptions[resourceId];
    if (sub === undefined) {
      return;
    }

    sub.count -= 1;

    if (sub.count <= 0) {
      stopSubscription(sub);
      delete subscriptions[resourceId];
    }
  },
  initSubscriptions: () => {
    const subKeys = Object.keys(subscriptions);
    subKeys.forEach((subKey) => {
      const sub = subscriptions[subKey];
      if (sub && !sub.subscribed) {
        subscriptions[subKey] = createSubscription(
          mercure,
          sub.topic,
          sub.callback,
          dataTransform,
        );
      }
    });
  },
  setMercureOptions: (mercureOptions: MercureOptions) => {
    mercure = mercureOptions;
  },
  setDataTransformer: (dataTransformer: DataTransformer) => {
    dataTransform = dataTransformer;
  },
};
