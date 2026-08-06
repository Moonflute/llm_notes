import { appVersion } from "@/lib/app-version";

export function AppVersion() {
  return <span className="appVersion" aria-label={"애플리케이션 버전 "+appVersion}>v{appVersion}</span>;
}
