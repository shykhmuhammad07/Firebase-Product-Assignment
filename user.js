import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { auth, db } from "./config.js";

let orderbtn = document.getElementById('order');
let cartCount = 0;

// Auth check
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location = "./login.html";
  } else {
    loadProducts();
    startCartCounter(user.uid);
  }
});

async function loadProducts() {
  let fetching = document.getElementById('fetching');
  const querySnapshot = await getDocs(collection(db, "products"));
  fetching.innerHTML = "";

  const user = auth.currentUser;
  let uid = user?.uid;

  querySnapshot.forEach((docSnap) => {
    let product = docSnap.data();
    let btnId = `btn-${docSnap.id}`; // unique id for each button

    fetching.innerHTML += `

      <div class="card-1"  style="--animation-order: 2">
  <img src="${product.image}" class="card-img-top" alt="${product.name}">
  <div class="card-body">
    <h5 class="card-title">${product.name}</h5>
    <p class="card-text">${product.description}</p>
    <p class="card-price">${product.price}</p>
     <a href="#" id="${btnId}" onclick="addToCart(
      //       '${docSnap.id}',
      //       '${product.name}',
      //       '${product.description}',
      //       '${product.price}',
      //       '${product.image}',
      //       '${btnId}'
      //     )" class="btn btn-primary">Add Product</a>
</div>
</div>`;

    // Real-time listener for each product to enable/disable button
    if (uid) {
      const cartRef = collection(db, `carts/${uid}/items`);
      const q = query(cartRef, where("productId", "==", docSnap.id));
      onSnapshot(q, (snap) => {
        const btn = document.getElementById(btnId);
        if (btn) {
          btn.disabled = !snap.empty; // disable if in cart
        }
      });
    }
  });
}

async function startCartCounter(uid) {
  const cartRef = collection(db, `carts/${uid}/items`);

  // Initial fetch so count shows instantly
  const initialSnap = await getDocs(cartRef);
  cartCount = initialSnap.size;
  updateCartButton();

  // Real-time updates
  onSnapshot(cartRef, (snapshot) => {
    cartCount = snapshot.size;
    updateCartButton();
  });
}

async function addToCart(id, name, description, price, image, btnId) {
  try {
    const user = auth.currentUser;
    if (!user) {
      Swal.fire({
        icon: "error",
        title: "Not Logged In",
        text: "Please log in to add products to cart.",
      });
      return;
    }

    let cartRef = collection(db, `carts/${user.uid}/items`);
    const q = query(cartRef, where("productId", "==", id));
    const querySnap = await getDocs(q);

    if (!querySnap.empty) {
      Swal.fire({
        icon: "info",
        title: "Already in Cart",
        text: "This product is already in your cart.",
      });
      document.getElementById(btnId).disabled = true;
      return;
    }

    await addDoc(cartRef, {
      productId: id,
      name,
      description,
      price,
      image,
      quantity: 1,
      createdAt: new Date()
    });

    document.getElementById(btnId).disabled = true;

    Swal.fire({
      title: "Product Added to Cart!",
      html: `
        <strong>Name:</strong> ${name} <br>
        <strong>Description:</strong> ${description} <br>
        <strong>Price:</strong> ${price}
      `,
      icon: "success"
    });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message,
    });
  }
}

function updateCartButton() {
  orderbtn.innerText = `Order (${cartCount})`;
}

function Order() {
  window.location = './cart.html';
}

// Optional: function to remove from cart (for decrease)
async function removeFromCart(itemId) {
  try {
    const user = auth.currentUser;
    if (!user) return;
    const itemRef = doc(db, `carts/${user.uid}/items/${itemId}`);
    await deleteDoc(itemRef);
    Swal.fire({
      icon: "success",
      title: "Removed",
      text: "Product removed from cart."
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error Removing",
      text: error.message
    });
  }
}

window.addToCart = addToCart;
window.Order = Order;
window.removeFromCart = removeFromCart; // export if you want to call from cart.html

document.getElementById("logout").addEventListener('click', () => {
  signOut(auth).then(() => {
    Swal.fire({
      title: "Logged Out!",
      text: "You have been successfully logged out",
      icon: "success",
      confirmButtonColor: "#4F46E5",
    }).then(() => {
      window.location.href = "./login.html";
    });
  }).catch((error) => {
    console.error("Error signing out:", error);
    Swal.fire({
      icon: "error",
      title: "Logout Failed",
      text: error.message,
    });
  });
});
