import {makeProject} from '@motion-canvas/core';

// 
import {Code, LezerHighlighter} from '@motion-canvas/2d';
import {parser} from '@lezer/javascript';

// Scenes
import hazelcast from './scenes/hazelcast/hazelcast?scene';
import messaging from './scenes/messaging/messaging?scene';
import mqtt from './scenes/mqtt/mqtt?scene';
import writer from './scenes/writer/writer?scene';
import reader from './scenes/reader/reader?scene';
import docker from './scenes/docker/docker?scene';
import deployment from './scenes/deployment/deployment?scene';

Code.defaultHighlighter = new LezerHighlighter(parser);

export default makeProject({
  scenes: [hazelcast, messaging, mqtt, writer, reader, docker, deployment],
});