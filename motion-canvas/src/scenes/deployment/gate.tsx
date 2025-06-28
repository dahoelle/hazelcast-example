import { Circle, Length, Rect, Txt } from "@motion-canvas/2d";
import {
  createRef,
  createSignal,
  Reference,
  SignalValue,
} from "@motion-canvas/core";
import { Node, NodeProps } from "@motion-canvas/2d";

export interface GateOptions extends NodeProps {
  text: string;
  leftCircleRef?: Reference<Circle>;
  rightCircleRef?: Reference<Circle>;
  topCircleRef?: Reference<Circle>;
  bottomCircleRef?: Reference<Circle>;
  leftTextRef?: Reference<Txt>;
  rightTextRef?: Reference<Txt>;
  topTextRef?: Reference<Txt>;
  bottomTextRef?: Reference<Txt>;
  rectWidth?: SignalValue<Length>;
}

export class Gate extends Node {
  constructor({
    text,
    leftCircleRef,
    rightCircleRef,
    topCircleRef,
    bottomCircleRef,
    leftTextRef,
    rightTextRef,
    topTextRef,
    bottomTextRef,
    rectWidth = null,
    ...rest
  }: GateOptions) {
    super(rest);

    const parentRect = createRef<Rect>();
    const refRect = createRef<Rect>();
    const size = createSignal(0);
    const gateSize = createSignal(125);

    leftCircleRef ??= createRef<Circle>();
    rightCircleRef ??= createRef<Circle>();
    topCircleRef ??= createRef<Circle>();
    bottomCircleRef ??= createRef<Circle>();

    leftTextRef ??= createRef<Txt>();
    rightTextRef ??= createRef<Txt>();
    topTextRef ??= createRef<Txt>();
    bottomTextRef ??= createRef<Txt>();

    this.add(
      <Rect>
        <Rect
          layout
          direction={"row"}
          alignItems="center"
          justifyContent="center"
          size={[gateSize() * Math.sqrt(2), gateSize() * Math.sqrt(2)]}
          ref={parentRect}
        >
          <Circle
            ref={leftCircleRef}
            stroke={"black"}
            lineWidth={2}
            size={size}
            layout={false}
          >
            <Txt fontSize={32} ref={leftTextRef} layout={false}></Txt>
          </Circle>
          <Rect
            justifyContent={"center"}
            alignItems={"center"}
            layout
            direction={"column"}
          >
            <Circle
              ref={topCircleRef}
              stroke={"black"}
              lineWidth={2}
              size={size}
              layout={false}
            >
              <Txt fontSize={32} ref={topTextRef} layout={false}></Txt>
            </Circle>
            <Rect
              rotation={45}
              size={gateSize}
              lineWidth={2}
              stroke={"black"}
              layout
              alignItems="center"
              justifyContent="center"
              ref={refRect}
            >
              <Txt
                text={text}
                rotation={-45}
                fontSize={32}
                textWrap
                textAlign={"center"}
              />
            </Rect>
            <Circle
              ref={bottomCircleRef}
              stroke={"black"}
              lineWidth={2}
              layout={false}
              size={size}
            >
              <Txt fontSize={32} ref={bottomTextRef} layout={false}></Txt>
            </Circle>
          </Rect>
          <Circle
            ref={rightCircleRef}
            stroke={"black"}
            lineWidth={2}
            layout={false}
            size={size}
          >
            <Txt fontSize={32} ref={rightTextRef} layout={false}></Txt>
          </Circle>
        </Rect>
      </Rect>
    );

    leftCircleRef().absolutePosition(
      parentRect()
        .absolutePosition()
        .addX(-parentRect().width() / 2)
    );

    rightCircleRef().absolutePosition(
      parentRect()
        .absolutePosition()
        .addX(parentRect().width() / 2)
    );

    topCircleRef().absolutePosition(
      parentRect()
        .absolutePosition()
        .addY(-parentRect().height() / 2)
    );

    bottomCircleRef().absolutePosition(
      parentRect()
        .absolutePosition()
        .addY(parentRect().height() / 2)
    );

    topTextRef().absolutePosition(
      topCircleRef().absolutePosition().add([16, -16])
    );

    rightTextRef().absolutePosition(
      rightCircleRef().absolutePosition().add([16, 16])
    );

    bottomTextRef().absolutePosition(
      bottomCircleRef().absolutePosition().add([-16, 16])
    );

    leftTextRef().absolutePosition(
      leftCircleRef().absolutePosition().add([-16, -16])
    );
  }
}
