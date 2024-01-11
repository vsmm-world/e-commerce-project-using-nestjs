import { Test, TestingModule } from '@nestjs/testing';
import { ShipmentService } from './shipment.service';

describe('ShipmentService', () => {
  let service: ShipmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShipmentService],
    }).compile();

    service = module.get<ShipmentService>(ShipmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
