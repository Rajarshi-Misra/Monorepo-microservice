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

  app.use(express.json());

  app.post('/log', (req, res) => {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    console.log('Service B log:', message);
    res.json({ status: 'Logged' });
  });

  app.listen(PORT, () => console.log(`Service B on port ${PORT}`));
})();
