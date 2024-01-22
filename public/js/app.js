const header = document.querySelector("header");
const menu = document.querySelector("header .nav");
const button = document.querySelector("toggleMenu");


button.addEventListener("click", ()=>{
    menu.classList.toggle("hidden");
});
