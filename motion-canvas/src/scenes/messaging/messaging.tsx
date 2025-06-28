import { Circle, Code, Line, makeScene2D, Rect, Txt } from "@motion-canvas/2d";
import {
  all,
  createEffect,
  createRef,
  createSignal,
  Reference,
  spawn,
  waitFor,
} from "@motion-canvas/core";

import { Container } from "../hazelcast/container";
import { Connector, LineAnchor } from "../hazelcast/connector";

export default makeScene2D(function* (view) {
  const count = createSignal(0);

  const actor = createRef<Circle>();
  const messaging = createRef<Circle>();
  const puParent = createRef<Rect>();

  const pu1 = createRef<Circle>();
  const pu2 = createRef<Circle>();
  const pu4 = createRef<Circle>();
  const pu4Text = createRef<Txt>();
  const pu4Spacer = createRef<Rect>();

  const lineActorMessaging = createRef<Line>();

  const lineMessagingPu1 = createRef<Line>();
  const lineMessagingPu2 = createRef<Line>();
  const lineMessagingPu4 = createRef<Line>();

  view.add(
    <>
      <Rect layout direction={"row"} gap={50} justifyContent={"center"}>
        <Rect
          alignContent={"center"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Rect
            layout
            direction={"column"}
            alignContent={"center"}
            justifyContent={"center"}
            alignItems={"center"}
            gap={0}
            fill={"#181818"}
            padding={50}
            radius={25}
          >
            <Code
              fontSize={28}
              code={`\
const pus = [];
const registerPu = function (pu) {
  pus.push(pu);
}

let index = 0;
const getNextPu = function () {
	const unit = pus[index];
	index = (index + 1) % pus.length;
	return unit;
};`}
            />
          </Rect>
        </Rect>

        <Rect layout direction={"row"} gap={100} alignItems={"center"}>
          <Rect layout direction={"column"} justifyContent={"center"}>
            <Circle ref={actor}></Circle>
          </Rect>
          <Rect layout direction={"row"}>
            <Rect layout direction={"column"} justifyContent={"center"}>
              <Circle ref={messaging}></Circle>
            </Rect>
            <Rect
              layout
              width={175}
              height={400}
              alignItems={"center"}
              stroke={"black"}
              lineWidth={2}
              justifyContent={"center"}
            >
              <Txt
                text={"Messaging Grid"}
                textWrap
                fontSize={32}
                textAlign={"center"}
              ></Txt>
            </Rect>
          </Rect>
          <Rect
            layout
            direction={"column"}
            ref={puParent}
            alignItems={"center"}
          >
            <Container circleRef={pu1} text={"PU 1"}></Container>
            <Rect height={50}></Rect>
            <Container circleRef={pu2} text={"PU 2"}></Container>
            <Rect ref={pu4Spacer}></Rect>
          </Rect>
        </Rect>
      </Rect>

      <Connector
        startRef={actor}
        startAnchor={LineAnchor.Right}
        endRef={messaging}
        endAnchor={LineAnchor.Left}
        stroke={"black"}
        lineRef={lineActorMessaging}
        endArrow
      ></Connector>

      <Connector
        startRef={pu1}
        startAnchor={LineAnchor.Right}
        endRef={pu1}
        endAnchor={LineAnchor.Left}
        stroke={"black"}
        lineRef={lineMessagingPu1}
        endArrow
      ></Connector>
      <Connector
        startRef={pu2}
        startAnchor={LineAnchor.Right}
        endRef={pu2}
        endAnchor={LineAnchor.Left}
        stroke={"black"}
        lineRef={lineMessagingPu2}
        endArrow
      ></Connector>

      <Connector
        startRef={pu2}
        startAnchor={LineAnchor.Right}
        endRef={pu2}
        endAnchor={LineAnchor.Left}
        stroke={"black"}
        lineRef={lineMessagingPu4}
        endArrow
      ></Connector>
    </>
  );

  let currentPu = -1;
  const puLines = [
    { pu: pu1, line: lineMessagingPu1 },
    { pu: pu2, line: lineMessagingPu2 },
    { pu: pu4, line: lineMessagingPu4 },
  ];

  const updateLinePositions = function* () {
    for (const element of puLines) {
      const { pu, line } = element;
      try {
        const points = [];
        points.push(
          pu()
            .position()
            .addX(30 + 345)
        );
        points.push(
          pu()
            .position()
            .addX(30 + 445)
        );
        yield* line().points(points, 0);
      } catch (error) {}
    }
  };

  const time = 0.25;

  const hideLines = function* () {
    for (const element of puLines) {
      const { line } = element;
      try {
        yield line().opacity(0, time);
      } catch (error) {}
    }

    yield lineActorMessaging().opacity(0, time);
    yield* waitFor(time);

    for (const element of puLines) {
      const { line } = element;
      try {
        yield* line().end(0, 0);
        yield* line().opacity(1, 0);
      } catch (error) {}
    }

    yield* lineActorMessaging().end(0, 0);
    yield* lineActorMessaging().opacity(1, 0);
  };

  yield* hideLines();

  const showLine = function* () {
    yield* updateLinePositions();
    yield* lineActorMessaging().end(1, time);

    const count = pu4() != null ? 3 : 2;
    currentPu = (currentPu + 1) % count;

    const line = puLines[currentPu].line;
    yield* waitFor(time / 2);

    try {
      yield* line().end(1, time);
    } catch (error) {
      currentPu = 0;
      yield* puLines[currentPu].line().end(1, time);
    }
  };

  const requestLoop = function* () {
    yield* showLine();
    yield* hideLines();
  };

  const circles: Container[] = [];

  const createPu4 = function* () {
    pu4Text().opacity(0);

    yield* all(pu4Spacer().height(50, time), pu4().size(0).size(100, time));
    yield* pu4Text().opacity(1, 0.1);
    yield* updateLinePositions();
  };

  const removePu4 = function* () {
    yield* pu4Text().opacity(0, 0.1);
    yield* all(pu4Spacer().height(0, time), pu4().size(0, time));
    yield* updateLinePositions();

    pu4().remove();
  };

  createEffect(() => {
    const targetCount = Math.round(count());
    let i = circles.length;
    // add any missing circles
    for (; i < targetCount; i++) {
      const circle = (
        <Container circleRef={pu4} textRef={pu4Text} text={"PU 3"} />
      ) as Container;

      pu4().size(0);
      pu4Text().opacity(0);

      circles.push(circle);
      puParent().add(circle);

      spawn(createPu4);
    }

    // remove any extra circles
    for (; i > targetCount; i--) {
      spawn(removePu4());
    }
  });

  yield* requestLoop();
  yield* requestLoop();
  yield* requestLoop();

  count(1);
  yield* waitFor(time * 2);

  yield* requestLoop();
  yield* requestLoop();
  yield* requestLoop();
  yield* requestLoop();
  yield* requestLoop();

  count(0);
  yield* waitFor(time * 2);
});
