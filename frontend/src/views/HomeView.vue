<script setup>
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";

const loading = ref(false);
const error = ref(false);
const products = ref([]);
const filterText = ref('');
const sort = ref('nom');


async function fetchProducts() {
  loading.value = true;
  error.value = false;

  try {
    const response = await fetch('http://localhost:3000/api/products');
    const data = await response.json();
    products.value = data;
    sortProducts('name');
  } catch (e) {
    error.value = true;
  } finally {
    loading.value = false;
  }
}


onMounted(fetchProducts);

function sortProducts(type) {
  if (type === 'price') {
    products.value = products.value?.sort((a, b) => a.originalPrice - b.originalPrice);
    sort.value = 'prix';
  } else {
    products.value = products.value?.sort((a, b) => a.name.localeCompare(b.name));
    sort.value = 'nom';
  }
}



function filterProducts() {
  return products.value.filter(product =>
    product.name.toLowerCase().includes(filterText.value.toLowerCase())
  );
}

/**@type {BidObject} */
const getHighestBid = (/**@type {ProductObject}*/product) => {
  if (!product.bids || product.bids.length === 0) {
    return product.originalPrice;
  }
/**@type {BidObject} */
  const highestBid = product.bids.reduce((max, bid) => {
    return bid.price > max.price ? bid : max;
  });

  return highestBid.price;
};

</script>

<template>
  <div>
    <h1 class="text-center mb-4">Liste des produits</h1>

    <div class="row mb-3">
      <div class="col-md-6">
        <form>
          <div class="input-group">
            <span class="input-group-text">Filtrage</span>
            <input
              v-model="filterText"
              type="text"
              class="form-control"
              placeholder="Filtrer par nom"
              data-test-filter
            />
          </div>
        </form>
      </div>
      <div class="col-md-6 text-end">
        <div class="btn-group">
          <button type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" data-test-sorter>
            Trier par {{ sort }}
            <span class="caret"></span>
          </button>

          <ul class="dropdown-menu dropdown-menu-end">
            <li v-on:click="sortProducts('name')">
              <a class="dropdown-item" href="#"> Nom </a>
            </li>
            <li v-on:click="sortProducts('price')">
              <a class="dropdown-item" href="#" data-test-sorter-price>
                Prix
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center mt-4" data-test-loading>
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger mt-4" role="alert" data-test-error>
      Une erreur est survenue lors du chargement des produits.
    </div>

    <div v-if="!loading && !error" class="row">
      <div v-for="product in filterProducts()" :key="product.id" class="col-md-4 mb-4" data-test-product>
        <div class="card">
          <RouterLink :to="{ name: 'Product', params: { productId: product.id } }">
            <img :src="product.pictureUrl" class="card-img-top" :alt="product.name" data-test-product-picture>
          </RouterLink>
          <div class="card-body">
            <h5 class="card-title">
              <RouterLink :to="{ name: 'Product', params: { productId: product.id } }" data-test-product-name>
                {{ product.name }}
              </RouterLink>
            </h5>
            <p class="card-text" data-test-product-description>{{ product.description }}</p>
            <p class="card-text">
              Vendeur :
              <RouterLink
                data-test-product-seller
                :to="{ name: 'User', params: { userId: product.sellerId } }"
              >
              {{product.seller.username}}
              </RouterLink>
            </p>
            <p class="card-text" data-test-product-date>
              <span v-if="new Date(product.endDate) > new Date()">
                En cours jusqu'au {{ new Date(product.endDate).toLocaleDateString('fr-FR') }}
              </span>
              <span v-else>
                Terminé
              </span>
            </p>
            <p class="card-text" data-test-product-price>
              Prix de départ : {{ product.originalPrice }} €
            </p>
            <p class="card-text" data-test-product-price>
              Prix actuel : {{ getHighestBid(product) }} €
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
