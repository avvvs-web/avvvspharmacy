import type { ReactNode } from 'react';
import Link from 'next/link';
import { CONTACT, ORG } from '@/lib/site';

/*
 * The store's own legal and help pages. They are kept here, not in Shopify, so that they describe
 * what this storefront really does (its cookies, the prescription upload, stock alerts) alongside
 * Shopify's part (checkout, payment, accounts), and so that every change is reviewed and dated.
 *
 * A page here wins over a Shopify Page with the same handle (see src/app/pages/[handle]/page.tsx).
 * This text has NOT been reviewed by a lawyer. Facts marked "confirm" in LEGAL must be checked by
 * AVVVS before the pages go live. Change UPDATED whenever the wording changes.
 *
 * Clause numbers are added by CSS (.legal in globals.css): each <h2> is a clause and each <C> a
 * sub-clause, so nothing here is numbered by hand and cross-references use clause headings.
 */

const UPDATED = '2026-11-15';

/** Facts the pages rely on. Each was taken from AVVVS's earlier published policies (2023). */
export const LEGAL = {
  // confirm: the registered office as stated in the 2023 policy
  registeredOffice: 'Taluk Road, Puthiyara PO, Kozhikode 673004, Kerala, India',
  // confirm: still the named officers
  grievanceOfficer: { name: 'Dr Rekha K. C.', role: 'Grievance Officer', email: 'pm@avvvs.com' },
  nodalOfficer: { name: 'Fasil V. M.', role: 'Nodal Officer', email: CONTACT.email },
  courts: 'Kozhikode, Kerala',
  // confirm: the commercial terms below are carried over from the 2023 return and shipping pages
  deliveryDays: 'three (3) to four (4) working days',
  returnWindow: 'thirty (30) working days',
  restockingCharge: 'twenty per cent (20%)',
  refundDays: 'seven (7) to ten (10) working days',
} as const;

const mail = (a: string) => <a href={`mailto:${a}`}>{a}</a>;
const tel = (p: string) => <a href={`tel:${p.replace(/\s/g, '')}`}>{p}</a>;
const SHOPIFY_PRIVACY = 'https://www.shopify.com/legal/privacy';
const ext = (href: string, label: string) => <a href={href} target="_blank" rel="noopener noreferrer">{label}</a>;

/** A numbered sub-clause. */
const C = ({ children }: { children: ReactNode }) => <p className="c">{children}</p>;
/** A lettered list inside a sub-clause. */
const Sub = ({ children }: { children: ReactNode }) => <ol className="sub">{children}</ol>;
/** A defined term. */
const T = ({ children }: { children: ReactNode }) => <b>“{children}”</b>;

function Grievance() {
  const g = LEGAL.grievanceOfficer;
  const n = LEGAL.nodalOfficer;
  return (
    <>
      <C>Any complaint or grievance in relation to the Store, an Order or these terms may be addressed to:</C>
      <Sub>
        <li><b>Customer care:</b> {mail(CONTACT.email)}; {tel(CONTACT.phones[0])}; {tel(CONTACT.phones[1])}</li>
        <li><b>{g.role}:</b> {g.name}, {ORG.name}; {mail(g.email)}; {tel(CONTACT.phones[0])}</li>
        <li><b>{n.role}:</b> {n.name}, {ORG.name}; {mail(n.email)}</li>
      </Sub>
      <C>The Grievance Officer shall acknowledge a complaint within forty-eight (48) hours of its receipt and shall endeavour to redress it within one (1) month from the date of receipt, in accordance with the Consumer Protection (E-Commerce) Rules, 2020.</C>
    </>
  );
}

export type LegalPage = { title: string; description: string; updatedAt: string; body: ReactNode; plain?: boolean };

export const LEGAL_CONTENT: Record<string, LegalPage> = {
  'privacy-policy': {
    title: 'Privacy policy',
    description: 'How Arya Vaidya Vilasini Vaidya Sala collects, uses, discloses and protects personal data on the AVVVS Ayur Store, including data processed by Shopify.',
    updatedAt: UPDATED,
    body: (
      <>
        <p>This Privacy Policy (<T>Policy</T>) is published by {ORG.name}, having its registered office at {LEGAL.registeredOffice} (<T>AVVVS</T>, <T>we</T>, <T>us</T> or <T>our</T>), and sets out the manner in which we collect, use, disclose, transfer, store and protect the personal data of any person (<T>you</T> or <T>your</T>) who accesses or uses the website at shop.avvvs.com (the <T>Store</T>).</p>
        <p>This Policy is an electronic record within the meaning of the Information Technology Act, 2000 and the rules made thereunder, and is published in accordance with the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 and the Digital Personal Data Protection Act, 2023. It does not require any physical or digital signature.</p>
        <p>By accessing or using the Store, you acknowledge that you have read and understood this Policy. Where you do not agree with it, you should refrain from using the Store.</p>

        <h2>Definitions</h2>
        <C>In this Policy, unless the context otherwise requires:</C>
        <Sub>
          <li><T>Applicable Law</T> means all laws, rules, regulations and orders in force in India from time to time;</li>
          <li><T>Order</T> means an order for products placed through the Store;</li>
          <li><T>Personal Data</T> means any data about an individual who is identifiable by or in relation to such data;</li>
          <li><T>Sensitive Personal Data</T> means Personal Data relating to physical, physiological or mental health condition, medical records and history, and financial information, as described in Applicable Law;</li>
          <li><T>Service Provider</T> means a third party engaged by us to process Personal Data on our behalf; and</li>
          <li><T>Shopify</T> means Shopify Inc. and its affiliates, which provide the commerce platform on which the Store’s catalogue, cart, checkout and customer accounts operate.</li>
        </Sub>

        <h2>Data controller</h2>
        <C>AVVVS determines the purposes and means of processing Personal Data collected through the Store and is the data fiduciary in respect of such Personal Data for the purposes of the Digital Personal Data Protection Act, 2023.</C>
        <C>Any communication concerning this Policy or your Personal Data may be addressed to {mail(CONTACT.email)} or to the Grievance Officer named in the clause headed “Grievance redressal”.</C>

        <h2>Personal Data collected</h2>
        <C>We collect and process the following categories of Personal Data:</C>
        <Sub>
          <li><b>Order and delivery data:</b> your name, telephone number, email address, delivery and billing address, and the particulars of the products ordered, as provided by you at checkout;</li>
          <li><b>Payment data:</b> the mode of payment, the amount paid and the status of the transaction. Card numbers, UPI PINs, net-banking credentials and other payment instrument details are submitted by you directly to the payment gateway (at present, Razorpay) from the checkout page hosted by Shopify, and are not received or stored by us;</li>
          <li><b>Account data:</b> where you sign in, your name, email address, saved addresses, Order history and wishlist. Authentication is performed by Shopify by means of a one-time code sent to your email address, and no password is held by us;</li>
          <li><b>Prescription data:</b> any prescription or physician’s note that you voluntarily attach to an Order, which constitutes Sensitive Personal Data;</li>
          <li><b>Stock alert data:</b> your email address and the product in respect of which you request a notification of availability;</li>
          <li><b>Correspondence:</b> the content of any communication you address to us by email, telephone or WhatsApp;</li>
          <li><b>Technical data:</b> your internet protocol (IP) address, browser type and the pages requested, as recorded by our hosting provider, together with a count of requests originating from an IP address, retained for up to two (2) days for the prevention of abuse; and</li>
          <li><b>Analytics and advertising data:</b> subject to your consent, information on pages viewed and products added to the cart, transmitted to Google Analytics and the Meta Pixel.</li>
        </Sub>
        <C>You are under no obligation to provide Sensitive Personal Data. The attachment of a prescription is optional, save where our pharmacist requires one before dispensing a particular product.</C>

        <h2>Purposes and grounds of processing</h2>
        <C>Personal Data is processed solely for the following purposes:</C>
        <Sub>
          <li>to receive, verify, process, dispense, dispatch and deliver Orders, and to communicate with you in relation thereto;</li>
          <li>to enable our pharmacist to verify an Order against any prescription furnished;</li>
          <li>to create and administer your account;</li>
          <li>to respond to enquiries, complaints and grievances;</li>
          <li>to notify you of the availability of a product where you have so requested;</li>
          <li>to detect and prevent fraud, abuse and unlawful activity;</li>
          <li>to comply with obligations under Applicable Law, including the maintenance of tax, consumer and pharmacy records; and</li>
          <li>subject to your consent, to measure use of the Store and the performance of our advertisements, and to send you promotional communications.</li>
        </Sub>
        <C>We process Prescription data, Stock alert data, Analytics and advertising data and Personal Data used for promotional communications on the basis of your consent. All other Personal Data is processed because it is necessary for the performance of the contract of sale with you or for compliance with Applicable Law.</C>
        <C>You may withdraw your consent at any time by writing to {mail(CONTACT.email)} or, in respect of cookies, through the “Cookie settings” link at the foot of every page. Withdrawal shall not affect the lawfulness of processing carried out before such withdrawal, and may result in our being unable to provide the service to which the consent relates.</C>

        <h2>Role of Shopify</h2>
        <C>The Store’s catalogue, cart, checkout (hosted at checkout.avvvs.com) and customer accounts are provided by Shopify. When you proceed to checkout or sign in to an account, you are directed to pages hosted by Shopify, and Shopify processes your Personal Data on our behalf as a Service Provider for the purposes of completing and recording the transaction.</C>
        <C>Without limiting the foregoing, Shopify:</C>
        <Sub>
          <li>stores your Order, contact, address and account data;</li>
          <li>together with its payment partners, processes your payment and screens Orders for fraud; and</li>
          <li>places such cookies on its checkout and sign-in pages as are strictly necessary for their operation.</li>
        </Sub>
        <C>Where you elect to use a service offered by Shopify to you directly, including Shop Pay or a Shop account, Shopify acts independently of us and its own terms and privacy policy shall govern that service.</C>
        <C>The manner in which Shopify processes the Personal Data of shoppers is described in the {ext(SHOPIFY_PRIVACY, 'Shopify Privacy Policy')}. Any request concerning Personal Data held by Shopify in connection with the Store may be addressed to us, and we shall take the steps necessary to give effect to it.</C>

        <h2>Disclosure of Personal Data</h2>
        <C>We disclose Personal Data only to the following recipients and only to the extent necessary for the purposes stated:</C>
        <table>
          <thead><tr><th>Recipient</th><th>Purpose</th></tr></thead>
          <tbody>
            <tr><td>Shopify</td><td>Cart, checkout, Order records and customer accounts</td></tr>
            <tr><td>Razorpay and the banks and card networks it works with</td><td>Processing of payments and refunds</td></tr>
            <tr><td>Courier and logistics providers</td><td>Delivery of Orders (name, address and telephone number)</td></tr>
            <tr><td>Vercel Inc.</td><td>Hosting of the Store and private storage of Prescription data</td></tr>
            <tr><td>Neon Inc.</td><td>Database hosting for Stock alert data and abuse-prevention counters</td></tr>
            <tr><td>Our email service provider</td><td>Transmission to our pharmacy of requests made through the Store</td></tr>
            <tr><td>Google LLC and Meta Platforms, Inc.</td><td>Analytics and measurement of advertising, subject to your consent</td></tr>
            <tr><td>Courts, regulators and law enforcement agencies</td><td>Where disclosure is required by Applicable Law or by order of a competent authority</td></tr>
          </tbody>
        </table>
        <C>Each Service Provider is permitted to process Personal Data solely for the purpose of providing its services to us. We do not sell Personal Data, and we do not disclose it to advertisers otherwise than through the Meta Pixel where you have consented to marketing cookies.</C>
        <C>In the event of a merger, reorganisation or transfer of the whole or part of our undertaking, Personal Data may be transferred to the successor entity, which shall be bound by obligations no less protective than those contained in this Policy.</C>

        <h2>Prescription data</h2>
        <C>Prescription data is held in private storage and is not accessible at any public address.</C>
        <C>The Order carries a cryptographically signed link to the file, which may be opened only through the Store and which ceases to be valid thirty (30) days after the file is uploaded.</C>
        <C>Prescription data is deleted automatically from our storage thirty (30) days after it is uploaded. A prescription required after that period shall be furnished afresh.</C>
        <C>Access to Prescription data is restricted to pharmacy personnel engaged in the verification and fulfilment of Orders, who are bound by obligations of confidentiality.</C>
        <C>You may remove the file from your cart at any time before checkout. Thereafter you may request its earlier deletion in writing, and we shall delete it without awaiting the expiry of the said period.</C>

        <h2>Cookies and local storage</h2>
        <C>The Store uses cookies and the local storage of your browser as set out below. Essential items are necessary for the operation of the Store and cannot be disabled. All other items are placed only upon your consent, which may be given, refused or withdrawn through the “Cookie settings” link at the foot of every page.</C>
        <table>
          <thead><tr><th>Name</th><th>Purpose</th><th>Duration</th></tr></thead>
          <tbody>
            <tr><td>avvvs_cart</td><td>Essential: identifies your cart</td><td>30 days</td></tr>
            <tr><td>avvvs_customer, avvvs_signed_in</td><td>Essential: maintains your signed-in session</td><td>30 days</td></tr>
            <tr><td>avvvs_oauth</td><td>Essential: secures the sign-in procedure</td><td>10 minutes</td></tr>
            <tr><td>avvvs-consent</td><td>Essential: records your cookie preferences (local storage)</td><td>Until cleared</td></tr>
            <tr><td>avvvs-wishlist, avvvs-recent, recent searches</td><td>Functional: your wishlist, recently viewed products and recent searches (local storage)</td><td>Until cleared</td></tr>
            <tr><td>Google Analytics</td><td>Analytics: subject to consent</td><td>As set by Google</td></tr>
            <tr><td>Meta Pixel</td><td>Marketing: subject to consent</td><td>As set by Meta</td></tr>
          </tbody>
        </table>

        <h2>Cross-border transfer</h2>
        <C>Personal Data may be transferred to, and stored or processed on, servers located outside India, including in the United States of America, by Shopify, Vercel, Neon, Google and Meta. Such transfers are made for the purposes set out in this Policy and in accordance with Applicable Law.</C>

        <h2>Retention</h2>
        <C>Personal Data is retained only for so long as is necessary for the purpose for which it was collected or as required by Applicable Law, and in particular:</C>
        <Sub>
          <li>Order and invoice records, for the period prescribed by applicable tax, consumer protection and pharmacy laws;</li>
          <li>Account data, until closure of the account at your request;</li>
          <li>Prescription data, for thirty (30) days from the date of upload, whereupon it is deleted automatically;</li>
          <li>Stock alert data, until the notification has been sent or the request has been withdrawn; and</li>
          <li>abuse-prevention counters, for up to two (2) days.</li>
        </Sub>

        <h2>Your rights</h2>
        <C>Subject to Applicable Law, you have the right to:</C>
        <Sub>
          <li>obtain confirmation of, and a summary of, the Personal Data processed by us and the identities of the persons with whom it has been shared;</li>
          <li>have inaccurate or incomplete Personal Data corrected, completed or updated;</li>
          <li>have Personal Data erased where it is no longer necessary for the purpose for which it was collected and its retention is not required by Applicable Law;</li>
          <li>withdraw consent previously given;</li>
          <li>nominate another individual to exercise your rights in the event of your death or incapacity; and</li>
          <li>have your grievance redressed in accordance with the clause headed “Grievance redressal”.</li>
        </Sub>
        <C>A request to exercise any of these rights shall be made in writing to {mail(CONTACT.email)} from the email address associated with your Order or account. We may require reasonable verification of your identity before acting on a request. You may also amend your name and addresses directly in <Link href="/account">your account</Link>.</C>

        <h2>Promotional communications</h2>
        <C>Promotional communications are sent only where you have opted to receive them. Each such communication shall contain a means of opting out, and you may also opt out by writing to us. Communications relating to an Order placed by you are transactional and shall be sent irrespective of your marketing preferences.</C>

        <h2>Children</h2>
        <C>The Store is intended for use by persons who have attained the age of eighteen (18) years. Products required for a minor shall be ordered by a parent or lawful guardian. We do not knowingly collect the Personal Data of a minor; where it is brought to our notice that such data has been collected, we shall delete it within a reasonable time.</C>

        <h2>Security</h2>
        <C>We maintain reasonable security practices and procedures, including transmission of all data over an encrypted (HTTPS) connection, encryption of session cookies, and private storage of Prescription data.</C>
        <C>Notwithstanding the foregoing, no method of transmission or storage is wholly secure. In the event of a personal data breach, we shall notify the affected persons and the competent authority in the manner required by Applicable Law.</C>

        <h2>Third-party websites</h2>
        <C>The Store contains links to other websites, including avvvs.com, the AVVVS Ayur Clinic and Gloveda Herbals. This Policy does not apply to those websites, and your use of them is governed by their respective privacy policies.</C>

        <h2>Grievance redressal</h2>
        <Grievance />
        <C>Where a grievance relating to your Personal Data is not resolved to your satisfaction, you may, after exhausting the remedy provided above, approach the Data Protection Board of India in accordance with the Digital Personal Data Protection Act, 2023.</C>

        <h2>Amendment</h2>
        <C>We may amend this Policy from time to time. The amended Policy shall be published on this page with a revised date. Where an amendment materially affects the processing of Personal Data already held by us, we shall give you notice by email or on the Store before it takes effect.</C>

        <h2>Governing law</h2>
        <C>This Policy shall be governed by and construed in accordance with the laws of India, and the courts at {LEGAL.courts} shall have jurisdiction in respect of any dispute arising hereunder, without prejudice to any forum to which you are entitled to resort under Applicable Law.</C>
      </>
    ),
  },

  'term-of-use': {
    title: 'Terms and conditions',
    description: 'The terms and conditions governing use of the AVVVS Ayur Store and the sale of products by Arya Vaidya Vilasini Vaidya Sala.',
    updatedAt: UPDATED,
    body: (
      <>
        <p>These Terms and Conditions (<T>Terms</T>) constitute a legally binding agreement between {ORG.name}, having its registered office at {LEGAL.registeredOffice} (<T>AVVVS</T>, <T>we</T>, <T>us</T> or <T>our</T>), and any person who accesses or uses the website at shop.avvvs.com (the <T>Store</T>) or places an order through it (<T>you</T> or <T>your</T>).</p>
        <p>These Terms are an electronic record within the meaning of the Information Technology Act, 2000 and the rules made thereunder, and do not require any physical or digital signature. They are published in accordance with the Consumer Protection (E-Commerce) Rules, 2020.</p>
        <p>By accessing or using the Store, or by placing an Order, you agree to be bound by these Terms together with the <Link href="/pages/privacy-policy">Privacy Policy</Link>, the <Link href="/pages/return-policy">Cancellation and Refund Policy</Link> and the <Link href="/pages/shipping">Shipping and Delivery Policy</Link>, each of which is incorporated herein by reference. If you do not agree, you shall not use the Store.</p>

        <h2>Definitions</h2>
        <C>In these Terms, unless the context otherwise requires:</C>
        <Sub>
          <li><T>Applicable Law</T> means all laws, rules, regulations and orders in force in India from time to time;</li>
          <li><T>Order</T> means an offer made by you through the Store to purchase one or more Products;</li>
          <li><T>Products</T> means the Ayurveda medicines and herbal care products offered for sale on the Store;</li>
          <li><T>Dispatch Confirmation</T> means our communication to you that the Products comprised in an Order, or any part of it, have been dispatched; and</li>
          <li><T>Shopify</T> means Shopify Inc. and its affiliates.</li>
        </Sub>

        <h2>The seller</h2>
        <C>The Products are manufactured and sold by AVVVS. The Store is not a marketplace, and no third-party seller offers goods through it.</C>
        <C>AVVVS may be contacted at {mail(CONTACT.email)} or {tel(CONTACT.phones[0])}.</C>

        <h2>Eligibility</h2>
        <C>The Store may be used only by persons who are competent to contract under the Indian Contract Act, 1872, that is to say, persons who have attained the age of eighteen (18) years, are of sound mind and are not disqualified from contracting by any law.</C>
        <C>Products are delivered within the territory of India only.</C>
        <C>The Store is made available for the purchase of Products for personal or household use, and not for resale or any other commercial purpose.</C>

        <h2>Medical disclaimer</h2>
        <C>The information published on the Store is a description of the Products. It does not constitute medical advice, diagnosis or treatment, and is not a substitute for consultation with a qualified physician.</C>
        <C>You shall read the label of each Product before use, adhere to the dosage directed by your physician, and keep all Products out of the reach of children.</C>
        <C>You shall inform your physician of any other medication you are taking and of any pregnancy or lactation.</C>
        <C>In a medical emergency you shall seek immediate attention at a hospital and shall not rely on the Store or await the delivery of an Order.</C>

        <h2>Prescriptions</h2>
        <C>You may attach a prescription or physician’s note to an Order, in which event our pharmacist shall verify the Order against it.</C>
        <C>Where, in the opinion of our pharmacist, a Product ought to be taken only on the advice of a physician, we reserve the right to contact you, to require a valid prescription, to limit the quantity dispensed to that prescribed, or to decline the Order and refund any amount paid in respect of it.</C>
        <C>You warrant that any document so attached is genuine, relates to the person for whom the Products are intended, and is furnished with that person’s consent.</C>

        <h2>Account</h2>
        <C>An Order may be placed as a guest or through an account. Authentication of an account is performed by Shopify by means of a one-time code sent to your email address.</C>
        <C>You are responsible for maintaining the security of that email address and for all activity under your account, and shall notify us forthwith of any unauthorised use.</C>
        <C>We may suspend or terminate an account that is used fraudulently or in breach of these Terms.</C>

        <h2>Checkout and Shopify</h2>
        <C>The cart, checkout (hosted at checkout.avvvs.com), payment and customer account functions of the Store are provided by Shopify on our behalf.</C>
        <C>The contract for the sale of Products is between you and AVVVS. Shopify is not a party to that contract and bears no liability to you under it.</C>
        <C>The terms of service of Shopify constitute an agreement between Shopify and AVVVS and do not impose obligations on you as a purchaser.</C>
        <C>Where you elect to use a service offered by Shopify to you directly, including Shop Pay or a Shop account, the terms and privacy policy of Shopify applicable to that service shall govern as between you and Shopify.</C>
        <C>The processing of your personal data by Shopify is described in the <Link href="/pages/privacy-policy">Privacy Policy</Link> and in the {ext(SHOPIFY_PRIVACY, 'Shopify Privacy Policy')}.</C>

        <h2>Formation of contract</h2>
        <C>The display of a Product on the Store is an invitation to offer. An Order placed by you is an offer to purchase the Products comprised in it.</C>
        <C>The confirmation issued upon receipt of an Order is an acknowledgment only and does not constitute acceptance.</C>
        <C>A contract of sale is concluded only upon issue of the Dispatch Confirmation. Where an Order is dispatched in more than one consignment, each Dispatch Confirmation concludes a separate contract in respect of the Products to which it relates.</C>
        <C>Every Order is subject to availability and to verification by our pharmacist. We reserve the right to decline or cancel an Order, in whole or in part, at any time before Dispatch Confirmation, in which event any amount paid in respect of the cancelled Products shall be refunded.</C>
        <C>You may cancel an Order at any time before Dispatch Confirmation in accordance with the <Link href="/pages/return-policy">Cancellation and Refund Policy</Link>.</C>

        <h2>Price and payment</h2>
        <C>All prices are stated in Indian Rupees and are inclusive of applicable taxes. Delivery charges, if any, are displayed at checkout before payment.</C>
        <C>The price payable is the price displayed at the time the Order is placed. The inclusion of a Product in your cart does not reserve its price.</C>
        <C>Where a Product has been listed at an incorrect price by reason of an obvious error, we may cancel the Order and refund the amount paid in full.</C>
        <C>Payment is collected on the checkout page hosted by Shopify through the payment gateway indicated there (at present, Razorpay), as further described on the <Link href="/pages/payments">Payments</Link> page.</C>

        <h2>Delivery, return and refund</h2>
        <C>Delivery is governed by the <Link href="/pages/shipping">Shipping and Delivery Policy</Link>, and cancellation, return and refund by the <Link href="/pages/return-policy">Cancellation and Refund Policy</Link>.</C>

        <h2>Acceptable use</h2>
        <C>You shall not:</C>
        <Sub>
          <li>furnish information that is false, inaccurate or misleading, or place an Order in the name of another person without authority;</li>
          <li>upload any document that is not a genuine prescription or physician’s note, or that relates to another person without that person’s consent;</li>
          <li>copy, reproduce, scrape, extract or resell any content, listing or price published on the Store;</li>
          <li>interfere with or disrupt the Store, probe or test its security without our prior written consent, or introduce any virus or other harmful code;</li>
          <li>host, display, upload, publish or transmit through the Store any information prohibited by the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021; or</li>
          <li>use the Store for any purpose that is unlawful or prohibited by these Terms.</li>
        </Sub>

        <h2>Intellectual property</h2>
        <C>All text, photographs, graphics, design, software and other content of the Store, and the names and marks “AVVVS” and “Gloveda”, are the property of AVVVS or its licensors and are protected by Applicable Law.</C>
        <C>You are granted a limited, revocable, non-exclusive and non-transferable licence to access the Store and to view and print its pages for personal use. No other use is permitted without our prior written consent.</C>

        <h2>Product information</h2>
        <C>We take reasonable care to ensure that the names, pack sizes, prices and images of Products are accurate. Packaging may vary from the images displayed. In the event of any inconsistency, the label affixed to the Product delivered shall prevail.</C>

        <h2>Limitation of liability</h2>
        <C>Nothing in these Terms shall exclude or restrict any right or remedy available to you under the Consumer Protection Act, 2019 or any other Applicable Law that cannot be excluded or restricted by agreement.</C>
        <C>Subject to the preceding sub-clause, our aggregate liability arising out of or in connection with an Order shall not exceed the amount paid by you for that Order, and we shall not be liable for any indirect, incidental or consequential loss, or for any loss of profit, revenue, business or goodwill.</C>

        <h2>Indemnity</h2>
        <C>You shall indemnify and hold harmless AVVVS, its officers, employees and agents from and against any claim, loss, liability or expense (including reasonable legal costs) arising out of your breach of these Terms, your misuse of the Store, or your infringement of the rights of any third party.</C>

        <h2>Force majeure</h2>
        <C>We shall not be liable for any delay or failure in the performance of our obligations where such delay or failure arises from any cause beyond our reasonable control, including acts of God, flood, epidemic, strike, governmental action, and failure or disruption of courier or telecommunication services.</C>

        <h2>Third-party websites</h2>
        <C>The Store contains links to other websites, including the AVVVS Ayur Clinic, avvvs.com and Gloveda Herbals. Any consultation or purchase made on such a website is governed by its own terms.</C>

        <h2>Grievance redressal</h2>
        <Grievance />

        <h2>Governing law and jurisdiction</h2>
        <C>These Terms shall be governed by and construed in accordance with the laws of India.</C>
        <C>Subject to your right to approach any consumer commission or other forum competent under Applicable Law, the courts at {LEGAL.courts} shall have exclusive jurisdiction in respect of any dispute arising out of or in connection with these Terms.</C>

        <h2>General</h2>
        <C><b>Amendment.</b> We may amend these Terms from time to time by publishing the amended Terms on this page. The Terms in force at the time an Order is placed shall govern that Order.</C>
        <C><b>Severability.</b> If any provision of these Terms is held to be invalid or unenforceable, that provision shall be severed and the remaining provisions shall continue in full force and effect.</C>
        <C><b>Waiver.</b> No failure or delay by us in exercising any right shall operate as a waiver of that right.</C>
        <C><b>Assignment.</b> You shall not assign or transfer any right or obligation under these Terms without our prior written consent.</C>
        <C><b>Entire agreement.</b> These Terms, together with the policies incorporated by reference, constitute the entire agreement between you and AVVVS in relation to their subject matter and supersede all prior terms published on the Store.</C>
      </>
    ),
  },

  'return-policy': {
    title: 'Cancellation and refund policy',
    description: 'The conditions on which AVVVS cancels, replaces, accepts the return of and refunds orders placed on the AVVVS Ayur Store.',
    updatedAt: UPDATED,
    body: (
      <>
        <p>This Cancellation and Refund Policy (<T>Policy</T>) forms part of the <Link href="/pages/term-of-use">Terms and Conditions</Link> and applies to every order (<T>Order</T>) placed with {ORG.name} (<T>AVVVS</T>, <T>we</T> or <T>us</T>) through shop.avvvs.com. Capitalised terms not defined herein bear the meanings assigned to them in those Terms.</p>

        <h2>Refund or replacement in full</h2>
        <C>You shall be entitled, at your option, to a full refund or to a replacement where:</C>
        <Sub>
          <li>a Product is delivered in a damaged or defective condition;</li>
          <li>the consignment is lost or damaged in transit;</li>
          <li>a Product is delivered after the expiry date stated on its label; or</li>
          <li>a Product comprised in the Order is not delivered, or a Product other than that ordered is delivered.</li>
        </Sub>

        <h2>Procedure for claims</h2>
        <C>A claim under the preceding clause shall be made by email to {mail(CONTACT.email)}, stating the Order number in the subject line, or by telephone at {tel(CONTACT.phones[0])}.</C>
        <C>A claim in respect of a damaged, defective or incorrect Product shall be accompanied by a photograph of the Product and its label.</C>
        <C>A claim in respect of a missing Product shall identify the Product concerned, and shall be verified against our packing record for the consignment.</C>
        <C>A claim shall be made as soon as reasonably practicable after delivery, and the Product and its packaging shall be retained until the claim is determined.</C>

        <h2>Return of unopened Products</h2>
        <C>A Product that is unopened, unused and in its original packaging may be returned, provided that notice of the return is given to us within {LEGAL.returnWindow} of delivery.</C>
        <C>A restocking charge of {LEGAL.restockingCharge} of the price paid shall be deducted from the refund.</C>
        <C>Where the return is occasioned by a change of prescription by your physician, we may, upon verification of the revised prescription, waive the restocking charge and refund the price in full.</C>
        <C>The cost of returning the Product shall be borne by you, and the refund shall be processed upon our receipt and inspection of the Product.</C>
        <C>In the interests of patient safety, a Product that has been opened, and any Product identified on its page as non-returnable, shall not be accepted for return.</C>

        <h2>Cancellation</h2>
        <C>You may cancel an Order at any time before it is dispatched by notifying us, in which event the amount paid shall be refunded in full and no cancellation charge shall be levied.</C>
        <C>An Order that has been dispatched may not be cancelled, and shall be dealt with under the clause headed “Return of unopened Products”.</C>

        <h2>Mode and time of refund</h2>
        <C>A refund shall be made to the original mode of payment. Upon approval of a refund, the amount shall ordinarily be credited within {LEGAL.refundDays}, subject to the processing time of your bank or payment service provider.</C>
        <C>Where payment was made in cash on delivery, the refund shall be made by bank transfer to an account nominated by you, and may take up to three (3) weeks from approval.</C>

        <h2>Grievances and statutory rights</h2>
        <C>Any grievance concerning a cancellation, return or refund may be raised in the manner set out on the <Link href="/pages/contact">Contact Us</Link> page.</C>
        <C>Nothing in this Policy shall exclude or restrict any right or remedy available to you under the Consumer Protection Act, 2019.</C>
      </>
    ),
  },

  shipping: {
    title: 'Shipping and delivery policy',
    description: 'The territory, time and terms of delivery for orders placed on the AVVVS Ayur Store.',
    updatedAt: UPDATED,
    body: (
      <>
        <p>This Shipping and Delivery Policy forms part of the <Link href="/pages/term-of-use">Terms and Conditions</Link> and applies to every order (<T>Order</T>) placed with {ORG.name} (<T>AVVVS</T>, <T>we</T> or <T>us</T>) through shop.avvvs.com.</p>

        <h2>Territory</h2>
        <C>Orders are delivered to addresses within India only. No Order shall be accepted for delivery outside India.</C>

        <h2>Time of delivery</h2>
        <C>An Order is ordinarily delivered within {LEGAL.deliveryDays} of dispatch. Sundays and public holidays are not working days.</C>
        <C>The time of delivery may vary according to the State and postal code of the delivery address.</C>
        <C>All delivery periods are estimates only and time shall not be of the essence. We shall not be liable for delay occasioned by any cause beyond our reasonable control, including adverse weather, strikes and disruption of courier services, but shall use reasonable endeavours to keep you informed of any such delay.</C>

        <h2>Delivery charges</h2>
        <C>The delivery charge, if any, applicable to an Order is displayed at checkout before payment.</C>

        <h2>Tracking</h2>
        <C>Upon dispatch, we shall notify you by email of the courier’s tracking number. Where the Order was placed through an account, its status may also be viewed under <Link href="/account/orders">your orders</Link>.</C>

        <h2>Receipt of consignment</h2>
        <C>You are responsible for the accuracy of the delivery address and telephone number furnished at checkout.</C>
        <C>Where a consignment appears to have been opened or damaged, you should photograph it before opening and notify us without delay.</C>
        <C>Where a consignment is not received within the estimated period, you may write to {mail(CONTACT.email)} quoting the Order number.</C>
        <C>Claims in respect of damaged, missing or incorrect Products are governed by the <Link href="/pages/return-policy">Cancellation and Refund Policy</Link>.</C>
      </>
    ),
  },

  payments: {
    title: 'Payment terms',
    description: 'The terms on which payment is collected for orders on the AVVVS Ayur Store through the checkout hosted by Shopify.',
    updatedAt: UPDATED,
    body: (
      <>
        <p>These Payment Terms form part of the <Link href="/pages/term-of-use">Terms and Conditions</Link> and apply to every order (<T>Order</T>) placed with {ORG.name} (<T>AVVVS</T>, <T>we</T> or <T>us</T>) through shop.avvvs.com.</p>

        <h2>Mode of payment</h2>
        <C>Payment is collected on our checkout page at checkout.avvvs.com, which is hosted by Shopify. The modes of payment available for an Order are displayed on that page before the Order is confirmed.</C>

        <h2>Payment credentials</h2>
        <C>Card numbers, UPI PINs, net-banking credentials and other payment instrument details are submitted by you directly to the payment gateway (at present, Razorpay) and are neither received nor stored by us.</C>
        <C>We receive only the mode of payment, the amount paid and the status of the transaction.</C>
        <C>No representative of AVVVS shall at any time request your card number, PIN or one-time password by telephone, email or WhatsApp. You should not disclose such details to any person purporting to act on our behalf, and should report any such request to us.</C>

        <h2>Price</h2>
        <C>All prices are stated in Indian Rupees and are inclusive of applicable taxes. The delivery charge, if any, is added at checkout, where the total amount payable is displayed before payment.</C>

        <h2>Failed transactions</h2>
        <C>Where a transaction fails and no amount has been debited, you may attempt payment again.</C>
        <C>Where an amount has been debited but no Order confirmation has been received, you may write to {mail(CONTACT.email)} stating the date and amount of the transaction and the telephone number or email address used. We shall verify the transaction with the payment service provider and shall either confirm the Order or cause the amount to be returned.</C>

        <h2>Refunds</h2>
        <C>Refunds are governed by the <Link href="/pages/return-policy">Cancellation and Refund Policy</Link>.</C>
      </>
    ),
  },

  contact: {
    title: 'Contact us',
    description: 'Contact details of the AVVVS pharmacy and of the Grievance Officer appointed under the Consumer Protection (E-Commerce) Rules, 2020.',
    updatedAt: UPDATED,
    body: (
      <>
        <p>The particulars below are published by {ORG.name} (<T>AVVVS</T>) in accordance with the Consumer Protection (E-Commerce) Rules, 2020 and the Information Technology Act, 2000.</p>

        <h2>Seller</h2>
        <C>{ORG.name}. Registered office: {LEGAL.registeredOffice}.</C>
        <C>Address for correspondence: {CONTACT.address.join(', ')}.</C>

        <h2>Customer care</h2>
        <C>Enquiries concerning an Order may be made by email to {mail(CONTACT.email)}, by telephone at {tel(CONTACT.phones[0])} or {tel(CONTACT.phones[1])}, or {ext(`https://wa.me/${CONTACT.whatsapp}`, 'by WhatsApp')}. Please quote the Order number stated in your confirmation email.</C>

        <h2>Grievance redressal</h2>
        <Grievance />

        <h2>Personal data</h2>
        <C>Requests for access to, or correction or erasure of, personal data shall be made in the manner set out in the clause headed “Your rights” of the <Link href="/pages/privacy-policy">Privacy Policy</Link>.</C>
      </>
    ),
  },
};
