export interface NigerianState {
  code: string;
  name: string;
}

export interface DeliveryRateRecord {
  stateCode: string;
  stateName: string;
  feeAmount: number;
  updatedAt?: string;
}

export const DEFAULT_DELIVERY_FEE = 4500;

export const NIGERIAN_STATES: NigerianState[] = [
  { code: "ABIA", name: "Abia" },
  { code: "ADAMAWA", name: "Adamawa" },
  { code: "AKWA_IBOM", name: "Akwa Ibom" },
  { code: "ANAMBRA", name: "Anambra" },
  { code: "BAUCHI", name: "Bauchi" },
  { code: "BAYELSA", name: "Bayelsa" },
  { code: "BENUE", name: "Benue" },
  { code: "BORNO", name: "Borno" },
  { code: "CROSS_RIVER", name: "Cross River" },
  { code: "DELTA", name: "Delta" },
  { code: "EBONYI", name: "Ebonyi" },
  { code: "EDO", name: "Edo" },
  { code: "EKITI", name: "Ekiti" },
  { code: "ENUGU", name: "Enugu" },
  { code: "GOMBE", name: "Gombe" },
  { code: "IMO", name: "Imo" },
  { code: "JIGAWA", name: "Jigawa" },
  { code: "KADUNA", name: "Kaduna" },
  { code: "KANO", name: "Kano" },
  { code: "KATSINA", name: "Katsina" },
  { code: "KEBBI", name: "Kebbi" },
  { code: "KOGI", name: "Kogi" },
  { code: "KWARA", name: "Kwara" },
  { code: "LAGOS", name: "Lagos" },
  { code: "NASARAWA", name: "Nasarawa" },
  { code: "NIGER", name: "Niger" },
  { code: "OGUN", name: "Ogun" },
  { code: "ONDO", name: "Ondo" },
  { code: "OSUN", name: "Osun" },
  { code: "OYO", name: "Oyo" },
  { code: "PLATEAU", name: "Plateau" },
  { code: "RIVERS", name: "Rivers" },
  { code: "SOKOTO", name: "Sokoto" },
  { code: "TARABA", name: "Taraba" },
  { code: "YOBE", name: "Yobe" },
  { code: "ZAMFARA", name: "Zamfara" },
  { code: "FCT", name: "Federal Capital Territory (FCT)" }
];

export function getStateName(stateCode?: string | null) {
  return NIGERIAN_STATES.find((state) => state.code === stateCode)?.name;
}

export function getDeliveryRateForState(rates: DeliveryRateRecord[], stateCode?: string | null) {
  return rates.find((rate) => rate.stateCode === stateCode);
}
