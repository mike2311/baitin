import { Test, TestingModule } from '@nestjs/testing';
import { LoadingController } from './loading.controller';
import { LoadingService } from './loading.service';
import { CreateLoadingMasterDto } from './dto/create-loading-master.dto';
import { AssignDnsToLoadingDto } from './dto/assign-dns-to-loading.dto';

/**
 * Loading Controller Tests
 *
 * Original Logic Reference:
 * - Legacy Forms: ila, ila2
 * - Documentation: docs/source/02-business-processes/delivery-note-process.md
 * - Business Rules:
 *   - Test REST API endpoints
 *   - Test request/response handling
 *   - Test error responses
 *   - Test authentication guards
 *
 * Reference: Phase 3 - Loading Module
 */
describe('LoadingController', () => {
  let controller: LoadingController;
  let service: LoadingService;

  const mockLoadingService = {
    createLoadingMaster: jest.fn(),
    assignDnsToLoading: jest.fn(),
    generateLoadingAdvice: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateLoadingStatus: jest.fn(),
    remove: jest.fn(),
    search: jest.fn(),
    getContainerAssignments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoadingController],
      providers: [
        {
          provide: LoadingService,
          useValue: mockLoadingService,
        },
      ],
    }).compile();

    controller = module.get<LoadingController>(LoadingController);
    service = module.get<LoadingService>(LoadingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createLoadingMaster', () => {
    it('should create a loading master', async () => {
      const createDto: CreateLoadingMasterDto = {
        loadingNo: 'LOAD001',
        vesselName: 'Test Vessel',
        voyageNo: 'V001',
        eta: new Date('2025-02-01'),
        etd: new Date('2025-02-05'),
        loadingPort: 'PORT1',
        dischargePort: 'PORT2',
      };

      const mockResult = {
        loadingNo: 'LOAD001',
        vesselName: 'Test Vessel',
        status: 'Draft',
      };

      mockLoadingService.createLoadingMaster.mockResolvedValue(
        mockResult as any,
      );

      const result = await controller.createLoadingMaster(createDto);

      expect(result).toEqual(mockResult);
      expect(mockLoadingService.createLoadingMaster).toHaveBeenCalledWith(
        createDto,
      );
    });

    it('should handle create errors', async () => {
      const createDto: CreateLoadingMasterDto = {
        loadingNo: 'LOAD001',
        vesselName: 'Test Vessel',
        voyageNo: 'V001',
      };

      mockLoadingService.createLoadingMaster.mockRejectedValue(
        new Error('Validation error'),
      );

      await expect(controller.createLoadingMaster(createDto)).rejects.toThrow(
        'Validation error',
      );
    });
  });

  describe('assignDnsToLoading', () => {
    it('should assign DNs to loading', async () => {
      const assignDto: AssignDnsToLoadingDto = {
        loadingNo: 'LOAD001',
        dnNos: ['DN001', 'DN002'],
        containerNo: 'CONT001',
      };

      const mockResult = {
        loadingNo: 'LOAD001',
        assignedDns: ['DN001', 'DN002'],
        containerNo: 'CONT001',
      };

      mockLoadingService.assignDnsToLoading.mockResolvedValue(
        mockResult as any,
      );

      const result = await controller.assignDnsToLoading(assignDto);

      expect(result).toEqual(mockResult);
      expect(mockLoadingService.assignDnsToLoading).toHaveBeenCalledWith(
        assignDto,
      );
    });

    it('should handle assignment errors', async () => {
      const assignDto: AssignDnsToLoadingDto = {
        loadingNo: 'LOAD001',
        dnNos: ['DN001'],
      };

      mockLoadingService.assignDnsToLoading.mockRejectedValue(
        new Error('DN not confirmed'),
      );

      await expect(controller.assignDnsToLoading(assignDto)).rejects.toThrow(
        'DN not confirmed',
      );
    });
  });

  describe('generateLoadingAdvice', () => {
    it('should generate loading advice', async () => {
      const mockResult = {
        loadingNo: 'LOAD001',
        adviceNo: 'LA001',
        containers: [
          {
            containerNo: 'CONT001',
            totalQty: 300,
            totalNet: 150,
            totalWt: 165,
          },
        ],
      };

      mockLoadingService.generateLoadingAdvice.mockResolvedValue(
        mockResult as any,
      );

      const result = await controller.generateLoadingAdvice('LOAD001');

      expect(result).toEqual(mockResult);
      expect(mockLoadingService.generateLoadingAdvice).toHaveBeenCalledWith(
        'LOAD001',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated loading masters', async () => {
      const mockResult = {
        data: [
          { loadingNo: 'LOAD001', vesselName: 'Vessel 1', status: 'Draft' },
          { loadingNo: 'LOAD002', vesselName: 'Vessel 2', status: 'Active' },
        ],
        total: 2,
        page: 1,
        limit: 10,
      };

      mockLoadingService.findAll.mockResolvedValue(mockResult as any);

      const result = await controller.findAll(1, 10);

      expect(result).toEqual(mockResult);
      expect(mockLoadingService.findAll).toHaveBeenCalledWith(1, 10);
    });

    it('should handle pagination parameters', async () => {
      mockLoadingService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        limit: 20,
      } as any);

      await controller.findAll(2, 20);

      expect(mockLoadingService.findAll).toHaveBeenCalledWith(2, 20);
    });

    it('should handle search filters', async () => {
      const searchParams = { loadingNo: 'LOAD001', status: 'Draft' };

      mockLoadingService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      } as any);

      await controller.findAll(1, 10, searchParams);

      expect(mockLoadingService.findAll).toHaveBeenCalledWith(
        1,
        10,
        searchParams,
      );
    });
  });

  describe('findOne', () => {
    it('should return a single loading master', async () => {
      const mockResult = {
        loadingNo: 'LOAD001',
        vesselName: 'Test Vessel',
        voyageNo: 'V001',
        status: 'Active',
        containerAssignments: [
          {
            containerNo: 'CONT001',
            dns: ['DN001', 'DN002'],
          },
        ],
      };

      mockLoadingService.findOne.mockResolvedValue(mockResult as any);

      const result = await controller.findOne('LOAD001');

      expect(result).toEqual(mockResult);
      expect(mockLoadingService.findOne).toHaveBeenCalledWith('LOAD001');
    });
  });

  describe('updateLoadingStatus', () => {
    it('should update loading status', async () => {
      const mockResult = {
        loadingNo: 'LOAD001',
        status: 'Completed',
      };

      mockLoadingService.updateLoadingStatus.mockResolvedValue(
        mockResult as any,
      );

      const result = await controller.updateLoadingStatus(
        'LOAD001',
        'Completed',
      );

      expect(result).toEqual(mockResult);
      expect(mockLoadingService.updateLoadingStatus).toHaveBeenCalledWith(
        'LOAD001',
        'Completed',
      );
    });

    it('should handle status update errors', async () => {
      mockLoadingService.updateLoadingStatus.mockRejectedValue(
        new Error('Invalid transition'),
      );

      await expect(
        controller.updateLoadingStatus('LOAD001', 'Invalid'),
      ).rejects.toThrow('Invalid transition');
    });
  });

  describe('remove', () => {
    it('should delete a loading master', async () => {
      mockLoadingService.remove.mockResolvedValue({ affected: 1 } as any);

      const result = await controller.remove('LOAD001');

      expect(result).toEqual({ affected: 1 });
      expect(mockLoadingService.remove).toHaveBeenCalledWith('LOAD001');
    });
  });

  describe('search', () => {
    it('should search loading masters', async () => {
      const searchParams = { loadingNo: 'LOAD001', vesselName: 'Test' };
      const mockResult = [{ loadingNo: 'LOAD001', vesselName: 'Test Vessel' }];

      mockLoadingService.search.mockResolvedValue(mockResult as any);

      const result = await controller.search(searchParams);

      expect(result).toEqual(mockResult);
      expect(mockLoadingService.search).toHaveBeenCalledWith(searchParams);
    });
  });

  describe('getContainerAssignments', () => {
    it('should return container assignments', async () => {
      const mockResult = [
        {
          containerNo: 'CONT001',
          dns: ['DN001', 'DN002'],
          totalQty: 300,
          totalNet: 150,
          totalWt: 165,
        },
      ];

      mockLoadingService.getContainerAssignments.mockResolvedValue(
        mockResult as any,
      );

      const result = await controller.getContainerAssignments('LOAD001');

      expect(result).toEqual(mockResult);
      expect(mockLoadingService.getContainerAssignments).toHaveBeenCalledWith(
        'LOAD001',
      );
    });
  });

  describe('error handling', () => {
    it('should handle service errors in create', async () => {
      const createDto: CreateLoadingMasterDto = {
        loadingNo: 'LOAD001',
        vesselName: 'Test Vessel',
        voyageNo: 'V001',
      };

      mockLoadingService.createLoadingMaster.mockRejectedValue(
        new Error('Service error'),
      );

      await expect(controller.createLoadingMaster(createDto)).rejects.toThrow(
        'Service error',
      );
    });

    it('should handle assignment errors', async () => {
      const assignDto: AssignDnsToLoadingDto = {
        loadingNo: 'LOAD001',
        dnNos: ['DN001'],
      };

      mockLoadingService.assignDnsToLoading.mockRejectedValue(
        new Error('Assignment failed'),
      );

      await expect(controller.assignDnsToLoading(assignDto)).rejects.toThrow(
        'Assignment failed',
      );
    });

    it('should handle advice generation errors', async () => {
      mockLoadingService.generateLoadingAdvice.mockRejectedValue(
        new Error('Generation failed'),
      );

      await expect(controller.generateLoadingAdvice('LOAD001')).rejects.toThrow(
        'Generation failed',
      );
    });

    it('should handle update errors', async () => {
      mockLoadingService.updateLoadingStatus.mockRejectedValue(
        new Error('Status update failed'),
      );

      await expect(
        controller.updateLoadingStatus('LOAD001', 'Active'),
      ).rejects.toThrow('Status update failed');
    });

    it('should handle deletion errors', async () => {
      mockLoadingService.remove.mockRejectedValue(
        new Error('Cannot delete completed loading'),
      );

      await expect(controller.remove('LOAD001')).rejects.toThrow(
        'Cannot delete completed loading',
      );
    });
  });
});
