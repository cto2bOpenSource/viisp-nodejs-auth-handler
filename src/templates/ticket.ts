export interface TicketTemplateProps {
  uniqueId: string;
  pid: string;
  postbackUrl: string;
  correlationData: string;
}

export const ticketTemplate = ({
  uniqueId,
  pid,
  postbackUrl,
  correlationData,
}: TicketTemplateProps) => {
  return `
<authentication:authenticationRequest
  xmlns:authentication="http://www.epaslaugos.lt/services/authentication"
  xmlns:dsig="http://www.w3.org/2000/09/xmldsig#"
  xmlns:ns3="http://www.w3.org/2001/10/xml-exc-c14n#"
  id="${uniqueId}"
>
  <authentication:pid>${pid}</authentication:pid>
  <authentication:authenticationProvider>auth.lt.identity.card</authentication:authenticationProvider>
  <authentication:authenticationProvider>auth.lt.bank</authentication:authenticationProvider>
  <authentication:authenticationProvider>auth.signatureProvider</authentication:authenticationProvider>
  <authentication:authenticationProvider>auth.login.pass</authentication:authenticationProvider>
  <authentication:authenticationProvider>auth.lt.government.employee.card</authentication:authenticationProvider>
  <authentication:authenticationProvider>auth.stork</authentication:authenticationProvider>
  <authentication:authenticationProvider>auth.tsl.identity.card</authentication:authenticationProvider>
  <authentication:authenticationAttribute>lt-personal-code</authentication:authenticationAttribute>
  <authentication:authenticationAttribute>lt-company-code</authentication:authenticationAttribute>
  <authentication:userInformation>firstName</authentication:userInformation>
  <authentication:userInformation>lastName</authentication:userInformation>
  <authentication:userInformation>companyName</authentication:userInformation>
  <authentication:postbackUrl>${postbackUrl}</authentication:postbackUrl>
  <authentication:customData>${correlationData}</authentication:customData>
</authentication:authenticationRequest>
`;
};
