import { Circle, Line, makeScene2D, Rect, Txt } from "@motion-canvas/2d";
import { all, createRef, Reference } from "@motion-canvas/core";

import { Container } from "../hazelcast/container";
import { Connector, LineAnchor } from "../hazelcast/connector";
import { Queue } from "../mqtt/queue";

interface PuLine {
  pu: Reference<Circle>;
  line: Reference<Line>;
}

export default makeScene2D(function* (view) {
  const hz = createRef<Circle>();
  const pu = createRef<Circle>();
  const requestLeft = createRef<Circle>();
  const requestRight = createRef<Circle>();
  const responseLeft = createRef<Circle>();
  const responseRight = createRef<Circle>();
  const writer = createRef<Circle>();
  const db = createRef<Circle>();

  const linePuHz = createRef<Line>();
  const linePuRequest = createRef<Line>();
  const lineResponsePu = createRef<Line>();
  const lineRequestWriter = createRef<Line>();
  const lineWriterResponse = createRef<Line>();
  const lineWriterDb = createRef<Line>();
  const lineDbWriter = createRef<Line>();

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
        justifyContent={"center"}
        gap={100}
        alignItems={"center"}
      >
        <Rect layout direction={"column"} gap={25} justifyContent={"center"}>
          <Rect height={32}></Rect>
          <Rect layout direction={"row"} gap={100} justifyContent={"center"}>
            <Container text={"HZ"} circleRef={hz} size={[125, 125]}></Container>
            <Container text={"PU"} circleRef={pu} size={[125, 125]}></Container>
          </Rect>
        </Rect>

        <Rect layout direction={"column"} gap={25} justifyContent={"center"}>
          <Txt
            text={"Data-Pump"}
            fill={"black"}
            fontSize={32}
            height={32}
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
            alignContent={"stretch"}
          >
            <Queue
              rectWidth={275}
              text="Write Request"
              leftCircleRef={requestLeft}
              rightCircleRef={requestRight}
            ></Queue>
            <Queue
              rectWidth={275}
              text="Write Response"
              leftCircleRef={responseLeft}
              rightCircleRef={responseRight}
            ></Queue>
          </Rect>
        </Rect>

        <Rect layout direction={"column"} gap={25} justifyContent={"center"}>
          <Rect height={32}></Rect>
          <Container
            size={[125, 125]}
            text={"Data Writer"}
            circleRef={writer}
          ></Container>
        </Rect>

        <Rect layout direction={"column"} gap={25} justifyContent={"center"}>
          <Rect height={32}></Rect>
          <Container text={"DB"} circleRef={db} size={[125, 125]}></Container>
        </Rect>
      </Rect>

      <Connector
        startRef={pu}
        startAnchor={LineAnchor.BottomRight}
        endRef={responseLeft}
        endAnchor={LineAnchor.Left}
        stroke={"black"}
        dashed={true}
        middlePoint={{
          x: getCenterOfNodes(pu(), responseLeft()).x,
          y: getCenterOfNodes(pu(), responseLeft()).y + 30,
        }}
      ></Connector>

      <Connector
        startRef={requestRight}
        startAnchor={LineAnchor.Right}
        endRef={writer}
        endAnchor={LineAnchor.TopLeft}
        stroke={"black"}
        dashed={true}
        middlePoint={{
          x: getCenterOfNodes(writer(), requestRight()).x,
          y: getCenterOfNodes(writer(), requestRight()).y - 30,
        }}
      ></Connector>

      <Connector
        startRef={pu}
        startAnchor={LineAnchor.TopRight}
        endRef={requestLeft}
        endAnchor={LineAnchor.Left}
        stroke={"black"}
        lineRef={linePuRequest}
        middlePoint={{
          x: getCenterOfNodes(pu(), requestLeft()).x,
          y: getCenterOfNodes(pu(), requestLeft()).y - 30,
        }}
        endArrow
      ></Connector>

      <Connector
        startRef={pu}
        startAnchor={LineAnchor.Left}
        endRef={hz}
        endAnchor={LineAnchor.Right}
        stroke={"black"}
        lineRef={linePuHz}
        endArrow
      ></Connector>

      <Connector
        startRef={responseLeft}
        startAnchor={LineAnchor.Left}
        endRef={pu}
        endAnchor={LineAnchor.BottomRight}
        stroke={"black"}
        lineRef={lineResponsePu}
        middlePoint={{
          x: getCenterOfNodes(pu(), responseLeft()).x,
          y: getCenterOfNodes(pu(), responseLeft()).y + 30,
        }}
        endArrow
      ></Connector>

      <Connector
        startRef={requestRight}
        startAnchor={LineAnchor.Right}
        endRef={writer}
        endAnchor={LineAnchor.TopLeft}
        stroke={"black"}
        lineRef={lineRequestWriter}
        middlePoint={{
          x: getCenterOfNodes(writer(), requestRight()).x,
          y: getCenterOfNodes(writer(), requestRight()).y - 30,
        }}
        endArrow
      ></Connector>

      <Connector
        startRef={writer}
        startAnchor={LineAnchor.BottomLeft}
        endRef={responseRight}
        endAnchor={LineAnchor.Right}
        stroke={"black"}
        lineRef={lineWriterResponse}
        middlePoint={{
          x: getCenterOfNodes(writer(), responseRight()).x,
          y: getCenterOfNodes(writer(), responseRight()).y + 30,
        }}
        endArrow
      ></Connector>

      <Connector
        startRef={writer}
        startAnchor={LineAnchor.TopRight}
        endRef={db}
        endAnchor={LineAnchor.TopLeft}
        stroke={"black"}
        lineRef={lineWriterDb}
        middlePoint={{
          x: getCenterOfNodes(writer(), db()).x,
          y: db().absolutePosition().add(db().size().mul(-0.5)).y,
        }}
        endArrow
      ></Connector>

      <Connector
        startRef={db}
        startAnchor={LineAnchor.BottomLeft}
        endRef={writer}
        endAnchor={LineAnchor.BottomRight}
        stroke={"black"}
        lineRef={lineDbWriter}
        middlePoint={{
          x: getCenterOfNodes(writer(), db()).x,
          y: db().absolutePosition().add(db().size().mul(0.5)).y,
        }}
        endArrow
      ></Connector>
    </>
  );

  const time = 0.5;

  const hideAllLines = function* () {
    yield* all(
      lineDbWriter().opacity(0, time),
      linePuRequest().opacity(0, time),
      lineRequestWriter().opacity(0, time),
      lineResponsePu().opacity(0, time),
      lineWriterDb().opacity(0, time),
      lineWriterResponse().opacity(0, time),
      linePuHz().opacity(0, time)
    );

    yield* all(
      lineDbWriter().end(0, 0),
      linePuRequest().end(0, 0),
      lineRequestWriter().end(0, 0),
      lineResponsePu().end(0, 0),
      lineWriterDb().end(0, 0),
      lineWriterResponse().end(0, 0),
      linePuHz().end(0, 0)
    );

    yield* all(
      lineDbWriter().opacity(1, 0),
      linePuRequest().opacity(1, 0),
      lineRequestWriter().opacity(1, 0),
      lineResponsePu().opacity(1, 0),
      lineWriterDb().opacity(1, 0),
      lineWriterResponse().opacity(1, 0),
      linePuHz().opacity(1, 0)
    );
  };

  const showRequest = function* () {
    yield* all(linePuRequest().end(1, time), linePuHz().end(1, time));
    yield* lineRequestWriter().end(1, time);
    yield* lineWriterDb().end(1, time);
    yield* lineDbWriter().end(1, time);
    yield* lineWriterResponse().end(1, time);
    yield* lineResponsePu().end(1, time);
  };

  yield* hideAllLines();
  yield* showRequest();
  yield* hideAllLines();
});
