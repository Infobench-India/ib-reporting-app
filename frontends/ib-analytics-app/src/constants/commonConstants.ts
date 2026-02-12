import type { IRolePolicy, ParameterConfig } from "../types/customTypes";

export let APP_NAME = "analytics";
export let navItems = [
  // {
  //   label: "Dashboard", href: `/${APP_NAME}/dashboard`
  // },
  // { label: "Home", href: `/${APP_NAME}/home` },
  // { label: "Report View", href: `/${APP_NAME}/reportview` },
  // {
  //   label: "Add Machine Configs",
  //   href: `/${APP_NAME}/machineconfigs`
  // },
  {
    label: "Add Schedule Configs",
    href: `/${APP_NAME}/scheduleconfigs`
  },
  {
    label: "Add Shift Configs",
    href: `/${APP_NAME}/shiftconfigs`
  },
  {
    label: "Event Logs",
    href: `/${APP_NAME}/eventlogs`
  },
  {
    label: "Report History",
    href: `/${APP_NAME}/reporthistory`
  },
  // {
  //   label: "Report Config",
  //   href: `/${APP_NAME}/reportconfigs`
  // },
  // {
  //   label: "SQL Report View",
  //   href: `/${APP_NAME}/sqlreportview`
  // },
  // {
  //   label: "SQL Report Schedule",
  //   href: `/${APP_NAME}/sqlreportschedule`
  // },
  // {
  //   label: "SQL Report History",
  //   href: `/${APP_NAME}/sqlreporthistory`
  // }
];

export let rolePolicy: IRolePolicy = {
  addSKU: ['Site_Owner', 'admin', 'editor'],
  editSKU: ['Site_Owner', 'admin', 'editor'],
  deleteSKU: ['Site_Owner', 'admin'],
  viewSKU: ['Site_Owner', 'admin', 'editor', 'viewer'],
  addPart: ['Site_Owner', 'admin', 'editor'],
  editPart: ['Site_Owner', 'admin', 'editor'],
  deletePart: ['Site_Owner', 'admin'],
  viewPart: ['Site_Owner', 'admin', 'editor', 'viewer'],
  addTool: ['Site_Owner', 'admin', 'editor'],
  editTool: ['Site_Owner', 'admin', 'editor'],
  deleteTool: ['Site_Owner', 'admin'],
  viewTool: ['Site_Owner', 'admin', 'editor', 'viewer'],
  addStation: ['Site_Owner', 'admin', 'editor'],
  editStation: ['Site_Owner', 'admin', 'editor'],
  deleteStation: ['Site_Owner', 'admin'],
  viewStation: ['Site_Owner', 'admin', 'editor', 'viewer'],
  addShift: ['Site_Owner', 'admin', 'editor'],
  editShift: ['Site_Owner', 'admin', 'editor'],
  deleteShift: ['Site_Owner', 'admin'],
  viewShift: ['Site_Owner', 'admin', 'editor', 'viewer'],
};

export let ioPinToNumberMap: any = {
  first: "1",
  second: "2",
  third: "3",
  fourth: "4",
  fifth: "5",
  six: "6",
  seventh: "7",
  eight: "8",
};

export let stages: any = [
  {
    label: 1,
    value: "1"
  },
  {
    label: 2,
    value: "2"
  }
  ,
  {
    label: 3,
    value: "3"
  }
  ,
  {
    label: 4,
    value: "4"
  }
  ,
  {
    label: 5,
    value: "5"
  },
  {
    label: 6,
    value: "6"
  },
  {
    label: 7,
    value: "7"
  },
  {
    label: 8,
    value: "8"
  },
  {
    label: 9,
    value: "9"
  },
  {
    label: 10,
    value: "10"
  },
  {
    label: 11,
    value: "11"
  },
  {
    label: 12,
    value: "12"
  }
  ,
  {
    label: 13,
    value: "13"
  }
  ,
  {
    label: 14,
    value: "14"
  }
  ,
  {
    label: 15,
    value: "15"
  },
  {
    label: 16,
    value: "16"
  },
  {
    label: 17,
    value: "17"
  },
  {
    label: 18,
    value: "18"
  },
  {
    label: 19,
    value: "19"
  },
  {
    label: 20,
    value: "20"
  },
  {
    label: 21,
    value: "21"
  },
  {
    label: 22,
    value: "22"
  }
  ,
  {
    label: 23,
    value: "23"
  }
  ,
  {
    label: 24,
    value: "24"
  }
  ,
  {
    label: 25,
    value: "25"
  },
  {
    label: 26,
    value: "26"
  },
  {
    label: 27,
    value: "27"
  },
  {
    label: 28,
    value: "28"
  },
  {
    label: 29,
    value: "29"
  },
  {
    label: 30,
    value: "30"
  },
  {
    label: 31,
    value: "31"
  },
  {
    label: 32,
    value: "32"
  }
  ,
  {
    label: 33,
    value: "33"
  }
  ,
  {
    label: 34,
    value: "34"
  }
  ,
  {
    label: 35,
    value: "35"
  },
  {
    label: 36,
    value: "36"
  },
  {
    label: 37,
    value: "37"
  },
  {
    label: 38,
    value: "38"
  },
  {
    label: 39,
    value: "39"
  },
  {
    label: 40,
    value: "40"
  },
  {
    label: 41,
    value: "41"
  },
  {
    label: 42,
    value: "42"
  }
  ,
  {
    label: 43,
    value: "43"
  }
  ,
  {
    label: 44,
    value: "44"
  }
  ,
  {
    label: 45,
    value: "45"
  },
  {
    label: 46,
    value: "46"
  },
  {
    label: 47,
    value: "47"
  },
  {
    label: 48,
    value: "48"
  },
  {
    label: 49,
    value: "49"
  },
  {
    label: 50,
    value: "50"
  },
  {
    label: 51,
    value: "51"
  },
  {
    label: 52,
    value: "52"
  }
  ,
  {
    label: 53,
    value: "53"
  }
  ,
  {
    label: 54,
    value: "54"
  }
  ,
  {
    label: 55,
    value: "55"
  },
  {
    label: 56,
    value: "56"
  },
  {
    label: 57,
    value: "57"
  },
  {
    label: 58,
    value: "58"
  },
  {
    label: 59,
    value: "59"
  },
  {
    label: 60,
    value: "60"
  },
];




export let toolsOptions = [
  { "value": "PTL", "label": "Pick To Light" },
  { "value": "IRDCTool", "label": "IR DC Tool" },
  { "value": "specialTool", "label": "Special Tool (Digital)" },
  { "value": "scanner", "label": "Scanner" },
  { "value": "manualWrench", "label": "Manual Wrench" },
  { "value": "otherToolD", "label": "Other Tool (Digital)" }
];

export let ioStations = [
  { "value": "1", "label": "1" },
  { "value": "2", "label": "2" },
  { "value": "3", "label": "3" },
  { "value": "4", "label": "4" },
  { "value": "5", "label": "5" },
  { "value": "6", "label": "6" },
  { "value": "7", "label": "7" },
  { "value": "8", "label": "8" }
];
export let IRDCToolAxelOptions = [
  { "value": "Rear Axel", "label": "Rear Axel" },
  { "value": "Front Axel", "label": "Front Axel" },
  { "value": "Center Axel", "label": "Center Axel" },
  { "value": "Handel Bar", "label": "Handel Bar" },
  { "value": "Fork tool", "label": "Fork tool" }
];
export let connectionOptions = [
  { "value": "ethernet", "label": "Ethernet" },
  { "value": "serial", "label": "Serial" },
  { "value": "hardwire", "label": "Hardwire" },
  { "value": "wifi", "label": "Wifi" }
];

export let comPorts = [
  { "value": "1", "label": "1" },
  { "value": "2", "label": "2" },
  { "value": "3", "label": "3" },
  { "value": "4", "label": "4" },
  { "value": "5", "label": "5" },
  { "value": "6", "label": "6" },
  { "value": "7", "label": "7" },
  { "value": "8", "label": "8" }
]

export let pulses = [
  { "value": "1", "label": "1" },
  { "value": "2", "label": "2" },
  { "value": "3", "label": "3" },
]

export let partName = [
  { value: "ECU", label: "ECU" },
  { value: "Silencer", label: "Silencer" },
  { value: "Petrol Tank", label: "Petrol Tank" },
  { value: "Throttle Body", label: "Throttle Body" },
  { value: "Engine", label: "Engine" },
  { value: "Frame", label: "Frame" },
]


export let conveyorStageRanges: Record<string, { start: number; end: number }> = {
  frame: { start: 1, end: 20 },
  volumetric: { start: 21, end: 30 },
  main: { start: 31, end: 40 }, // example
};

export let convName = [
  { value: "", label: "Select Conveyor" },
  { value: "frame", label: "Frame" },
  { value: "volumetric", label: "Volumetric" },
  { value: "main", label: "Main" }
]

export let program = [
  { value: "program1", label: "program 1" },
  { value: "program2", label: "program 2" },
  { value: "program3", label: "program 3" },
  { value: "program4", label: "program 4" },
  { value: "program5", label: "program 5" },
]

export let models = [
  { value: "", label: "Select Model" },
  { value: "K11", label: "K11" },
  { value: "K11K", label: "K11K" },
  { value: "K15", label: "K15" },
  { value: "K11 CARB", label: "K11 CARB" },
  { value: "K4", label: "K4" },
  { value: "K4 G", label: "K4 G" },
  { value: "K4 K", label: "K4 K" },
  { value: "K14", label: "K14" },
  { value: "K4 CARB", label: "K4 CARB" },
  { value: "K8F", label: "K8F" },
  { value: "K403A", label: "K403A" },
  { value: "K403B", label: "K403B" },
  { value: "K10C", label: "K10C" },
  { value: "K10M", label: "K10M" },
  { value: "K10B", label: "K10B" },
  { value: "K10N", label: "K10N" },
]

export let type = [
  { value: "", label: "Select Type" },
  { value: "Domestic", label: "Domestic" },
  { value: "Export", label: "Export" },
]

export const REPORT_PARAMETER_CONFIG: Record<string, ParameterConfig[]> = {
  SHIFT_OEE: [
    {
      key: "machineIds",
      label: "Machines",
      type: "multi-select",
      required: true,
    },
    {
      key: "fromDate",
      label: "From Date",
      type: "datetime",
      required: true,
    },
    {
      key: "toDate",
      label: "To Date",
      type: "datetime",
      required: true,
    }
  ],

  DOWNTIME: [
    {
      key: "machineIds",
      label: "Machines",
      type: "multi-select",
      required: true,
    }
  ],
};

export const reportTypes = [
  { id: "SHIFT_OEE", name: "SHIFT_OEE" },
  { id: "DOWNTIME", name: "DOWNTIME" },
];

export const machines = [
  { id: "machine1", name: "Machine 1" },
  { id: "machine2", name: "Machine 2" },
  { id: "machine3", name: "Machine 3" },
];

export const scheduleModeOptions = [
  { id: "On Schedule", name: "On Schedule" },
  { id: "On Shift", name: "On Shift" },
];