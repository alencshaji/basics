import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Model } from "mongoose";
import { StockItem, StockStatus } from "src/schemas/stockItem.schema";


@Injectable()
export class StockStatusUpdate {
    constructor(
        @InjectModel('StockItem') private readonly stockItemModel: Model<StockItem>,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async updateExpiredStockItems() {
        const now = new Date();

        await this.stockItemModel.updateMany(
            { expiryDate: { $lt: now }},
            { $set: { status: StockStatus.Expired } }
        );

        console.log('Stock items status updated');
    }
}