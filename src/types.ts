export type Sex = 'female' | 'male';
export type Century = 'XX' | 'XXI';

export interface SexAndSentury {
  sex: Sex;
  century: Century;
  key: number;
}

export interface SexAndSenturyMap {
  [key: string]: SexAndSentury;
}

export interface IidentityResponse {
  firstName: string;
  lastName: string;
  birthdate: string;
  sex: Sex;
  companyName?: string;
}

interface ViispAuthClientCertOptions {
  key: string;
  cert: string;
}

export interface ViispAuthClientOptions {
  wsdlUrl?: string;
  pid?: string;
  uniqueNodeId?: string;
  postbackUrl?: string;
  correlationData?: string;
  cert?: ViispAuthClientCertOptions;
}
