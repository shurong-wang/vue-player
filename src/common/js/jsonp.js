import originJsonp from 'jsonp';

export default function jsonp(url, data, option) {
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(data);

  return new Promise((resolve, reject) => {
    originJsonp(url, option, (err, data) => {
      if (!err) {
        resolve(data);
      } else {
        reject(err);
      }
    });
  });
}

export function param(data) {
  return Object.entries(data)
    .map(([key, value]) => key + '=' + encodeURIComponent(value))
    .join('&');
}
