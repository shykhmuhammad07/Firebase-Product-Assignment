import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { auth, db } from "./config.js";
import { collection, addDoc, getDocs, Timestamp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// DOM Elements
const modal = document.getElementById("modal");
const addProductBtn = document.getElementById("add-product-btn");
const modalCloseBtn = document.getElementById("modal-close");
const modalForm = document.getElementById("modal-form");
const logoutBtn = document.getElementById("logout");
const productsContainer = document.getElementById("products-container");

// Auth State Listener
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "./login.html";
  } else {
    loadProducts();
  }
});

// Modal Controls
addProductBtn.addEventListener("click", () => {
  modal.classList.add("active");
});

modalCloseBtn.addEventListener("click", () => {
  modal.classList.remove("active");
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove("active");
  }
});

// Add Product Form
modalForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const productName = modalForm["productName"].value.trim();
  const productDesc = modalForm["productDesc"].value.trim();
  const url = modalForm["Image Url"].value.trim();

  if (!productName || !productDesc || !url) {
    Swal.fire({
      icon: "error",
      title: "Please fill all fields",
    });
    return;
  }

  try {
    await addDoc(collection(db, "products"), {
      image:url,
      name: productName,
      description: productDesc,
      createdAt: Timestamp.now(),
      userId: auth.currentUser.uid, 
    });

    Swal.fire({
      title: "Product Added!",
      text: "Your product has been added successfully",
      icon: "success",
      confirmButtonColor: "#4F46E5",
    });
    
    modal.classList.remove("active");
    modalForm.reset();
    loadProducts();

  } catch (error) {
    console.error("Error adding product: ", error);
    Swal.fire({
      icon: "error",
      title: "Failed to add product",
      text: error.message,
    });
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
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
      console.error("Error logging out: ", error);
      Swal.fire({
        icon: "error",
        title: "Logout Failed",
        text: error.message,
      });
    });
});

// Load Products
async function loadProducts() {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    productsContainer.innerHTML = "";
    
    querySnapshot.forEach((doc) => {
      const product = doc.data();
      const productCard = `
      <div class="card" style="width: 18rem;">
  <img src="${product.image}" class="card-img-top" alt="...">
  <div class="card-body">
    <h5 class="card-title">${product.name}</h5>
    <p class="card-text">${product.description}</p>
    <a href="#" class="btn btn-primary">Go somewhere</a>
  </div>
</div>

      `;
      productsContainer.innerHTML += productCard;
    });
    
    if (querySnapshot.empty) {
      productsContainer.innerHTML = `
        <div class="col-span-full text-center py-12">
          <i class="fas fa-box-open text-4xl text-gray-300 mb-4"></i>
          <p class="text-gray-500">No products found. Add your first product!</p>
        </div>
      `;
    }
       
  } catch (error) {
    console.error("Error loading products: ", error);
    Swal.fire({
      icon: "error",
      title: "Failed to load products",
      text: error.message,
    });
  }
}