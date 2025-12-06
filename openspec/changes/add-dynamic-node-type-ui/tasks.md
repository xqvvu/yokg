# Implementation Tasks

## 1. Shared Utilities
- [x] 1.1 Create `apps/web/src/lib/graph-utils.ts` with type discovery utilities
- [x] 1.2 Implement `extractNodeTypes(nodes)` - returns unique node types from graph data
- [x] 1.3 Implement `extractRelationshipTypes(edges)` - returns unique relationship types
- [x] 1.4 Implement `getNodeStyleConfig(type)` - returns icon/color config with fallback for unknown types
- [x] 1.5 Add color palette generator for unknown types (consistent hash-based colors)

## 2. Graph Legend Component
- [x] 2.1 Update `graph-legend.tsx` to call `extractNodeTypes()` instead of using hardcoded array
- [x] 2.2 Replace `typeConfigs` array with dynamic config generation using `getNodeStyleConfig()`
- [x] 2.3 Ensure legend shows all types present in current graph data
- [x] 2.4 Add visual indicator for "known" vs "custom" types (optional)

## 3. Graph Toolbar Component
- [x] 3.1 Update `graph-toolbar.tsx` filter dropdown to generate options from `extractNodeTypes()`
- [x] 3.2 Remove hardcoded SelectItem elements for Person/Document/Concept/Topic
- [x] 3.3 Dynamically render SelectItem for each discovered type
- [x] 3.4 Preserve "All Types" option at the top

## 4. Command Palette Component
- [x] 4.1 Update `command-palette.tsx` to dynamically generate "Browse by Type" items
- [x] 4.2 Replace hardcoded CommandItem elements with map over discovered types
- [x] 4.3 Update `getNodeIcon()` to use `getNodeStyleConfig()` with fallback handling
- [x] 4.4 Ensure search functionality works with dynamic types

## 5. Testing & Validation
- [x] 5.1 Test with existing four types (Person, Document, Concept, Topic)
- [x] 5.2 Test with custom types (e.g., Project, Location, Event)
- [x] 5.3 Test with mixed known and unknown types
- [x] 5.4 Verify empty graph state still renders correctly
- [x] 5.5 Verify filter and command palette remain responsive with many types (>10)

## 6. Documentation
- [x] 6.1 Update component comments to reflect dynamic behavior
- [x] 6.2 Document fallback icon/color strategy in graph-utils.ts
