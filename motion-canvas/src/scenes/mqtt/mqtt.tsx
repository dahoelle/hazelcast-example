import { Circle, Line, makeScene2D, Rect, Txt } from "@motion-canvas/2d";
import { all, createRef, Reference, waitFor } from "@motion-canvas/core";

import { Container } from "../hazelcast/container";
import { Connector, LineAnchor } from "../hazelcast/connector";
import { Queue } from "./queue";

export default makeScene2D(function* (view) {
  const producer1 = createRef<Circle>();
  const producer2 = createRef<Circle>();

  const consumer1 = createRef<Circle>();
  const consumer2 = createRef<Circle>();

  const queue1Left = createRef<Circle>();
  const queue1Right = createRef<Circle>();

  const queue2Left = createRef<Circle>();
  const queue2Right = createRef<Circle>();

  const lineEmpty = createRef<Line>();
  const lineProducer1Queue1 = createRef<Line>();
  const lineProducer1Queue2 = createRef<Line>();
  const lineProducer2Queue2 = createRef<Line>();

  const lineQueue1Consumer1 = createRef<Line>();
  const lineQueue2Consumer1 = createRef<Line>();
  const lineQueue2Consumer2 = createRef<Line>();

  view.add(
    <>
      <Rect layout direction={"row"} gap={100}>
        <Rect layout direction={"column"} gap={25} justifyContent={"center"}>
          <Txt
            text={"Producer"}
            fill={"black"}
            fontSize={32}
            textAlign={"center"}
          ></Txt>

          <Rect
            layout
            direction={"column"}
            gap={50}
            stroke={"black"}
            padding={50}
          >
            <Container text={"P1"} circleRef={producer1}></Container>
            <Container text={"P2"} circleRef={producer2}></Container>
          </Rect>
        </Rect>

        <Rect layout direction={"column"} gap={25} justifyContent={"center"}>
          <Txt
            text={"MQTT"}
            fill={"black"}
            fontSize={32}
            textAlign={"center"}
          ></Txt>

          <Rect
            layout
            direction={"column"}
            gap={50}
            stroke={"black"}
            lineDash={[10, 10]}
            lineWidth={2}
            padding={50}
          >
            <Queue
              text="Queue 1"
              leftCircleRef={queue1Left}
              rightCircleRef={queue1Right}
            ></Queue>
            <Queue
              text="Queue 2"
              leftCircleRef={queue2Left}
              rightCircleRef={queue2Right}
            ></Queue>
          </Rect>
        </Rect>

        <Rect layout direction={"column"} gap={25} justifyContent={"center"}>
          <Txt
            text={"Consumer"}
            fill={"black"}
            fontSize={32}
            textAlign={"center"}
          ></Txt>

          <Rect
            layout
            direction={"column"}
            gap={50}
            stroke={"black"}
            padding={50}
          >
            <Container text={"C1"} circleRef={consumer1}></Container>
            <Container text={"C2"} circleRef={consumer2}></Container>
          </Rect>
        </Rect>
      </Rect>

      <Connector
        startRef={producer1}
        startAnchor={LineAnchor.Right}
        endRef={queue1Left}
        endAnchor={LineAnchor.Left}
        lineRef={lineProducer1Queue1}
        stroke={"black"}
        endArrow
      ></Connector>
      <Connector
        startRef={producer1}
        startAnchor={LineAnchor.Right}
        endRef={queue2Left}
        endAnchor={LineAnchor.Left}
        lineRef={lineProducer1Queue2}
        stroke={"black"}
        endArrow
      ></Connector>
      <Connector
        startRef={producer2}
        startAnchor={LineAnchor.Right}
        endRef={queue2Left}
        endAnchor={LineAnchor.Left}
        lineRef={lineProducer2Queue2}
        stroke={"black"}
        endArrow
      ></Connector>

      <Connector
        startRef={queue1Right}
        startAnchor={LineAnchor.Right}
        endRef={consumer1}
        endAnchor={LineAnchor.Left}
        stroke={"black"}
        lineRef={lineEmpty}
        dashed={true}
      ></Connector>
      <Connector
        startRef={queue2Right}
        startAnchor={LineAnchor.Right}
        endRef={consumer1}
        endAnchor={LineAnchor.Left}
        stroke={"black"}
        lineRef={lineEmpty}
        dashed={true}
      ></Connector>
      <Connector
        startRef={queue2Right}
        startAnchor={LineAnchor.Right}
        endRef={consumer2}
        endAnchor={LineAnchor.Left}
        stroke={"black"}
        lineRef={lineEmpty}
        dashed={true}
      ></Connector>

      <Connector
        startRef={queue1Right}
        startAnchor={LineAnchor.Right}
        endRef={consumer1}
        endAnchor={LineAnchor.Left}
        stroke={"black"}
        lineRef={lineQueue1Consumer1}
        endArrow
      ></Connector>
      <Connector
        startRef={queue2Right}
        startAnchor={LineAnchor.Right}
        endRef={consumer1}
        endAnchor={LineAnchor.Left}
        stroke={"black"}
        lineRef={lineQueue2Consumer1}
        endArrow
      ></Connector>
      <Connector
        startRef={queue2Right}
        startAnchor={LineAnchor.Right}
        endRef={consumer2}
        endAnchor={LineAnchor.Left}
        stroke={"black"}
        lineRef={lineQueue2Consumer2}
        endArrow
      ></Connector>
    </>
  );

  const time = 0.5;

  const hideAllLines = function* () {
    yield* all(
      lineProducer1Queue1().opacity(0, time),
      lineProducer1Queue2().opacity(0, time),
      lineProducer2Queue2().opacity(0, time),

      lineQueue1Consumer1().opacity(0, time),
      lineQueue2Consumer1().opacity(0, time),
      lineQueue2Consumer2().opacity(0, time)
    );

    yield* all(
      lineProducer1Queue1().end(0, 0),
      lineProducer1Queue2().end(0, 0),
      lineProducer2Queue2().end(0, 0),

      lineQueue1Consumer1().end(0, 0),
      lineQueue2Consumer1().end(0, 0),
      lineQueue2Consumer2().end(0, 0)
    );

    yield* all(
      lineProducer1Queue1().opacity(1, 0),
      lineProducer1Queue2().opacity(1, 0),
      lineProducer2Queue2().opacity(1, 0),

      lineQueue1Consumer1().opacity(1, 0),
      lineQueue2Consumer1().opacity(1, 0),
      lineQueue2Consumer2().opacity(1, 0)
    );
  };

  const requestProducer1Queue1 = function* () {
    yield* lineProducer1Queue1().end(1, time);

    yield* all(lineQueue1Consumer1().end(1, time));

    yield* waitFor(time);
    yield* hideAllLines();
  };

  const requestProducer1Queue2 = function* () {
    yield* lineProducer1Queue2().end(1, time);

    yield* all(
      lineQueue2Consumer1().end(1, time),
      lineQueue2Consumer2().end(1, time)
    );

    yield* waitFor(time);
    yield* hideAllLines();
  };

  const requestProducer2Queue2 = function* () {
    yield* lineProducer2Queue2().end(1, time);

    yield* all(
      lineQueue2Consumer1().end(1, time),
      lineQueue2Consumer2().end(1, time)
    );

    yield* waitFor(time);
    yield* hideAllLines();
  };

  yield* hideAllLines();

  yield* requestProducer1Queue1();
  yield* waitFor(0.5);
  yield* requestProducer1Queue2();
  yield* waitFor(0.5);
  yield* requestProducer2Queue2();
  yield* waitFor(0.5);
});
