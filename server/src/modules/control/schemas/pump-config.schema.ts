import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import {
  SensorType,
  PumpCondition,
} from '../../../common/enums/smart-farm.enums';

export type PumpConfigDocument = HydratedDocument<PumpConfig>;

// Condition for triggering the pump
class PumpTrigger {
  @Prop({ required: true, enum: SensorType })
  type!: string;

  @Prop({ required: true, enum: PumpCondition })
  condition!: string;

  @Prop({ required: true })
  value!: number;
}

@Schema({ timestamps: true })
export class PumpConfig {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Device',
    required: true,
    index: true,
  })
  device_id!: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  enabled!: boolean;

  @Prop({ type: [PumpTrigger], required: true })
  triggers!: PumpTrigger[];

  @Prop({ required: true })
  duration!: number;

  @Prop({ required: true })
  cooldown!: number;

  @Prop()
  last_triggered?: Date;
}

export const PumpConfigSchema = SchemaFactory.createForClass(PumpConfig);
