export enum DeviceStatus {
  UNCLAIMED = 'UNCLAIMED',
  ACTIVE = 'ACTIVE',
  OFFLINE = 'OFFLINE',
}

export enum SensorType {
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  SOIL_MOISTURE = 'soil_moisture',
  LIGHT_LEVEL = 'light_level',
}

export enum AlertStatus {
  LOW = 'LOW',
  HIGH = 'HIGH',
  NORMAL = 'NORMAL',
}

export enum AlertType {
  ENV = 'ENV',
  SYSTEM = 'SYSTEM',
  DEVICE = 'DEVICE',
}

export enum PumpCondition {
  LESS_THAN = 'LESS_THAN',
  GREATER_THAN = 'GREATER_THAN',
}

export enum TriggerSource {
  MANUAL = 'MANUAL',
  ENV = 'ENV',
}

export enum PumpActionStatus {
  FINISH = 'FINISH',
  ERROR = 'ERROR',
}
