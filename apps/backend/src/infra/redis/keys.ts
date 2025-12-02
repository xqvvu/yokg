export class RedisKeyFactory {
  private readonly namespace = "business";

  users = {
    byId: (id: string) => `${this.namespace}:users:id:${id}`,
  };

  graph = {
    node: (id: string) => `${this.namespace}:graph:node:${id}`,
    subgraph: (id: string, depth: number) =>
      `${this.namespace}:graph:subgraph:${id}:${depth}`,
    neighbors: (id: string) => `${this.namespace}:graph:neighbors:${id}`,
  };
}
