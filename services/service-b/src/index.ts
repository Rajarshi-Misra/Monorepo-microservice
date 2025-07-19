import express from 'express';
import { connectRabbitMQ, consumeFromQueue } from '@mynth/common';

const app = express();
const PORT = 3002;

(async () => {
  await connectRabbitMQ();
  console.log('RabbitMQ connected for Service B');

  await consumeFromQueue('my_queue', (msg) => {
    console.log('Service B received message:', msg);
    // process the message
  });

  app.listen(PORT, () => console.log(`Service B on port ${PORT}`));
})();
