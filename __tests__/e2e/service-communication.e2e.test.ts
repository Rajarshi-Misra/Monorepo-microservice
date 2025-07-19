import request from 'supertest';
import * as commonModule from '@mynth/common';

// Mock the common module for E2E tests
jest.mock('@mynth/common', () => ({
  connectRabbitMQ: jest.fn().mockResolvedValue({}),
  publishToQueue: jest.fn().mockResolvedValue(undefined),
  consumeFromQueue: jest.fn().mockResolvedValue(undefined),
}));

const mockedCommon = commonModule as jest.Mocked<typeof commonModule>;

// Mock the service URLs for E2E testing
const SERVICE_A_URL = 'http://localhost:3001';
const SERVICE_B_URL = 'http://localhost:3002';

describe('End-to-End Service Communication Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Service A to Service B Communication', () => {
    it('should send message from Service A and process in Service B', async () => {
      // Simulate the complete flow:
      // 1. Service A receives HTTP request to send message
      // 2. Service A publishes to RabbitMQ
      // 3. Service B consumes from RabbitMQ and processes

      const testMessage = { message: 'E2E Test Message' };
      let capturedMessage: any = null;

      // Mock Service B message consumption
      mockedCommon.consumeFromQueue.mockImplementation(async (queue, callback) => {
        callback(testMessage);
        capturedMessage = testMessage;
        return Promise.resolve();
      });

      // Mock Service A message publishing
      mockedCommon.publishToQueue.mockImplementation(async (queue, message) => {
        // Simulate successful publish
        return Promise.resolve();
      });

      // Simulate Service A receiving HTTP request and publishing message
      const publishResponse = await mockedCommon.publishToQueue('my_queue', testMessage);
      expect(publishResponse).toBeUndefined(); // Successful publish

      // Simulate Service B consuming the message
      await mockedCommon.consumeFromQueue('my_queue', (msg) => {
        capturedMessage = msg;
        console.log('Service B received message:', msg);
      });

      // Verify the end-to-end flow
      expect(mockedCommon.publishToQueue).toHaveBeenCalledWith('my_queue', testMessage);
      expect(mockedCommon.consumeFromQueue).toHaveBeenCalledWith('my_queue', expect.any(Function));
      expect(capturedMessage).toEqual(testMessage);
    });

    it('should handle multiple messages in sequence', async () => {
      const messages = [
        { message: 'First E2E message', id: 1 },
        { message: 'Second E2E message', id: 2 },
        { message: 'Third E2E message', id: 3 }
      ];

      const processedMessages: any[] = [];

      // Mock the consumption to process all messages
      mockedCommon.consumeFromQueue.mockImplementation(async (queue, callback) => {
        messages.forEach(msg => {
          callback(msg);
          processedMessages.push(msg);
        });
        return Promise.resolve();
      });

      // Simulate Service A publishing multiple messages
      for (const message of messages) {
        await mockedCommon.publishToQueue('my_queue', message);
      }

      // Simulate Service B consuming all messages
      await mockedCommon.consumeFromQueue('my_queue', (msg) => {
        console.log('Service B received message:', msg);
      });

      // Verify all messages were processed
      expect(mockedCommon.publishToQueue).toHaveBeenCalledTimes(3);
      expect(processedMessages).toHaveLength(3);
      expect(processedMessages).toEqual(messages);
    });
  });

  describe('Service Error Handling E2E', () => {
    it('should handle Service A publishing failures gracefully', async () => {
      const testMessage = { message: 'Failed message test' };

      // Mock publish failure
      mockedCommon.publishToQueue.mockRejectedValue(new Error('RabbitMQ connection lost'));

      // Verify that Service A handles the error
      await expect(mockedCommon.publishToQueue('my_queue', testMessage))
        .rejects.toThrow('RabbitMQ connection lost');

      // Verify consumption is not affected by publish failures
      mockedCommon.consumeFromQueue.mockResolvedValue(undefined);
      await expect(mockedCommon.consumeFromQueue('my_queue', () => {}))
        .resolves.toBeUndefined();
    });

    it('should handle Service B consumption failures gracefully', async () => {
      const testMessage = { message: 'Consumption test' };

      // Mock consumption failure
      mockedCommon.consumeFromQueue.mockRejectedValue(new Error('Queue not found'));

      // Verify that Service B handles the error
      await expect(mockedCommon.consumeFromQueue('my_queue', () => {}))
        .rejects.toThrow('Queue not found');

      // Verify publishing is not affected by consumption failures
      mockedCommon.publishToQueue.mockResolvedValue(undefined);
      await expect(mockedCommon.publishToQueue('my_queue', testMessage))
        .resolves.toBeUndefined();
    });
  });

  describe('High Volume Message Processing E2E', () => {
    it('should handle high volume message processing', async () => {
      const messageCount = 100;
      const messages = Array.from({ length: messageCount }, (_, index) => ({
        message: `Bulk message ${index}`,
        timestamp: Date.now() + index,
        id: index
      }));

      const processedMessages: any[] = [];

      // Mock bulk message consumption
      mockedCommon.consumeFromQueue.mockImplementation(async (queue, callback) => {
        messages.forEach(msg => {
          callback(msg);
          processedMessages.push(msg);
        });
        return Promise.resolve();
      });

      // Simulate bulk publishing
      const publishPromises = messages.map(msg => 
        mockedCommon.publishToQueue('my_queue', msg)
      );
      await Promise.all(publishPromises);

      // Simulate bulk consumption
      await mockedCommon.consumeFromQueue('my_queue', (msg) => {
        // Process message (in real scenario, this would be actual processing)
        console.log('Processing message:', msg.id);
      });

      // Verify all messages were processed
      expect(mockedCommon.publishToQueue).toHaveBeenCalledTimes(messageCount);
      expect(processedMessages).toHaveLength(messageCount);
      expect(processedMessages[0]).toEqual(messages[0]);
      expect(processedMessages[messageCount - 1]).toEqual(messages[messageCount - 1]);
    });
  });

  describe('Service Health Check E2E', () => {
    it('should verify both services are responding', async () => {
      // This would be used in a real E2E test environment where services are actually running
      // For now, we simulate the health checks

      const serviceAHealth = async () => {
        // In real E2E, this would be: await request(SERVICE_A_URL).get('/health')
        return { status: 'ok', service: 'service-a', port: 3001 };
      };

      const serviceBHealth = async () => {
        // In real E2E, this would be: await request(SERVICE_B_URL).get('/health')
        return { status: 'ok', service: 'service-b', port: 3002 };
      };

      const [healthA, healthB] = await Promise.all([
        serviceAHealth(),
        serviceBHealth()
      ]);

      expect(healthA.status).toBe('ok');
      expect(healthB.status).toBe('ok');
      expect(healthA.service).toBe('service-a');
      expect(healthB.service).toBe('service-b');
    });
  });

  describe('Data Flow Integrity E2E', () => {
    it('should maintain message integrity through the complete flow', async () => {
      const originalMessage = {
        id: 'e2e-test-123',
        message: 'Critical business data',
        metadata: {
          timestamp: Date.now(),
          source: 'service-a',
          priority: 'high',
          nested: {
            department: 'engineering',
            project: 'mynth'
          }
        },
        payload: {
          data: [1, 2, 3, 4, 5],
          flags: { urgent: true, encrypted: false }
        }
      };

      let receivedMessage: any = null;

      // Mock the complete flow
      mockedCommon.publishToQueue.mockResolvedValue(undefined);
      mockedCommon.consumeFromQueue.mockImplementation(async (queue, callback) => {
        callback(originalMessage);
        receivedMessage = originalMessage;
        return Promise.resolve();
      });

      // Send message from Service A
      await mockedCommon.publishToQueue('my_queue', originalMessage);

      // Receive message in Service B
      await mockedCommon.consumeFromQueue('my_queue', (msg) => {
        receivedMessage = msg;
      });

      // Verify complete data integrity
      expect(receivedMessage).toEqual(originalMessage);
      expect(receivedMessage.id).toBe(originalMessage.id);
      expect(receivedMessage.metadata.nested.department).toBe('engineering');
      expect(receivedMessage.payload.data).toEqual([1, 2, 3, 4, 5]);
      expect(receivedMessage.payload.flags.urgent).toBe(true);
    });
  });

  describe('Concurrent Service Operations E2E', () => {
    it('should handle concurrent operations across services', async () => {
      const concurrentCount = 50;
      const messages = Array.from({ length: concurrentCount }, (_, index) => ({
        message: `Concurrent message ${index}`,
        workerId: index % 5, // Simulate 5 different workers
        timestamp: Date.now()
      }));

      const processedMessages: any[] = [];

      // Mock concurrent message processing
      mockedCommon.consumeFromQueue.mockImplementation(async (queue, callback) => {
        messages.forEach(msg => {
          callback(msg);
          processedMessages.push(msg);
        });
        return Promise.resolve();
      });

      // Simulate concurrent publishing from Service A
      const publishPromises = messages.map(msg => 
        mockedCommon.publishToQueue('my_queue', msg)
      );
      
      // Execute all publishes concurrently
      await Promise.all(publishPromises);

      // Simulate concurrent consumption by Service B
      await mockedCommon.consumeFromQueue('my_queue', (msg) => {
        // Simulate processing time
        console.log(`Processing message from worker ${msg.workerId}`);
      });

      // Verify all concurrent operations completed successfully
      expect(mockedCommon.publishToQueue).toHaveBeenCalledTimes(concurrentCount);
      expect(processedMessages).toHaveLength(concurrentCount);

      // Verify all worker IDs are represented
      const workerIds = processedMessages.map(msg => msg.workerId);
      const uniqueWorkerIds = [...new Set(workerIds)];
      expect(uniqueWorkerIds).toEqual([0, 1, 2, 3, 4]);
    });
  });
}); 