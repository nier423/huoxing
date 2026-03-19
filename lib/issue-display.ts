interface IssueDisplayInput {
  label?: string | null;
  title?: string | null;
  description?: string | null;
}

const CHINESE_DIGITS = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

function toChineseNumber(value: number): string {
  if (value < 10) {
    return CHINESE_DIGITS[value] ?? String(value);
  }

  if (value === 10) {
    return "十";
  }

  if (value < 20) {
    return `十${CHINESE_DIGITS[value % 10]}`;
  }

  if (value < 100) {
    const tens = Math.floor(value / 10);
    const ones = value % 10;

    return `${CHINESE_DIGITS[tens]}十${ones === 0 ? "" : CHINESE_DIGITS[ones]}`;
  }

  return String(value);
}

export function getIssueNumberFromLabel(label?: string | null): number | null {
  if (!label) {
    return null;
  }

  const match = label.trim().match(/^v(\d+)$/i);

  if (!match) {
    return null;
  }

  return Number.parseInt(match[1], 10);
}

export function getIssueDisplayTitle(
  issue?: IssueDisplayInput | null,
  fallback = "本期文章"
): string {
  const issueNumber = getIssueNumberFromLabel(issue?.label);

  if (issueNumber !== null && !Number.isNaN(issueNumber)) {
    return `第${toChineseNumber(issueNumber)}看`;
  }

  return issue?.title?.trim() || fallback;
}

export function getIssueDisplayBrandTitle(
  issue?: IssueDisplayInput | null,
  brandName = "星火"
): string {
  const issueNumber = getIssueNumberFromLabel(issue?.label);

  if (issueNumber !== null && !Number.isNaN(issueNumber)) {
    return `${brandName}第${toChineseNumber(issueNumber)}看`;
  }

  if (issue?.description?.trim()) {
    return issue.description.trim();
  }

  if (issue?.title?.trim()) {
    return `${brandName}${issue.title.trim()}`;
  }

  return `${brandName}本期`;
}
