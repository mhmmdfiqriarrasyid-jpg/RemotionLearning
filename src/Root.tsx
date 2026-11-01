import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { Partisi1 } from "./partisi1/Partisi1";
import { T } from "./partisi1/timeline";
import { Partisi2 } from "./partisi2/Partisi2";
import { T as T2 } from "./partisi2/timeline";
import { END as WORKSETUP_END } from "./worksetup/timeline";
import { WorkSetupVideo } from "./worksetup/WorkSetupVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition
        id="Partisi1-CheckDeviceUnit"
        component={Partisi1}
        durationInFrames={Math.ceil(T.end * 30)}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Partisi2-WorkSetup"
        component={Partisi2}
        durationInFrames={Math.ceil(T2.end * 30)}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="WorkSetup-Lengkap"
        component={WorkSetupVideo}
        durationInFrames={Math.ceil(WORKSETUP_END * 30)}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
