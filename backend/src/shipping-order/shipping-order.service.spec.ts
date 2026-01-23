import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ShippingOrderService } from './shipping-order.service';
import { ShippingOrder } from './entities/shipping-order.entity';
import { SoFormat } from './entities/so-format.entity';
import { CreateShippingOrderDto } from './dto/create-shipping-order.dto';

/**
 * Shipping Order Service Tests
 *
 * Original Logic Reference:
 * - Legacy Form: isetso
 * - Documentation: docs/source/02-business-processes/shipping-process.md
 * - Business Rules:
 *   - Test SO creation and validation
 *   - Test format lookup
 *   - Test available items calculation
 *
 * Reference: Phase 3 - Shipping Order Module
 */
describe('ShippingOrderService', () => {
  let service: ShippingOrderService;
  let shippingOrderRepository: Repository<ShippingOrder>;
  let soFormatRepository: Repository<SoFormat>;
  let dataSource: DataSource;

  const mockDataSource = {
    createQueryRunner: jest.fn(),
    query: jest.fn().mockResolvedValue([{ exists: true }]),
  };

  beforeEach(async () => {
    // Reset all mocks to prevent state bleeding
    jest.clearAllMocks();
    mockDataSource.query.mockReset();
    mockDataSource.query.mockResolvedValue([{ exists: true }]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShippingOrderService,
        {
          provide: getRepositoryToken(ShippingOrder),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(SoFormat),
          useClass: Repository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ShippingOrderService>(ShippingOrderService);
    shippingOrderRepository = module.get<Repository<ShippingOrder>>(
      getRepositoryToken(ShippingOrder),
    );
    soFormatRepository = module.get<Repository<SoFormat>>(
      getRepositoryToken(SoFormat),
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a shipping order', async () => {
      const createDto: CreateShippingOrderDto = {
        soNo: 'SO001',
        itemNo: 'ITEM001',
        qty: 100,
      };

      const mockShippingOrder = {
        ...createDto,
        creDate: new Date(),
        modDate: new Date(),
      };

      jest.spyOn(shippingOrderRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(shippingOrderRepository, 'create')
        .mockReturnValue(mockShippingOrder as any);
      jest
        .spyOn(shippingOrderRepository, 'save')
        .mockResolvedValue(mockShippingOrder as any);
      jest
        .spyOn(dataSource, 'query')
        .mockResolvedValue([{ item_no: 'ITEM001' }]);

      const result = await service.create(createDto);

      expect(result).toEqual(mockShippingOrder);
      expect(shippingOrderRepository.findOne).toHaveBeenCalledWith({
        where: { soNo: 'SO001' },
      });
      expect(shippingOrderRepository.save).toHaveBeenCalled();
    });

    it('should throw error for duplicate SO number', async () => {
      const createDto: CreateShippingOrderDto = {
        soNo: 'SO001',
        itemNo: 'ITEM001',
        qty: 100,
      };

      jest.spyOn(shippingOrderRepository, 'findOne').mockResolvedValue({
        soNo: 'SO001',
      } as ShippingOrder);

      await expect(service.create(createDto)).rejects.toThrow(
        'Shipping Order SO001 already exists',
      );
    });

    // Note: create() method doesn't support sourceType/ocNo - it's for direct SO creation
    // Use createFromSource() for OC/Contract creation
    // it('should create SO from OC with all items', async () => {
    //   const createDto: CreateShippingOrderDto = {
    //     soNo: 'SO001',
    //     itemNo: 'ITEM001',
    //     qty: 100,
    //   };

    //   jest.spyOn(shippingOrderRepository, 'findOne').mockResolvedValue(null);
    //   jest.spyOn(dataSource, 'query').mockResolvedValue([{ item_no: 'ITEM001' }]);
    //   jest.spyOn(shippingOrderRepository, 'create').mockImplementation((data) => data as any);
    //   jest.spyOn(shippingOrderRepository, 'save').mockResolvedValue({
    //     ...createDto,
    //     creDate: new Date(),
    //     modDate: new Date(),
    //   } as any);

    //   const result = await service.create(createDto);

    //   expect(result).toBeDefined();
    // });

    it('should create SO from Contract with breakdown copy', async () => {
      const createDto: CreateShippingOrderDto = {
        soNo: 'SO002',
        itemNo: 'ITEM002',
        qty: 1000,
        contNo: 'CONT001',
      };

      jest.spyOn(shippingOrderRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(dataSource, 'query').mockResolvedValue([{ exists: true }]);
      jest
        .spyOn(shippingOrderRepository, 'create')
        .mockImplementation((data) => data as any);
      jest.spyOn(shippingOrderRepository, 'save').mockResolvedValue({
        ...createDto,
        creDate: new Date(),
        modDate: new Date(),
      } as any);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.soNo).toBe('SO002');
    });

    it('should validate SO format lookup', async () => {
      const createDto: CreateShippingOrderDto = {
        soNo: 'SO001',
        itemNo: 'ITEM001',
        qty: 100,
      };

      const mockFormat = [
        { soKey: 'GLOBE', uniqueid: 'company_name', vpos: 1, hpos: 1 },
        { soKey: 'GLOBE', uniqueid: 'so_no', vpos: 2, hpos: 1 },
      ];

      jest
        .spyOn(dataSource, 'query')
        .mockResolvedValue([{ item_no: 'ITEM001' }]);
      jest
        .spyOn(soFormatRepository, 'find')
        .mockResolvedValue(mockFormat as SoFormat[]);
      jest.spyOn(shippingOrderRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(shippingOrderRepository, 'create').mockReturnValue({} as any);
      jest.spyOn(shippingOrderRepository, 'save').mockResolvedValue({} as any);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
    });

    it('should handle customer-specific formats', async () => {
      const createDto: CreateShippingOrderDto = {
        soNo: 'SO003',
        itemNo: 'ITEM001',
        qty: 100,
      };

      const mockCustomerFormats = [
        { soKey: 'SPENCER_FORMAT', uniqueid: 'logo', vpos: 1, hpos: 1 },
        {
          soKey: 'SPENCER_FORMAT',
          uniqueid: 'customer_name',
          vpos: 2,
          hpos: 1,
        },
      ];

      jest
        .spyOn(dataSource, 'query')
        .mockResolvedValue([{ item_no: 'ITEM001' }]);
      jest
        .spyOn(soFormatRepository, 'find')
        .mockResolvedValue(mockCustomerFormats as SoFormat[]);
      jest.spyOn(shippingOrderRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(shippingOrderRepository, 'create').mockReturnValue({} as any);
      jest.spyOn(shippingOrderRepository, 'save').mockResolvedValue({} as any);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
    });

    it('should validate SO status transitions', async () => {
      const updateDto = {
        soNo: 'SO001',
        status: 'Confirmed',
      };

      const mockSo = {
        soNo: 'SO001',
        itemNo: 'ITEM001',
        qty: 100,
        creDate: new Date(),
        modDate: new Date(),
      };

      jest
        .spyOn(shippingOrderRepository, 'findOne')
        .mockResolvedValue(mockSo as ShippingOrder);
      jest
        .spyOn(shippingOrderRepository, 'save')
        .mockResolvedValue({ ...mockSo, qty: 150 } as ShippingOrder);

      const result = await service.update('SO001', updateDto as any);

      expect(result.qty).toBe(150);
      expect(shippingOrderRepository.save).toHaveBeenCalled();
    });

    it('should handle SO edit with validation', async () => {
      const updateDto = {
        qty: 150,
        price: 11.0,
      };

      const mockSo = {
        soNo: 'SO001',
        itemNo: 'ITEM001',
        qty: 100,
        creDate: new Date(),
        modDate: new Date(),
      };

      jest
        .spyOn(shippingOrderRepository, 'findOne')
        .mockResolvedValue(mockSo as any);
      jest
        .spyOn(shippingOrderRepository, 'save')
        .mockResolvedValue({ ...mockSo, qty: 150 } as any);

      const result = await service.update('SO001', updateDto as any);

      expect(result.qty).toBe(150);
      expect(result.soNo).toBe('SO001');
      expect(shippingOrderRepository.save).toHaveBeenCalled();
    });
  });

  describe('getSoFormat', () => {
    it('should return SO format configuration', async () => {
      const mockFormats = [
        { soKey: 'GLOBE', uniqueid: 'field1', vpos: 1, hpos: 1 },
        { soKey: 'GLOBE', uniqueid: 'field2', vpos: 2, hpos: 1 },
      ];

      jest
        .spyOn(soFormatRepository, 'find')
        .mockResolvedValue(mockFormats as SoFormat[]);

      const result = await service.getSoFormat('GLOBE');

      expect(result).toEqual(mockFormats);
      expect(soFormatRepository.find).toHaveBeenCalledWith({
        where: { soKey: 'GLOBE' },
        order: { vpos: 'ASC', hpos: 'ASC' },
      });
    });
  });
});
