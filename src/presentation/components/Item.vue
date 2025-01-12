<template>
  <div>
    <button @click="addColumn">Add Column</button>
    <button @click="addCard">Add Card</button>
    <div class="tier-list">
      <div
        v-for="tier in tiers"
        :key="tier.name"
        class="tier-category"
        :style="{ backgroundColor: tier.color }"
        @drop.prevent="onDrop(tier)"
        @dragover.prevent
      >
        <div class="tier-name">{{ tier.name }}</div>
        <div class="tier-items">
          <div
            v-for="(fruit, index) in tier.items"
            :key="`${fruit.name}-${index}`"
            :style="`background-color: ${fruit.color};`"
            class="fruit-item"
            draggable="true"
            @dragstart="onDragStart(fruit, tier)"
          >
            <div class="fruit-placeholder"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

interface Fruit {
  name: string;
  color: string;
}

interface Tier {
  name: string;
  color: string;
  items: Fruit[];
}

// Initialisation des niveaux de classement (tiers)
const tiers = ref<Tier[]>([
  { name: 'S', color: '#FF595E', items: [] },
  { name: 'A', color: '#FFCA3A', items: [] },
  { name: 'B', color: '#8AC926', items: [] },
  { name: 'C', color: '#1982C4', items: [] },
  { name: 'D', color: '#6A4C93', items: [] },
  { name: 'F', color: '#FF6B6B', items: [] },
]);

// Initialisation des fruits disponibles
const fruits = ref<Fruit[]>([
  { name: 'Apple', color: '#000' },
  { name: 'Banana', color: '#FFFF00' },
  { name: 'Orange', color: '#FFA500' },
  { name: 'Lemon', color: '#FFF44F' },
  { name: 'Grapes', color: '#8E4585' },
  { name: 'Pineapple', color: '#FFD700' },
  { name: 'Strawberry', color: '#FC5A8D' },
]);

// Ajouter tous les fruits dans la tier "F" par défaut
tiers.value.find((tier) => tier.name === 'F')!.items.push(...fruits.value);

// Variable pour suivre le fruit en cours de glissement
const draggedFruit = ref<Fruit | null>(null);
const draggedFromTier = ref<Tier | null>(null);

// Fonction pour démarrer le glisser-déposer
const onDragStart = (fruit: Fruit, tier: Tier) => {
  draggedFruit.value = fruit;
  draggedFromTier.value = tier;
};

// Fonction pour gérer le dépôt de l'élément
const onDrop = (targetTier: Tier) => {
  if (draggedFruit.value && draggedFromTier.value) {
    // Retirer le fruit de la tier d'origine
    const fromIndex = draggedFromTier.value.items.findIndex(
      (item) => item.name === draggedFruit.value!.name
    );
    if (fromIndex !== -1) {
      draggedFromTier.value.items.splice(fromIndex, 1);
    }

    // Ajouter le fruit à la tier cible
    targetTier.items.push(draggedFruit.value);

    // Réinitialiser les variables de suivi
    draggedFruit.value = null;
    draggedFromTier.value = null;
  }
};

// Fonction pour ajouter une nouvelle colonne
const addColumn = () => {
  const newTierName = `New Tier ${tiers.value.length + 1}`;
  tiers.value.push({ name: newTierName, color: getRandomColor(), items: [] });
};

// Fonction pour ajouter une nouvelle carte dans la première colonne
const addCard = () => {
  if (tiers.value.length > 0) {
    tiers.value[0].items.push({ name: `New Card ${tiers.value[0].items.length + 1}`, color: getRandomColor() });
  }
};

// Fonction pour générer une couleur aléatoire
const getRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};
</script>

<style lang="scss" scoped>
.tier-list {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .tier-category {
    border: 1px solid #000;
    padding: 10px;
    border-radius: 5px;

    .tier-name {
      font-weight: bold;
      margin-bottom: 10px;
    }

    .tier-items {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      min-height: 50px;
      padding: 10px;
      border: 2px dashed #ccc;

      .fruit-item {
        width: 50px;
        height: 50px;
        cursor: grab;

        .fruit-placeholder {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
}
</style>
