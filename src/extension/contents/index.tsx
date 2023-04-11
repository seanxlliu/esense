import type { PlasmoCSConfig } from 'plasmo';
import { createPortal } from 'react-dom';
import AmazonDp from '../modules/amazon-ap/app';

export const config: PlasmoCSConfig = {
  matches: ['https://www.amazon.com/*', 'http://localhost:82/*'],
  all_frames: true
};

const initialize = (afterContainer: string) => {
  const name = 'esene-extension-container';
  const existElement = document.querySelector(`[data-extension="${name}"]`);

  if (existElement) return existElement;

  const element = document.createElement('div');
  element.setAttribute('data-extension', name);
  const nextElement = document.querySelector(afterContainer);
  nextElement?.parentNode?.insertBefore(element, nextElement);

  return element;
};

const matchGroup: {
  path: RegExp;
  afterContainer: string;
  component: JSX.Element;
}[] = [
  {
    path: /^\/Surprise-Mini-Brands-Amazon-Exclusive\/dp/,
    afterContainer: '#dp-container',
    component: <AmazonDp />
  }
];

const InjectContent = (): JSX.Element | null => {
  const inject = matchGroup.find(({ path }) =>
    path.test(window.location.pathname)
  );
  if (!inject) return null;

  const container = initialize(inject.afterContainer);

  return createPortal(<>{inject.component}</>, container);
};

export default InjectContent;
