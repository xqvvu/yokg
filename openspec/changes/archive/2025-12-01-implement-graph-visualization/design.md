# Design: Graph Visualization Architecture

## Context

This is the first user-facing feature of the knowledge graph system. The user is new to knowledge graph concepts, so this implementation serves dual purposes:
1. **Educational**: Help understand what knowledge graphs are through visual interaction
2. **Foundation**: Establish patterns for future graph-related features

Knowledge graphs consist of:
- **Nodes (节点)**: Circles representing entities (people, concepts, documents, topics)
- **Edges (边/关系)**: Lines connecting nodes, showing relationships (e.g., "wrote", "references", "related to")
- **Properties (属性)**: Metadata on nodes/edges (names, timestamps, weights)

Example:
```
[Person: Alice] --wrote--> [Document: React Tutorial]
                               |
                          related-to
                               ↓
                    [Concept: Frontend Development]
```

### Stakeholders
- End users who want to explore knowledge connections visually
- Developers who will extend this with real backend data later

## Goals / Non-Goals

### Goals
- ✅ Render interactive force-directed graph layouts
- ✅ Support basic interactions: zoom, pan, drag nodes, hover tooltips
- ✅ Use mock data for immediate development and testing
- ✅ Create reusable, composable React components
- ✅ Maintain performance with ~100-500 nodes (typical initial graphs)

### Non-Goals
- ❌ Backend API integration (deferred to future changes)
- ❌ Real-time collaboration or multiplayer editing
- ❌ Graph editing/creation UI (only viewing for now)
- ❌ Advanced graph algorithms (clustering, pathfinding) - just visualization
- ❌ Canvas fallback for very large graphs (>1000 nodes) - use SVG for simplicity

## Decisions

### Decision 1: D3.js for Graph Layout

**Choice**: Use D3.js `d3-force` module for force-directed layout simulation.

**Why**:
- **Industry standard** for graph visualization in web apps
- **Force simulation** automatically positions nodes to minimize edge overlap (looks natural)
- **Well-documented** with extensive community examples
- **Modular** - we only need `d3-force`, `d3-selection`, `d3-zoom` (small bundle size)
- **Framework-agnostic** - works seamlessly with React

**Alternatives considered**:
- **react-force-graph**: Pre-built React component
  - ❌ Less customizable for our specific UI needs
  - ❌ Heavier bundle, includes features we don't need
- **Cytoscape.js**: Another graph viz library
  - ❌ More complex API for our simple use case
  - ❌ Less common in React ecosystem
- **Canvas-based libraries**: Better for huge graphs
  - ❌ SVG is sufficient for our scale and easier to style with CSS

### Decision 2: React + D3 Integration Pattern

**Choice**: Use the "React owns DOM, D3 calculates layout" pattern.

**Pattern**:
```tsx
// React renders SVG elements
<svg>
  {nodes.map(node => (
    <circle cx={node.x} cy={node.y} r={10} />
  ))}
</svg>

// D3 only updates positions in state
useEffect(() => {
  const simulation = d3.forceSimulation(nodes)
    .on('tick', () => setNodes([...nodes])); // React re-renders
}, []);
```

**Why**:
- React's declarative rendering is easier to reason about
- Avoids D3 directly manipulating DOM (anti-pattern in React)
- Enables using React features (hooks, context, etc.) naturally

**Alternatives considered**:
- **D3 owns DOM**: D3 directly updates `<circle>` positions
  - ❌ Breaks React's mental model
  - ❌ Hard to integrate with other React features
- **Ref-based approach**: D3 updates via refs
  - ❌ More imperative, harder to test

### Decision 3: Component Structure

**Choice**: Split into focused, composable components.

**Structure**:
```
components/graph/
├── graph-canvas.tsx          # Main SVG container + D3 simulation
├── graph-node.tsx            # Individual node rendering
├── graph-edge.tsx            # Individual edge rendering
├── graph-controls.tsx        # Zoom/pan controls UI
├── node-detail-panel.tsx     # Side panel showing node info
├── use-force-simulation.ts   # D3 simulation hook
└── use-graph-zoom.ts         # D3 zoom behavior hook
```

**Why**:
- **Single Responsibility**: Each component has one job
- **Testable**: Can test simulation logic separately from rendering
- **Reusable**: Hooks can be used in other graph views later
- **Maintainable**: Easy to modify node rendering without touching simulation

### Decision 4: Mock Data Strategy

**Choice**: Create typed mock data in `lib/mocks/graph-data.ts` matching future API shape.

**Mock data structure**:
```typescript
interface GraphNode {
  id: string;
  type: 'person' | 'document' | 'concept' | 'topic';
  label: string;
  properties: Record<string, unknown>;
}

interface GraphEdge {
  id: string;
  source: string; // node id
  target: string; // node id
  type: 'wrote' | 'references' | 'related_to' | 'belongs_to';
  properties: Record<string, unknown>;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
```

**Why**:
- **Type-safe**: Catch errors early with TypeScript
- **API-ready**: When backend is built, just swap mock with API call
- **Realistic**: Use real-world scenarios (academic papers, authors, topics)
- **Educational**: Comments explain what each node/edge represents

**Example scenario**:
```
Nodes: [Alice (person)], [React Tutorial (document)], [Frontend (concept)]
Edges: [Alice -wrote-> React Tutorial], [React Tutorial -about-> Frontend]
```

### Decision 5: Styling Approach

**Choice**: Use Tailwind CSS for controls, inline SVG attributes for graph elements.

**Why**:
- **SVG performance**: Inline attributes are faster than classes for animated elements
- **Type differentiation**: Color-code node types (person=blue, document=green, concept=purple)
- **Consistency**: Tailwind for UI controls matches rest of the app

**Color palette**:
```typescript
const nodeColors = {
  person: '#3b82f6',    // blue-500
  document: '#10b981',  // green-500
  concept: '#8b5cf6',   // violet-500
  topic: '#f59e0b',     // amber-500
};
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│  Route: /graph                                       │
│  ┌───────────────────────────────────────────────┐  │
│  │  GraphCanvas (main component)                  │  │
│  │  ├─ useForceSimulation(mockData)              │  │
│  │  │   └─ D3 calculates node positions          │  │
│  │  ├─ useGraphZoom()                             │  │
│  │  │   └─ D3 handles zoom/pan                    │  │
│  │  └─ SVG rendering                               │  │
│  │      ├─ GraphEdge (for each edge)              │  │
│  │      └─ GraphNode (for each node)              │  │
│  ├───────────────────────────────────────────────┤  │
│  │  GraphControls (zoom buttons)                  │  │
│  ├───────────────────────────────────────────────┤  │
│  │  NodeDetailPanel (selected node info)          │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Performance Considerations

### D3 Force Simulation
- **Alpha decay**: Simulation gradually slows down (less CPU over time)
- **Throttle updates**: Only re-render every 16ms (60fps cap)
- **Stop on idle**: Pause simulation when alpha < 0.01

### React Rendering
- **Memoization**: Use `React.memo` for `GraphNode` and `GraphEdge`
- **Key stability**: Use node/edge IDs as keys (not array indices)
- **Avoid inline objects**: Define event handlers outside render

### Expected Performance
- **100 nodes**: Smooth 60fps
- **500 nodes**: 30-60fps (acceptable)
- **1000+ nodes**: Degrade gracefully, add warning/pagination later

## Risks / Trade-offs

### Risk: D3 Learning Curve
- **Mitigation**: Extensive code comments, link to D3 docs, simple initial implementation
- **Fallback**: If too complex, can use pre-built library in future refactor

### Risk: Mock Data Gets Stale
- **Mitigation**: Define data types in `@yokg/shared` so mock matches future API
- **Mitigation**: Add validation with Zod schemas

### Trade-off: SVG vs Canvas
- **SVG**: Easier to style, better for small/medium graphs, accessibility-friendly
- **Canvas**: Better performance for >1000 nodes
- **Decision**: Start with SVG, add Canvas renderer if needed (future change)

### Trade-off: Flexibility vs Simplicity
- **Current**: Opinionated defaults (force layout, specific colors)
- **Future**: Make configurable (layout algorithms, theming) when needed

## Migration Plan

N/A - This is a new feature with no existing functionality to migrate.

## Open Questions

1. **Node size**: Should it be fixed or scale based on properties (e.g., importance)?
   - **Proposal**: Fixed size initially, add dynamic sizing in future change

2. **Edge labels**: Display relationship types directly on edges?
   - **Proposal**: Omit initially (clutters view), show in tooltip on hover

3. **Layout persistence**: Save node positions when user manually drags?
   - **Proposal**: No persistence initially (simulation always resets), add later

4. **Mobile support**: Touch gestures for zoom/pan?
   - **Proposal**: Basic zoom works via pinch, but optimize later (not priority)

## Learning Resources for Implementation

Since the user is new to knowledge graphs, here are helpful references:

- **Knowledge Graphs 101**: [Wikipedia - Knowledge Graph](https://en.wikipedia.org/wiki/Knowledge_graph)
- **D3 Force Layout**: [D3 Force Documentation](https://d3js.org/d3-force)
- **React + D3 Pattern**: [Amelia Wattenberger's Guide](https://2019.wattenberger.com/blog/react-and-d3)
- **Graph Visualization Examples**: [Observable D3 Gallery](https://observablehq.com/@d3/gallery#graphs)
