import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Item {
  name: string;
  color: string;
}

export interface Tier {
  name: string;
  color: string;
  items: Item[];
}

export const useTierListStore = defineStore('tierList', () => {
  const tiers = ref<Tier[]>([]);
  const socket = ref<WebSocket | null>(null);

  const connectWebSocket = () => {
    // Fake WebSocket connectionsxdx
    setTimeout(() => {
      const data = {
        tiers: [
          {
            name: 'S Tier',
            color: '#ff0000',
            items: [
              { name: 'Item 1', color: '#ff0000' },
              { name: 'Item 2', color: '#ff0000' },
            ],
          },
          {
            name: 'A Tier',
            color: '#00ff00',
            items: [
              { name: 'Item 3', color: '#00ff00' },
              { name: 'Item 4', color: '#00ff00' },
            ],
          },
        ],
      };
      tiers.value = data.tiers;
    }, 1000);
  };

  const disconnectWebSocket = () => {
    if (socket.value) {
      socket.value.close();
    }
  };

  return { tiers, connectWebSocket, disconnectWebSocket };
});
