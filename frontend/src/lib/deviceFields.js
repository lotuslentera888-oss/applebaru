export const DEVICE_SECTIONS = [
  {
    title: "Identity",
    fields: [
      ["device_name", "Device Name"],
      ["model_name", "Model Name"],
      ["model_number", "Model Number"],
      ["part_number", "Part Number"],
      ["color", "Color"],
      ["ios_version", "iOS Version"],
      ["build_version", "Build Version"],
    ],
  },
  {
    title: "Content",
    fields: [
      ["songs", "Songs"],
      ["videos", "Videos"],
      ["photos", "Photos"],
      ["applications", "Applications"],
    ],
  },
  {
    title: "Storage",
    fields: [
      ["capacity", "Capacity"],
      ["available", "Available"],
    ],
  },
  {
    title: "Coverage",
    fields: [
      ["coverage_type", "Coverage Type"],
      ["warranty_status", "Warranty Status"],
    ],
  },
  {
    title: "Network",
    fields: [
      ["carrier", "Carrier"],
      ["carrier_version", "Network Provider Version"],
      ["carrier_lock", "Carrier Lock"],
    ],
  },
  {
    title: "Identifiers",
    fields: [
      ["serial_number", "Serial Number"],
      ["imei", "IMEI"],
      ["imei2", "IMEI2"],
      ["meid", "MEID"],
      ["iccid", "ICCID"],
      ["eid", "EID"],
      ["seeid", "SEID"],
    ],
  },
  {
    title: "Radios",
    fields: [
      ["modem_firmware", "Modem Firmware"],
      ["wifi_address", "Wi-Fi Address"],
      ["bluetooth", "Bluetooth Address"],
    ],
  },
  {
    title: "System & Status",
    fields: [
      ["certificate_trust_store", "Certificate Trust Store"],
      ["region", "Region"],
      ["purchase_date", "Purchase Date"],
      ["activation_status", "Activation Status"],
      ["find_my_iphone", "Find My iPhone"],
      ["icloud_lock", "iCloud Lock"],
      ["blacklist_status", "Blacklist Status"],
      ["battery_max_capacity", "Battery Max Capacity"],
      ["battery_charge_cycles", "Charge Cycles"],
    ],
  },
];
