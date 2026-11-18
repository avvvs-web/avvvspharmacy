/*
 * Short introductions for each concern page. They explain how Ayurveda traditionally looks at the
 * area and what kinds of medicines are listed, without promising any result. Status: written 8 Nov
 * 2026; wording corrected by AVVVS on 18 Nov 2026 (their "Avvvs pharmacy" document). Add `faq`
 * entries only with answers AVVVS approves; they are then also published as FAQ structured data.
 */
export type ConcernIntro = { intro: string; faq?: { q: string; a: string }[] };

export const CONCERN_INTROS: Record<string, ConcernIntro> = {
  'pain-management': {
    intro: 'Ayurveda traditionally links most pain and stiffness in the joints, muscles and back to aggravated vata. The medicines here include kashayams taken orally and classical oils for massage, which are often used together under a physician’s guidance.',
  },
  'digestive-health': {
    intro: 'Ayurveda places digestion, or Agni, at the centre of good health. The medicines in this category are traditionally used for appetite, indigestion, gas, constipation and bowel health. These include digestive powders (Choornams), Kashayams and Arishtams.',
  },
  'respiratory': {
    intro: 'These medicines are traditionally used in Ayurveda for coughs, colds, sinus congestion and respiratory health. Breathlessness, chest pain or a persistent cough should always be evaluated by a doctor.',
  },
  'skin-and-hair': {
    intro: 'Ayurveda traditionally views the skin as a reflection of blood and digestion. Skin care often combines oral medicines with externally applied oils and powders. The hair oils (Kerams) in this category are used on the scalp.',
  },
  'womens-health': {
    intro: 'Medicines traditionally used in Ayurveda for menstrual health, care during pregnancy and after childbirth, and menopause. Consult your doctor before using any Ayurvedic medicine during pregnancy or breastfeeding.',
  },
  'childrens-health': {
    intro: 'Gentle tonics, digestive medicines and massage oils traditionally used for children in Kerala. Dosages for children differ from those for adults. Consult a doctor for the appropriate dose before use.',
  },
  'fever-and-immunity': {
    intro: 'Medicines traditionally used in Ayurveda during and after fever, and to support the body’s natural defences through seasonal changes. High, persistent or recurring fever requires medical attention.',
  },
  'diabetes-and-metabolic': {
    intro: 'Medicines traditionally used in Ayurveda alongside dietary and lifestyle measures to support blood sugar management, weight management and metabolism. These are intended as supportive care. Do not stop or change any prescribed medication without consulting your doctor.',
  },
  'heart-and-circulation': {
    intro: 'Medicines traditionally used in Ayurveda to support heart and circulatory health. They are not a substitute for prescribed medical treatment. Chest pain or breathlessness requires immediate medical attention.',
  },
  'liver-and-kidney': {
    intro: 'Medicines traditionally used in Ayurveda for liver, kidney and urinary health, and concerns related to fluid retention. Jaundice, persistent flank pain or blood in the urine requires medical evaluation.',
  },
  'mind-sleep-nerves': {
    intro: 'Medicines and oils traditionally used in Ayurveda to support relaxation, restful sleep, memory and nervous system health, including classical head and body oils.',
  },
  'rejuvenation': {
    intro: 'Rasayana is a branch of Ayurveda focused on strength, vitality, longevity and healthy ageing. These tonics, medicated ghees and herbal preparations are traditionally used to support general well-being and recovery after illness.',
  },
};
