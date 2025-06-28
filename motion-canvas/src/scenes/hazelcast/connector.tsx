import { Circle, Line, PossibleCanvasStyle, Spline } from "@motion-canvas/2d";
import { createRef, PossibleVector2, Reference } from "@motion-canvas/core";
import { Node, NodeProps } from "@motion-canvas/2d";

export enum LineAnchor {
  Center = "center",
  Top = "top",
  Right = "right",
  Bottom = "bottom",
  Left = "left",
  TopLeft = "topLeft",
  BottomLeft = "bottomLeft",
  BottomRight = "bottomRight",
  TopRight = "topRight",
}

export interface ConnectorOptions extends NodeProps {
  lineRef?: Reference<Line>;
  startRef: Reference<Circle>;
  startAnchor?: LineAnchor;
  endRef: Reference<Circle>;
  endAnchor?: LineAnchor;
  stroke: PossibleCanvasStyle;
  endArrow?: boolean;
  middlePoint?: PossibleVector2;
  dashed?: Boolean;
  start?: number;
}

export class Connector extends Node {
  constructor({
    lineRef = null,
    startRef,
    startAnchor = LineAnchor.Top,
    endRef,
    endAnchor = LineAnchor.Top,
    stroke,
    endArrow = false,
    middlePoint = null,
    dashed = false,
    start = 0,
    ...rest
  }: ConnectorOptions) {
    super(rest);

    if (lineRef == null) {
      lineRef = createRef<Line>();
    }

    this.add(
      <Spline
        ref={lineRef}
        start={start}
        end={1}
        stroke={stroke}
        lineWidth={4}
        endArrow={endArrow}
        arrowSize={20}
        points={[
          [0, 0],
          [0, 0],
        ]}
      />
    );

    lineRef().absolutePosition(0);

    if (dashed) {
      lineRef().lineDash([10, 10]);
    }

    function getAnchorOffset(
      circle: Circle,
      anchor: LineAnchor
    ): [number, number] {
      const r = circle.width() / 2;
      switch (anchor) {
        case LineAnchor.Top:
          return [0, -r];
        case LineAnchor.Bottom:
          return [0, r];
        case LineAnchor.Right:
          return [r, 0];
        case LineAnchor.Left:
          return [-r, 0];
        case LineAnchor.TopLeft:
          return [-r * Math.cos(Math.PI / 4), -r * Math.sin(Math.PI / 4)];
        case LineAnchor.TopRight:
          return [r * Math.cos(Math.PI / 4), -r * Math.sin(Math.PI / 4)];
        case LineAnchor.BottomLeft:
          return [-r * Math.cos(Math.PI / 4), r * Math.sin(Math.PI / 4)];
        case LineAnchor.BottomRight:
          return [r * Math.cos(Math.PI / 4), r * Math.sin(Math.PI / 4)];
        default:
          return [0, 0];
      }
    }

    const startCircle = startRef();
    const endCircle = endRef();

    const [startOffsetX, startOffsetY] = getAnchorOffset(
      startCircle,
      startAnchor
    );
    const [endOffsetX, endOffsetY] = getAnchorOffset(endCircle, endAnchor);

    const startPoint = startCircle
      .absolutePosition()
      .add([startOffsetX, startOffsetY]);
    const endPoint = endCircle.absolutePosition().add([endOffsetX, endOffsetY]);

    if (middlePoint != null) {
      lineRef().points([startPoint, middlePoint, endPoint]);
    } else {
      lineRef().points([startPoint, endPoint]);
    }
  }
}
