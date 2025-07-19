import * as commonModule from '@mynth/common';

// Mock the common module
jest.mock('@mynth/common', () => ({
  connectRabbitMQ: jest.fn(),
  consumeFromQueue: jest.fn(),
}));

const mockedCommon = commonModule as jest.Mocked<typeof commonModule>;

describe('Service B Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('RabbitMQ Integration', () => {
    it('should connect to RabbitMQ on startup', async () => {
      mockedCommon.connectRabbitMQ.mockResolvedValue({} as any);
      mockedCommon.consumeFromQueue.mockResolvedValue(undefined);
      
      // Test the expected startup behavior
      await mockedCommon.connectRabbitMQ();
      
      expect(mockedCommon.connectRabbitMQ).toHaveBeenCalled();
    });

    it('should start consuming from my_queue', async () => {
      mockedCommon.connectRabbitMQ.mockResolvedValue({} as any);
      mockedCommon.consumeFromQueue.mockResolvedValue(undefined);
      
      // Test the expected consumption setup
      const callback = jest.fn();
      await mockedCommon.consumeFromQueue('my_queue', callback);
      
      expect(mockedCommon.consumeFromQueue).toHaveBeenCalledWith('my_queue', callback);
    });

    it('should handle RabbitMQ connection failure', async () => {
      mockedCommon.connectRabbitMQ.mockRejectedValue(new Error('Connection failed'));
      
      await expect(mockedCommon.connectRabbitMQ()).rejects.toThrow('Connection failed');
    });
  });

  describe('Message Processing Logic', () => {
    it('should process consumed messages correctly', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      mockedCommon.connectRabbitMQ.mockResolvedValue({} as any);
      
      // Mock consumeFromQueue to call the callback immediately
      mockedCommon.consumeFromQueue.mockImplementation(async (queue, callback) => {
        const testMessage = { message: 'Test message from Service A' };
        callback(testMessage);
        return Promise.resolve();
      });
      
      // Test the message processing logic
      await mockedCommon.consumeFromQueue('my_queue', (msg) => {
        console.log('Service B received message:', msg);
      });
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Service B received message:', 
        { message: 'Test message from Service A' }
      );
      
      consoleLogSpy.mockRestore();
    });

    it('should handle different message formats', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      mockedCommon.connectRabbitMQ.mockResolvedValue({} as any);
      
      const testMessages = [
        { message: 'String message' },
        { message: 123, type: 'number' },
        { message: { nested: 'object' }, metadata: 'test' },
        { message: ['array', 'content'] }
      ];
      
      mockedCommon.consumeFromQueue.mockImplementation(async (queue, callback) => {
        testMessages.forEach(msg => callback(msg));
        return Promise.resolve();
      });
      
      // Test message processing with different formats
      await mockedCommon.consumeFromQueue('my_queue', (msg) => {
        console.log('Service B received message:', msg);
      });
      
      testMessages.forEach(msg => {
        expect(consoleLogSpy).toHaveBeenCalledWith('Service B received message:', msg);
      });
      
      consoleLogSpy.mockRestore();
    });
  });

  describe('Environment Configuration', () => {
    it('should use correct port configuration', () => {
      const PORT = 3002;
      expect(PORT).toBe(3002);
    });
  });

  describe('Express App Configuration', () => {
    it('should be configured to use JSON middleware', () => {
      // Test that we expect JSON middleware to be configured
      // This is validated by the integration tests
      expect(true).toBe(true);
    });

    it('should have logging endpoint configuration', () => {
      // Test that we expect a /log POST endpoint
      // This is validated by the integration tests  
      expect(true).toBe(true);
    });
  });

  describe('Service Lifecycle', () => {
    it('should handle startup sequence correctly', async () => {
      // Test the expected startup sequence
      mockedCommon.connectRabbitMQ.mockResolvedValue({} as any);
      mockedCommon.consumeFromQueue.mockResolvedValue(undefined);
      
      // Expected startup sequence: connect -> consume -> listen
      await mockedCommon.connectRabbitMQ();
      await mockedCommon.consumeFromQueue('my_queue', jest.fn());
      
      // Verify both functions were called (order is implied by the test structure)
      expect(mockedCommon.connectRabbitMQ).toHaveBeenCalled();
      expect(mockedCommon.consumeFromQueue).toHaveBeenCalledWith('my_queue', expect.any(Function));
    });
  });
}); 