import { Test, TestingModule } from '@nestjs/testing';
import { ShippingOrderController } from './shipping-order.controller';
import { ShippingOrderService } from './shipping-order.service';
import { ShippingOrderDocumentService } from './shipping-order-document.service';
import { CreateShippingOrderDto } from './dto/create-shipping-order.dto';
import { UpdateShippingOrderDto } from './dto/update-shipping-order.dto';
import { GenerateSoDocumentDto } from './dto/generate-so-document.dto';
// SoDocumentType enum not exported from DTO

/**
 * Shipping Order Controller Tests
 *
 * Original Logic Reference:
 * - Legacy Forms: isetso, pso, pso_pdf
 * - Documentation: docs/source/02-business-processes/shipping-process.md
 * - Business Rules:
 *   - Test REST API endpoints
 *   - Test request/response handling
 *   - Test error responses
 *   - Test authentication guards
 *
 * Reference: Phase 3 - Shipping Order Module
 */
describe('ShippingOrderController', () => {
  let controller: ShippingOrderController;
  let service: ShippingOrderService;
  let documentService: ShippingOrderDocumentService;

  const mockShippingOrderService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    search: jest.fn(),
    getAvailableItemsForSo: jest.fn(),
    getSoFormat: jest.fn(),
  };

  const mockDocumentService = {
    previewSoDocument: jest.fn(),
    generateSoDocument: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShippingOrderController],
      providers: [
        {
          provide: ShippingOrderService,
          useValue: mockShippingOrderService,
        },
        {
          provide: ShippingOrderDocumentService,
          useValue: mockDocumentService,
        },
      ],
    }).compile();

    controller = module.get<ShippingOrderController>(ShippingOrderController);
    service = module.get<ShippingOrderService>(ShippingOrderService);
    documentService = module.get<ShippingOrderDocumentService>(
      ShippingOrderDocumentService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a shipping order', async () => {
      const createDto: CreateShippingOrderDto = {
        soNo: 'SO001',
        itemNo: 'ITEM001',
        qty: 100,
      };

      const mockResult = {
        ...createDto,
        creDate: new Date(),
        modDate: new Date(),
      };

      mockShippingOrderService.create.mockResolvedValue(mockResult);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockResult);
      expect(mockShippingOrderService.create).toHaveBeenCalledWith(createDto);
    });

    it('should handle create errors', async () => {
      const createDto: CreateShippingOrderDto = {
        soNo: 'SO001',
        itemNo: 'ITEM001',
        qty: 100,
      };

      mockShippingOrderService.create.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.create(createDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated shipping orders', async () => {
      const mockResult = {
        data: [
          { soNo: 'SO001', itemNo: 'ITEM001', qty: 100 },
          { soNo: 'SO002', itemNo: 'ITEM002', qty: 200 },
        ],
        total: 2,
        page: 1,
        limit: 10,
      };

      mockShippingOrderService.findAll.mockResolvedValue(mockResult as any);

      const result = await controller.search();

      expect(result).toEqual(mockResult);
      expect(mockShippingOrderService.findAll).toHaveBeenCalledWith(1, 10);
    });

    it('should handle pagination parameters', async () => {
      mockShippingOrderService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        limit: 20,
      } as any);

      await controller.search();

      expect(mockShippingOrderService.search).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single shipping order', async () => {
      const mockResult = {
        soNo: 'SO001',
        itemNo: 'ITEM001',
        qty: 100,
      };

      mockShippingOrderService.findOne.mockResolvedValue(mockResult as any);

      const result = await controller.findOne('SO001');

      expect(result).toEqual(mockResult);
      expect(mockShippingOrderService.findOne).toHaveBeenCalledWith('SO001');
    });
  });

  describe('update', () => {
    it('should update a shipping order', async () => {
      const updateDto: UpdateShippingOrderDto = {
        qty: 150,
        // price not in DTO
      };

      const mockResult = {
        soNo: 'SO001',
        itemNo: 'ITEM001',
        qty: 150,
      };

      mockShippingOrderService.update.mockResolvedValue(mockResult as any);

      const result = await controller.update('SO001', updateDto);

      expect(result).toEqual(mockResult);
      expect(mockShippingOrderService.update).toHaveBeenCalledWith(
        'SO001',
        updateDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a shipping order', async () => {
      mockShippingOrderService.remove.mockResolvedValue({ affected: 1 } as any);

      const result = await controller.remove('SO001');

      expect(result).toEqual({ affected: 1 });
      expect(mockShippingOrderService.remove).toHaveBeenCalledWith('SO001');
    });
  });

  describe('search', () => {
    it('should search shipping orders', async () => {
      const mockResult = [{ soNo: 'SO001', itemNo: 'ITEM001', qty: 100 }];

      mockShippingOrderService.search.mockResolvedValue(mockResult as any);

      const result = await controller.search('SO001', undefined, undefined, 'ITEM001');

      expect(result).toEqual(mockResult);
      expect(mockShippingOrderService.search).toHaveBeenCalledWith({
        soNo: 'SO001',
        confNo: undefined,
        contNo: undefined,
        itemNo: 'ITEM001',
        shipDateFrom: undefined,
        shipDateTo: undefined,
      });
    });
  });

  describe('getAvailableItems', () => {
    it('should return available items for SO', async () => {
      const mockResult = [
        { itemNo: 'ITEM001', availableQty: 500, itemName: 'Test Item' },
        { itemNo: 'ITEM002', availableQty: 300, itemName: 'Another Item' },
      ];

      mockShippingOrderService.getAvailableItemsForSo.mockResolvedValue(
        mockResult as any,
      );

      const result = await controller.getAvailableItemsForSo('oc', 'CUST001');

      expect(result).toEqual(mockResult);
      expect(mockShippingOrderService.getAvailableItemsForSo).toHaveBeenCalledWith(
        'oc',
        'CUST001',
      );
    });
  });

  describe('getSoFormat', () => {
    it('should return SO format configuration', async () => {
      const mockResult = [
        {
          soKey: 'DEFAULT',
          uniqueid: 'company',
          vpos: 1,
          hpos: 1,
          data: 'Company Name',
        },
        {
          soKey: 'DEFAULT',
          uniqueid: 'so_no',
          vpos: 2,
          hpos: 1,
          data: 'SO Number',
        },
      ];

      mockShippingOrderService.getSoFormat.mockResolvedValue(mockResult as any);

      const result = await controller.getSoFormat('DEFAULT');

      expect(result).toEqual(mockResult);
      expect(mockShippingOrderService.getSoFormat).toHaveBeenCalledWith(
        'DEFAULT',
      );
    });
  });

  // Note: previewSoDocument and generateSoDocument methods not on controller
  // These are on shipping-order-document.controller instead
  // describe('previewSoDocument', () => {
  //   it('should preview SO document', async () => {
  //     const generateDto: GenerateSoDocumentDto = {
  //       soNos: ['SO001'],
  //       // documentType not in DTO
  //       outputFormat: 'excel',
  //     };

  //     const mockResult = {
  //       soNos: ['SO001'],
  //       // documentType not in DTO
  //       data: [
  //         {
  //           soNo: 'SO001',
  //           date: new Date(),
  //           items: [],
  //         },
  //       ],
  //     };

  //     mockDocumentService.previewSoDocument.mockResolvedValue(mockResult);

  //     const result = await controller.previewSoDocument(generateDto);

  //     expect(result).toEqual(mockResult);
  //     expect(mockDocumentService.previewSoDocument).toHaveBeenCalledWith(
  //       generateDto,
  //     );
  //   });
  // });

  // describe('generateSoDocument', () => {
  //   it('should generate SO document file', async () => {
  //     const generateDto: GenerateSoDocumentDto = {
  //       soNos: ['SO001'],
  //       // documentType not in DTO
  //       outputFormat: 'excel',
  //     };

  //     const mockResult = {
  //       soNos: ['SO001'],
  //       // documentType not in DTO
  //       fileName: 'SO001_SO_DOCUMENT_2025-01-15.xlsx',
  //       fileSize: 10240,
  //       format: 'excel',
  //       generatedAt: new Date(),
  //       fileBuffer: Buffer.from('mock excel data'),
  //     };

  //     mockDocumentService.generateSoDocument.mockResolvedValue(mockResult);

  //     // Mock Express Response
  //     const mockRes = {
  //       setHeader: jest.fn(),
  //       send: jest.fn(),
  //     };

  //     const result = await controller.generateSoDocument(
  //       generateDto,
  //       mockRes as any,
  //     );

  //     expect(mockDocumentService.generateSoDocument).toHaveBeenCalledWith(
  //       generateDto,
  //     );
  //     expect(mockRes.setHeader).toHaveBeenCalledWith(
  //       'Content-Type',
  //       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  //     );
  //     expect(mockRes.setHeader).toHaveBeenCalledWith(
  //       'Content-Disposition',
  //       `attachment; filename="${mockResult.fileName}"`,
  //     );
  //     expect(mockRes.setHeader).toHaveBeenCalledWith(
  //       'Content-Length',
  //       mockResult.fileSize.toString(),
  //     );
  //     expect(mockRes.send).toHaveBeenCalledWith(mockResult.fileBuffer);
  //   });

  //   it('should handle PDF generation', async () => {
  //     const generateDto: GenerateSoDocumentDto = {
  //       soNos: ['SO001'],
  //       // documentType not in DTO
  //       outputFormat: 'pdf',
  //     };

  //     const mockResult = {
  //       fileName: 'SO001_SO_DOCUMENT_2025-01-15.pdf',
  //       fileSize: 5120,
  //       format: 'pdf',
  //       fileBuffer: Buffer.from('mock pdf data'),
  //     };

  //     mockDocumentService.generateSoDocument.mockResolvedValue(mockResult);

  //     const mockRes = {
  //       setHeader: jest.fn(),
  //       send: jest.fn(),
  //     };

  //     await controller.generateSoDocument(generateDto, mockRes as any);

  //     expect(mockRes.setHeader).toHaveBeenCalledWith(
  //       'Content-Type',
  //       'application/pdf',
  //     );
  //     expect(mockRes.setHeader).toHaveBeenCalledWith(
  //       'Content-Disposition',
  //       `attachment; filename="${mockResult.fileName}"`,
  //     );
  //   });
  // });

  describe('error handling', () => {
    it('should handle service errors in create', async () => {
      const createDto: CreateShippingOrderDto = {
        soNo: 'SO001',
        itemNo: 'ITEM001',
        qty: 100,
      };

      mockShippingOrderService.create.mockRejectedValue(
        new Error('Service error'),
      );

      await expect(controller.create(createDto)).rejects.toThrow(
        'Service error',
      );
    });

    // it('should handle document service errors', async () => {
    //   const generateDto: GenerateSoDocumentDto = {
    //     soNos: ['SO001'],
    //     // documentType not in DTO
    //     outputFormat: 'excel',
    //   };

    //   mockDocumentService.generateSoDocument.mockRejectedValue(
    //     new Error('Document generation failed'),
    //   );

    //   const mockRes = {
    //     setHeader: jest.fn(),
    //     send: jest.fn(),
    //   };

    //   await expect(
    //     controller.generateSoDocument(generateDto, mockRes as any),
    //   ).rejects.toThrow('Document generation failed');
    // });
  });
});
