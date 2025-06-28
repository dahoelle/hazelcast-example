import { makeScene2D, Rect, Txt } from "@motion-canvas/2d";
import { createRef, waitFor } from "@motion-canvas/core";

import { DockerContainer } from "./dockerContainer";

export default makeScene2D(function* (view) {
  const debug = createRef<Rect>();
  const pu1 = createRef<Rect>();
  const pu2 = createRef<Rect>();
  const middleware = createRef<Rect>();
  const data = createRef<Rect>();

  const debugText = createRef<Txt>();
  const pu1Text = createRef<Txt>();
  const pu2Text = createRef<Txt>();
  const middlewareText = createRef<Txt>();
  const dataText = createRef<Txt>();

  view.add(
    <>
      <Rect layout direction={"column"} justifyContent={"center"} gap={10}>
        <Rect
          layout
          direction={"row"}
          gap={10}
          justifyContent={"center"}
          alignItems={"center"}
          stroke={"black"}
          lineWidth={2}
          padding={15}
          ref={middleware}
        >
          <Txt
            text={"Webseite"}
            fontSize={32}
            width={235}
            ref={middlewareText}
          ></Txt>
          <Rect
            layout
            direction={"row"}
            gap={10}
            grow={1}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <DockerContainer text={"nginx"}></DockerContainer>
          </Rect>
        </Rect>

        <Rect
          layout
          direction={"row"}
          gap={10}
          justifyContent={"center"}
          alignItems={"center"}
          stroke={"black"}
          lineWidth={2}
          padding={15}
          ref={debug}
        >
          <Txt text={"Debug"} fontSize={32} width={275} ref={debugText}></Txt>
          <Rect layout direction={"row"} gap={10} grow={1}>
            <DockerContainer text={"elasticsearch"}></DockerContainer>
            <DockerContainer text={"grafana"}></DockerContainer>
            <DockerContainer
              text={"hazelcast/management-center"}
            ></DockerContainer>
          </Rect>
        </Rect>

        <Rect
          layout
          direction={"row"}
          gap={10}
          justifyContent={"center"}
          alignItems={"center"}
          stroke={"black"}
          lineWidth={2}
          padding={15}
          ref={pu1}
        >
          <Txt
            text={"PU Instanz 1"}
            fontSize={32}
            width={275}
            ref={pu1Text}
          ></Txt>
          <Rect
            layout
            direction={"row"}
            gap={10}
            grow={1}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <DockerContainer text={"processing-unit-1"}></DockerContainer>
            <DockerContainer text={"hazelcast-cluster-1"}></DockerContainer>
          </Rect>
        </Rect>

        <Rect
          layout
          direction={"row"}
          gap={10}
          justifyContent={"center"}
          alignItems={"center"}
          stroke={"black"}
          lineWidth={2}
          padding={15}
          ref={pu2}
        >
          <Txt
            text={"PU Instanz 2"}
            fontSize={32}
            width={275}
            ref={pu2Text}
          ></Txt>
          <Rect
            layout
            direction={"row"}
            gap={10}
            grow={1}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <DockerContainer text={"processing-unit-2"}></DockerContainer>
            <DockerContainer text={"hazelcast-cluster-2"}></DockerContainer>
          </Rect>
        </Rect>

        <Rect
          layout
          direction={"row"}
          gap={10}
          justifyContent={"center"}
          alignItems={"center"}
          stroke={"black"}
          lineWidth={2}
          padding={15}
          ref={middleware}
        >
          <Txt
            text={"Virtaulisierte Middleware"}
            fontSize={32}
            width={275}
            ref={middlewareText}
          ></Txt>
          <Rect
            layout
            direction={"row"}
            gap={10}
            grow={1}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <DockerContainer text={"middleware"}></DockerContainer>
          </Rect>
        </Rect>

        <Rect
          layout
          direction={"row"}
          gap={10}
          justifyContent={"center"}
          alignItems={"center"}
          stroke={"black"}
          lineWidth={2}
          padding={15}
          ref={data}
        >
          <Txt
            text={"Daten-Persistenz"}
            fontSize={32}
            width={275}
            ref={dataText}
          ></Txt>
          <Rect
            layout
            direction={"row"}
            gap={10}
            grow={1}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <DockerContainer text={"mariadb"}></DockerContainer>
            <DockerContainer text={"data-rw"}></DockerContainer>
            <DockerContainer text={"rabbitmq"}></DockerContainer>
          </Rect>
        </Rect>
      </Rect>
    </>
  );

  yield* waitFor(1);
});
