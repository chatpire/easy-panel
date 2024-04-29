import packageJson from "package.json";

type Release = {
  tag_name: string;
  name: string;
  draft: boolean;
  published_at: string;
  html_url: string;
};

export async function fetchLatestRelease() {
  const response = await fetch("https://api.github.com/repos/chatpire/easy-panel/releases/latest");
  const data = (await response.json()) as Release;
  return data;
}

export function getVersion() {
  return packageJson.version;
}
