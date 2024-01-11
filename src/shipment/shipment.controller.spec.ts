import { Test, TestingModule } from '@nestjs/testing';
import { ShipmentController } from './shipment.controller';
import { ShipmentService } from './shipment.service';

describe('ShipmentController', () => {
  let controller: ShipmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShipmentController],
      providers: [ShipmentService],
    }).compile();

    controller = module.get<ShipmentController>(ShipmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
