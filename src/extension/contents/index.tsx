import type { PlasmoCSConfig } from 'plasmo';
import { createPortal } from 'react-dom';
import AppContent from '../modules/dp-slot/app';

export const config: PlasmoCSConfig = {
  matches: ['https://www.amazon.com/*', 'http://localhost:82/*'],
  all_frames: true
};

const name = 'esene-extension-container';

const initialize = () => {
  const existElement = document.querySelector(`[data-extension="${name}"]`);

  if (existElement) return existElement;

  const element = document.createElement('div');
  element.setAttribute('data-extension', name);
  const nextElement = document.getElementById('dp-container');
  nextElement?.parentNode?.insertBefore(element, nextElement);

  return element;
};

const CustomButton = () => {
  const container = initialize();
  return <>{createPortal(<AppContent />, container)}</>;
};

export default CustomButton;
