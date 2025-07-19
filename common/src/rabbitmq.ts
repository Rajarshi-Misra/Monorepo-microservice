import amqp from 'amqplib';
import dotenv from 'dotenv';
import path from "path";

//In an ideal case we should make a secrets file for env variables and import consts from it
/* eslint-disable no-undef */
dotenv.config({path: path.join(__dirname, "../../.env")});
/* eslint-enable no-undef */

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  if (!process.env.RABBITMQ_URL) {
    throw new Error('RABBITMQ_URL environment variable is not set');
  }
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();
  return channel;
};

export const publishToQueue = async (queue: string, msg: object) => {
  if (!channel) throw new Error('RabbitMQ channel not initialized');
  await channel.assertQueue(queue);
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));
};

export const consumeFromQueue = async (
  queue: string,
  callback: (msg: any) => void,
) => {
  if (!channel) throw new Error('RabbitMQ channel not initialized');
  await channel.assertQueue(queue);
  channel.consume(queue, (msg) => {
    if (msg) {
      callback(JSON.parse(msg.content.toString()));
      channel.ack(msg);
    }
  });
};
