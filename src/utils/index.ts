/* eslint-disable @typescript-eslint/restrict-template-expressions */
export const getAsin = () => {
  return window.location.pathname
    .replace(/(^\/+|\/+$)/g, '')
    .split('/')
    .pop();
};

export const transformJsonToUrlencoded = (params: Record<string, any>) => {
  const content = [];
  let key: keyof typeof params;
  for (key in params) {
    content.push(`${key}=${params[key]}`);
  }
  return content.join('&');
};

export const transformStreamToString = (
  stream: ReadableStream<Uint8Array>
): Promise<string> => {
  const reader = stream.getReader();
  // NOTE: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
  return new Response(
    new ReadableStream({
      start(controller) {
        function push() {
          void reader?.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            controller.enqueue(value);
            push();
          });
        }
        push();
      }
    }),
    {
      headers: { 'Content-Type': 'text/html' }
    }
  ).text();
};
