import manifest from "../../public/voiceover/worksetup/manifest.json";
import { buildVo, type VoManifest } from "../shared/vo";
import lines from "./vo-lines.json";

export const VO = buildVo(lines, manifest as VoManifest);
