import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { Partisi1 } from "./partisi1/Partisi1";
import { T } from "./partisi1/timeline";

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
    </>
  );
};
