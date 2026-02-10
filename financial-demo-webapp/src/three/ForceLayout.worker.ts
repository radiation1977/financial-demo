/** Web Worker for d3-force-3d layout computation.
 *
 *  Receives node positions and edges, runs force simulation,
 *  and posts back updated positions.
 */

import {
  forceSimulation,
  forceManyBody,
  forceCenter,
  forceLink,
} from 'd3-force-3d';

interface NodeDatum {
  id: string;
  x: number;
  y: number;
  z: number;
  fx?: number;
  fy?: number;
  fz?: number;
}

interface LinkDatum {
  source: string;
  target: string;
}

interface WorkerMessage {
  type: 'init' | 'tick' | 'update';
  nodes?: NodeDatum[];
  links?: LinkDatum[];
}

let simulation: any = null;
let nodes: NodeDatum[] = [];

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const msg = event.data;

  switch (msg.type) {
    case 'init': {
      nodes = msg.nodes ?? [];
      const links = msg.links ?? [];

      simulation = forceSimulation(nodes, 3)
        .force('charge', forceManyBody().strength(-30))
        .force('center', forceCenter())
        .force(
          'link',
          forceLink(links)
            .id((d: any) => d.id)
            .distance(2),
        )
        .alphaDecay(0.02)
        .on('tick', () => {
          self.postMessage({
            type: 'positions',
            positions: nodes.map((n) => ({
              id: n.id,
              x: n.x,
              y: n.y,
              z: n.z,
            })),
          });
        });
      break;
    }

    case 'tick': {
      if (simulation) {
        simulation.alpha(0.3).restart();
      }
      break;
    }

    case 'update': {
      // Update node list for new/removed nodes.
      if (msg.nodes && simulation) {
        nodes = msg.nodes;
        simulation.nodes(nodes);
        simulation.alpha(0.5).restart();
      }
      break;
    }
  }
};
