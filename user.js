import {
  collection,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { onAuthStateChanged,  signOut  } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { auth, db } from "./config.js";

// Auth check
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location = "./login.html";
  } else {
    loadProducts();
  }
});

async function loadProducts() {
  let fetching = document.getElementById('fetching');
  const querySnapshot = await getDocs(collection(db, "products"));

  fetching.innerHTML = ""; // Clear before loading

  querySnapshot.forEach((docSnap) => {
    let product = docSnap.data();

    fetching.innerHTML += `
      <div class="card" style="width: 18rem;">
        <img src="${product.image}" class="card-img-top" alt="${product.name}">
        <div class="card-body">
          <h5 class="card-title">Name: ${product.name}</h5>
          <p class="card-text">Description: ${product.description}</p>
          <p class="card-text">Price: ${product.price}</p>
          <a href="#" onclick="addToCart(
            '${docSnap.id}',
            '${product.name}',
            '${product.description}',
            '${product.price}',
            '${product.image}'
          )" class="btn btn-primary">Add Product</a>
        </div>
      </div>`;
  });
}

async function addToCart(id, name, description, price, image) {
  try {
    await addDoc(collection(db, "cart"), {
      id,
      name,
      description,
      price,
      image,
      createdAt: new Date()
    });

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
  }
}
window.addToCart = addToCart;

// Order button — go to cart page
document.getElementById('order').addEventListener('click', () => {
  window.location = './cart.html';
});


document.getElementById("logout").addEventListener('click', () =>{
    signOut(auth).then(() => {
  Swal.fire({
        title: "Logged Out!",
        text: "You have been successfully logged out",
        icon: "success",
        confirmButtonColor: "#4F46E5",
      }).then(() => {
        window.location.href = "./login.html";
      });
    })
.catch((error) => {
  console.error("Error signing out:", error);
  Swal.fire({
        icon: "error",
        title: "Logout Failed",
        text: error.message,
      });
});
})


