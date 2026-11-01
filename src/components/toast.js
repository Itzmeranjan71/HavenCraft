import { icons } from '../utils/icons.js';

class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  }

  show(message, type = 'info', duration = 3500) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconSvg = icons.sparkles;
    if (type === 'success') iconSvg = icons.check;
    if (type === 'error') iconSvg = icons.close;

    toast.innerHTML = `
      <div style="flex-shrink: 0; display:flex; align-items:center;">${iconSvg}</div>
      <div style="flex-grow: 1; font-weight: 500;">${message}</div>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  success(msg) {
    this.show(msg, 'success');
  }

  info(msg) {
    this.show(msg, 'info');
  }

  error(msg) {
    this.show(msg, 'error');
  }
}

export const toast = new ToastManager();
