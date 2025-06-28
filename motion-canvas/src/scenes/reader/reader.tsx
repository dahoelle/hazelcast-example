import { Circle, Line, makeScene2D, Rect, Txt } from "@motion-canvas/2d";
import { all, createRef, Reference } from "@motion-canvas/core";

import { Container } from "../hazelcast/container";
import { Connector, LineAnchor } from "../hazelcast/connector";
import { Queue } from "../mqtt/queue";

export default makeScene2D(function* (view) {
  const pu = createRef<Circle>();
  const hz = createRef<Circle>();
  const reader = createRef<Circle>();
  const db = createRef<Circle>();

  const mappingRequestLeft = createRef<Circle>();
  const mappingRequestRight = createRef<Circle>();
  const mappingResponseLeft = createRef<Circle>();
  const mappingResponseRight = createRef<Circle>();

  const readRequestLeft = createRef<Circle>();
  const readRequestRight = createRef<Circle>();
  const readResponseLeft = createRef<Circle>();
  const readResponseRight = createRef<Circle>();

  const linePuMapping = createRef<Line>();
  const lineMappingReader = createRef<Line>();
  const lineReaderDb = createRef<Line>();
  const lineDbReader = createRef<Line>();
  const lineReaderMapping = createRef<Line>();
  const lineMappingPu = createRef<Line>();

  const linePuRead = createRef<Line>();
  const lineReadReader = createRef<Line>();
  const lineReaderDb2 = createRef<Line>();
  const lineDbReader2 = createRef<Line>();
  const lineReaderRead = createRef<Line>();
  const lineReadPu = createRef<Line>();

  const linePuHz = createRef<Line>();
  const linePuHz2 = createRef<Line>();

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
              rectWidth={325}
              text="Mapping Request"
              leftCircleRef={mappingRequestLeft}
              rightCircleRef={mappingRequestRight}
            ></Queue>
            <Queue
              rectWidth={325}
              text="Mapping Response"
              leftCircleRef={mappingResponseLeft}
              rightCircleRef={mappingResponseRight}
            ></Queue>
            <Queue
              rectWidth={325}
              text="Read Request"
              leftCircleRef={readRequestLeft}
              rightCircleRef={readRequestRight}
            ></Queue>
            <Queue
              rectWidth={325}
              text="Read Response"
              leftCircleRef={readResponseLeft}
              rightCircleRef={readResponseRight}
            ></Queue>
          </Rect>
        </Rect>

        <Rect layout direction={"column"} gap={25} justifyContent={"center"}>
          <Rect height={32}></Rect>
          <Container
            size={[125, 125]}
            text={"Data Reader"}
            circleRef={reader}
          ></Container>
        </Rect>

        <Rect layout direction={"column"} gap={25} justifyContent={"center"}>
          <Rect height={32}></Rect>
          <Container text={"DB"} circleRef={db} size={[125, 125]}></Container>
        </Rect>
      </Rect>

      <Connector
        startRef={mappingRequestRight}
        startAnchor={LineAnchor.Right}
        endRef={reader}
        endAnchor={LineAnchor.Top}
        stroke={"black"}
        middlePoint={{
          x: getCenterOfNodes(reader(), mappingRequestRight()).x,
          y: getCenterOfNodes(reader(), mappingRequestRight()).y - 60,
        }}
        dashed={true}
      ></Connector>
      <Connector
        startRef={mappingResponseLeft}
        startAnchor={LineAnchor.Left}
        endRef={pu}
        endAnchor={LineAnchor.TopRight}
        stroke={"black"}
        middlePoint={{
          x: getCenterOfNodes(pu(), mappingResponseLeft()).x,
          y: getCenterOfNodes(pu(), mappingResponseLeft()).y - 30,
        }}
        dashed={true}
      ></Connector>
      <Connector
        startRef={readRequestRight}
        startAnchor={LineAnchor.Right}
        endRef={reader}
        endAnchor={LineAnchor.BottomLeft}
        stroke={"black"}
        middlePoint={{
          x: getCenterOfNodes(reader(), readRequestRight()).x,
          y: getCenterOfNodes(reader(), readRequestRight()).y + 30,
        }}
        dashed={true}
      ></Connector>
      <Connector
        startRef={readResponseLeft}
        startAnchor={LineAnchor.Left}
        endRef={pu}
        endAnchor={LineAnchor.Bottom}
        stroke={"black"}
        middlePoint={{
          x: getCenterOfNodes(pu(), readResponseLeft()).x,
          y: getCenterOfNodes(pu(), readResponseLeft()).y + 60,
        }}
        dashed={true}
      ></Connector>

      <Connector
        startRef={pu}
        startAnchor={LineAnchor.Top}
        endRef={mappingRequestLeft}
        endAnchor={LineAnchor.Left}
        stroke={"black"}
        lineRef={linePuMapping}
        middlePoint={{
          x: getCenterOfNodes(pu(), mappingRequestLeft()).x,
          y: getCenterOfNodes(pu(), mappingRequestLeft()).y - 60,
        }}
        endArrow
      ></Connector>
      <Connector
        startRef={mappingRequestRight}
        startAnchor={LineAnchor.Right}
        endRef={reader}
        endAnchor={LineAnchor.Top}
        stroke={"black"}
        lineRef={lineMappingReader}
        middlePoint={{
          x: getCenterOfNodes(reader(), mappingRequestRight()).x,
          y: getCenterOfNodes(reader(), mappingRequestRight()).y - 60,
        }}
        endArrow
      ></Connector>
      <Connector
        startRef={reader}
        startAnchor={LineAnchor.TopRight}
        endRef={db}
        endAnchor={LineAnchor.TopLeft}
        stroke={"black"}
        lineRef={lineReaderDb}
        middlePoint={{
          x: getCenterOfNodes(reader(), db()).x,
          y: getCenterOfNodes(reader(), db()).y - 60,
        }}
        endArrow
      ></Connector>
      <Connector
        startRef={db}
        startAnchor={LineAnchor.BottomLeft}
        endRef={reader}
        endAnchor={LineAnchor.BottomRight}
        stroke={"black"}
        lineRef={lineDbReader}
        middlePoint={{
          x: getCenterOfNodes(reader(), db()).x,
          y: getCenterOfNodes(reader(), db()).y + 60,
        }}
        endArrow
      ></Connector>
      <Connector
        startRef={reader}
        startAnchor={LineAnchor.TopLeft}
        endRef={mappingResponseRight}
        endAnchor={LineAnchor.Right}
        stroke={"black"}
        lineRef={lineReaderMapping}
        middlePoint={{
          x: getCenterOfNodes(reader(), mappingResponseRight()).x,
          y: getCenterOfNodes(reader(), mappingResponseRight()).y - 30,
        }}
        endArrow
      ></Connector>
      <Connector
        startRef={mappingResponseLeft}
        startAnchor={LineAnchor.Left}
        endRef={pu}
        endAnchor={LineAnchor.TopRight}
        stroke={"black"}
        lineRef={lineMappingPu}
        middlePoint={{
          x: getCenterOfNodes(pu(), mappingResponseLeft()).x,
          y: getCenterOfNodes(pu(), mappingResponseLeft()).y - 30,
        }}
        endArrow
      ></Connector>

      <Connector
        startRef={pu}
        startAnchor={LineAnchor.BottomRight}
        endRef={readRequestLeft}
        endAnchor={LineAnchor.Left}
        stroke={"black"}
        lineRef={linePuRead}
        middlePoint={{
          x: getCenterOfNodes(pu(), readRequestLeft()).x,
          y: getCenterOfNodes(pu(), readRequestLeft()).y + 30,
        }}
        endArrow
      ></Connector>
      <Connector
        startRef={readRequestRight}
        startAnchor={LineAnchor.Right}
        endRef={reader}
        endAnchor={LineAnchor.BottomLeft}
        stroke={"black"}
        lineRef={lineReadReader}
        middlePoint={{
          x: getCenterOfNodes(reader(), readRequestRight()).x,
          y: getCenterOfNodes(reader(), readRequestRight()).y + 30,
        }}
        endArrow
      ></Connector>
      <Connector
        startRef={reader}
        startAnchor={LineAnchor.Top}
        endRef={db}
        endAnchor={LineAnchor.Top}
        stroke={"black"}
        lineRef={lineReaderDb2}
        middlePoint={{
          x: getCenterOfNodes(reader(), db()).x,
          y: getCenterOfNodes(reader(), db()).y - 90,
        }}
        endArrow
      ></Connector>
      <Connector
        startRef={db}
        startAnchor={LineAnchor.Bottom}
        endRef={reader}
        endAnchor={LineAnchor.Bottom}
        stroke={"black"}
        lineRef={lineDbReader2}
        middlePoint={{
          x: getCenterOfNodes(reader(), db()).x,
          y: getCenterOfNodes(reader(), db()).y + 90,
        }}
        endArrow
      ></Connector>
      <Connector
        startRef={reader}
        startAnchor={LineAnchor.Bottom}
        endRef={readResponseRight}
        endAnchor={LineAnchor.Right}
        stroke={"black"}
        lineRef={lineReaderRead}
        middlePoint={{
          x: getCenterOfNodes(reader(), readResponseRight()).x,
          y: getCenterOfNodes(reader(), readResponseRight()).y + 60,
        }}
        endArrow
      ></Connector>
      <Connector
        startRef={readResponseLeft}
        startAnchor={LineAnchor.Left}
        endRef={pu}
        endAnchor={LineAnchor.Bottom}
        stroke={"black"}
        lineRef={lineReadPu}
        middlePoint={{
          x: getCenterOfNodes(pu(), readResponseLeft()).x,
          y: getCenterOfNodes(pu(), readResponseLeft()).y + 60,
        }}
        endArrow
      ></Connector>

      <Connector
        startRef={pu}
        startAnchor={LineAnchor.TopLeft}
        endRef={hz}
        endAnchor={LineAnchor.TopRight}
        stroke={"black"}
        lineRef={linePuHz}
        middlePoint={{
          x: getCenterOfNodes(pu(), hz()).x,
          y: getCenterOfNodes(pu(), hz()).y - 60,
        }}
        endArrow
      ></Connector>
      <Connector
        startRef={pu}
        startAnchor={LineAnchor.BottomLeft}
        endRef={hz}
        endAnchor={LineAnchor.BottomRight}
        stroke={"black"}
        lineRef={linePuHz2}
        middlePoint={{
          x: getCenterOfNodes(pu(), hz()).x,
          y: getCenterOfNodes(pu(), hz()).y + 60,
        }}
        endArrow
      ></Connector>
    </>
  );

  const time = 0.5;
  const hideAllLines = function* () {
    yield* all(
      linePuMapping().opacity(0, time),
      lineMappingReader().opacity(0, time),
      lineReaderDb().opacity(0, time),
      lineDbReader().opacity(0, time),
      lineReaderMapping().opacity(0, time),
      lineMappingPu().opacity(0, time),
      linePuHz().opacity(0, time),

      linePuRead().opacity(0, time),
      lineReadReader().opacity(0, time),
      lineReaderDb2().opacity(0, time),
      lineDbReader2().opacity(0, time),
      lineReaderRead().opacity(0, time),
      lineReadPu().opacity(0, time),
      linePuHz2().opacity(0, time)
    );

    yield* all(
      linePuMapping().end(0, 0),
      lineMappingReader().end(0, 0),
      lineReaderDb().end(0, 0),
      lineDbReader().end(0, 0),
      lineReaderMapping().end(0, 0),
      lineMappingPu().end(0, 0),
      linePuHz().end(0, 0),

      linePuRead().end(0, 0),
      lineReadReader().end(0, 0),
      lineReaderDb2().end(0, 0),
      lineDbReader2().end(0, 0),
      lineReaderRead().end(0, 0),
      lineReadPu().end(0, 0),
      linePuHz2().end(0, 0)
    );

    yield* all(
      linePuMapping().opacity(1, 0),
      lineMappingReader().opacity(1, 0),
      lineReaderDb().opacity(1, 0),
      lineDbReader().opacity(1, 0),
      lineReaderMapping().opacity(1, 0),
      lineMappingPu().opacity(1, 0),
      linePuHz().opacity(1, 0),

      linePuRead().opacity(1, 0),
      lineReadReader().opacity(1, 0),
      lineReaderDb2().opacity(1, 0),
      lineDbReader2().opacity(1, 0),
      lineReaderRead().opacity(1, 0),
      lineReadPu().opacity(1, 0),
      linePuHz2().opacity(1, 0)
    );
  };

  const hideReadPuLines = function* () {
    yield* all(
      lineReadPu().opacity(0, time),
      linePuHz2().opacity(0, time),
      lineReaderRead().opacity(0, time)
    );
    yield* all(
      lineReadPu().end(0, 0),
      linePuHz2().end(0, 0),
      lineReaderRead().end(0, 0)
    );
    yield* all(
      lineReadPu().opacity(1, 0),
      linePuHz2().opacity(1, 0),
      lineReaderRead().opacity(1, 0)
    );
  };

  const showReadPuLines = function* () {
    yield* lineReaderRead().end(1, time);
    yield* lineReadPu().end(1, time);
    yield* linePuHz2().end(1, time);
  };

  const showRequest = function* () {
    yield* linePuMapping().end(1, time);
    yield* lineMappingReader().end(1, time);
    yield* lineReaderDb().end(1, time);
    yield* lineDbReader().end(1, time);
    yield* lineReaderMapping().end(1, time);
    yield* lineMappingPu().end(1, time);
    yield* linePuHz().end(1, time);

    yield* linePuRead().end(1, time);
    yield* lineReadReader().end(1, time);
    yield* lineReaderDb2().end(1, time);
    yield* lineDbReader2().end(1, time);

    yield* showReadPuLines();
    yield* hideReadPuLines();

    yield* showReadPuLines();
    yield* hideReadPuLines();

    yield* showReadPuLines();
  };

  yield* hideAllLines();
  yield* showRequest();
  yield* hideAllLines();
});
