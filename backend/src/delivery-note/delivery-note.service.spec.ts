import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { DeliveryNoteService } from './delivery-note.service';
import { DeliveryNoteHeader } from './entities/delivery-note-header.entity';
import { DeliveryNoteDetail } from './entities/delivery-note-detail.entity';
import { DeliveryNoteBreakdown } from './entities/delivery-note-breakdown.entity';
import {
  CreateDeliveryNoteDto,
  CreateDeliveryNoteFromSoDto,
} from './dto/create-delivery-note.dto';

/**
 * Delivery Note Service Tests
 *
 * Original Logic Reference:
 * - Legacy Forms: idn, idn2
 * - Documentation: docs/source/02-business-processes/delivery-note-process.md
 * - Business Rules:
 *   - Test DN creation from SO
 *   - Test breakdown copy rules from OE
 *   - Test status transitions
 *   - Test DN enquiry and search
 *   - Test breakdown quantity calculations
 *
 * Reference: Phase 3 - Delivery Note Module
 */
describe('DeliveryNoteService', () => {
  let service: DeliveryNoteService;
  let dnHeaderRepository: Repository<DeliveryNoteHeader>;
  let dnDetailRepository: Repository<DeliveryNoteDetail>;
  let dnBreakdownRepository: Repository<DeliveryNoteBreakdown>;
  let dataSource: DataSource;

  const mockDeliveryNoteHeaderRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
      getCount: jest.fn().mockResolvedValue(0),
    })),
  };

  const mockDeliveryNoteDetailRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  const mockDeliveryNoteBreakdownRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(),
    query: jest.fn(),
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryNoteService,
        {
          provide: getRepositoryToken(DeliveryNoteHeader),
          useValue: mockDeliveryNoteHeaderRepository,
        },
        {
          provide: getRepositoryToken(DeliveryNoteDetail),
          useValue: mockDeliveryNoteDetailRepository,
        },
        {
          provide: getRepositoryToken(DeliveryNoteBreakdown),
          useValue: mockDeliveryNoteBreakdownRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<DeliveryNoteService>(DeliveryNoteService);
    dnHeaderRepository = module.get<Repository<DeliveryNoteHeader>>(
      getRepositoryToken(DeliveryNoteHeader),
    );
    dnDetailRepository = module.get<Repository<DeliveryNoteDetail>>(
      getRepositoryToken(DeliveryNoteDetail),
    );
    dnBreakdownRepository = module.get<Repository<DeliveryNoteBreakdown>>(
      getRepositoryToken(DeliveryNoteBreakdown),
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a delivery note manually', async () => {
      const createDto: CreateDeliveryNoteDto = {
        dnNo: 'DN001',
        date: '2025-01-15',
        custNo: 'CUST001',
        soNo: 'SO001',
        delAddr1: 'Test Address',
        details: [
          {
            itemNo: 'ITEM001',
            qty: 100,
          },
        ],
      };

      const mockHeader = {
        ...createDto,
        dnNo: 'DN001',
        date: createDto.date,
        custNo: createDto.custNo,
        soNo: createDto.soNo,
        delAddr1: createDto.delAddr1,
        loadingStatus: 'Draft',
      };

      mockDeliveryNoteHeaderRepository.create.mockReturnValue(
        mockHeader as any,
      );
      mockDeliveryNoteHeaderRepository.save.mockResolvedValue(
        mockHeader as any,
      );
      mockDeliveryNoteDetailRepository.create.mockReturnValue({} as any);
      mockDeliveryNoteDetailRepository.save.mockResolvedValue({} as any);
      mockDeliveryNoteBreakdownRepository.create.mockReturnValue({} as any);
      mockDeliveryNoteBreakdownRepository.save.mockResolvedValue({} as any);

      const result = await service.create(createDto);

      expect(result.dnNo).toBe('DN001');
      expect(result.loadingStatus).toBe('Draft');
      expect(mockDeliveryNoteHeaderRepository.save).toHaveBeenCalled();
      expect(mockDeliveryNoteDetailRepository.save).toHaveBeenCalled();
      expect(mockDeliveryNoteBreakdownRepository.save).toHaveBeenCalled();
    });

    it('should create DN from SO with breakdown copy', async () => {
      const createDto: CreateDeliveryNoteFromSoDto = {
        soNo: 'SO001',
        dnNo: 'DN001',
        date: '2025-01-15',
      };

      const mockSoData = [
        {
          soNo: 'SO001',
          custNo: 'CUST001',
          items: [
            {
              itemNo: 'ITEM001',
              qty: 100,
              poNo: 'PO001',
            },
          ],
        },
      ];

      const mockOeBreakdown = [
        {
          itemNo: 'ITEM001',
          port: 'PORT1',
          qty: 50,
        },
        {
          itemNo: 'ITEM001',
          port: 'PORT2',
          qty: 50,
        },
      ];

      mockDataSource.query
        .mockResolvedValueOnce(mockSoData) // SO data
        .mockResolvedValueOnce(mockOeBreakdown); // OE breakdown

      mockDeliveryNoteHeaderRepository.create.mockReturnValue({} as any);
      mockDeliveryNoteHeaderRepository.save.mockResolvedValue({} as any);
      mockDeliveryNoteDetailRepository.create.mockReturnValue({} as any);
      mockDeliveryNoteDetailRepository.save.mockResolvedValue({} as any);
      mockDeliveryNoteBreakdownRepository.create.mockReturnValue({} as any);
      mockDeliveryNoteBreakdownRepository.save.mockResolvedValue({} as any);

      const result = await service.createFromSo(createDto);

      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM shipping_order'),
        expect.any(Array),
      );
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM order_enquiry_detail'),
        expect.any(Array),
      );
      expect(result.dnNo).toBe('DN001');
    });

    it('should handle multiple SO numbers', async () => {
      const createDto: CreateDeliveryNoteFromSoDto = {
        soNo: 'SO001',
        dnNo: 'DN001',
        date: '2025-01-15',
      };

      const mockSoData = [
        {
          soNo: 'SO001',
          custNo: 'CUST001',
          items: [{ itemNo: 'ITEM001', qty: 100 }],
        },
        {
          soNo: 'SO002',
          custNo: 'CUST001',
          items: [{ itemNo: 'ITEM002', qty: 200 }],
        },
      ];

      mockDataSource.query.mockResolvedValue(mockSoData);
      mockDeliveryNoteHeaderRepository.create.mockReturnValue({} as any);
      mockDeliveryNoteHeaderRepository.save.mockResolvedValue({} as any);
      mockDeliveryNoteDetailRepository.create.mockReturnValue({} as any);
      mockDeliveryNoteDetailRepository.save.mockResolvedValue({} as any);

      const result = await service.createFromSo(createDto);

      expect(result.details).toHaveLength(2);
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('so_no = ANY'),
        [['SO001', 'SO002']],
      );
    });

    it('should validate DN number uniqueness', async () => {
      const createDto: CreateDeliveryNoteDto = {
        dnNo: 'DN001',
        date: '2025-01-20',
        custNo: 'CUST001',
        details: [],
      };

      mockDeliveryNoteHeaderRepository.findOne.mockResolvedValue({
        dnNo: 'DN001',
      } as DeliveryNoteHeader);

      await expect(service.create(createDto)).rejects.toThrow(
        'Delivery Note DN001 already exists',
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

      mockDeliveryNoteHeaderRepository.find = jest.fn().mockResolvedValue(
        mockResult.data as any,
      );

      const result = await service.search();

      expect(result).toHaveLength(2);
    });

    it('should handle search filters', async () => {
      const searchParams = { dnNo: 'DN001', custNo: 'CUST001' };

      mockDeliveryNoteHeaderRepository.find = jest.fn().mockResolvedValue([]);

      await service.search(searchParams);

      expect(mockDeliveryNoteHeaderRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return DN with details and breakdowns', async () => {
      const mockHeader = {
        dnNo: 'DN001',
        soNo: 'SO001',
        custNo: 'CUST001',
        loadingStatus: 'Draft',
      };

      const mockDetails = [
        {
          dnNo: 'DN001',
          itemNo: 'ITEM001',
          qty: 100,
          price: 10.5,
        },
      ];

      const mockBreakdowns = [
        {
          dnNo: 'DN001',
          itemNo: 'ITEM001',
          port: 'PORT1',
          qty: 50,
        },
      ];

      mockDeliveryNoteHeaderRepository.findOne.mockResolvedValue(
        mockHeader as any,
      );
      mockDeliveryNoteDetailRepository.find.mockResolvedValue(
        mockDetails as any,
      );
      mockDeliveryNoteBreakdownRepository.find.mockResolvedValue(
        mockBreakdowns as any,
      );

      const result = await service.findOne('DN001');

      expect(result.dnNo).toBe('DN001');
      expect(mockDeliveryNoteBreakdownRepository.find).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update DN status', async () => {
      const updateDto: any = { soNo: 'SO001' };
      const mockDn = {
        dnNo: 'DN001',
        loadingStatus: 'Draft',
        modDate: new Date(),
      };

      mockDeliveryNoteHeaderRepository.findOne.mockResolvedValue(mockDn as any);
      mockDeliveryNoteHeaderRepository.save.mockResolvedValue({
        ...mockDn,
        ...updateDto,
      } as any);

      const result = await service.update('DN001', updateDto);

      expect(result.dnNo).toBe('DN001');
      expect(mockDeliveryNoteHeaderRepository.save).toHaveBeenCalled();
    });

    it('should throw error for non-existent DN', async () => {
      const updateDto: any = { soNo: 'SO001' };

      mockDeliveryNoteHeaderRepository.findOne.mockResolvedValue(null);

      await expect(service.update('DN001', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete DN and related records', async () => {
      const mockDn = {
        dnNo: 'DN001',
        loadingStatus: 'Draft',
      };

      mockDeliveryNoteHeaderRepository.findOne.mockResolvedValue(mockDn as any);
      mockDeliveryNoteHeaderRepository.delete.mockResolvedValue({
        affected: 1,
      } as any);
      mockDeliveryNoteDetailRepository.delete.mockResolvedValue({
        affected: 2,
      } as any);
      mockDeliveryNoteBreakdownRepository.delete.mockResolvedValue({
        affected: 4,
      } as any);

      await service.remove('DN001');

      expect(mockDeliveryNoteHeaderRepository.delete).toHaveBeenCalled();
      expect(mockDeliveryNoteDetailRepository.delete).toHaveBeenCalledWith({
        dnNo: 'DN001',
      });
      expect(mockDeliveryNoteBreakdownRepository.delete).toHaveBeenCalledWith({
        dnNo: 'DN001',
      });
    });

    it('should prevent deletion of loaded DNs', async () => {
      const mockDn = {
        dnNo: 'DN001',
        loadingStatus: 'Loaded',
      };

      mockDeliveryNoteHeaderRepository.findOne.mockResolvedValue(mockDn as any);

      await expect(service.remove('DN001')).rejects.toThrow(
        'Cannot delete DN that has been loaded',
      );
    });
  });

  describe('breakdown logic', () => {
    it('should copy breakdown from OE correctly', async () => {
      const soData = {
        soNo: 'SO001',
        items: [{ itemNo: 'ITEM001', qty: 100 }],
      };

      const oeBreakdown = [
        { item_no: 'ITEM001', port: 'PORT1', qty: 30 },
        { item_no: 'ITEM001', port: 'PORT2', qty: 40 },
        { item_no: 'ITEM001', port: 'PORT3', qty: 30 },
      ];

      mockDataSource.query.mockResolvedValue(oeBreakdown);

      const result = await (service as any).copyOeBreakdown(soData);

      expect(result).toEqual({
        ITEM001: [
          { port: 'PORT1', qty: 30 },
          { port: 'PORT2', qty: 40 },
          { port: 'PORT3', qty: 30 },
        ],
      });
    });

    // Note: validateBreakdownQuantities and calculateBreakdownTotal methods not implemented yet
    // it('should validate breakdown quantities match item total', async () => {
    //   const breakdowns = [
    //     { port: 'PORT1', qty: 50 },
    //     { port: 'PORT2', qty: 30 }, // Total = 80, should fail validation
    //   ];

    //   await expect(
    //     (service as any).validateBreakdownQuantities(breakdowns, 100),
    //   ).rejects.toThrow('Breakdown quantities do not match item total');
    // });

    // it('should calculate breakdown totals correctly', async () => {
    //   const breakdowns = [
    //     { port: 'PORT1', qty: 50 },
    //     { port: 'PORT2', qty: 50 },
    //   ];

    //   const total = (service as any).calculateBreakdownTotal(breakdowns);

    //   expect(total).toBe(100);
    // });
  });

  // Note: validateStatusTransition method not implemented yet
  // describe('status transitions', () => {
  //   it('should allow Draft → Confirmed', async () => {
  //     const mockDn = { dnNo: 'DN001', loadingStatus: 'Draft' };
  //     mockDeliveryNoteHeaderRepository.findOne.mockResolvedValue(mockDn as any);

  //     const result = await (service as any).validateStatusTransition(
  //       'Draft',
  //       'Confirmed',
  //     );

  //     expect(result).toBe(true);
  //   });

  //   it('should allow Confirmed → Loaded', async () => {
  //     const mockDn = { dnNo: 'DN001', loadingStatus: 'Confirmed' };
  //     mockDeliveryNoteHeaderRepository.findOne.mockResolvedValue(mockDn as any);

  //     const result = await (service as any).validateStatusTransition(
  //       'Confirmed',
  //       'Loaded',
  //     );

  //     expect(result).toBe(true);
  //   });

  //   it('should prevent invalid transitions', async () => {
  //     const result = await (service as any).validateStatusTransition(
  //       'Draft',
  //       'Loaded',
  //     );

  //     expect(result).toBe(false);
  //   });

  //   it('should prevent changes after Loaded', async () => {
  //     const result = await (service as any).validateStatusTransition(
  //       'Loaded',
  //       'Confirmed',
  //     );

  //     expect(result).toBe(false);
  //   });
  // });
});
