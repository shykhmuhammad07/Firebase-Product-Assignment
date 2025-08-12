import {
  collection,
  getDocs,
  doc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { db, auth } from "./config.js";

let productCounts = {};
window.addEventListener("DOMContentLoaded", async (e) => {
  e.preventDefault();
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location = "./login.html";
      return;
    }

    let get = document.getElementById("get");
    get.innerHTML = "";

    try {
      const querySnapshot = await getDocs(
        collection(db, `carts/${user.uid}/items`)
      );

      if (querySnapshot.empty) {
        get.innerHTML = "<p>Your cart is empty.</p>";
        return;
      }

      querySnapshot.forEach((doc) => {
        const item = doc.data();
        productCounts[doc.id] = item.quantity || 1;
        get.innerHTML += `
      <div class="cart-item">
      <img src=${item.image} class="item-image">
      <div class="item-content">
      <div class="item-header">
      <h3 class="item-name">Name: ${item.name}</h3>
      <div class="item-price">Price: ${item.price}</div>
      </div>
      <p class="item-desc">Description: ${item.description}</p>
       <button onclick="increase('${
         doc.id
       }')" class="btn btn-success">+</button>
              <p id="count-${doc.id}" class="d-flex justify-content-center">${
          productCounts[doc.id]
        }</p>
              <button onclick="decrease('${
                doc.id
              }')" class="btn btn-danger">-</button>
      </div>
      </div>
      `;
      });
    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  });
});

async function increase(id) {
  productCounts[id]++;
  document.getElementById(`count-${id}`).innerText = productCounts[id];
}
window.increase = increase;

async function decrease(id) {
  const user = auth.currentUser;
  if (productCounts[id] > 1) {
    productCounts[id]--;
    document.getElementById(`count-${id}`).innerText = productCounts[id];

    await updateDoc(doc(db, `carts/${user.uid}/items/${id}`), {
      quantity: productCounts[id],
    });
  } else {
    // Delete from Firestore
    await deleteDoc(doc(db, `carts/${user.uid}/items/${id}`));
    // Remove from UI
    document.getElementById(`cart-item-${id}`).remove();
    // Button in user.js will auto enable via onSnapshot
  }
}
window.decrease = decrease;
