import { Rect, Txt } from "@motion-canvas/2d";
import { Node, NodeProps } from "@motion-canvas/2d";

export interface DockerContainerOptions extends NodeProps {
  text: string;
}

export class DockerContainer extends Node {
  constructor({ text, ...rest }: DockerContainerOptions) {
    super(rest);

    this.add(
      <Rect layout direction={"row"} alignItems={"center"}>
        <Rect
          layout
          direction={"column"}
          stroke={"black"}
          lineWidth={2}
          padding={25}
          height={75}
          justifyContent={"center"}
          fill={"181818"}
        >
          <Txt
            textAlign={"center"}
            text={text}
            fill={"CCCCCC"}
            fontSize={32}
          ></Txt>
        </Rect>
      </Rect>
    );
  }
}
