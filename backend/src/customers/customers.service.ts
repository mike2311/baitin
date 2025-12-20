import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Like } from 'typeorm'
import { Customer } from './entities/customer.entity'
import { CreateCustomerDto } from './dto/create-customer.dto'
import { UpdateCustomerDto } from './dto/update-customer.dto'
import { CustomerSearchResponseDto } from './dto/customer-search-response.dto'

/**
 * Customer Service
 * 
 * Implements customer master data CRUD operations.
 * 
 * Original Logic Reference:
 * - Documentation: docs/source/02-business-processes/master-data-management.md lines 164-290
 * - Validation: docs/04-forms-and-screens/validation-catalog.md lines 57-67
 * 
 * Business Rules:
 * - cust_no must be unique
 * - Customer name required
 * 
 * Reference: Task 02-01 - Customer Entry Form
 */
@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto, userId: string): Promise<Customer> {
    // Validate customer number uniqueness
    await this.validateCustomerNumberUniqueness(createCustomerDto.custNo)

    // Create customer with audit fields
    const customer = this.customerRepository.create({
      ...createCustomerDto,
      creDate: new Date(),
      creUser: userId,
      userId: userId,
    })

    return await this.customerRepository.save(customer)
  }

  async findAll(
    page: number = 1,
    limit: number = 50,
    filter?: string,
  ): Promise<{ customers: Customer[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit

    const where = filter
      ? [
          { custNo: Like(`%${filter}%`) },
          { ename: Like(`%${filter}%`) },
          { sname: Like(`%${filter}%`) },
        ]
      : {}

    const [customers, total] = await this.customerRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { custNo: 'ASC' },
    })

    return {
      customers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findOne(custNo: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { custNo },
    })

    if (!customer) {
      throw new NotFoundException(`Customer Number "${custNo}" Not Found`)
    }

    return customer
  }

  async update(
    custNo: string,
    updateCustomerDto: UpdateCustomerDto,
    userId: string,
  ): Promise<Customer> {
    const customer = await this.findOne(custNo)

    // Update customer with audit fields
    Object.assign(customer, updateCustomerDto)
    customer.modDate = new Date()
    customer.modUser = userId

    return await this.customerRepository.save(customer)
  }

  async remove(custNo: string): Promise<void> {
    const customer = await this.findOne(custNo)
    await this.customerRepository.remove(customer)
  }

  async search(
    query: string,
    limit: number = 20,
  ): Promise<CustomerSearchResponseDto[]> {
    const customers = await this.customerRepository.find({
      where: [
        { custNo: Like(`%${query}%`) },
        { ename: Like(`%${query}%`) },
        { sname: Like(`%${query}%`) },
      ],
      take: limit,
      order: { custNo: 'ASC' },
    })

    return customers.map((customer) => ({
      code: customer.custNo,
      name: customer.ename || customer.custNo,
      description: customer.sname,
    }))
  }

  /**
   * Validates customer number uniqueness
   * 
   * Business Rule:
   * - cust_no must be unique in customer table
   * 
   * @param custNo - Customer number to validate
   * @throws BadRequestException if customer already exists
   */
  private async validateCustomerNumberUniqueness(custNo: string): Promise<void> {
    const existing = await this.customerRepository.findOne({
      where: { custNo },
    })

    if (existing) {
      throw new BadRequestException('Customer Number Already Exists')
    }
  }
}

