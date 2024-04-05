<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "../store/auth";

const { isAuthenticated, isAdmin, userData, token } = useAuthStore();

const route = useRoute();
const router = useRouter();

const productId = ref(route.params.productId);
const product = ref();
const loading = ref(true);
const error = ref(false);
const isOwner = ref(false);
const price = ref(0);
let intervalId = null;

function formatDate(date) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString("fr-FR", options);
}

async function deleteProduct(){
  try {
    const response = await fetch('http://localhost:3000/api/products/' + productId.value, {
      method: 'DELETE',
      headers: {
          authorization: `Bearer ${token.value}`,
          accept: 'application/json'
        }
      })
      if (response.ok) {
        router.push({ name: "User", params: { userId:'me'}})
      } else {
        error.value = true
      }
    } catch (e) {
      error.value = true
    } finally {
      loading.value = false
    }
  }

const disabledAddBid = computed(() => {
  const maxPrice = lastBid.value?.price ?? 10;
  const lastBidderId = lastBid.value?.bidderId ?? null;
  return price.value < maxPrice;
});

const lastBid = computed(() => {
  if (product.value.bids.length > 0) {
    return product.value.bids.slice(-1)[0] ?? null;
  }
  return null;
});

async function fetchProduct() {
  loading.value = true;
  try {
    const response = await fetch(`http://localhost:3000/api/products/${productId.value}`);
    if (response.ok) {
      const data = await response.json();
      product.value = data;
      loading.value = false;
      error.value = false;
      if (isAuthenticated.value && userData.value.id === product.value.sellerId) {
        isOwner.value = true;
      }
      const lastBidPrice = lastBid.value?.price ?? product.value.originalPrice;
      price.value = lastBidPrice + 1;

      startCountdown();
    } else if (response.status === 404) {
      error.value = true;
      errorMessage.value = "Product not found";
      loading.value = false;
    } else {
      error.value = true;
      loading.value = false;
    }
  } catch (e) {
    console.error(e);
    error.value = true;
    loading.value = false;
  }
}

async function deleteBid(bidId) {
  error.value = false;
  loading.value = true;
  try {
    await fetch(`http://localhost:3000/api/bids/${bidId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
    fetchProduct();
  } catch (e) {
    error.value = true;
  } finally {
    loading.value = false;
  }
}

async function addBid() {
  if (isAuthenticated.value && userData.value.id === product.value.sellerId) {
    return;
  }
  try {
    const res = await fetch(
      `http://localhost:3000/api/products/${productId.value}/bids`,
      {
        method: "POST",
        body: JSON.stringify({ price: price.value }),
        headers: {
          Authorization: `Bearer ${token.value}`,
          "Content-Type": "application/json",
        },
      }
    );
  fetchProduct();
  } catch (e) {
    error.value = true;
  }
}

const countdown = ref('');

function updateCountdown() {
  const end = new Date(product.value.endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) {
    countdown.value = "Terminé";
    stopCountdown();
    return;
  }

  const seconds = Math.floor(diff / 1000) % 60;
  const minutes = Math.floor(diff / 1000 / 60) % 60;
  const hours = Math.floor(diff / 1000 / 60 / 60) % 24;
  const days = Math.floor(diff / 1000 / 60 / 60 / 24);

  countdown.value = `${days}j ${hours}h ${minutes}min ${seconds}s`;
}

function startCountdown() {
  if (!product.value || !product.value.endDate) {
    return;
  }
  updateCountdown();
  intervalId = setInterval(updateCountdown, 1000);
}

function stopCountdown() {
  clearInterval(intervalId);
}

onMounted(() => {
  fetchProduct();
});

onUnmounted(() => {
  stopCountdown();
});
</script>

<template>
  <div class="row">
    <div v-if="loading && !error" class="text-center mt-4" data-test-loading>
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div class="alert alert-danger mt-4" v-if="error" role="alert" data-test-error>
      Une erreur est survenue lors du chargement des produits.
    </div>

    <div v-if="!loading && !error" data-test-product>
      <!-- Colonne de gauche : image et compte à rebours -->
      <div class="col-lg-4">
        <img
          v-if="product"
          :src="product.pictureUrl"
          alt=""
          class="img-fluid rounded mb-3"
          data-test-product-picture
        />
        <div class="card">
          <div class="card-header">
            <h5 class="card-title">Compte à rebours</h5>
          </div>
          <div class="card-body">
            <h6 class="card-subtitle mb-2 text-muted" data-test-countdown>
              {{ countdown }}
            </h6>
          </div>
        </div>
      </div>

      <!-- Colonne de droite : informations du produit et formulaire d'enchère -->
      <div class="col-lg-8">
        <div class="row">
          <div class="col-lg-6">
            <h1 v-if="product" class="mb-3" data-test-product-name>
              {{product.name}}
            </h1>
          </div>
          <div class="col-lg-6 text-end" v-if="isAdmin || isOwner">
            <RouterLink
              v-if="product"
              :to="{ name: 'ProductEdition', params: { productId: product.id } }"
              class="btn btn-primary"
              data-test-edit-product
            >
              Editer
            </RouterLink>
            &nbsp;
            <button v-if="product" @click="deleteProduct()" class="btn btn-danger" data-test-delete-product>
              Supprimer
            </button>
          </div>
        </div>

        <h2 v-if="product" class="mb-3">Description</h2>
        <p v-if="product" data-test-product-description>
          {{product.description}}
        </p>

        <h2 v-if="product" class="mb-3">Informations sur l'enchère</h2>
        <ul v-if="product">
          <li data-test-product-price>Prix de départ : {{product.originalPrice}} €</li>
          <li data-test-product-end-date>Date de fin : {{ formatDate(product.endDate) }}</li>
          <li>
            Vendeur :
            <router-link
              v-if="product"
              :to="{ name: 'User', params: { userId: product.sellerId } }"
              data-test-product-seller
            >
              {{product.seller.username}}
            </router-link>
          </li>
        </ul>

        <h2 v-if="product" class="mb-3">Offres sur le produit</h2>
        <table v-if="product" class="table table-striped" data-test-bids>
          <thead>
            <tr>
              <th scope="col">Enchérisseur</th>
              <th scope="col">Offre</th>
              <th scope="col">Date</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bid in product.bids" :key="bid.id" data-test-bid>
              <td>
                <router-link
                  :to="{ name: 'User', params: { userId: bid.bidderId } }"
                  data-test-bid-bidder
                >
                  {{ bid.bidder.username}}
                </router-link>
              </td>
              <td data-test-bid-price>{{ bid.price}} €</td>
              <td data-test-bid-date>{{ formatDate(bid.date) }}</td>
              <td>
                <button class="btn btn-danger btn-sm" v-if="isAdmin || (isAuthenticated && userData.id === bid.bidder.id)" @click="deleteBid(bid.id)" data-test-delete-bid>
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <p data-test-no-bids v-if="product && product.bids.length === 0">Aucune offre pour le moment</p>
        <form data-test-bid-form @submit.prevent="addBid">
          <div class="form-group">
            <label for="bidAmount">Votre offre :</label>
            <input type="number" class="form-control" id="bidAmount" data-test-bid-form-price v-model="price" />
            <small class="form-text text-muted">
              Le montant doit être supérieur à 10 €.
            </small>
          </div>
          <button
            type="submit" class="btn btn-primary" :disabled="disabledAddBid" data-test-submit-bid>
            Enchérir
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
