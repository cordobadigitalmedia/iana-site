/**
 * Loan agreement contract template. Placeholders: {{APPLICANT_NAME}}, {{DATE}}, {{AMOUNT_REQUESTED}}, {{APPLICATION_ID}}
 */
export const CONTRACT_TEMPLATE = `LOAN AGREEMENT – INTEREST-FREE LOAN

This Agreement is made as of {{DATE}} between IANA Financial (“Lender”) and {{APPLICANT_NAME}} (“Borrower”).

1. LOAN AMOUNT
The Lender agrees to provide an interest-free loan to the Borrower in the amount of \${{AMOUNT_REQUESTED}} (CAD).

2. PURPOSE
The loan is provided for the purpose stated in the Borrower’s application (Application ID: {{APPLICATION_ID}}).

3. REPAYMENT
Repayment terms will be as agreed in writing and in accordance with the Borrower’s application and the Lender’s policies.

4. NO INTEREST
This is an interest-free loan. No interest or finance charges shall accrue.

5. BORROWER OBLIGATIONS
The Borrower agrees to repay the principal amount according to the agreed schedule and to comply with any other terms communicated by the Lender.

6. GOVERNING TERMS
This agreement is subject to the policies of IANA Financial and any supplementary terms provided to the Borrower.

By signing below, the Borrower acknowledges that they have read, understood, and agree to the terms of this loan agreement.

_________________________     {{DATE}}
Borrower signature

_________________________
Printed name: {{APPLICANT_NAME}}
`;

export type ContractPlaceholders = {
  APPLICANT_NAME: string;
  DATE: string;
  AMOUNT_REQUESTED: string;
  APPLICATION_ID: string;
};

export function fillContractTemplate(
  template: string,
  placeholders: Partial<ContractPlaceholders>
): string {
  let out = template;
  for (const [key, value] of Object.entries(placeholders)) {
    out = out.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value ?? ''));
  }
  return out;
}

export function getContractUrl(token: string): string {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APP_URL) {
    return `${process.env.NEXT_PUBLIC_APP_URL}/contract/${token}`;
  }
  if (typeof process !== 'undefined' && process.env?.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/contract/${token}`;
  }
  return `https://www.ianafinancial.org/contract/${token}`;
}
