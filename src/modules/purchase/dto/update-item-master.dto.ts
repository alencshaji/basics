import { PartialType } from "@nestjs/swagger";
import { CreateItemMasterDto } from "./create-itemmaster.dto";
export class UpdateItemMasterDto extends PartialType(CreateItemMasterDto) {}