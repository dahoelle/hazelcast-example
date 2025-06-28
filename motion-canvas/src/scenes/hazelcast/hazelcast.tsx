import { Circle, Code, Line, makeScene2D, Rect, Txt } from "@motion-canvas/2d";
import { all, createRef, waitFor } from "@motion-canvas/core";
import { Container } from "./container";
import { LineAnchor, Connector } from "./connector";

export default makeScene2D(function* (view) {
  const code1 = createRef<Rect>();
  const code2 = createRef<Code>();
  const code3 = createRef<Code>();
  const code4 = createRef<Code>();

  const pu1 = createRef<Circle>();
  const pu2 = createRef<Circle>();
  const pu3 = createRef<Circle>();

  const hz1 = createRef<Circle>();
  const hz2 = createRef<Circle>();
  const hz3 = createRef<Circle>();

  const linePu1Hz1 = createRef<Line>();
  const linePu2Hz2 = createRef<Line>();
  const linePu3Hz3 = createRef<Line>();

  const lineHz1Hz2 = createRef<Line>();
  const lineHz2Hz3 = createRef<Line>();

  const lineMappingPu2Hz2 = createRef<Line>();
  const lineMappingHz2Hz1 = createRef<Line>();
  const lineMappingHz2Hz3 = createRef<Line>();

  const lineReadPu2Hz2 = createRef<Line>();
  const lineReadHz2Pu2 = createRef<Line>();

  const getCenterOfNodes = function (start: Circle, end: Circle) {
    const startPos = start.absolutePosition();
    const endPos = end.absolutePosition();
    return {
      x: (startPos.x + endPos.x) / 2,
      y: (startPos.y + endPos.y) / 2,
    };
  };

  view.add(
    <>
      <Rect
        layout
        direction={"row"}
        gap={50}
        alignContent={"center"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Rect
          layout
          direction={"column"}
          alignContent={"center"}
          justifyContent={"center"}
          gap={0}
          fill={"#181818"}
          padding={50}
          ref={code1}
          radius={25}
        >
          <Code
            fontSize={28}
            code={`\
const { Client: hz } = require('hazelcast-client');

const client = await hz.newHazelcastClient({
	network: { clusterMembers: ['ip:port'] },
});

const sql = await client.getSql();`}
          />
          <Code
            fontSize={28}
            ref={code2}
            code={`\
await sql.execute('CREATE MAPPING <...>');`}
          />

          <Code
            fontSize={28}
            ref={code3}
            code={`\
await sql.execute('INSERT <...>');`}
          />

          <Code
            fontSize={28}
            ref={code4}
            code={`\
const data = await sql.execute('SELECT <...>');`}
          />
        </Rect>

        <Rect layout direction={"column"} gap={100}>
          <Rect layout direction={"row"} gap={150}>
            <Container text="PU 1" circleRef={pu1}></Container>
            <Container text="HZ 1" circleRef={hz1}></Container>
          </Rect>
          <Rect layout direction={"row"} gap={150}>
            <Container text="PU 2" circleRef={pu2}></Container>
            <Container text="HZ 2" circleRef={hz2}></Container>
          </Rect>
          <Rect layout direction={"row"} gap={150}>
            <Container text="PU 3" circleRef={pu3}></Container>
            <Container text="HZ 3" circleRef={hz3}></Container>
          </Rect>
        </Rect>
      </Rect>

      <Connector
        startRef={pu1}
        startAnchor={LineAnchor.Right}
        endRef={hz1}
        endAnchor={LineAnchor.Left}
        lineRef={linePu1Hz1}
        stroke={"black"}
        dashed={true}
      ></Connector>
      <Connector
        startRef={pu2}
        startAnchor={LineAnchor.Right}
        endRef={hz2}
        endAnchor={LineAnchor.Left}
        lineRef={linePu2Hz2}
        stroke={"black"}
        dashed={true}
      ></Connector>
      <Connector
        startRef={pu3}
        startAnchor={LineAnchor.Right}
        endRef={hz3}
        endAnchor={LineAnchor.Left}
        lineRef={linePu3Hz3}
        stroke={"black"}
        dashed={true}
      ></Connector>

      <Connector
        startRef={hz1}
        startAnchor={LineAnchor.Bottom}
        endRef={hz2}
        endAnchor={LineAnchor.Top}
        lineRef={lineHz1Hz2}
        stroke={"black"}
        dashed={true}
      ></Connector>
      <Connector
        startRef={hz2}
        startAnchor={LineAnchor.Bottom}
        endRef={hz3}
        endAnchor={LineAnchor.Top}
        lineRef={lineHz2Hz3}
        stroke={"black"}
        dashed={true}
      ></Connector>

      <Connector
        startRef={pu2}
        startAnchor={LineAnchor.TopRight}
        endRef={hz2}
        endAnchor={LineAnchor.TopLeft}
        middlePoint={{
          x: getCenterOfNodes(pu2(), hz2()).x,
          y: pu1().absolutePosition().add(pu1().size().mul(1.5)).y,
        }}
        endArrow={true}
        lineRef={lineMappingPu2Hz2}
        stroke={"black"}
      ></Connector>
      <Connector
        startRef={hz2}
        startAnchor={LineAnchor.TopRight}
        endRef={hz1}
        endAnchor={LineAnchor.BottomRight}
        middlePoint={{
          x: hz2().absolutePosition().add(hz2().size().mul(0.5)).x,
          y: getCenterOfNodes(hz2(), hz1()).y,
        }}
        endArrow={true}
        lineRef={lineMappingHz2Hz1}
        stroke={"black"}
      ></Connector>
      <Connector
        startRef={hz2}
        startAnchor={LineAnchor.BottomRight}
        endRef={hz3}
        endAnchor={LineAnchor.TopRight}
        middlePoint={{
          x: hz2().absolutePosition().add(hz2().size().mul(0.5)).x,
          y: getCenterOfNodes(hz2(), hz3()).y,
        }}
        endArrow={true}
        lineRef={lineMappingHz2Hz3}
        stroke={"black"}
      ></Connector>

      <Connector
        startRef={pu2}
        startAnchor={LineAnchor.TopRight}
        endRef={hz2}
        endAnchor={LineAnchor.TopLeft}
        middlePoint={{
          x: getCenterOfNodes(pu2(), hz2()).x,
          y: pu1().absolutePosition().add(pu1().size().mul(1.5)).y,
        }}
        endArrow={true}
        lineRef={lineReadPu2Hz2}
        stroke={"black"}
      ></Connector>
      <Connector
        startRef={hz2}
        startAnchor={LineAnchor.BottomLeft}
        endRef={pu2}
        endAnchor={LineAnchor.BottomRight}
        middlePoint={{
          x: getCenterOfNodes(pu2(), hz2()).x,
          y: pu1().absolutePosition().add(pu1().size().mul(2.5)).y,
        }}
        endArrow={true}
        lineRef={lineReadHz2Pu2}
        stroke={"black"}
      ></Connector>
    </>
  );

  // Hide lines
  linePu1Hz1().start(0.5).end(0.5).opacity(0);
  linePu2Hz2().start(0.5).end(0.5).opacity(0);
  linePu3Hz3().start(0.5).end(0.5).opacity(0);

  lineHz1Hz2().start(0.5).end(0.5).opacity(0);
  lineHz2Hz3().start(0.5).end(0.5).opacity(0);

  lineMappingPu2Hz2().start(0).end(0).opacity(0);
  lineMappingHz2Hz1().start(0).end(0).opacity(0);
  lineMappingHz2Hz3().start(0).end(0).opacity(0);

  lineReadHz2Pu2().start(0).end(0).opacity(0);
  lineReadPu2Hz2().start(0).end(0).opacity(0);

  // Hide code
  code2().opacity(0);
  code3().opacity(0);
  code4().opacity(0);

  const markCut = function* () {
    const children = view.children;

    for (const element of children()) {
      element.opacity(0);
    }

    yield view.fill("#000000FF");
    yield;
    yield view.fill("#FFFFFFFF");

    for (const element of children()) {
      element.opacity(1);
    }
  };

  //! --- Animations

  const time = 0.5;

  const showAndConnectOtherInstances = function* () {
    yield* all(
      linePu1Hz1().opacity(1, 0),
      linePu1Hz1().start(0, time),
      linePu1Hz1().end(1, time),

      linePu2Hz2().opacity(1, 0),
      linePu2Hz2().start(0, time),
      linePu2Hz2().end(1, time),

      linePu3Hz3().opacity(1, 0),
      linePu3Hz3().start(0, time),
      linePu3Hz3().end(1, time),

      lineHz1Hz2().opacity(1, 0),
      lineHz1Hz2().start(0, time),
      lineHz1Hz2().end(1, time),

      lineHz2Hz3().opacity(1, 0),
      lineHz2Hz3().start(0, time),
      lineHz2Hz3().end(1, time)
    );

    yield* waitFor(0.5);

    yield* all(
      linePu1Hz1().opacity(0, time),
      linePu2Hz2().opacity(0, time),
      linePu3Hz3().opacity(0, time),
      lineHz1Hz2().opacity(0, time),
      lineHz2Hz3().opacity(0, time)
    );

    yield* all(
      linePu1Hz1().start(0.5, 0),
      linePu1Hz1().end(0.5, 0),

      linePu2Hz2().start(0.5, 0),
      linePu2Hz2().end(0.5, 0),

      linePu3Hz3().start(0.5, 0),
      linePu3Hz3().end(0.5, 0),

      lineHz1Hz2().start(0.5, 0),
      lineHz1Hz2().end(0.5, 0),

      lineHz2Hz3().start(0.5, 0),
      lineHz2Hz3().end(0.5, 0)
    );
  };

  const showMappingCode = function* () {
    yield* code2().opacity(1, 0);
  };

  const showMappingRequest = function* () {
    lineMappingPu2Hz2().opacity(1);
    lineMappingHz2Hz1().opacity(1);
    lineMappingHz2Hz3().opacity(1);

    yield* lineMappingPu2Hz2().end(1, time);
    yield* all(
      lineMappingHz2Hz1().end(1, time),
      lineMappingHz2Hz3().end(1, time)
    );

    yield* waitFor(0.5);

    yield* all(
      lineMappingPu2Hz2().opacity(0, time),
      lineMappingHz2Hz1().opacity(0, time),
      lineMappingHz2Hz3().opacity(0, time)
    );

    yield* all(
      lineMappingPu2Hz2().end(0, 0),
      lineMappingHz2Hz1().end(0, 0),
      lineMappingHz2Hz3().end(0, 0)
    );
  };

  const showInsertCode = function* () {
    yield* all(
      lineMappingPu2Hz2().opacity(0, time),
      lineMappingHz2Hz1().opacity(0, time),
      lineMappingHz2Hz3().opacity(0, time),

      code2().opacity(0, time),
      code3().opacity(1, time)
    );

    lineMappingPu2Hz2().end(0).opacity(1);
    lineMappingHz2Hz1().end(0).opacity(1);
    lineMappingHz2Hz3().end(0).opacity(1);
  };

  const showInsertRequest = function* () {
    yield* lineMappingPu2Hz2().end(1, time);
    yield* all(
      lineMappingHz2Hz1().end(1, time),
      lineMappingHz2Hz3().end(1, time)
    );

    yield* all(
      lineMappingPu2Hz2().opacity(0, time),
      lineMappingHz2Hz1().opacity(0, time),
      lineMappingHz2Hz3().opacity(0, time)
    );

    yield* all(
      lineMappingPu2Hz2().end(0, 0),
      lineMappingHz2Hz1().end(0, 0),
      lineMappingHz2Hz3().end(0, 0)
    );
  };

  const showReadCode = function* () {
    yield* all(
      lineMappingPu2Hz2().opacity(0, time),
      lineMappingHz2Hz1().opacity(0, time),
      lineMappingHz2Hz3().opacity(0, time),

      code3().opacity(0, time),
      code4().opacity(1, time)
    );

    lineMappingPu2Hz2().end(0);
    lineMappingHz2Hz1().end(0);
    lineMappingHz2Hz3().end(0);
  };

  const showReadRequest = function* () {
    lineReadPu2Hz2().opacity(1);
    lineReadHz2Pu2().opacity(1);
    yield* lineReadPu2Hz2().end(1, time);
    yield* lineReadHz2Pu2().end(1, time);

    yield* all(
      lineReadPu2Hz2().opacity(0, time),
      lineReadHz2Pu2().opacity(0, time)
    );
  };

  yield* showAndConnectOtherInstances();
  yield* markCut();

  yield* showMappingCode();
  yield* markCut();

  yield* all(
    linePu1Hz1().opacity(1, 0),
    linePu1Hz1().start(0, 0),
    linePu1Hz1().end(1, 0),

    linePu2Hz2().opacity(1, 0),
    linePu2Hz2().start(0, 0),
    linePu2Hz2().end(1, 0),

    linePu3Hz3().opacity(1, 0),
    linePu3Hz3().start(0, 0),
    linePu3Hz3().end(1, 0),

    lineHz1Hz2().opacity(1, 0),
    lineHz1Hz2().start(0, 0),
    lineHz1Hz2().end(1, 0),

    lineHz2Hz3().opacity(1, 0),
    lineHz2Hz3().start(0, 0),
    lineHz2Hz3().end(1, 0)
  );

  yield* showMappingRequest();
  yield* markCut();

  yield* showInsertCode();
  yield* markCut();

  yield* showInsertRequest();
  yield* markCut();

  yield* showReadCode();
  yield* markCut();

  yield* showReadRequest();
  yield* markCut();
});
