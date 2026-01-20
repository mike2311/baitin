import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { InvoiceDocumentService } from './invoice-document.service';
import { InvoiceHeader } from './entities/invoice-header.entity';
import { InvoiceDetail } from './entities/invoice-detail.entity';
import { GenerateInvoiceDocumentDto, InvoiceDocumentType } from './dto/generate-invoice-document.dto';

/**
 * Invoice Document Service Tests
 *
 * Original Logic Reference:
 * - Legacy Forms: ppacklist_new, ppacklist_xls, ppacklist_xls_spencer, pshadvice, pdebitnote
 * - Legacy Program: uwpacklist.prg
 * - Documentation: docs/source/02-business-processes/invoice-process.md
 * - Business Rules:
 *   - Test packing list generation (standard & Spencer)
 *   - Test shipment advice generation
 *   - Test debit note generation
 *   - Test invoice document generation
 *   - Test weight unit conversion
 *   - Test BOM item handling
 *
 * Reference: Phase 3 - Invoice Document Generation
 */
describe('InvoiceDocumentService', () => {
  let service: InvoiceDocumentService;
  let invoiceHeaderRepository: Repository<InvoiceHeader>;
  let invoiceDetailRepository: Repository<InvoiceDetail>;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceDocumentService,
        {
          provide: getRepositoryToken(InvoiceHeader),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(InvoiceDetail),
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

    service = module.get<InvoiceDocumentService>(InvoiceDocumentService);
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

  describe('previewInvoiceDocument', () => {
    it('should generate packing list preview', async () => {
      const generateDto: GenerateInvoiceDocumentDto = {
        invNos: ['INV001'],
        documentType: InvoiceDocumentType.PACKING_LIST,
        outputFormat: 'excel',
      };

      const mockInvData = [{
        invNo: 'INV001',
        date: new Date('2025-01-15'),
        custNo: 'CUST001',
        customerName: 'Test Customer',
        items: [{
          itemNo: 'ITEM001',
          itemName: 'Test Item',
          qty: 100,
          ctn: 2,
          qctn: 50,
          net: 50,
          wt: 55,
        }],
      }];

      jest.spyOn(dataSource, 'query').mockResolvedValue(mockInvData);

      const result = await service.previewInvoiceDocument(generateDto);

      expect(result.invNos).toEqual(['INV001']);
      expect(result.documentType).toBe(InvoiceDocumentType.PACKING_LIST);
      expect(result.data).toBeDefined();
      expect(result.data[0].items[0]).toHaveProperty('net');
      expect(result.data[0].items[0]).toHaveProperty('wt');
    });

    it('should handle Spencer format packing list', async () => {
      const generateDto: GenerateInvoiceDocumentDto = {
        invNos: ['INV001'],
        documentType: InvoiceDocumentType.PACKING_LIST_SPENCER,
        outputFormat: 'excel',
      };

      const mockInvData = [{
        invNo: 'INV001',
        custNo: 'SPENCER',
        items: [{
          itemNo: 'ITEM001',
          qty: 100,
          head: true, // BOM head item
        }, {
          itemNo: 'SUB001',
          qty: 50,
          head: false, // BOM sub-item
          headItem: 'ITEM001',
        }],
      }];

      jest.spyOn(dataSource, 'query').mockResolvedValue(mockInvData);

      const result = await service.previewInvoiceDocument(generateDto);

      expect(result.documentType).toBe(InvoiceDocumentType.PACKING_LIST_SPENCER);
      expect(result.data[0]).toHaveProperty('plName');
    });

    it('should generate shipment advice preview', async () => {
      const generateDto: GenerateInvoiceDocumentDto = {
        invNos: ['INV001'],
        documentType: InvoiceDocumentType.SHIPMENT_ADVICE,
        outputFormat: 'excel',
      };

      const mockInvData = [{
        invNo: 'INV001',
        ship: 'By Sea',
        loading: 'PORT1',
        dest: 'PORT2',
        items: [{
          itemNo: 'ITEM001',
          shipMark: 'ABC123',
          poNo: 'PO001',
        }],
      }];

      jest.spyOn(dataSource, 'query').mockResolvedValue(mockInvData);

      const result = await service.previewInvoiceDocument(generateDto);

      expect(result.documentType).toBe(InvoiceDocumentType.SHIPMENT_ADVICE);
      expect(result.data[0]).toHaveProperty('ship');
      expect(result.data[0]).toHaveProperty('loading');
    });

    it('should generate debit note preview', async () => {
      const generateDto: GenerateInvoiceDocumentDto = {
        invNos: ['INV001'],
        documentType: InvoiceDocumentType.DEBIT_NOTE,
        outputFormat: 'excel',
      };

      const mockInvData = [{
        invNo: 'INV001',
        date: new Date('2025-01-15'),
        custNo: 'CUST001',
        customerName: 'Test Customer',
        items: [{
          itemNo: 'ITEM001',
          qty: 100,
          price: 10.50,
          amount: 1050.00,
        }],
      }];

      jest.spyOn(dataSource, 'query').mockResolvedValue(mockInvData);

      const result = await service.previewInvoiceDocument(generateDto);

      expect(result.documentType).toBe(InvoiceDocumentType.DEBIT_NOTE);
      expect(result.data[0].items[0]).toHaveProperty('amount');
    });
  });

  describe('generateInvoiceDocument', () => {
    it('should generate packing list in Excel format', async () => {
      const generateDto: GenerateInvoiceDocumentDto = {
        invNos: ['INV001'],
        documentType: InvoiceDocumentType.PACKING_LIST,
        outputFormat: 'excel',
      };

      const mockInvData = [{
        invNo: 'INV001',
        date: new Date('2025-01-15'),
        items: [],
      }];

      jest.spyOn(dataSource, 'query').mockResolvedValue(mockInvData);

      const result = await service.generateInvoiceDocument(generateDto);

      expect(result.fileName).toContain('INV001');
      expect(result.fileName).toContain('PACKING_LIST');
      expect(result.fileName).toContain('.xlsx');
      expect(result.format).toBe('excel');
      expect(result.fileSize).toBeGreaterThan(0);
      expect(result.fileBuffer).toBeInstanceOf(Buffer);
    });

    it('should generate Spencer packing list', async () => {
      const generateDto: GenerateInvoiceDocumentDto = {
        invNos: ['INV001'],
        documentType: InvoiceDocumentType.PACKING_LIST_SPENCER,
        outputFormat: 'excel',
      };

      const mockInvData = [{
        invNo: 'INV001',
        items: [],
      }];

      jest.spyOn(dataSource, 'query').mockResolvedValue(mockInvData);

      const result = await service.generateInvoiceDocument(generateDto);

      expect(result.fileName).toContain('PACKING_LIST_SPENCER');
      expect(result.format).toBe('excel');
    });

    it('should generate shipment advice in Excel format', async () => {
      const generateDto: GenerateInvoiceDocumentDto = {
        invNos: ['INV001'],
        documentType: InvoiceDocumentType.SHIPMENT_ADVICE,
        outputFormat: 'excel',
      };

      const mockInvData = [{
        invNo: 'INV001',
        items: [],
      }];

      jest.spyOn(dataSource, 'query').mockResolvedValue(mockInvData);

      const result = await service.generateInvoiceDocument(generateDto);

      expect(result.fileName).toContain('SHIPMENT_ADVICE');
      expect(result.format).toBe('excel');
    });

    it('should generate debit note in Excel format', async () => {
      const generateDto: GenerateInvoiceDocumentDto = {
        invNos: ['INV001'],
        documentType: InvoiceDocumentType.DEBIT_NOTE,
        outputFormat: 'excel',
      };

      const mockInvData = [{
        invNo: 'INV001',
        items: [],
      }];

      jest.spyOn(dataSource, 'query').mockResolvedValue(mockInvData);

      const result = await service.generateInvoiceDocument(generateDto);

      expect(result.fileName).toContain('DEBIT_NOTE');
      expect(result.format).toBe('excel');
    });

    it('should generate invoice in PDF format', async () => {
      const generateDto: GenerateInvoiceDocumentDto = {
        invNos: ['INV001'],
        documentType: InvoiceDocumentType.INVOICE,
        outputFormat: 'pdf',
      };

      const mockInvData = [{
        invNo: 'INV001',
        items: [],
      }];

      jest.spyOn(dataSource, 'query').mockResolvedValue(mockInvData);

      const result = await service.generateInvoiceDocument(generateDto);

      expect(result.fileName).toContain('INVOICE');
      expect(result.fileName).toContain('.pdf');
      expect(result.format).toBe('pdf');
    });

    it('should handle multiple invoice numbers', async () => {
      const generateDto: GenerateInvoiceDocumentDto = {
        invNos: ['INV001', 'INV002'],
        documentType: InvoiceDocumentType.PACKING_LIST,
        outputFormat: 'excel',
      };

      const mockInvData = [
        { invNo: 'INV001', items: [] },
        { invNo: 'INV002', items: [] },
      ];

      jest.spyOn(dataSource, 'query').mockResolvedValue(mockInvData);

      const result = await service.generateInvoiceDocument(generateDto);

      expect(result.fileName).toContain('INV001_INV002');
      expect(result.format).toBe('excel');
    });

    it('should validate unsupported output format', async () => {
      const generateDto: GenerateInvoiceDocumentDto = {
        invNos: ['INV001'],
        documentType: InvoiceDocumentType.PACKING_LIST,
        outputFormat: 'invalid' as any,
      };

      await expect(service.generateInvoiceDocument(generateDto)).rejects.toThrow('Unsupported output format');
    });

    it('should handle empty invoice data', async () => {
      const generateDto: GenerateInvoiceDocumentDto = {
        invNos: ['INV001'],
        documentType: InvoiceDocumentType.PACKING_LIST,
        outputFormat: 'excel',
      };

      jest.spyOn(dataSource, 'query').mockResolvedValue([]);

      await expect(service.generateInvoiceDocument(generateDto)).rejects.toThrow('No invoices found for the specified invoice numbers');
    });
  });

  describe('loadInvoiceData', () => {
    it('should load invoice data with customer and item details', async () => {
      const invNos = ['INV001'];
      const documentType = InvoiceDocumentType.PACKING_LIST;

      const mockInvData = [{
        invNo: 'INV001',
        date: new Date('2025-01-15'),
        custNo: 'CUST001',
        customerName: 'Test Customer',
        items: [{
          itemNo: 'ITEM001',
          qty: 100,
          ctn: 2,
          net: 50,
          wt: 55,
        }],
      }];

      jest.spyOn(dataSource, 'query').mockResolvedValue(mockInvData);

      const result = await (service as any).loadInvoiceData(invNos, documentType);

      expect(result).toEqual(mockInvData);
      expect(dataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM invoice_header'),
        expect.any(Array)
      );
    });

    it('should apply weight unit conversion for lbs customers', async () => {
      const invNos = ['INV001'];
      const documentType = InvoiceDocumentType.PACKING_LIST;

      const mockInvData = [{
        invNo: 'INV001',
        wt_unit: 2, // lbs conversion
        items: [{
          itemNo: 'ITEM001',
          net: 50, // kg
          wt: 55, // kg
        }],
      }];

      jest.spyOn(dataSource, 'query').mockResolvedValue(mockInvData);

      const result = await (service as any).loadInvoiceData(invNos, documentType);

      expect(result[0].items[0].net).toBe(110); // 50 * 2.2
      expect(result[0].items[0].wt).toBe(121); // 55 * 2.2
    });

    it('should handle BOM items in Spencer format', async () => {
      const invNos = ['INV001'];
      const documentType = InvoiceDocumentType.PACKING_LIST_SPENCER;

      const mockInvData = [{
        invNo: 'INV001',
        items: [{
          itemNo: 'BOM001',
          qty: 10,
          head: true,
        }, {
          itemNo: 'SUB001',
          qty: 20,
          head: false,
          headItem: 'BOM001',
        }],
      }];

      jest.spyOn(dataSource, 'query').mockResolvedValue(mockInvData);

      const result = await (service as any).loadInvoiceData(invNos, documentType);

      expect(result[0].items).toHaveLength(2);
      expect(result[0].items[0].head).toBe(true);
      expect(result[0].items[1].head).toBe(false);
    });

    it('should filter by container number', async () => {
      const invNos = ['INV001'];
      const documentType = InvoiceDocumentType.PACKING_LIST;
      const containerNo = 'CONT001';

      jest.spyOn(dataSource, 'query').mockResolvedValue([]);

      await (service as any).loadInvoiceData(invNos, documentType, containerNo);

      expect(dataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('AND invd.cntr_no ='),
        expect.arrayContaining(['CONT001'])
      );
    });
  });

  describe('generateExcel', () => {
    it('should generate Excel for standard packing list', async () => {
      const mockInvData = [{
        invNo: 'INV001',
        date: new Date('2025-01-15'),
        customerName: 'Test Customer',
        items: [{
          itemNo: 'ITEM001',
          itemName: 'Test Item',
          qty: 100,
          ctn: 2,
          net: 50,
          wt: 55,
          shipMark: 'ABC123',
        }],
        totalCartons: 2,
        totalQty: 100,
        totalNet: 50,
        totalWt: 55,
      }];

      const result = await (service as any).generateExcel(mockInvData, InvoiceDocumentType.PACKING_LIST);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should generate Excel for Spencer packing list', async () => {
      const mockInvData = [{
        invNo: 'INV001',
        customerName: 'Spencer Corp',
        plName: 'Packing List',
        items: [{
          itemNo: 'ITEM001',
          itemName: 'Test Item',
          qty: 100,
          ctn: 2,
          head: true,
        }],
      }];

      const result = await (service as any).generateExcel(mockInvData, InvoiceDocumentType.PACKING_LIST_SPENCER);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should generate Excel for shipment advice', async () => {
      const mockInvData = [{
        invNo: 'INV001',
        ship: 'By Sea',
        loading: 'PORT1',
        dest: 'PORT2',
        items: [{
          itemNo: 'ITEM001',
          shipMark: 'ABC123',
          poNo: 'PO001',
        }],
      }];

      const result = await (service as any).generateExcel(mockInvData, InvoiceDocumentType.SHIPMENT_ADVICE);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty invoice data', async () => {
      const mockInvData = [];

      const result = await (service as any).generateExcel(mockInvData, InvoiceDocumentType.PACKING_LIST);

      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe('generatePdf', () => {
    it('should generate PDF document', async () => {
      const mockInvData = [{
        invNo: 'INV001',
        date: new Date('2025-01-15'),
        customerName: 'Test Customer',
        items: [{
          itemNo: 'ITEM001',
          itemName: 'Test Item',
          qty: 100,
        }],
      }];

      const result = await (service as any).generatePdf(mockInvData, InvoiceDocumentType.PACKING_LIST);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
      const content = result.toString();
      expect(content).toContain('INV001');
      expect(content).toContain('PACKING LIST');
    });

    it('should limit PDF content for large datasets', async () => {
      const mockInvData = [{
        invNo: 'INV001',
        items: Array(2000).fill({}).map((_, i) => ({
          itemNo: `ITEM${i}`,
          qty: 100,
        })),
      }];

      const result = await (service as any).generatePdf(mockInvData, InvoiceDocumentType.PACKING_LIST);

      const content = result.toString();
      expect(content).toContain('(Showing first 1000 of 2000 rows)');
    });
  });
});