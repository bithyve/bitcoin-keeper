type HelpAiSourceLink = { title: string; url: string };

const HELP_AI_ALLOWED_LINK_DOMAINS = [
  'bitcoinkeeper.app',
  'tapsigner.com',
  'coldcard.com',
  'seedsigner.com',
  'specter.solutions',
  'ledger.com',
  'trezor.io',
  'bitbox.swiss',
  'blockstream.com',
  'help.blockstream.com',
  'keyst.one',
  'foundation.xyz',
  'satochip.io',
  'store.coinkite.com',
  'docs.coinkite.com',
  'suite.trezor.io',
  'support.ledger.com',
];

const URL_IN_TEXT_PATTERN = /https?:\/\/[^\s<>()\[\]{}"]+/gi;

function normalizeHost(host: string): string {
  return host.trim().toLowerCase().replace(/\.$/, '');
}

function isIPv4Host(host: string): boolean {
  const parts = host.split('.');
  if (parts.length !== 4) return false;

  return parts.every((part) => {
    if (!/^\d+$/.test(part)) return false;
    const value = Number(part);
    return value >= 0 && value <= 255;
  });
}

function isIPv6Host(host: string): boolean {
  return host.includes(':');
}

function isIpLiteralHost(host: string): boolean {
  return isIPv4Host(host) || isIPv6Host(host);
}

function isLocalhostHost(host: string): boolean {
  return host === 'localhost' || host.endsWith('.localhost');
}

function isAllowlistedHost(host: string): boolean {
  return HELP_AI_ALLOWED_LINK_DOMAINS.some(
    (domain) => host === domain || host.endsWith(`.${domain}`)
  );
}

function isAllowedHelpAiUrl(rawUrl: string): boolean {
  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }

  if (parsed.protocol !== 'https:') return false;

  const host = normalizeHost(parsed.hostname || '');
  if (!host) return false;
  if (isLocalhostHost(host)) return false;
  if (isIpLiteralHost(host)) return false;

  return isAllowlistedHost(host);
}

function splitTrailingPunctuation(token: string): {
  core: string;
  trailing: string;
} {
  const match = token.match(/[.,!?;:)+\]]+$/);
  if (!match) return { core: token, trailing: '' };

  const trailing = match[0];
  return {
    core: token.slice(0, -trailing.length),
    trailing,
  };
}

export function sanitizeHelpAiReplyLinks(text: string): string {
  if (!text) return text;

  const sanitized = text.replace(URL_IN_TEXT_PATTERN, (token) => {
    const { core, trailing } = splitTrailingPunctuation(token);
    return isAllowedHelpAiUrl(core) ? core + trailing : trailing;
  });

  return sanitized.replace(/\s{2,}/g, ' ').trim();
}

export function sanitizeHelpAiSources(
  sources?: HelpAiSourceLink[],
  max = 4
): HelpAiSourceLink[] {
  if (!sources?.length) return [];

  const unique: HelpAiSourceLink[] = [];
  const seen = new Set<string>();

  for (const source of sources) {
    if (!source?.url || !isAllowedHelpAiUrl(source.url)) continue;
    if (seen.has(source.url)) continue;

    unique.push(source);
    seen.add(source.url);

    if (unique.length >= max) break;
  }

  return unique;
}
