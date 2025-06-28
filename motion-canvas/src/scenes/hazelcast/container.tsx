import { Circle, Txt } from "@motion-canvas/2d";
import { PossibleVector2, Reference } from "@motion-canvas/core";
import { Node, NodeProps } from "@motion-canvas/2d";

export interface ContainerOptions extends NodeProps {
  text: string;
  circleRef: Reference<Circle>;
  textRef?: Reference<Txt>;
  size?: PossibleVector2;
}

export class Container extends Node {
  constructor({
    text,
    circleRef,
    textRef,
    size = [100, 100],
    ...rest
  }: ContainerOptions) {
    super(rest);

    this.add(
      <Circle
        ref={circleRef}
        layout
        direction={"column"}
        justifyContent={"center"}
        alignItems={"center"}
        lineWidth={2}
        stroke={"black"}
        size={size}
        fill={"white"}
      >
        <Txt
          fontSize={32}
          fill={"black"}
          text={text}
          ref={textRef}
          textWrap
          textAlign={"center"}
        ></Txt>
      </Circle>
    );
  }
}
