<template>
  <div class="flow-container">
    <VueFlow
      v-model:edges="edges"
      v-model:nodes="nodes"
      class="flow"
      :default-viewport="{ x: 100, y: 200, zoom: 1 }"
    >
      <template #node-default="nodeProps">
        <div class="custom-node">
          {{ nodeProps.data.label }}

          <Handle
            type="source"
            :id="`source-right-${nodeProps.id}`"
            :position="Position.Right"
            :connectable="true"
          />
          <Handle
            type="source"
            :id="`source-bottom-${nodeProps.id}`"
            :position="Position.Bottom"
            :connectable="true"
          />
          <Handle
            type="source"
            :id="`source-left-${nodeProps.id}`"
            :position="Position.Left"
            :connectable="true"
          />
          <Handle
            type="source"
            :id="`source-top-${nodeProps.id}`"
            :position="Position.Top"
            :connectable="true"
          />
        </div>
      </template>
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { VueFlow, useVueFlow, Handle } from '@vue-flow/core';
import { MarkerType } from '@vue-flow/core';
import { useProjectStore } from 'src/stores/project-store';
import { useRoute } from 'vue-router';

enum Position {
  Left = 'left',
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
}

const projectStore = useProjectStore();

const isDragging = ref(false);
const route = useRoute();

const { addEdges, onConnect, onEdgeClick, removeEdges } = useVueFlow();

const nodes = ref([]);
const edges = ref([]);

onMounted(async () => {
  const data = await projectStore.getProjectStatuses(
    route.params.workspace as string,
    route.params.project as string,
  );
  let statuses = Object.values(data).flat();

  statuses.forEach((s) => {
    nodes.value.push({
      id: s.id,
      type: 'default',
      position: {
        x: Math.floor(Math.random() * 700),
        y: Math.floor(Math.random() * 700),
      },
      style: {
        backgroundColor: s.color,
      },
      data: {
        label: s.name,
      },
    });
  });
});

onConnect((connection) => {
  if (draggingEdge.value) {
    if (
      connection.source === draggingEdge.value.sourceNodeId &&
      connection.sourceHandle === draggingEdge.value.sourceHandleId
    ) {
      const newEdge = {
        id: `e-${connection.source}-${connection.target}-${Date.now()}`,
        source: connection.source,
        target: connection.target,
        type: 'smoothstep',
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        data: {
          label: `Связь ${connection.source}-${connection.target}`,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#ff0072',
        },
      };

      addEdges(newEdge);
      setTimeout(() => {
        isDragging.value = false;
      }, 100);
    }
  } else if (isDragging.value === false) {
    addEdges({
      ...connection,
      id: `e-${connection.source}-${connection.target}-${Date.now()}`,
      type: 'smoothstep',
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#4a90e2',
        width: 15,
        height: 15,
      },
    });
  }
  draggingEdge.value = null;
});

const draggingEdge = ref();

onEdgeClick(({ edge }) => {
  console.log('Клик по ребру:', edge);

  draggingEdge.value = {
    id: edge.id,
    sourceNodeId: edge.source,
    sourceHandleId: edge.sourceHandle,
    sourcePosition: { x: 0, y: 0 },
  };

  removeEdges(edge.id);

  startConnectionFromHandle(edge.source, edge.sourceHandle);
});

const startConnectionFromHandle = (
  nodeId: string,
  handleId: string | null | undefined,
) => {
  const handleElement = document.querySelector(
    `[data-handleid="${handleId}"][data-nodeid="${nodeId}"]`,
  ) as HTMLElement;

  if (handleElement) {
    const rect = handleElement.getBoundingClientRect();
    const flowRect = document
      .querySelector('.flow-container')
      ?.getBoundingClientRect();

    if (flowRect) {
      const mouseEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
      });

      handleElement.dispatchEvent(mouseEvent);
    }
  }

  isDragging.value = true;
};
</script>

<style>
.flow-container {
  width: 100%;
  height: 100vh;
  position: relative;
}
</style>
