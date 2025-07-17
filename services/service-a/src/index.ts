import express from 'express';
import { connectRabbitMQ, publishToQueue } from '../../../common/src/rabbitmq';

const app = express();
const PORT = 3001;
app.use(express.json());

app.post('/send', async (req, res) => {
  const { message } = req.body;
  try {
    await publishToQueue('my_queue', { message });
    res.json({ status: 'Message sent' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

(async () => {
  await connectRabbitMQ();
  console.log('RabbitMQ connected for Service A');
  app.listen(PORT, () => console.log(`Service A on port ${PORT}`));
})();
