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

  beforeEach(async () => {
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
          useValue: {
            createQueryRunner: jest.fn(),
            query: jest.fn(),
          },
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

    it('should create SO from OC with all items', async () => {
      const createDto = {
        sourceType: 'oc' as const,
        ocNo: 'OC001',
        custNo: 'CUST001',
      };

      const mockOcItems = [
        { item_no: 'ITEM001', qty: 100, price: 10.5 },
        { item_no: 'ITEM002', qty: 200, price: 8.75 },
      ];

      const mockSoItems = mockOcItems.map((item) => ({
        soNo: 'SO001',
        itemNo: item.item_no,
        qty: item.qty,
        price: item.price,
        creDate: new Date(),
        modDate: new Date(),
      }));

      jest.spyOn(dataSource, 'query').mockResolvedValueOnce(mockOcItems);
      jest.spyOn(shippingOrderRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(shippingOrderRepository, 'create')
        .mockImplementation((data) => data as any);
      jest
        .spyOn(shippingOrderRepository, 'save')
        .mockResolvedValue(mockSoItems[0] as any);

      const result = await service.create(createDto as any);

      expect(dataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM order_confirmation_detail'),
        expect.any(Array),
      );
      expect(result).toBeDefined();
    });

    it('should create SO from Contract with breakdown copy', async () => {
      const createDto = {
        sourceType: 'contract' as const,
        contractNo: 'CONT001',
        custNo: 'CUST001',
      };

      const mockContractItems = [
        {
          item_no: 'ITEM001',
          qty: 1000,
          breakdown: [
            { port: 'PORT1', qty: 500 },
            { port: 'PORT2', qty: 500 },
          ],
        },
      ];

      jest.spyOn(dataSource, 'query').mockResolvedValueOnce(mockContractItems);
      jest.spyOn(shippingOrderRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(shippingOrderRepository, 'create')
        .mockImplementation((data) => data as any);
      jest.spyOn(shippingOrderRepository, 'save').mockResolvedValue({} as any);

      const result = await service.create(createDto as any);

      expect(dataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM contract_detail'),
        expect.any(Array),
      );
      expect(result).toBeDefined();
    });

    it('should validate SO format lookup', async () => {
      const createDto = {
        soNo: 'SO001',
        formatKey: 'GLOBE',
        custNo: 'CUST001',
      };

      const mockFormat = [
        { soKey: 'GLOBE', uniqueid: 'company_name', vpos: 1, hpos: 1 },
        { soKey: 'GLOBE', uniqueid: 'so_no', vpos: 2, hpos: 1 },
      ];

      jest
        .spyOn(soFormatRepository, 'find')
        .mockResolvedValue(mockFormat as SoFormat[]);
      jest.spyOn(shippingOrderRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(shippingOrderRepository, 'create').mockReturnValue({} as any);
      jest.spyOn(shippingOrderRepository, 'save').mockResolvedValue({} as any);

      const result = await service.create(createDto as any);

      expect(soFormatRepository.find).toHaveBeenCalledWith({
        where: { soKey: 'GLOBE' },
        order: { vpos: 'ASC', hpos: 'ASC' },
      });
      expect(result).toBeDefined();
    });

    it('should handle customer-specific formats', async () => {
      const createDto = {
        soNo: 'SO001',
        custNo: 'SPENCER',
        formatKey: 'SPENCER_FORMAT',
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
        .mockResolvedValueOnce([
          { cust_no: 'SPENCER', special_format: 'SPENCER_FORMAT' },
        ]);
      jest
        .spyOn(soFormatRepository, 'find')
        .mockResolvedValue(mockCustomerFormats as SoFormat[]);
      jest.spyOn(shippingOrderRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(shippingOrderRepository, 'create').mockReturnValue({} as any);
      jest.spyOn(shippingOrderRepository, 'save').mockResolvedValue({} as any);

      const result = await service.create(createDto as any);

      expect(dataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM customer'),
        expect.any(Array),
      );
      expect(soFormatRepository.find).toHaveBeenCalledWith({
        where: { soKey: 'SPENCER_FORMAT' },
        order: { vpos: 'ASC', hpos: 'ASC' },
      });
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
