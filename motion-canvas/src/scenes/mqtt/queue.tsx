import { Circle, Length, Rect, Txt } from "@motion-canvas/2d";
import { createSignal, Reference, SignalValue } from "@motion-canvas/core";
import { Node, NodeProps } from "@motion-canvas/2d";

export interface QueueOptions extends NodeProps {
  text: string;
  leftCircleRef?: Reference<Circle>;
  rightCircleRef?: Reference<Circle>;
  topCircleRef?: Reference<Circle>;
  bottomCircleRef?: Reference<Circle>;
  rectWidth?: SignalValue<Length>;
}

export class Queue extends Node {
  constructor({
    text,
    leftCircleRef,
    rightCircleRef,
    topCircleRef,
    bottomCircleRef,
    rectWidth = null,
    ...rest
  }: QueueOptions) {
    super(rest);

    const size = createSignal(0);

    this.add(
      <Rect layout direction={"row"} alignItems={"center"}>
        <Circle
          ref={leftCircleRef}
          stroke={"black"}
          lineWidth={2}
          size={size}
        ></Circle>
        <Rect
          justifyContent={"center"}
          alignItems={"center"}
          layout
          direction={"column"}
        >
          {" "}
          <Circle
            ref={topCircleRef}
            stroke={"black"}
            lineWidth={2}
            size={size}
          ></Circle>
          <Rect
            layout
            direction={"column"}
            gap={50}
            stroke={"black"}
            lineWidth={2}
            padding={25}
            height={100}
            width={rectWidth}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Txt
              textAlign={"center"}
              text={text}
              fill={"black"}
              fontSize={32}
            ></Txt>
          </Rect>
          <Circle
            ref={bottomCircleRef}
            stroke={"black"}
            lineWidth={2}
            size={size}
          ></Circle>
        </Rect>
        <Circle
          ref={rightCircleRef}
          stroke={"black"}
          lineWidth={2}
          size={size}
        ></Circle>
      </Rect>
    );
  }
}
