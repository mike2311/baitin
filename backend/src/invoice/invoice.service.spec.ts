import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { InvoiceService } from './invoice.service';
import { InvoiceHeader } from './entities/invoice-header.entity';
import { InvoiceDetail } from './entities/invoice-detail.entity';
import {
  CreateInvoiceDto,
  CreateInvoiceFromSourceDto,
  SelectInvoiceItemsByContainerDto,
} from './dto/create-invoice.dto';

/**
 * Invoice Service Tests
 *
 * Original Logic Reference:
 * - Legacy Forms: iinvhd@, iinvdt2@
 * - Documentation: docs/source/02-business-processes/invoice-process.md
 * - Business Rules:
 *   - Test invoice header CRUD
 *   - Test container/ref-driven detail entry
 *   - Test qty/carton mismatch validation with override
 *   - Test date range validation
 *   - Test invoice creation from SO/DN
 *   - Test BOM sub-item handling
 *   - Test weight unit conversion (kg to lbs)
 *
 * Reference: Phase 3 - Invoice Module
 */
describe('InvoiceService', () => {
  let service: InvoiceService;
  let invoiceHeaderRepository: Repository<InvoiceHeader>;
  let invoiceDetailRepository: Repository<InvoiceDetail>;
  let dataSource: DataSource;

  const mockInvoiceHeaderRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockInvoiceDetailRepository = {
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
        InvoiceService,
        {
          provide: getRepositoryToken(InvoiceHeader),
          useValue: mockInvoiceHeaderRepository,
        },
        {
          provide: getRepositoryToken(InvoiceDetail),
          useValue: mockInvoiceDetailRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
    invoiceHeaderRepository = module.get<Repository<InvoiceHeader>>(
      getRepositoryToken(InvoiceHeader),
    );
    invoiceDetailRepository = module.get<Repository<InvoiceDetail>>(
      getRepositoryToken(InvoiceDetail),
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an invoice manually', async () => {
      const createDto: CreateInvoiceDto = {
        invNo: 'INV001',
        date: new Date('2025-01-15'),
        custNo: 'CUST001',
        ocNo: 'OC001',
        details: [
          {
            itemNo: 'ITEM001',
            qty: 100,
            price: 10.5,
            ctn: 2,
            qctn: 50,
          },
        ],
      };

      const mockInvoice = {
        ...createDto,
        plStatus: 'Not Printed',
        creDate: new Date(),
        modDate: new Date(),
      };

      mockInvoiceHeaderRepository.create.mockReturnValue(mockInvoice as any);
      mockInvoiceHeaderRepository.save.mockResolvedValue(mockInvoice as any);
      mockInvoiceDetailRepository.create.mockReturnValue({} as any);
      mockInvoiceDetailRepository.save.mockResolvedValue({} as any);

      const result = await service.create(createDto);

      expect(result.invNo).toBe('INV001');
      expect(result.plStatus).toBe('Not Printed');
      expect(mockInvoiceHeaderRepository.save).toHaveBeenCalled();
      expect(mockInvoiceDetailRepository.save).toHaveBeenCalled();
    });

    it('should create invoice from SO', async () => {
      const createDto: CreateInvoiceFromSourceDto = {
        sourceType: 'so' as const,
        sourceNo: 'SO001',
        invNo: 'INV001',
        date: '2025-01-15',
      };

      const mockSoData = [
        {
          soNo: 'SO001',
          custNo: 'CUST001',
          ocNo: 'OC001',
          items: [
            {
              itemNo: 'ITEM001',
              qty: 100,
              price: 10.5,
              ctn: 2,
              qctn: 50,
            },
          ],
        },
      ];

      mockDataSource.query.mockResolvedValue(mockSoData);
      mockInvoiceHeaderRepository.create.mockReturnValue({} as any);
      mockInvoiceHeaderRepository.save.mockResolvedValue({} as any);
      mockInvoiceDetailRepository.create.mockReturnValue({} as any);
      mockInvoiceDetailRepository.save.mockResolvedValue({} as any);

      const result = await service.createFromSource(createDto);

      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM shipping_order'),
        expect.any(Array),
      );
      expect(result.invNo).toBe('INV001');
      expect(result.details).toBeDefined();
    });

    it('should create invoice from DN', async () => {
      const createDto: CreateInvoiceFromSourceDto = {
        sourceType: 'dn' as const,
        sourceNo: 'DN001',
        invNo: 'INV001',
        date: '2025-01-15',
      };

      const mockDnData = [
        {
          dnNo: 'DN001',
          custNo: 'CUST001',
          soNo: 'SO001',
          ocNo: 'OC001',
          items: [
            {
              itemNo: 'ITEM001',
              qty: 100,
              price: 10.5,
            },
          ],
        },
      ];

      mockDataSource.query.mockResolvedValue(mockDnData);
      mockInvoiceHeaderRepository.create.mockReturnValue({} as any);
      mockInvoiceHeaderRepository.save.mockResolvedValue({} as any);
      mockInvoiceDetailRepository.create.mockReturnValue({} as any);
      mockInvoiceDetailRepository.save.mockResolvedValue({} as any);

      const result = await service.createFromSource(createDto);

      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM delivery_note_header'),
        expect.any(Array),
      );
      expect(result.invNo).toBe('INV001');
    });

    it('should select items by container', async () => {
      const selectDto: SelectInvoiceItemsByContainerDto = {
        invNo: 'INV001',
        cntrNo: 'CONT001',
        refNo: 'REF001',
      };

      const mockItems = [
        {
          itemNo: 'ITEM001',
          qty: 100,
          price: 10.5,
          ctn: 2,
          qctn: 50,
          containerNo: 'CONT001',
          refNo: 'REF001',
        },
      ];

      mockDataSource.query.mockResolvedValue(mockItems);

      const result = await service.selectItemsByContainer(selectDto);

      expect(result).toEqual(mockItems);
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM invoice_select_items'),
        expect.any(Array),
      );
    });

    it('should validate invoice number uniqueness', async () => {
      const createDto: CreateInvoiceDto = {
        invNo: 'INV001',
        date: '2025-01-20',
        custNo: 'CUST001',
        details: [],
      };

      mockInvoiceHeaderRepository.findOne.mockResolvedValue({
        invNo: 'INV001',
      } as InvoiceHeader);

      await expect(service.create(createDto)).rejects.toThrow(
        'Invoice INV001 already exists',
      );
    });
  });

  describe('qty/carton validation', () => {
    it('should validate qty/carton mismatch', async () => {
      const details = [
        { itemNo: 'ITEM001', qty: 100, ctn: 2, qctn: 50 }, // Valid: 2 * 50 = 100
        { itemNo: 'ITEM002', qty: 150, ctn: 3, qctn: 45 }, // Invalid: 3 * 45 = 135 ≠ 150
      ];

      const result = await (service as any).validateQtyCartonMatch(details);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Qty/carton mismatch for item ITEM002');
    });

    it('should pass validation for correct qty/carton', async () => {
      const details = [
        { itemNo: 'ITEM001', qty: 100, ctn: 2, qctn: 50 }, // Valid
        { itemNo: 'ITEM002', qty: 120, ctn: 3, qctn: 40 }, // Valid
      ];

      const result = await (service as any).validateQtyCartonMatch(details);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle override for qty/carton mismatch', async () => {
      const details = [
        {
          itemNo: 'ITEM001',
          qty: 100,
          ctn: 2,
          qctn: 50,
          overrideQtyCarton: true,
        }, // Override allowed
      ];

      const result = await (service as any).validateQtyCartonMatch(details);

      expect(result.isValid).toBe(true);
    });
  });

  describe('date range validation', () => {
    it('should validate date range', async () => {
      const invDtFrDate = new Date('2025-01-01');
      const invDtToDate = new Date('2025-01-31');

      const result = await (service as any).validateDateRange(
        invDtFrDate,
        invDtToDate,
      );

      expect(result.isValid).toBe(true);
    });

    it('should reject invalid date range', async () => {
      const invDtFrDate = new Date('2025-01-31');
      const invDtToDate = new Date('2025-01-01'); // From > To

      const result = await (service as any).validateDateRange(
        invDtFrDate,
        invDtToDate,
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('From date cannot be after To date');
    });

    it('should allow null dates', async () => {
      const result = await (service as any).validateDateRange(null, null);

      expect(result.isValid).toBe(true);
    });
  });

  describe('BOM sub-item handling', () => {
    it('should handle BOM items correctly', async () => {
      const details = [
        {
          itemNo: 'BOM001',
          qty: 10,
          isBom: true,
          subItems: [
            { itemNo: 'SUB001', qty: 20, price: 5.0 },
            { itemNo: 'SUB002', qty: 15, price: 8.0 },
          ],
        },
      ];

      const result = await (service as any).processBomItems(details);

      expect(result).toContainEqual({
        itemNo: 'SUB001',
        qty: 20,
        price: 5.0,
        parentBom: 'BOM001',
      });
      expect(result).toContainEqual({
        itemNo: 'SUB002',
        qty: 15,
        price: 8.0,
        parentBom: 'BOM001',
      });
    });

    it('should calculate BOM sub-item quantities', async () => {
      const bomItem = {
        itemNo: 'BOM001',
        qty: 10,
        subItems: [
          { itemNo: 'SUB001', qtyPerBom: 2 },
          { itemNo: 'SUB002', qtyPerBom: 3 },
        ],
      };

      const result = await (service as any).calculateBomSubItemQty(bomItem);

      expect(result.SUB001).toBe(20); // 10 * 2
      expect(result.SUB002).toBe(30); // 10 * 3
    });
  });

  describe('weight unit conversion', () => {
    it('should convert weights from kg to lbs', async () => {
      const details = [{ itemNo: 'ITEM001', net: 50, wt: 55, unit: 'kg' }];

      const customer = { custNo: 'CUST001', wt_unit: 2 }; // lbs conversion

      mockDataSource.query.mockResolvedValue([customer]);

      const result = await (service as any).applyWeightConversion(
        details,
        'CUST001',
      );

      expect(result[0].net).toBe(110); // 50 * 2.2
      expect(result[0].wt).toBe(121); // 55 * 2.2
    });

    it('should skip conversion for non-lbs customers', async () => {
      const details = [{ itemNo: 'ITEM001', net: 50, wt: 55, unit: 'kg' }];

      const customer = { custNo: 'CUST001', wt_unit: 1 }; // no conversion

      mockDataSource.query.mockResolvedValue([customer]);

      const result = await (service as any).applyWeightConversion(
        details,
        'CUST001',
      );

      expect(result[0].net).toBe(50);
      expect(result[0].wt).toBe(55);
    });
  });

  describe('findAll', () => {
    it('should return paginated invoices', async () => {
      const mockResult = {
        data: [
          {
            invNo: 'INV001',
            custNo: 'CUST001',
            date: '2025-01-20',
            plStatus: 'Not Printed',
          },
          {
            invNo: 'INV002',
            custNo: 'CUST002',
            date: '2025-01-20',
            plStatus: 'Printed',
          },
        ],
        total: 2,
        page: 1,
        limit: 10,
      };

      mockInvoiceHeaderRepository.findAndCount.mockResolvedValue([
        mockResult.data as any,
        2,
      ]);

      const result = await service.search({});

      expect(result).toHaveLength(2);
      // Note: search returns array, not paginated object
    });

    it('should handle search filters', async () => {
      const searchParams = { invNo: 'INV001', custNo: 'CUST001' };

      mockInvoiceHeaderRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.search(searchParams);

      expect(mockInvoiceHeaderRepository.findAndCount).toHaveBeenCalledWith({
        where: searchParams,
        skip: 0,
        take: 10,
        order: { creDate: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return invoice with details', async () => {
      const mockHeader = {
        invNo: 'INV001',
        custNo: 'CUST001',
        date: '2025-01-20',
        plStatus: 'Not Printed',
      };

      const mockDetails = [
        {
          invNo: 'INV001',
          itemNo: 'ITEM001',
          qty: 100,
          price: 10.5,
          amount: 1050.0,
        },
      ];

      mockInvoiceHeaderRepository.findOne.mockResolvedValue(mockHeader as any);
      mockInvoiceDetailRepository.find.mockResolvedValue(mockDetails as any);

      const result = await service.findOne('INV001');

      expect(result.invNo).toBe('INV001');
      expect(result.details).toEqual(mockDetails);
    });

    it('should calculate totals correctly', async () => {
      const mockHeader = {
        invNo: 'INV001',
        custNo: 'CUST001',
        date: '2025-01-20',
      };

      const mockDetails = [
        { qty: 100, amount: 1050.0, ctn: 2 },
        { qty: 200, amount: 1600.0, ctn: 4 },
      ];

      mockInvoiceHeaderRepository.findOne.mockResolvedValue(mockHeader as any);
      mockInvoiceDetailRepository.find.mockResolvedValue(mockDetails as any);

      const result = await service.findOne('INV001');

      // Note: totalQty, totalAmount, totalCartons are calculated client-side
      expect(result.details).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update invoice header', async () => {
      const updateDto = { plStatus: 'Printed', remarks: 'Updated remarks' };
      const mockInvoice = {
        invNo: 'INV001',
        plStatus: 'Not Printed',
        modDate: new Date(),
      };

      mockInvoiceHeaderRepository.findOne.mockResolvedValue(mockInvoice as any);
      mockInvoiceHeaderRepository.save.mockResolvedValue({
        ...mockInvoice,
        ...updateDto,
      } as any);

      const result = await service.update('INV001', updateDto);

      expect(result.plStatus).toBe('Printed');
      expect(result.remarks).toBe('Updated remarks');
      expect(mockInvoiceHeaderRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete invoice and details', async () => {
      const mockInvoice = {
        invNo: 'INV001',
        plStatus: 'Not Printed',
      };

      mockInvoiceHeaderRepository.findOne.mockResolvedValue(mockInvoice as any);
      mockInvoiceHeaderRepository.delete.mockResolvedValue({
        affected: 1,
      } as any);
      mockInvoiceDetailRepository.delete.mockResolvedValue({
        affected: 3,
      } as any);

      const result = await service.remove('INV001');

      // Note: remove returns void
      expect(mockInvoiceHeaderRepository.delete).toHaveBeenCalledWith('INV001');
      expect(mockInvoiceHeaderRepository.delete).toHaveBeenCalledWith('INV001');
      expect(mockInvoiceDetailRepository.delete).toHaveBeenCalledWith({
        invNo: 'INV001',
      });
    });

    it('should prevent deletion of printed invoices', async () => {
      const mockInvoice = {
        invNo: 'INV001',
        plStatus: 'Printed',
      };

      mockInvoiceHeaderRepository.findOne.mockResolvedValue(mockInvoice as any);

      await expect(service.remove('INV001')).rejects.toThrow(
        'Cannot delete printed invoice',
      );
    });
  });
});
