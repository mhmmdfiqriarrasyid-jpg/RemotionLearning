import manifest from "../../public/voiceover/partisi1/manifest.json";
import { buildVo, type VoManifest } from "../shared/vo";
import lines from "./vo-lines.json";

export { VO_GAP, VO_LEAD } from "../shared/vo";

export const VO = buildVo(lines, manifest as VoManifest);
