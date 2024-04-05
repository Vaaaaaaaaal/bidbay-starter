<script setup>
import { ref } from "vue";

import { useAuthStore } from "@/store/auth";



const { isAuthenticated, userData } = useAuthStore();
/**
 *@typedef { import("vue").Ref } Ref 
 */
/**
 * @typedef {import('../../../backend/types/types.js')}
 */

 /**@type {Ref<UserObject|null>} */
const user = ref(null);
const loading = ref(true);
const error = ref(false);


/**
 * 
 * @param {string} idUser 
 */
async function fetchUser(idUser) {
  loading.value = true;
  error.value = false;
  /**@type {string} */
  let str;
  if (idUser === "me") {
    str = "http://localhost:3000/api/users/" + userData.value.id;
  } else {
    str = "http://localhost:3000/api/users/" + idUser;
  }

  try {
    const response = await fetch(str);
    user.value = await response.json();
    loading.value = false;
  } catch (e) {
    error.value = true;
    console.log(e);
  } finally {
    loading.value = false;
  }
}

if (!isAuthenticated) {
  window.location.href = "LoginView.vue";
}

if (window.location.href.startsWith("http://localhost:5173/users/")) {
  /** @type {string} */
  let userId;
  if (window.location.href.includes("me")) {
    fetchUser("me");
  } else {
    const regex = /http:\/\/localhost:5173\/users\/(.+)/;
    const match = window.location.href.match(regex);
    if (match && match.length > 1) {
      userId = match[1];
    }
    fetchUser(userId);
  }
}
/**
 * 
 * @param {string[]} bids
 * @returns {BidObject[]}
 */
const getHighestBidForProduct = (bids) => {
  /**@type {BidObject}   */
  const highestBids = {};
  bids.forEach((bid) => {
    if (!highestBids[bid.product.id] || bid.price > highestBids[bid.product.id].price) {
      highestBids[bid.product.id] = bid;
    }
  });
  return Object.values(highestBids);
};

</script>

<template>
  <div>
    <h1 class="text-center" data-test-username>
      Utilisateur {{ user ? user.username : "" }}
      <span
      v-if="user && user.admin"
        class="badge rounded-pill bg-primary"
        data-test-admin
        >Admin</span
      >
    </h1>
    <div v-if="loading" class="text-center" data-test-loading>
      <span class="spinner-border"></span>
      <span>Chargement en cours...</span>
    </div>
    <div v-if="error" class="alert alert-danger mt-3" data-test-error>
      Une erreur est survenue
    </div>
    <div v-if="!loading && !error" data-test-view>
      <div class="row">
        <div class="col-lg-6">
          <h2>Produits</h2>
          <div class="row">
            <div
              class="col-md-6 mb-6 py-2"
              v-for="product in user ? user.products : null"
              :key="product.id"
              data-test-product
            >
              <div class="card">
                <RouterLink
                  :to="{ name: 'Product', params: { productId: product.id } }"
                >
                  <img
                    :src="product.pictureUrl"
                    class="card-img-top"
                    data-test-product-picture
                    alt="Image non trouvée"
                  />
                </RouterLink>
                <div class="card-body">
                  <h5 class="card-title">
                    <RouterLink
                      :to="{
                        name: 'Product',
                        params: { productId: product.id },
                      }"
                      data-test-product-name
                    >
                      {{ product.name }}
                    </RouterLink>
                  </h5>
                  <p class="card-text" data-test-product-description>
                    {{ product.description }}
                  </p>
                  <p class="card-text" data-test-product-price>
                    Prix de départ : {{ product.originalPrice }} €
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <h2>Offres</h2>
          <table class="table table-striped">
            <thead>
              <tr>
                <th scope="col">Produit</th>
                <th scope="col">Offre</th>
                <th scope="col">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="bid in getHighestBidForProduct(user ? user.bids : [])" :key="bid.id" data-test-bid>
                <td>
                  <RouterLink
                    :to="{
                      name: 'Product',
                      params: { productId: bid.product.id },
                    }"
                    data-test-bid-product
                  >
                    {{ bid.product.name }}
                  </RouterLink>
                </td>
                <td data-test-bid-price>{{ bid.price }} €</td>
                <td data-test-bid-date>{{ new Date(bid.date).toLocaleDateString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>