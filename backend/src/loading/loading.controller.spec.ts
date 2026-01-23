import { Test, TestingModule } from '@nestjs/testing';
import { LoadingController } from './loading.controller';
import { LoadingService } from './loading.service';
import { CreateLoadingMasterDto } from './dto/create-loading-master.dto';
// DTO for assigning DNs to loading (inline definition since file doesn't exist)
interface AssignDnsToLoadingDto {
  loadingNo: string;
  dnNos: string[];
}

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

  const mockLoadingService = {
    createLoadingMaster: jest.fn(),
    createLoadingAdvice: jest.fn(),
    assignDnsToLoading: jest.fn(),
    searchLoadingMasters: jest.fn(),
    findLoadingMaster: jest.fn(),
    findLoadingAdvice: jest.fn(),
    getDnsForLoading: jest.fn(),
    updateLoadingMasterStatus: jest.fn(),
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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createLoadingMaster', () => {
    it('should create a loading master', async () => {
      const createDto: CreateLoadingMasterDto = {
        loadingNo: 'LOAD001',
        date: '2025-01-20',
        vesselName: 'Test Vessel',
        voyageNo: 'V001',
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
        date: '2025-01-20',
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
      };

      const mockResult = {
        loadingNo: 'LOAD001',
        assignedDns: ['DN001', 'DN002'],
        containerNo: 'CONT001',
      };

      mockLoadingService.assignDnsToLoading.mockResolvedValue(
        mockResult as any,
      );

      const result = await controller.assignDnsToLoading(
        assignDto.loadingNo,
        assignDto.dnNos,
      );

      expect(result).toEqual(mockResult);
      expect(mockLoadingService.assignDnsToLoading).toHaveBeenCalledWith(
        assignDto.loadingNo,
        assignDto.dnNos,
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

      await expect(
        controller.assignDnsToLoading(assignDto.loadingNo, assignDto.dnNos),
      ).rejects.toThrow('DN not confirmed');
    });
  });

  describe('createLoadingAdvice', () => {
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

      mockLoadingService.createLoadingAdvice.mockResolvedValue(
        mockResult as any,
      );

      const result = await controller.createLoadingAdvice({
        loadingNo: 'LOAD001',
        laNo: 'LA001',
        date: '2025-01-20',
        details: [],
      } as any);

      expect(result).toEqual(mockResult);
      expect(mockLoadingService.createLoadingAdvice).toHaveBeenCalled();
    });
  });

  describe('searchLoadingMasters', () => {
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

      mockLoadingService.searchLoadingMasters.mockResolvedValue(
        mockResult.data as any,
      );

      const result = await controller.searchLoadingMasters();

      expect(Array.isArray(result)).toBe(true);
      expect(mockLoadingService.searchLoadingMasters).toHaveBeenCalled();
    });

    it('should handle search filters', async () => {
      mockLoadingService.searchLoadingMasters.mockResolvedValue([]);

      await controller.searchLoadingMasters(
        'LOAD001',
        undefined,
        undefined,
        'Draft',
      );

      expect(mockLoadingService.searchLoadingMasters).toHaveBeenCalled();
    });
  });

  describe('findLoadingMaster', () => {
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

      mockLoadingService.findLoadingMaster.mockResolvedValue(mockResult as any);

      const result = await controller.findLoadingMaster('LOAD001');

      expect(result).toEqual(mockResult);
      expect(mockLoadingService.findLoadingMaster).toHaveBeenCalledWith(
        'LOAD001',
      );
    });
  });

  describe('updateLoadingMasterStatus', () => {
    it('should update loading status', async () => {
      const mockResult = {
        loadingNo: 'LOAD001',
        status: 'Completed',
      };

      mockLoadingService.updateLoadingMasterStatus.mockResolvedValue(
        mockResult as any,
      );

      const result = await controller.updateLoadingMasterStatus(
        'LOAD001',
        'Completed',
      );

      expect(result).toEqual(mockResult);
      expect(mockLoadingService.updateLoadingMasterStatus).toHaveBeenCalledWith(
        'LOAD001',
        'Completed',
      );
    });

    it('should handle status update errors', async () => {
      mockLoadingService.updateLoadingMasterStatus.mockRejectedValue(
        new Error('Invalid transition'),
      );

      await expect(
        controller.updateLoadingMasterStatus('LOAD001', 'Invalid'),
      ).rejects.toThrow('Invalid transition');
    });
  });

  // Note: remove method not implemented in controller
  // describe('remove', () => {
  //   it('should delete a loading master', async () => {
  //     mockLoadingService.remove.mockResolvedValue({ affected: 1 } as any);
  //     const result = await controller.remove('LOAD001');
  //     expect(result).toEqual({ affected: 1 });
  //   });
  // });

  // Note: search method not implemented in controller
  // describe('search', () => {
  //   it('should search loading masters', async () => {
  //     const searchParams = { loadingNo: 'LOAD001', vesselName: 'Test' };
  //     const mockResult = [{ loadingNo: 'LOAD001', vesselName: 'Test Vessel' }];
  //     mockLoadingService.search.mockResolvedValue(mockResult as any);
  //     const result = await controller.search(searchParams);
  //     expect(result).toEqual(mockResult);
  //   });
  // });

  // Note: getContainerAssignments method not implemented in controller
  // describe('getContainerAssignments', () => {
  //   it('should return container assignments', async () => {
  //     const mockResult = [
  //       {
  //         containerNo: 'CONT001',
  //         dns: ['DN001', 'DN002'],
  //         totalQty: 300,
  //         totalNet: 150,
  //         totalWt: 165,
  //       },
  //     ];
  //     mockLoadingService.getDnsForLoading.mockResolvedValue(mockResult as any);
  //     const result = await controller.getDnsForLoading('LOAD001');
  //     expect(result).toEqual(mockResult);
  //   });
  // });

  describe('error handling', () => {
    it('should handle service errors in create', async () => {
      const createDto: CreateLoadingMasterDto = {
        loadingNo: 'LOAD001',
        date: '2025-01-20',
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

      await expect(
        controller.assignDnsToLoading(assignDto.loadingNo, assignDto.dnNos),
      ).rejects.toThrow('Assignment failed');
    });

    it('should handle advice generation errors', async () => {
      mockLoadingService.createLoadingAdvice.mockRejectedValue(
        new Error('Generation failed'),
      );

      await expect(
        controller.createLoadingAdvice({
          loadingNo: 'LOAD001',
          laNo: 'LA001',
          date: '2025-01-20',
          details: [],
        } as any),
      ).rejects.toThrow('Generation failed');
    });

    it('should handle update errors', async () => {
      mockLoadingService.updateLoadingMasterStatus.mockRejectedValue(
        new Error('Status update failed'),
      );

      await expect(
        controller.updateLoadingMasterStatus('LOAD001', 'Active'),
      ).rejects.toThrow('Status update failed');
    });

    // Note: remove method not implemented in controller
    // it('should handle deletion errors', async () => {
    //   mockLoadingService.remove.mockRejectedValue(
    //     new Error('Cannot delete completed loading'),
    //   );
    //   await expect(controller.remove('LOAD001')).rejects.toThrow(
    //     'Cannot delete completed loading',
    //   );
    // });
  });
});
