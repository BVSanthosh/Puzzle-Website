export function setItem(key, value) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  }
  
  export function getItem(key) {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(key);
    }
    return null;
  }