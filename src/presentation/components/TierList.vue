<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useTierListStore } from '../stores/tierListStore';
import type { Item, Tier } from '../stores/tierListStore';

const tierListStore = useTierListStore();

const draggedItem = ref<Item | null>(null);
const draggedFromTier = ref<Tier | null>(null);
const dragOverIndex = ref<number>(-1);
const dragOverTier = ref<Tier | null>(null);
const isDragging = ref(false);

const onDragStart = (item: Item, tier: Tier, event: DragEvent) => {
  draggedItem.value = item;
  draggedFromTier.value = tier;
  isDragging.value = true;

  // Set a custom drag image if supported
  if (event.dataTransfer && event.target instanceof HTMLElement) {
    // Create a ghost image for better drag visuals
    const ghostEl = event.target.cloneNode(true) as HTMLElement;
    ghostEl.style.opacity = '0.7';
    document.body.appendChild(ghostEl);
    event.dataTransfer.setDragImage(ghostEl, 15, 15);

    // Clean up after drag starts
    setTimeout(() => {
      document.body.removeChild(ghostEl);
    }, 0);
  }
};

const onDragOver = (event: DragEvent, index: number, tier: Tier) => {
  event.preventDefault();
  dragOverIndex.value = index;
  dragOverTier.value = tier;
};

const onDragLeave = () => {
  dragOverIndex.value = -1;
};

const onDrop = (targetTier: Tier, targetIndex: number = -1) => {
  if (draggedItem.value && draggedFromTier.value) {
    const fromIndex = draggedFromTier.value.items.findIndex(
      (item: Item) => item.name === draggedItem.value!.name
    );

    if (fromIndex !== -1) {
      draggedFromTier.value.items.splice(fromIndex, 1);
    }

    if (targetIndex >= 0) {
      if (targetTier === draggedFromTier.value && targetIndex > fromIndex) {
        targetIndex--;
      }
      targetTier.items.splice(targetIndex, 0, draggedItem.value);
    } else {
      targetTier.items.push(draggedItem.value);
    }

    draggedItem.value = null;
    draggedFromTier.value = null;
    dragOverIndex.value = -1;
    dragOverTier.value = null;
    isDragging.value = false;
  }
};

const onDragEnd = () => {
  // Reset drag states
  draggedItem.value = null;
  draggedFromTier.value = null;
  dragOverIndex.value = -1;
  dragOverTier.value = null;
  isDragging.value = false;
};

onMounted(() => {
  tierListStore.connectWebSocket();
});

onUnmounted(() => {
  tierListStore.disconnectWebSocket();
});
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-4 bg-blue-500">Tier List</h1>
    <div class="grid gap-4">
      <div
        v-for="tier in tierListStore.tiers"
        :key="tier.name"
        :style="{ backgroundColor: tier.color }"
        :class="[
          'p-4 rounded-md shadow-md tier-container',
          { 'tier-dropzone': isDragging, 'tier-active-dropzone': isDragging && dragOverTier === tier && dragOverIndex === -1 }
        ]"
        @dragover.prevent
        @drop.prevent="onDrop(tier)"
        @dragenter.prevent="dragOverTier = tier">
        <div class="font-bold text-white text-lg mb-2">{{ tier.name }}</div>
        <div
          :class="[
            'flex flex-wrap gap-2 border-2 border-dashed p-2 rounded-md',
            { 'bg-white': !isDragging || dragOverTier !== tier, 'bg-gray-100': isDragging && dragOverTier === tier }
          ]"
          :style="{ transition: 'background-color 0.2s ease' }">
          <div
            v-for="(item, index) in tier.items"
            :key="`${item.name}-${index}`"
            :class="[
              'w-12 h-12 rounded-md flex items-center justify-center text-white font-bold relative transition-transform',
              {
                'item-card': true,
                'dragging': draggedItem?.name === item.name,
                'drag-over-before': dragOverIndex === index && dragOverTier === tier,
                'item-hover': !isDragging
              }
            ]"
            :style="`background-color: ${item.color}; transform: ${draggedItem?.name === item.name ? 'scale(0.9)' : 'scale(1)'};`"
            draggable="true"
            @dragstart="(e) => onDragStart(item, tier, e)"
            @dragover.prevent="onDragOver($event, index, tier)"
            @dragleave="onDragLeave"
            @drop.prevent.stop="onDrop(tier, index)"
            @dragend="onDragEnd">
            <div class="item-content">{{ item.name.charAt(0) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-card {
  cursor: grab;
  user-select: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  position: relative;
}

.item-card:active {
  cursor: grabbing;
  transform: scale(1.05);
}

.item-card.dragging {
  opacity: 0.6;
}

.item-card.item-hover:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.item-card.drag-over-before::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 0;
  height: 100%;
  width: 4px;
  background-color: #3b82f6; /* Blue highlight */
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}

.tier-container {
  transition: box-shadow 0.3s ease, border 0.3s ease;
}

.tier-dropzone {
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
}

.tier-active-dropzone {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
  animation: glow 2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

@keyframes glow {
  0% { box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3); }
  50% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5); }
  100% { box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3); }
}

/* Add cursor styles for different states */
.tier-active-dropzone {
  cursor: copy;
}

.item-card:active {
  cursor: grabbing;
}

.item-content {
  pointer-events: none; /* Ensures the content doesn't interfere with drag events */
}
</style>

