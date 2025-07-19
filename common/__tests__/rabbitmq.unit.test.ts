// Mock amqplib at the top level
const mockConnect = jest.fn();
const mockChannel = {
  assertQueue: jest.fn().mockResolvedValue(undefined),
  sendToQueue: jest.fn().mockReturnValue(true),
  consume: jest.fn().mockImplementation(() => {
    return Promise.resolve({ consumerTag: 'test-consumer' });
  }),
  ack: jest.fn(),
};

const mockConnection = {
  createChannel: jest.fn().mockResolvedValue(mockChannel),
};

jest.mock('amqplib', () => ({
  connect: mockConnect
}));

import { connectRabbitMQ, publishToQueue, consumeFromQueue } from '../src/rabbitmq';

describe('RabbitMQ Common Module', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    mockConnect.mockResolvedValue(mockConnection);
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.RABBITMQ_URL;
  });

  describe('connectRabbitMQ', () => {
    it('should connect successfully with valid RABBITMQ_URL', async () => {
      process.env.RABBITMQ_URL = 'amqp://localhost:5672';
      
      const result = await connectRabbitMQ();
      
      expect(mockConnect).toHaveBeenCalledWith('amqp://localhost:5672');
      expect(mockConnection.createChannel).toHaveBeenCalled();
      expect(result).toBe(mockChannel);
    });

    it('should throw error when RABBITMQ_URL is not set', async () => {
      delete process.env.RABBITMQ_URL;
      
      await expect(connectRabbitMQ()).rejects.toThrow(
        'RABBITMQ_URL environment variable is not set'
      );
    });

    it('should throw error when RABBITMQ_URL is empty string', async () => {
      process.env.RABBITMQ_URL = '';
      
      await expect(connectRabbitMQ()).rejects.toThrow(
        'RABBITMQ_URL environment variable is not set'
      );
    });

    it('should handle connection failure', async () => {
      process.env.RABBITMQ_URL = 'amqp://localhost:5672';
      mockConnect.mockRejectedValue(new Error('Connection failed'));
      
      await expect(connectRabbitMQ()).rejects.toThrow('Connection failed');
    });
  });

  describe('publishToQueue', () => {
    beforeEach(async () => {
      process.env.RABBITMQ_URL = 'amqp://localhost:5672';
      await connectRabbitMQ(); // Initialize the channel
    });

    it('should publish message to queue successfully', async () => {
      const testMessage = { text: 'Hello World', timestamp: Date.now() };
      
      await publishToQueue('test-queue', testMessage);
      
      expect(mockChannel.assertQueue).toHaveBeenCalledWith('test-queue');
      expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
        'test-queue',
        Buffer.from(JSON.stringify(testMessage))
      );
    });

    it('should handle complex message objects', async () => {
      const complexMessage = {
        id: '123',
        data: { nested: { value: 'test' } },
        array: [1, 2, 3],
        boolean: true
      };
      
      await publishToQueue('complex-queue', complexMessage);
      
      expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
        'complex-queue',
        Buffer.from(JSON.stringify(complexMessage))
      );
    });

    it('should throw error when channel is not initialized', async () => {
      // Test the actual error condition: calling publishToQueue without connecting first
      const testMessage = { text: 'Hello' };
      
      // Reset the module to simulate a fresh start without connection
      jest.resetModules();
      
      // Re-import after reset to get fresh module state
      const { publishToQueue: freshPublishToQueue } = await import('../src/rabbitmq');
      
      await expect(freshPublishToQueue('test-queue', testMessage)).rejects.toThrow(
        'RabbitMQ channel not initialized'
      );
    });
  });

  describe('consumeFromQueue', () => {
    beforeEach(async () => {
      process.env.RABBITMQ_URL = 'amqp://localhost:5672';
      await connectRabbitMQ(); // Initialize the channel
    });

    it('should consume messages from queue successfully', async () => {
      const callback = jest.fn();
      
      await consumeFromQueue('test-queue', callback);
      
      expect(mockChannel.assertQueue).toHaveBeenCalledWith('test-queue');
      expect(mockChannel.consume).toHaveBeenCalledWith('test-queue', expect.any(Function));
    });

    it('should process consumed message correctly', async () => {
      const testMessage = { text: 'Test message' };
      const callback = jest.fn();
      
      // Mock the consume method to simulate message reception
      mockChannel.consume.mockImplementation((queue, messageHandler) => {
        // Simulate receiving a message
        const mockMessage = {
          content: Buffer.from(JSON.stringify(testMessage)),
        };
        
        if (messageHandler) {
          messageHandler(mockMessage);
        }
        
        return Promise.resolve({ consumerTag: 'test-consumer' });
      });
      
      await consumeFromQueue('test-queue', callback);
      
      expect(callback).toHaveBeenCalledWith(testMessage);
      expect(mockChannel.ack).toHaveBeenCalled();
    });

    it('should handle null message correctly', async () => {
      const callback = jest.fn();
      
      // Mock consume to return null message
      mockChannel.consume.mockImplementation((queue, messageHandler) => {
        if (messageHandler) {
          messageHandler(null);
        }
        return Promise.resolve({ consumerTag: 'test-consumer' });
      });
      
      await consumeFromQueue('test-queue', callback);
      
      expect(callback).not.toHaveBeenCalled();
      expect(mockChannel.ack).not.toHaveBeenCalled();
    });

    it('should throw error when channel is not initialized', async () => {
      // Test the actual error condition: calling consumeFromQueue without connecting first
      const callback = jest.fn();
      
      // Reset the module to simulate a fresh start without connection
      jest.resetModules();
      
      // Re-import after reset to get fresh module state
      const { consumeFromQueue: freshConsumeFromQueue } = await import('../src/rabbitmq');
      
      await expect(freshConsumeFromQueue('test-queue', callback)).rejects.toThrow(
        'RabbitMQ channel not initialized'
      );
    });
  });
}); 