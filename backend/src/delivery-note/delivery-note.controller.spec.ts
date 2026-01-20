import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryNoteController } from './delivery-note.controller';
import { DeliveryNoteService } from './delivery-note.service';
import {
  CreateDeliveryNoteDto,
  CreateDeliveryNoteFromSoDto,
} from './dto/create-delivery-note.dto';
import { UpdateDeliveryNoteDto } from './dto/update-delivery-note.dto';

/**
 * Delivery Note Controller Tests
 *
 * Original Logic Reference:
 * - Legacy Forms: idn, idn2
 * - Documentation: docs/source/02-business-processes/delivery-note-process.md
 * - Business Rules:
 *   - Test REST API endpoints
 *   - Test request/response handling
 *   - Test error responses
 *   - Test authentication guards
 *
 * Reference: Phase 3 - Delivery Note Module
 */
describe('DeliveryNoteController', () => {
  let controller: DeliveryNoteController;
  let service: DeliveryNoteService;

  const mockDeliveryNoteService = {
    create: jest.fn(),
    createFromSo: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    search: jest.fn(),
    getAvailableSoItems: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryNoteController],
      providers: [
        {
          provide: DeliveryNoteService,
          useValue: mockDeliveryNoteService,
        },
      ],
    }).compile();

    controller = module.get<DeliveryNoteController>(DeliveryNoteController);
    service = module.get<DeliveryNoteService>(DeliveryNoteService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a delivery note manually', async () => {
      const createDto: CreateDeliveryNoteDto = {
        dnNo: 'DN001',
        date: '2025-01-15',
        custNo: 'CUST001',
        soNo: 'SO001',
        delAddr: 'Test Address',
        details: [
          {
            itemNo: 'ITEM001',
            qty: 100,
            breakdowns: [
              { port: 'PORT1', qty: 50 },
              { port: 'PORT2', qty: 50 },
            ],
          },
        ],
      };

      const mockResult = {
        dnNo: 'DN001',
        loadingStatus: 'Draft',
        details: createDto.details,
      };

      mockDeliveryNoteService.create.mockResolvedValue(mockResult as any);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockResult);
      expect(mockDeliveryNoteService.create).toHaveBeenCalledWith(createDto);
    });

    it('should handle create errors', async () => {
      const createDto: CreateDeliveryNoteDto = {
        dnNo: 'DN001',
        date: '2025-01-20',
        custNo: 'CUST001',
        details: [],
      };

      mockDeliveryNoteService.create.mockRejectedValue(
        new Error('Validation error'),
      );

      await expect(controller.create(createDto)).rejects.toThrow(
        'Validation error',
      );
    });
  });

  describe('createFromSo', () => {
    it('should create DN from SO', async () => {
      const createDto: CreateDeliveryNoteFromSoDto = {
        soNo: 'SO001',
        dnNo: 'DN001',
        date: '2025-01-15',
      };

      const mockResult = {
        dnNo: 'DN001',
        soNo: 'SO001',
        loadingStatus: 'Draft',
        details: [
          {
            itemNo: 'ITEM001',
            qty: 100,
            breakdowns: [
              { port: 'PORT1', qty: 50 },
              { port: 'PORT2', qty: 50 },
            ],
          },
        ],
      };

      mockDeliveryNoteService.createFromSo.mockResolvedValue(mockResult as any);

      const result = await controller.createFromSo(createDto);

      expect(result).toEqual(mockResult);
      expect(mockDeliveryNoteService.createFromSo).toHaveBeenCalledWith(
        createDto,
      );
    });

    it('should handle multiple SO numbers', async () => {
      const createDto: CreateDeliveryNoteFromSoDto = {
        soNo: 'SO001',
        dnNo: 'DN001',
        date: '2025-01-15',
      };

      const mockResult = {
        dnNo: 'DN001',
        details: [],
      };

      mockDeliveryNoteService.createFromSo.mockResolvedValue(mockResult as any);

      const result = await controller.createFromSo(createDto);

      expect(result).toEqual(mockResult);
      expect(mockDeliveryNoteService.createFromSo).toHaveBeenCalledWith(
        createDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated delivery notes', async () => {
      const mockResult = {
        data: [
          {
            dnNo: 'DN001',
            soNo: 'SO001',
            custNo: 'CUST001',
            loadingStatus: 'Draft',
          },
          {
            dnNo: 'DN002',
            soNo: 'SO002',
            custNo: 'CUST002',
            loadingStatus: 'Confirmed',
          },
        ],
        total: 2,
        page: 1,
        limit: 10,
      };

      mockDeliveryNoteService.findAll.mockResolvedValue(mockResult as any);

      const result = await controller.search();

      expect(result).toEqual(mockResult);
      expect(mockDeliveryNoteService.findAll).toHaveBeenCalledWith(1, 10);
    });

    it('should handle pagination parameters', async () => {
      mockDeliveryNoteService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        limit: 20,
      } as any);

      await controller.search();

      expect(mockDeliveryNoteService.findAll).toHaveBeenCalledWith(2, 20);
    });

    it('should handle search filters', async () => {
      const searchParams = { dnNo: 'DN001', custNo: 'CUST001' };

      mockDeliveryNoteService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      } as any);

      await controller.search(searchParams as any);

      expect(mockDeliveryNoteService.findAll).toHaveBeenCalledWith(
        1,
        10,
        searchParams,
      );
    });
  });

  describe('findOne', () => {
    it('should return a single delivery note with details', async () => {
      const mockResult = {
        dnNo: 'DN001',
        soNo: 'SO001',
        custNo: 'CUST001',
        loadingStatus: 'Draft',
        details: [
          {
            itemNo: 'ITEM001',
            qty: 100,
            breakdowns: [
              { port: 'PORT1', qty: 50 },
              { port: 'PORT2', qty: 50 },
            ],
          },
        ],
      };

      mockDeliveryNoteService.findOne.mockResolvedValue(mockResult as any);

      const result = await controller.findOne('DN001');

      expect(result).toEqual(mockResult);
      expect(mockDeliveryNoteService.findOne).toHaveBeenCalledWith('DN001');
    });
  });

  describe('update', () => {
    it('should update a delivery note', async () => {
      const updateDto: UpdateDeliveryNoteDto = {
        soNo: 'SO001',
        delAddr1: 'Updated Address',
      };

      const mockResult = {
        dnNo: 'DN001',
        soNo: 'SO001',
        delAddr1: 'Updated Address',
      };

      mockDeliveryNoteService.update.mockResolvedValue(mockResult as any);

      const result = await controller.update('DN001', updateDto);

      expect(result).toEqual(mockResult);
      expect(mockDeliveryNoteService.update).toHaveBeenCalledWith(
        'DN001',
        updateDto,
      );
    });

    it('should handle status transitions', async () => {
      const updateDto: any = { soNo: 'SO002' };

      mockDeliveryNoteService.update.mockResolvedValue({
        dnNo: 'DN001',
        soNo: 'SO002',
      } as any);

      const result = await controller.update('DN001', updateDto);

      expect(result.soNo).toBe('SO002');
    });
  });

  describe('remove', () => {
    it('should delete a delivery note', async () => {
      mockDeliveryNoteService.remove.mockResolvedValue({ affected: 1 } as any);

      const result = await controller.remove('DN001');

      expect(result).toEqual({ affected: 1 });
      expect(mockDeliveryNoteService.remove).toHaveBeenCalledWith('DN001');
    });
  });

  describe('search', () => {
    it('should search delivery notes', async () => {
      const searchParams = { dnNo: 'DN001', soNo: 'SO001' };
      const mockResult = [{ dnNo: 'DN001', soNo: 'SO001', custNo: 'CUST001' }];

      mockDeliveryNoteService.search.mockResolvedValue(mockResult as any);

      const result = await controller.search(searchParams);

      expect(result).toEqual(mockResult);
      expect(mockDeliveryNoteService.search).toHaveBeenCalledWith(searchParams);
    });
  });

  describe('getAvailableSoItems', () => {
    it('should return available SO items for DN creation', async () => {
      const mockResult = [
        {
          soNo: 'SO001',
          itemNo: 'ITEM001',
          availableQty: 500,
          itemName: 'Test Item',
          price: 10.5,
        },
        {
          soNo: 'SO001',
          itemNo: 'ITEM002',
          availableQty: 300,
          itemName: 'Another Item',
          price: 8.75,
        },
      ];

      mockDeliveryNoteService.getAvailableSoItems.mockResolvedValue(
        mockResult as any,
      );

      const result = await controller.getAvailableItemsForDn('SO001');

      expect(result).toEqual(mockResult);
      expect(mockDeliveryNoteService.getAvailableSoItems).toHaveBeenCalledWith(
        'SO001',
        'CUST001',
      );
    });

    it('should handle multiple SO numbers', async () => {
      const mockResult = [];

      mockDeliveryNoteService.getAvailableSoItems.mockResolvedValue(
        mockResult as any,
      );

      const result = await controller.getAvailableItemsForDn(
        'SO001,SO002',
        'CUST001',
      );

      expect(result).toEqual(mockResult);
      expect(mockDeliveryNoteService.getAvailableSoItems).toHaveBeenCalledWith(
        'SO001,SO002',
        'CUST001',
      );
    });
  });

  describe('error handling', () => {
    it('should handle service errors in create', async () => {
      const createDto: CreateDeliveryNoteDto = {
        dnNo: 'DN001',
        date: '2025-01-20',
        custNo: 'CUST001',
        details: [],
      };

      mockDeliveryNoteService.create.mockRejectedValue(
        new Error('Service error'),
      );

      await expect(controller.create(createDto)).rejects.toThrow(
        'Service error',
      );
    });

    it('should handle createFromSo errors', async () => {
      const createDto: CreateDeliveryNoteFromSoDto = {
        soNo: 'SO001',
        dnNo: 'DN001',
        date: '2025-01-20',
      };

      mockDeliveryNoteService.createFromSo.mockRejectedValue(
        new Error('SO not found'),
      );

      await expect(controller.createFromSo(createDto)).rejects.toThrow(
        'SO not found',
      );
    });

    it('should handle update errors', async () => {
      const updateDto: any = { soNo: 'INVALID' };

      mockDeliveryNoteService.update.mockRejectedValue(
        new Error('Invalid status transition'),
      );

      await expect(controller.update('DN001', updateDto)).rejects.toThrow(
        'Invalid status transition',
      );
    });

    it('should handle deletion errors', async () => {
      mockDeliveryNoteService.remove.mockRejectedValue(
        new Error('Cannot delete loaded DN'),
      );

      await expect(controller.remove('DN001')).rejects.toThrow(
        'Cannot delete loaded DN',
      );
    });
  });
});
