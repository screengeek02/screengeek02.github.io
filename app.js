const next = require('next');
const http = require('http');

const port = parseInt(process.env.PORT || '3000', 10);
const hostname = process.env.HOSTNAME || '0.0.0.0';
const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http
    .createServer((req, res) => {
      handle(req, res);
    })
    .listen(port, hostname, () => {
      // eslint-disable-next-line no-console
      console.log(`Helio Service Scheduler running on http://${hostname}:${port}`);
    });
});

