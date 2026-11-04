
export interface MonthlyReminderInput {
  memberName: string;
  month: string;
  year: number;
}

export const MONTHLY_CONTRIBUTION_TEMPLATE = `Assalamu Alaikum {{memberName}},

Umeed hai aap khairiyat se honge.

Ye aapke {{month}} {{year}} ke masjid ke chande ke liye ek chhota sa reminder hai.

Aapse guzarish hai ki apna chanda apni sahulat ke mutabiq jama kar dein.

Aap chanda jama karne ke liye attached QR code scan kar sakte hain.

JazakAllahu Khairan. Allah aapke maal aur rizq mein barkat ata farmaye.

— Mosque Administration`;

export function buildMonthlyContributionMessage({
  memberName,
  month,
  year,
}: MonthlyReminderInput): string {
  return MONTHLY_CONTRIBUTION_TEMPLATE
    .replaceAll("{{memberName}}", memberName)
    .replaceAll("{{month}}", month)
    .replaceAll("{{year}}", String(year));
}
