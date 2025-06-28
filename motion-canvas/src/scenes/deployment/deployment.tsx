import { Circle, Line, makeScene2D, Rect, Txt } from "@motion-canvas/2d";
import { all, createRef, spawn, waitFor } from "@motion-canvas/core";

import { Container } from "../hazelcast/container";
import { Connector, LineAnchor } from "../hazelcast/connector";
import { Queue } from "../mqtt/queue";
import { Gate } from "./gate";

export default makeScene2D(function* (view) {
  const textGate1Y = createRef<Txt>();
  const textGate1N = createRef<Txt>();
  const textGate2Y = createRef<Txt>();
  const textGate2N = createRef<Txt>();

  const start = createRef<Circle>();
  const pu1 = createRef<Circle>();
  const pu2 = createRef<Circle>();
  const pu3 = createRef<Circle>();
  const pu3Text = createRef<Txt>();
  const puParent = createRef<Rect>();

  const collectionLeft = createRef<Circle>();
  const collectionUp = createRef<Circle>();
  const collectionBottom = createRef<Circle>();
  const analyzeRight = createRef<Circle>();
  const analyzeBottom = createRef<Circle>();

  const gate1Left = createRef<Circle>();
  const gate1Right = createRef<Circle>();
  const gate1Bottom = createRef<Circle>();

  const gate2Top = createRef<Circle>();
  const gate2Right = createRef<Circle>();

  const addLeft = createRef<Circle>();
  const removeLeft = createRef<Circle>();

  const lineStartCollection = createRef<Line>();
  const lineCollectionAnalyze = createRef<Line>();
  const lineAnalyzeGate1 = createRef<Line>();
  const lineGate1Add = createRef<Line>();
  const lineGate1Gate2 = createRef<Line>();
  const lineGate2Remove = createRef<Line>();

  const linePu1Collection = createRef<Line>();
  const linePu2Collection = createRef<Line>();
  const linePu3Collection = createRef<Line>();

  view.add(
    <>
      <Rect layout direction={"column"} gap={50}>
        <Rect
          layout
          direction={"column"}
          gap={75}
          lineDash={[10, 10]}
          stroke={"black"}
          lineWidth={2}
          padding={25}
        >
          <Rect layout direction={"row"} gap={100}>
            <Rect grow={1}></Rect>
            <Queue
              text={"Metriken betrachten"}
              rectWidth={350}
              bottomCircleRef={analyzeBottom}
              rightCircleRef={analyzeRight}
            ></Queue>
            <Gate
              text={"Über Grenze A"}
              rightTextRef={textGate1Y}
              bottomTextRef={textGate1N}
              rightCircleRef={gate1Right}
              leftCircleRef={gate1Left}
              bottomCircleRef={gate1Bottom}
            ></Gate>
            <Queue
              text={"PU einschalten"}
              rectWidth={275}
              leftCircleRef={addLeft}
            ></Queue>
          </Rect>

          <Rect layout direction={"row"} gap={100} alignItems={"center"}>
            <Container text={"Start"} circleRef={start}></Container>
            <Queue
              text={"Daten Sammlung"}
              rectWidth={350}
              topCircleRef={collectionUp}
              bottomCircleRef={collectionBottom}
              leftCircleRef={collectionLeft}
            ></Queue>
            <Gate
              text={"Unter Grenze B"}
              rightTextRef={textGate2Y}
              bottomTextRef={textGate2N}
              topCircleRef={gate2Top}
              rightCircleRef={gate2Right}
            ></Gate>
            <Queue
              text={"PU abschalten"}
              rectWidth={275}
              leftCircleRef={removeLeft}
            ></Queue>
          </Rect>
        </Rect>
        <Rect
          layout
          direction={"row"}
          gap={50}
          ref={puParent}
          alignItems={"center"}
        >
          <Rect width={150}></Rect>
          <Container text="PU 1" circleRef={pu1}></Container>
          <Container text="PU 2" circleRef={pu2}></Container>
          <Container text="PU 3" circleRef={pu3} textRef={pu3Text}></Container>
        </Rect>
      </Rect>

      <Connector
        startRef={collectionUp}
        endRef={analyzeBottom}
        stroke={"black"}
        lineRef={lineCollectionAnalyze}
        endArrow
      ></Connector>
      <Connector
        startRef={analyzeRight}
        endRef={gate1Left}
        stroke={"black"}
        lineRef={lineAnalyzeGate1}
        endArrow
      ></Connector>
      <Connector
        startRef={gate1Right}
        endRef={addLeft}
        stroke={"black"}
        lineRef={lineGate1Add}
        endArrow
      ></Connector>
      <Connector
        startRef={gate1Bottom}
        endRef={gate2Top}
        stroke={"black"}
        lineRef={lineGate1Gate2}
        endArrow
      ></Connector>
      <Connector
        startRef={gate2Right}
        endRef={removeLeft}
        stroke={"black"}
        lineRef={lineGate2Remove}
        endArrow
      ></Connector>

      <Connector
        startRef={pu1}
        endRef={collectionBottom}
        stroke={"black"}
        lineRef={linePu1Collection}
        endArrow
      ></Connector>
      <Connector
        startRef={pu2}
        endRef={collectionBottom}
        stroke={"black"}
        lineRef={linePu2Collection}
        endArrow
      ></Connector>
      <Connector
        startRef={pu3}
        endRef={collectionBottom}
        stroke={"black"}
        lineRef={linePu3Collection}
        endArrow
      ></Connector>

      <Connector
        startRef={start}
        startAnchor={LineAnchor.Right}
        endRef={collectionLeft}
        stroke={"black"}
        lineRef={lineStartCollection}
        endArrow
      ></Connector>
    </>
  );

  textGate1Y().text("J").opacity(0);
  textGate2Y().text("J").opacity(0);
  textGate1N().text("N").opacity(0);
  textGate2N().text("N").opacity(0);

  const time = 0.5;
  const createPu4 = function* () {
    pu3Text().opacity(0);

    yield* all(pu3().size(0).size(100, time));
    yield* pu3Text().opacity(1, 0.1);
  };

  const removePu4 = function* () {
    yield* pu3Text().opacity(0, 0.1);
    yield* all(pu3().size(0, time));
  };

  const lines = [
    lineCollectionAnalyze,
    lineAnalyzeGate1,
    lineGate1Add,
    lineGate1Gate2,
    lineGate2Remove,
    lineStartCollection,
  ];

  const puLines = [linePu1Collection, linePu2Collection, linePu3Collection];

  const hidePuLines = function* () {
    for (const line of puLines) {
      yield line().opacity(0, time);
    }

    yield* all(
      textGate1N().opacity(0, time),
      textGate1Y().opacity(0, time),
      textGate2N().opacity(0, time),
      textGate2Y().opacity(0, time)
    );

    for (const line of puLines) {
      yield line().end(0, 0);
      yield line().opacity(1, 0);
    }
  };

  const hideAllLines = function* () {
    for (const line of lines) {
      yield line().opacity(0, time);
    }

    yield* all(
      textGate1N().opacity(0, time),
      textGate1Y().opacity(0, time),
      textGate2N().opacity(0, time),
      textGate2Y().opacity(0, time)
    );

    for (const line of lines) {
      yield line().end(0, 0);
      yield line().opacity(1, 0);
    }
  };

  const startFlow1 = function* () {
    yield* lineStartCollection().end(1, time);
    yield* lineCollectionAnalyze().end(1, time);
    yield* lineAnalyzeGate1().end(1, time);
    yield* all(lineGate1Add().end(1, time), textGate1Y().opacity(1, time));
  };

  const startFlow2 = function* () {
    yield* lineStartCollection().end(1, time);
    yield* lineCollectionAnalyze().end(1, time);
    yield* lineAnalyzeGate1().end(1, time);
    yield* all(lineGate1Gate2().end(1, time), textGate1N().opacity(1, time));
    yield* textGate2N().opacity(1, time);
  };

  const startFlow3 = function* () {
    yield* lineStartCollection().end(1, time);
    yield* lineCollectionAnalyze().end(1, time);
    yield* lineAnalyzeGate1().end(1, time);
    yield* all(lineGate1Gate2().end(1, time), textGate1N().opacity(1, time));
    yield* all(lineGate2Remove().end(1, time), textGate2Y().opacity(1, time));
  };

  const pu1Request = function* () {
    yield* linePu1Collection().end(1, time);
    yield* linePu1Collection().opacity(0, time);
    yield linePu1Collection().end(0).opacity(1, 0);
  };

  const pu2Request = function* () {
    yield* linePu2Collection().end(1, time);
    yield* linePu2Collection().opacity(0, time);
    yield linePu2Collection().end(0).opacity(1, 0);
  };

  const pu3Request = function* () {
    yield* linePu3Collection().end(1, time);
    yield* linePu3Collection().opacity(0, time);
    yield linePu3Collection().end(0).opacity(1, 0);
  };

  const requestFlow1 = function* () {
    yield* pu1Request();
    yield* pu2Request();

    yield* pu1Request();
    yield* pu2Request();
    yield* pu3Request();

    yield* pu1Request();
    yield* pu2Request();
    yield* pu3Request();

    yield* pu1Request();
    yield* pu2Request();
  };

  yield hidePuLines();
  yield* hideAllLines();
  yield* removePu4();
  yield;

  // ! Animation
  spawn(requestFlow1);
  yield* waitFor(time);

  yield* startFlow1();
  yield* createPu4();
  yield* waitFor(time);
  yield* hideAllLines();

  yield* startFlow2();
  yield* waitFor(time);
  yield* hideAllLines();

  yield* startFlow3();
  yield* waitFor(time);
  yield* removePu4();
  yield* hideAllLines();
});
