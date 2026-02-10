// src/hooks/useSystemConfigs.ts
import { ISystemConfig } from "../types/customTypes";
import { useAppSelector } from "../store";
import { 
   comPorts as DEFAULT_COM_PORTS,
   connectionOptions as DEFAULT_CONNECTION_OPTIONS,
   ioStations as DEFAULT_IO_STATIONS,
   IRDCToolAxelOptions as DEFAULT_IRDC_OPTIONS,
   ioPinToNumberMap as DEFAULT_IO_MAP,
   pulses as DEFAULT_PULSES, 
   stages as DEFAULT_STAGES,
   toolsOptions as DEFAULT_TOOLS_OPTIONS,
   program as DEFAULT_PROGRAM,
   convName as DEFAULT_CONV_NAME,
   conveyorStageRanges as DEFAULT_CONVEYOR_STAGE_RANGES,
   models as DEFAULT_MODELS,
   type as DEFAULT_TYPE,
   rolePolicy as DEFAULT_ROLE_POLICY,
   partName as DEFAULT_PARTNAME,
   machines as DEFAULT_MACHINES,
   REPORT_PARAMETER_CONFIG as DEFAULT_REPORT_PARAMETER_CONFIG,
   reportTypes as DEFAULT_REPORT_TYPES,
   scheduleModeOptions as DEFAULT_SCHEDULE_MODE_OPTIONS
} from "../constants/commonConstants";
export const useSystemConfigs = () => {
  const systemConfigs = useAppSelector(
    (state) =>
      state.systemConfigsReducer.data?.docs as ISystemConfig[] | undefined
  );

  // Generic getter by key
 const getConfigValue = <T,>(configId: string, defaultValue: T): T => {
    const config = systemConfigs?.find((c: ISystemConfig) => c.id === configId);
    return config ? config.value : defaultValue;
  };


  const ioPinToNumberMap = getConfigValue<Record<string, string>>(
    'ioPinToNumberMap',
    DEFAULT_IO_MAP
  );

  const pulses = getConfigValue<Array<{value: string, label: string}>>(
    'pulses',
    DEFAULT_PULSES
  );

  const stages = getConfigValue<Array<{value: string, label: string}>>(
    'stages',
    DEFAULT_STAGES
  );

  const comPorts = getConfigValue<Array<{value: string, label: string}>>(
    'comPorts',
    DEFAULT_COM_PORTS
  );

  const connectionOptions = getConfigValue<Array<{value: string, label: string}>>(
    'connectionOptions',
    DEFAULT_CONNECTION_OPTIONS
  );

  const toolsOptions = getConfigValue<Array<{value: string, label: string}>>(
    'toolsOptions',
    DEFAULT_TOOLS_OPTIONS
  );

  const IRDCToolAxelOptions = getConfigValue<Array<{value: string, label: string}>>(
    'IRDCToolAxelOptions',
    DEFAULT_IRDC_OPTIONS
  );

  const programOptions = getConfigValue<Array<{value: string, label: string}>>(
    'program',
    DEFAULT_PROGRAM
  );
   const convName = getConfigValue<Array<{value: string, label: string}>>(
    'convName',
    DEFAULT_CONV_NAME
  );
    const conveyorStageRanges = getConfigValue<Record<string, { start: number; end: number }>>(
    'conveyorStageRanges',
    DEFAULT_CONVEYOR_STAGE_RANGES
  );
    const ioStations = getConfigValue<Array<{value: string, label: string}>>(
    'ioStations',
    DEFAULT_IO_STATIONS
  );
  const models = getConfigValue<Array<{value: string, label: string}>>(
    'models',
    DEFAULT_MODELS
  );
  const type = getConfigValue<Array<{value: string, label: string}>>(
    'type',
    DEFAULT_TYPE
  );
  const rolePolicy = getConfigValue<Record<string, any>>(
    'rolePolicy',
    DEFAULT_ROLE_POLICY
  );
  const partName = getConfigValue<Array<{value: string, label: string}>>(
    'partName',
    DEFAULT_PARTNAME
  );
  const machines = getConfigValue<Array<{id: string; name: string}>>(
    'machines',
    DEFAULT_MACHINES
  );
  const REPORT_PARAMETER_CONFIG = getConfigValue<Record<string, any>>(
    'REPORT_PARAMETER_CONFIG',
    DEFAULT_REPORT_PARAMETER_CONFIG
  );
  const reportTypes = getConfigValue<Array<{id: string, name: string}>>(
    'reportTypes',
    DEFAULT_REPORT_TYPES
  );
  const scheduleModeOptions = getConfigValue<Array<{id: string, name: string}>>(
    'scheduleModeOptions',
    DEFAULT_SCHEDULE_MODE_OPTIONS
  );
  return {
    ioStations,
    ioPinToNumberMap,
    pulses,
    stages,
    toolsOptions,
    IRDCToolAxelOptions,
    programOptions,
    convName,
    conveyorStageRanges,
    connectionOptions,
    comPorts,
    models,
    type,
    rolePolicy,
    partName,
    machines,
     REPORT_PARAMETER_CONFIG,
      reportTypes,
      scheduleModeOptions
  };
};
