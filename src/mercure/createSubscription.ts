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

  const legacy = mercure.protocolVersion === '0.x';
  const url = new URL(mercure.hub, window.origin);
  url.searchParams.append(
    legacy ? 'topic' : 'match',
    new URL(topic, mercure.topicUrl).toString(),
  );

  const eventSource = new EventSource(url.toString(), {
    withCredentials: mercure.withCredentials ?? false,
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
