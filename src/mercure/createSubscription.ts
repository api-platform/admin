import type {
  ApiPlatformAdminRecord,
  DataTransformer,
  MercureOptions,
  MercureSubscription,
} from '../types.js';

const createSubscription = (
  mercure: MercureOptions,
  topic: string,
  callback: (document: ApiPlatformAdminRecord) => void,
  transformData: DataTransformer = (parsedData) =>
    parsedData as ApiPlatformAdminRecord,
): MercureSubscription => {
  if (mercure.hub === null) {
    return {
      subscribed: false,
      topic,
      callback,
      count: 1,
    };
  }

  const url = new URL(mercure.hub, window.origin);
  url.searchParams.append('topic', new URL(topic, mercure.topicUrl).toString());

  if (mercure.jwt !== null) {
    document.cookie = `mercureAuthorization=${mercure.jwt}; Path=${mercure.hub}; Secure; SameSite=None`;
  }

  const eventSource = new EventSource(url.toString(), {
    withCredentials: mercure.jwt !== null,
  });
  const eventListener = (event: MessageEvent) => {
    const document = transformData(JSON.parse(event.data));
    // this callback is for updating RA's state
    callback(document);
  };
  eventSource.addEventListener('message', eventListener);

  return {
    subscribed: true,
    topic,
    callback,
    eventSource,
    eventListener,
    count: 1,
  };
};

export default createSubscription;
