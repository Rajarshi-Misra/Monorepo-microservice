import amqp from 'amqplib';

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  const connection = await amqp.connect('amqp://guest:guest@localhost:5672'); // hostname from Docker
  channel = await connection.createChannel();
  return channel;
};

export const publishToQueue = async (queue: string, msg: object) => {
  if (!channel) throw new Error('RabbitMQ channel not initialized');
  await channel.assertQueue(queue);
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));
};

export const consumeFromQueue = async (queue: string, callback: (msg: any) => void) => {
  if (!channel) throw new Error('RabbitMQ channel not initialized');
  await channel.assertQueue(queue);
  channel.consume(queue, (msg) => {
    if (msg) {
      callback(JSON.parse(msg.content.toString()));
      channel.ack(msg);
    }
  });
};
