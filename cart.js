import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { db } from "./config.js";


window.addEventListener('DOMContentLoaded', async () => {
  let get = document.getElementById('get');
  get.innerHTML = '';

  try {
    const querySnapshot = await getDocs(collection(db, "cart"));
    querySnapshot.forEach((doc) => {
      const item = doc.data();
      get.innerHTML += `
       <div class="cart-item">
          <img src=${item.image} class="item-image">
          <div class="item-content">
            <div class="item-header">
              <h3 class="item-name">Name: ${item.name}</h3>
              <div class="item-price">Price: ${item.price}</div>
            </div>
            <p class="item-desc">Description: ${item.description}</p>
              </div>
            </div>
      `;
    });
  } catch (error) {
    console.error("Error fetching cart data:", error);
  }
});

