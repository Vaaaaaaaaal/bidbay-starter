<script setup>
import { useAuthStore } from "../store/auth";
import { useRouter } from "vue-router";
import { ref } from "vue";

const { isAuthenticated, token } = useAuthStore();
const router = useRouter();

if (!isAuthenticated.value) {
  router.push({ name: "Login" });
}

const name = ref("");
const description = ref("");
const category = ref("");
const originalPrice = ref("");
const pictureUrl = ref("");
const endDate = ref("");
const errorMessage = ref("");
const isSubmitting = ref(false);



//récupérer id de user actuel
const userID = useAuthStore().userData._value.id;


const addProduct = async () => {

  isSubmitting.value = true;

  try {
    const response = await fetch("http://localhost:3000/api/products/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.value,
        description: description.value,
        category: category.value,
        originalPrice: originalPrice.value,
        pictureUrl: pictureUrl.value,
        endDate: endDate.value,
        sellerId: userID,
      }),
    });


    if (!response.ok) {
      const { error } = await response.json();
      errorMessage.value = error;
    } else {
      const { newProduct } = await response.json();
      console.log(newProduct.id);
      router.push({ name: "Product", params: { productId: newProduct.id } });
      console.log(name);
    }
  } catch (e) {
    errorMessage.value = e;
  } finally {
    isSubmitting.value = false;
  }
};

</script>

<template>
  <h1 class="text-center">Ajouter un produit</h1>

  <div class="row justify-content-center">
    <div id="wrapper-form" class="col-md-6">
      <form @submit.prevent="addProduct">
        <div v-if="errorMessage" class="alert alert-danger mt-4" role="alert">
          {{ errorMessage }}
        </div>

        <div class="mb-3">
          <label for="product-name" class="form-label"> Nom du produit </label>
          <input v-model="name" name="name" type="text" class="form-control" id="product-name" required />
        </div>

        <div class="mb-3">
          <label for="product-description" class="form-label">
            Description
          </label>
          <textarea v-model="description" class="form-control" id="product-description" name="description" rows="3"
            required></textarea>
        </div>

        <div class="mb-3">
          <label for="product-category" class="form-label"> Catégorie </label>
          <input v-model="category" type="text" name="category" class="form-control" id="product-category" required />
        </div>

        <div class="mb-3">
          <label for="product-original-price" class="form-label">
            Prix de départ
          </label>
          <div class="input-group">
            <input v-model="originalPrice" type="number" class="form-control" id="product-original-price"
              name="originalPrice" step="1" min="0" required />
            <span class="input-group-text">€</span>
          </div>
        </div>

        <div class="mb-3">
          <label for="product-picture-url" class="form-label">
            URL de l'image
          </label>
          <input v-model="pictureUrl" type="url" class="form-control" id="product-picture-url" name="pictureUrl"
            required />
        </div>

        <div class="mb-3">
          <label for="product-end-date" class="form-label">
            Date de fin de l'enchère
          </label>
          <input v-model="endDate" type="date" class="form-control" id="product-end-date" name="endDate" required />
        </div>

        <div class="d-grid gap-2">
          <button type="submit" class="btn btn-primary" data-test-submit :disabled="isSubmitting">
            {{ isSubmitting ? "<span data-test-spinner class=\"spinner-border spinner-border-sm\" role=\"status\"aria hidden =\"true\"</span>" : "Ajouter le produit" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
