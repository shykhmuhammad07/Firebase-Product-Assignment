import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  onSnapshot 
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
      <div class="card" style="width: 18rem;">
        <img src="${product.image}" class="card-img-top" alt="${product.name}">
        <div class="card-body">
          <h5 class="card-title">Name: ${product.name}</h5>
          <p class="card-text">Description: ${product.description}</p>
          <p class="card-text">Price: ${product.price}</p>
          <a href="#" id="${btnId}" onclick="addToCart(
            '${docSnap.id}',
            '${product.name}',
            '${product.description}',
            '${product.price}',
            '${product.image}'
          )" class="btn btn-primary">Add Product</a>
        </div>
      </div>`;

    // Real-time listener for each product to enable/disable button
    if (uid) {
      const cartRef = collection(db, `carts/${uid}/items`);
      const q = query(cartRef, where("productId", "==", docSnap.id));
      onSnapshot(q, (snap) => {
        const btn = document.getElementById(btnId);
        if (btn) {
          btn.disabled = !snap.empty; // disable if in cart, enable if removed
        }
      });
    }
  });
}


function startCartCounter(uid) {
  const cartRef = collection(db, `carts/${uid}/items`);
  onSnapshot(cartRef, (snapshot) => {
    cartCount = snapshot.size;
    updateCartButton();
  });
}

async function addToCart(id, name, description, price, image,btnElement) {
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

     let cartRef = collection(db,  `carts/${user.uid}/items`)
     const q = query(cartRef, where("productId", "==", id))
     const querySnap = await getDocs(q);

       if (!querySnap.empty) {
      Swal.fire({
        icon: "info",
        title: "Already in Cart",
        text: "This product is already in your cart.",
      });
      document.getElementById(`btn-${id}`).disabled = true;

      return;
    }
    
    await addDoc(collection(db, `carts/${user.uid}/items`), {
      productId: id,
      name,
      description,
      price,
      image,
      quantity: 1,
      createdAt: new Date()
    });

     let btnElement = document.getElementById(`btn-${id}`);
btnElement.disabled = true; 

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

window.addToCart = addToCart;
window.Order = Order;

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
