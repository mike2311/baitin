import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ShippingOrderDocumentService } from './shipping-order-document.service';
import { ShippingOrder } from './entities/shipping-order.entity';
import { SoFormat } from './entities/so-format.entity';
import { GenerateSoDocumentDto } from './dto/generate-so-document.dto';
// SoDocumentType enum not exported from DTO

/**
 * Shipping Order Document Service Tests
 *
 * Original Logic Reference:
 * - Legacy Forms: pso, pso_pdf, pso_xls
 * - Legacy Program: uwso.prg
 * - Documentation: docs/source/02-business-processes/shipping-process.md
 * - Business Rules:
 *   - Test SO document generation (PDF/Excel)
 *   - Test customer-specific format handling
 *   - Test format configuration lookup
 *   - Test data aggregation and formatting
 *
 * Reference: Phase 3 - Shipping Order Document Generation
 */
describe('ShippingOrderDocumentService', () => {
  let service: ShippingOrderDocumentService;
  let shippingOrderRepository: Repository<ShippingOrder>;
  let soFormatRepository: Repository<SoFormat>;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShippingOrderDocumentService,
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

    service = module.get<ShippingOrderDocumentService>(
      ShippingOrderDocumentService,
    );
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

  describe('previewSoDocument', () => {
    it('should generate SO document preview', async () => {
      const generateDto: GenerateSoDocumentDto = {
        soNos: ['SO001'],
        // documentType not in DTO
        outputFormat: 'excel',
        formatKey: 'DEFAULT',
      };

      const mockSoData = [
        {
          soNo: 'SO001',
          date: new Date('2025-01-15'),
          custNo: 'CUST001',
          customerName: 'Test Customer',
          items: [
            {
              itemNo: 'ITEM001',
              itemName: 'Test Item',
              qty: 100,
              price: 10.5,
            },
          ],
        },
      ];

      jest.spyOn(dataSource, 'query').mockResolvedValue(mockSoData);

      const result = await service.previewSoDocument(generateDto);

      expect(result).toBeDefined();
      expect(result.soNos).toEqual(['SO001']);
      // expect(result.documentType).toBe(SoDocumentType.SO_DOCUMENT);
      expect(result.data).toBeDefined();
      expect(dataSource.query).toHaveBeenCalled();
    });

    it('should handle customer-specific format lookup', async () => {
      const generateDto: GenerateSoDocumentDto = {
        soNos: ['SO001'],
        // documentType not in DTO
        outputFormat: 'excel',
        formatKey: 'SPENCER_FORMAT',
      };

      const mockSoData = [
        {
          soNo: 'SO001',
          custNo: 'SPENCER',
          customerName: 'Spencer Corp',
          items: [],
        },
      ];

      const mockFormatConfig = [
        {
          soKey: 'SPENCER_FORMAT',
          uniqueid: 'logo',
          vpos: 1,
          hpos: 1,
          data: 'SPENCER_LOGO',
        },
        {
          soKey: 'SPENCER_FORMAT',
          uniqueid: 'header',
          vpos: 2,
          hpos: 1,
          data: 'SHIPPING ORDER',
        },
      ];

      jest.spyOn(dataSource, 'query').mockResolvedValue(mockSoData);
      jest
        .spyOn(soFormatRepository, 'find')
        .mockResolvedValue(mockFormatConfig as SoFormat[]);

      const result = await service.previewSoDocument(generateDto);

      expect(soFormatRepository.find).toHaveBeenCalledWith({
        where: { soKey: 'SPENCER_FORMAT' },
        order: { vpos: 'ASC', hpos: 'ASC' },
      });
      expect(result).toBeDefined();
    });
  });

  describe('generateSoDocument', () => {
    it('should generate SO document in Excel format', async () => {
      const generateDto: GenerateSoDocumentDto = {
        soNos: ['SO001'],
        // documentType not in DTO
        outputFormat: 'excel',
        formatKey: 'DEFAULT',
      };

      const mockSoData = [
        {
          soNo: 'SO001',
          date: new Date('2025-01-15'),
          custNo: 'CUST001',
          customerName: 'Test Customer',
          items: [
            {
              itemNo: 'ITEM001',
              itemName: 'Test Item',
              qty: 100,
              price: 10.5,
              amount: 1050.0,
            },
          ],
        },
      ];

      jest.spyOn(dataSource, 'query').mockResolvedValue(mockSoData);

      const result = await service.generateSoDocument(generateDto);

      expect(result).toBeDefined();
      expect(result.fileName).toContain('SO001');
      expect(result.fileName).toContain('.xlsx');
      expect(result.format).toBe('excel');
      expect(result.fileSize).toBeGreaterThan(0);
      expect(result.fileBuffer).toBeInstanceOf(Buffer);
    });

    it('should generate SO document in PDF format', async () => {
      const generateDto: GenerateSoDocumentDto = {
        soNos: ['SO001'],
        // documentType not in DTO
        outputFormat: 'pdf',
        formatKey: 'DEFAULT',
      };

      const mockSoData = [
        {
          soNo: 'SO001',
          date: new Date('2025-01-15'),
          items: [],
        },
      ];

      jest.spyOn(dataSource, 'query').mockResolvedValue(mockSoData);

      const result = await service.generateSoDocument(generateDto);

      expect(result).toBeDefined();
      expect(result.fileName).toContain('SO001');
      expect(result.fileName).toContain('.pdf');
      expect(result.format).toBe('pdf');
      expect(result.fileSize).toBeGreaterThan(0);
      expect(result.fileBuffer).toBeInstanceOf(Buffer);
    });

    it('should handle multiple SO numbers', async () => {
      const generateDto: GenerateSoDocumentDto = {
        soNos: ['SO001', 'SO002'],
        // documentType not in DTO
        outputFormat: 'excel',
      };

      const mockSoData = [
        { soNo: 'SO001', items: [] },
        { soNo: 'SO002', items: [] },
      ];

      jest.spyOn(dataSource, 'query').mockResolvedValue(mockSoData);

      const result = await service.generateSoDocument(generateDto);

      expect(result).toBeDefined();
      expect(result.fileName).toContain('SO001_SO002');
      expect(result.format).toBe('excel');
    });

    it('should validate document output format', async () => {
      const generateDto: GenerateSoDocumentDto = {
        soNos: ['SO001'],
        // documentType not in DTO
        outputFormat: 'invalid' as any,
      };

      await expect(service.generateSoDocument(generateDto)).rejects.toThrow(
        'Unsupported output format',
      );
    });

    it('should handle empty SO data', async () => {
      const generateDto: GenerateSoDocumentDto = {
        soNos: ['SO001'],
        // documentType not in DTO
        outputFormat: 'excel',
      };

      jest.spyOn(dataSource, 'query').mockResolvedValue([]);

      await expect(service.generateSoDocument(generateDto)).rejects.toThrow(
        'No data found for document generation',
      );
    });

    it('should apply format configuration correctly', async () => {
      const generateDto: GenerateSoDocumentDto = {
        soNos: ['SO001'],
        // documentType not in DTO
        outputFormat: 'excel',
        formatKey: 'CUSTOM_FORMAT',
      };

      const mockSoData = [
        {
          soNo: 'SO001',
          items: [],
        },
      ];

      const mockFormatConfig = [
        {
          soKey: 'CUSTOM_FORMAT',
          uniqueid: 'company',
          vpos: 1,
          hpos: 1,
          data: 'Test Company',
        },
        {
          soKey: 'CUSTOM_FORMAT',
          uniqueid: 'title',
          vpos: 2,
          hpos: 1,
          data: 'SO DOCUMENT',
        },
      ];

      jest.spyOn(dataSource, 'query').mockResolvedValue(mockSoData);
      jest
        .spyOn(soFormatRepository, 'find')
        .mockResolvedValue(mockFormatConfig as SoFormat[]);

      const result = await service.generateSoDocument(generateDto);

      expect(soFormatRepository.find).toHaveBeenCalledWith({
        where: { soKey: 'CUSTOM_FORMAT' },
        order: { vpos: 'ASC', hpos: 'ASC' },
      });
      expect(result).toBeDefined();
    });
  });

  describe('getSoData', () => {
    it('should retrieve SO data with customer and item details', async () => {
      const soNos = ['SO001'];

      const mockSoData = [
        {
          soNo: 'SO001',
          date: new Date('2025-01-15'),
          custNo: 'CUST001',
          customerName: 'Test Customer',
          items: [
            {
              itemNo: 'ITEM001',
              itemName: 'Test Item',
              qty: 100,
              price: 10.5,
            },
          ],
        },
      ];

      jest.spyOn(dataSource, 'query').mockResolvedValue(mockSoData);

      const result = await (service as any).getSoData(soNos);

      expect(result).toEqual(mockSoData);
      expect(dataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM shipping_order'),
        expect.any(Array),
      );
    });

    it('should handle SO data aggregation correctly', async () => {
      const soNos = ['SO001', 'SO002'];

      const mockSoData = [
        { soNo: 'SO001', items: [] },
        { soNo: 'SO002', items: [] },
      ];

      jest.spyOn(dataSource, 'query').mockResolvedValue(mockSoData);

      const result = await (service as any).getSoData(soNos);

      expect(result).toHaveLength(2);
      expect(result[0].soNo).toBe('SO001');
      expect(result[1].soNo).toBe('SO002');
    });
  });

  describe('getFormatConfig', () => {
    it('should retrieve format configuration', async () => {
      const formatKey = 'DEFAULT_FORMAT';

      const mockConfig = [
        { soKey: 'DEFAULT_FORMAT', uniqueid: 'header', vpos: 1, hpos: 1 },
        { soKey: 'DEFAULT_FORMAT', uniqueid: 'so_no', vpos: 2, hpos: 1 },
      ];

      jest
        .spyOn(soFormatRepository, 'find')
        .mockResolvedValue(mockConfig as SoFormat[]);

      const result = await (service as any).getFormatConfig(formatKey);

      expect(result).toEqual(mockConfig);
      expect(soFormatRepository.find).toHaveBeenCalledWith({
        where: { soKey: formatKey },
        order: { vpos: 'ASC', hpos: 'ASC' },
      });
    });

    it('should return empty array for non-existent format', async () => {
      const formatKey = 'NON_EXISTENT';

      jest.spyOn(soFormatRepository, 'find').mockResolvedValue([]);

      const result = await (service as any).getFormatConfig(formatKey);

      expect(result).toEqual([]);
    });
  });
});
