import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { KitchenService } from './kitchen.service';
import { GetKitchenItemsDto, UpdateKitchenItemStatusDto } from './dto';
import { RequirePermissions } from '../auth/rbac';

@Controller('kitchen')
export class KitchenController {
  constructor(private readonly kitchenService: KitchenService) {}

  @Get('items')
  @RequirePermissions('kitchen.view-orders')
  async getKitchenItems(@Query() query: GetKitchenItemsDto) {
    return this.kitchenService.getKitchenQueue(query);
  }

  @Patch('items/:itemId/status')
  @RequirePermissions('kitchen.update-status')
  async updateItemStatus(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateKitchenItemStatusDto,
  ) {
    return this.kitchenService.updateKitchenItemStatus(itemId, dto);
  }
}
