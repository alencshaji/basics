import { PartialType } from "@nestjs/swagger";
import { CreateStockLocationDto } from "./create-stockLocation.dto";


export class UpdateStockLocationDto extends PartialType(CreateStockLocationDto) {
    
}
