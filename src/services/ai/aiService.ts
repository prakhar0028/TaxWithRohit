import { GoogleGenAI } from '@google/genai';

const SYSTEM_INSTRUCTION = `You are TaxWithRohit AI, an expert, professional, and friendly Indian Income Tax & Chartered Accountant Assistant for TaxWithRohit (Tagline: "SIMPLE | ACCURATE | SECURE").
You provide precise, compliant, easy-to-understand explanations on Indian Taxation, including:
- FY 2024-25 / AY 2025-26 & Budget 2025 updates
- Comparison of Old Tax Regime vs New Tax Regime (Section 115BAC)
- Salary taxation (Standard Deduction ₹75,000 in New vs ₹50,000 in Old, HRA under Sec 10(13A), LTA, Professional Tax)
- Chapter VI-A Deductions (80C, 80CCC, 80CCD(1B) NPS ₹50k, 80D Mediclaim, 80E, 80G, 80TTA, 24(b) Home loan interest)
- Form 16, Form 26AS, AIS/TIS reconciliation
- Capital Gains on Shares/Mutual Funds (STCG 20%, LTCG 12.5% above ₹1.25L post Budget 2024 amendments)
- Tax Notices (Sec 143(1) intimation, Sec 139(9) defective return, Sec 148, Sec 245)
- Presumptive taxation under Section 44AD and 44ADA for freelancers and small businesses
- GST, TDS rates, Advance Tax deadlines (June 15, Sept 15, Dec 15, March 15)

Rules:
1. Provide structured, concise responses with bullet points and bold key terms.
2. Use INR (₹) formatting.
3. Always include a short friendly disclaimer: "Note: TaxWithRohit AI provides informational guidance. Please consult our assigned CA or tax expert for final filing sign-off."
`;

export async function askTaxWithRohitAI(userQuery: string, chatHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = []): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 0) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const contents = [
        ...chatHistory,
        {
          role: 'user',
          parts: [{ text: userQuery }],
        },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (error) {
      console.warn('[TaxWithRohit AI] Gemini API call failed or rate limited, using tax expert engine fallback:', error);
    }
  }

  // Fallback Rule-Based Expert Knowledge Engine
  return generateTaxExpertFallback(userQuery);
}

function generateTaxExpertFallback(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('new') || q.includes('old') || q.includes('regime') || q.includes('compare') || q.includes('better')) {
    return `### 📊 New vs Old Tax Regime (AY 2025-26)

**Key Highlights:**
* **New Tax Regime (Section 115BAC)**: Default regime. Features lower slab rates and a standard deduction of **₹75,000** for salaried employees. Taxable income up to **₹7,00,000** has **zero tax liability** due to Section 87A rebate (up to ₹25,000).
* **Old Tax Regime**: Allows exemptions like HRA (Sec 10(13A)), LTA, Section 80C (up to ₹1.5L), Section 80D Health Insurance (up to ₹75k), and Section 24(b) Home Loan Interest (up to ₹2L). Standard deduction is **₹50,000**. Income up to **₹5,00,000** is tax-free under Sec 87A rebate.

**Recommendation Rule of Thumb**:
- If total eligible deductions (80C + 80D + HRA + Home loan interest) exceed **₹3.75 Lakhs to ₹4.25 Lakhs**, the **Old Regime** may save more tax.
- For incomes with fewer deductions or below ₹7.75 Lakhs (CTC), the **New Regime** is almost always superior!

*Note: TaxWithRohit AI provides informational guidance. Use our Tax Calculator tool or consult our assigned CA for a personalized breakdown.*`;
  }

  if (q.includes('80c') || q.includes('deduction') || q.includes('save tax') || q.includes('80d') || q.includes('nps')) {
    return `### 🛡️ Top Tax Saving Deductions (Old Regime)

1. **Section 80C (Up to ₹1,50,000)**:
   - ELSS Mutual Funds (3-year lock-in, highest historical returns)
   - Public Provident Fund (PPF) & Employee Provident Fund (EPF)
   - National Savings Certificate (NSC), Sukanya Samriddhi Yojana (SSY)
   - Life Insurance Premium (LIC/Term Insurance)
   - Tuition Fees for children (up to 2 children)
   - Home Loan Principal Repayment

2. **Section 80CCD(1B) - NPS (Additional ₹50,000)**:
   - Save up to ₹15,600 extra in taxes over and above Section 80C.

3. **Section 80D - Health Insurance Mediclaim**:
   - Self, Spouse & Dependent Children: Up to **₹25,000** (₹50,000 if senior citizen).
   - Parents: Additional **₹25,000** (Up to **₹50,000** for senior citizen parents).
   - Preventive health checkup: ₹5,000 included in the limits.

4. **Section 24(b) - Home Loan Interest**:
   - Up to **₹2,00,000** for self-occupied residential property.

*Note: TaxWithRohit AI provides informational guidance. Please consult our assigned CA or tax expert for final filing sign-off.*`;
  }

  if (q.includes('form 16') || q.includes('form16') || q.includes('form-16')) {
    return `### 📄 What is Form 16 and Why is it Essential?

**Form 16** is a certificate issued by your employer under Section 203 of the Income Tax Act confirming the total salary paid and Tax Deducted at Source (TDS).

**It consists of two parts:**
* **Part A**: Generated from TRACES portal. Contains Employer TAN, Employee PAN, quarterly TDS summary, and government deposit challan numbers.
* **Part B**: Breakup of Gross Salary, allowances exempt under Section 10 (HRA, LTA), Standard Deduction, and Chapter VI-A deductions claimed through the employer.

**How to use on TaxWithRohit**:
Simply upload your Form 16 PDF in the **ITR Filing module** or **Document Vault** — TaxWithRohit auto-extracts your salary components, TDS, and deductions instantly!

*Note: TaxWithRohit AI provides informational guidance. Please consult our assigned CA or tax expert for final filing sign-off.*`;
  }

  if (q.includes('notice') || q.includes('143(1)') || q.includes('139(9)') || q.includes('148')) {
    return `### 🚨 Tax Notice Guidance (Sec 143(1), 139(9), 148)

Received a notice from the Income Tax Department? Don't panic!

* **Section 143(1) Intimation**: Routine comparison between your filed ITR and the department's computation. It may show a Refund due, Demand payable, or Nil difference.
* **Section 139(9) Defective Return**: Filed return has discrepancies (e.g., missing balance sheet, TDS claimed without matching income). Needs response within 15 days.
* **Section 148/148A Reassessment Notice**: Notice issued when income is believed to have escaped assessment.

**Immediate Next Steps on TaxWithRohit**:
1. Head to **/tax-notices** and upload the PDF Notice.
2. Our AI verifies the DIN (Document Identification Number).
3. A senior Chartered Accountant reviews the mismatch and prepares a compliant e-proceedings response.

*Note: TaxWithRohit AI provides informational guidance. Please consult our assigned CA or tax expert for final filing sign-off.*`;
  }

  if (q.includes('capital gain') || q.includes('crypto') || q.includes('shares') || q.includes('stock') || q.includes('mutual fund')) {
    return `### 📈 Capital Gains Tax Rates (Budget 2024-25 Updated)

1. **Listed Equity Shares & Equity Mutual Funds**:
   - **STCG (Holding < 12 months)**: Taxed at **20%** (Section 111A).
   - **LTCG (Holding >= 12 months)**: Taxed at **12.5%** on gains exceeding **₹1,25,000** per financial year (Section 112A).

2. **Debt Mutual Funds & Unlisted Bonds**:
   - Taxed at applicable income tax slab rates regardless of holding period.

3. **Real Estate / Property**:
   - LTCG (> 24 months): Taxed at **12.5% without indexation** (or optional 20% with indexation for properties acquired before July 23, 2024).

4. **Virtual Digital Assets / Crypto**:
   - Flat **30% tax** + 4% cess under Section 115BBH without any expense deduction or loss set-off. 1% TDS applies.

*Note: TaxWithRohit AI provides informational guidance. Please consult our assigned CA or tax expert for final filing sign-off.*`;
  }

  return `### 💡 TaxWithRohit Tax Assistant

Thank you for your question regarding Indian taxation and financial planning.

**Here is what you should know:**
* **Income Tax Filing (AY 2025-26)**: The due date for non-audit individual taxpayers is **July 31**. Filing early ensures prompt tax refunds and prevents interest under Section 234A/234B/234C.
* **Advance Tax**: If your estimated tax liability after TDS exceeds **₹10,000**, pay quarterly advance tax in installments (15% by June 15, 45% by Sept 15, 75% by Dec 15, and 100% by March 15).
* **TaxWithRohit CA Support**: You can file on your own using our guided step-by-step ITR wizard, or book a 1-on-1 Chartered Accountant review for complex capital gains, foreign assets, or business returns.

Feel free to ask about specific tax sections (80C, 80D, 80CCD), salary slips, HRA calculations, or notice compliance!

*Note: TaxWithRohit AI provides informational guidance. Please consult our assigned CA or tax expert for final filing sign-off.*`;
}
