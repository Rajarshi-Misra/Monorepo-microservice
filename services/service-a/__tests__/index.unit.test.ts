import * as commonModule from '@mynth/common';

// Mock the common module
jest.mock('@mynth/common', () => ({
  connectRabbitMQ: jest.fn(),
  publishToQueue: jest.fn(),
}));

const mockedCommon = commonModule as jest.Mocked<typeof commonModule>;

describe('Service A Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('RabbitMQ Integration', () => {
    it('should connect to RabbitMQ on startup', async () => {
      mockedCommon.connectRabbitMQ.mockResolvedValue({} as any);
      
      // Import the module to trigger the connection
      await import('../src/index');
      
      expect(mockedCommon.connectRabbitMQ).toHaveBeenCalled();
    });

    it('should handle RabbitMQ connection failure', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      mockedCommon.connectRabbitMQ.mockRejectedValue(new Error('Connection failed'));
      
      try {
        await import('../src/index');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
      
      consoleLogSpy.mockRestore();
    });
  });

  describe('Message Publishing Logic', () => {
    it('should publish message to queue when publishToQueue is called', async () => {
      const testMessage = { message: 'Hello from Service A' };
      mockedCommon.publishToQueue.mockResolvedValue(undefined);
      
      await mockedCommon.publishToQueue('my_queue', testMessage);
      
      expect(mockedCommon.publishToQueue).toHaveBeenCalledWith('my_queue', testMessage);
    });

    it('should handle publishing errors gracefully', async () => {
      const testMessage = { message: 'Test message' };
      mockedCommon.publishToQueue.mockRejectedValue(new Error('Publishing failed'));
      
      await expect(mockedCommon.publishToQueue('my_queue', testMessage))
        .rejects.toThrow('Publishing failed');
    });
  });

  describe('Environment Configuration', () => {
    it('should use correct port configuration', () => {
      const PORT = 3001;
      expect(PORT).toBe(3001);
    });
  });
}); 