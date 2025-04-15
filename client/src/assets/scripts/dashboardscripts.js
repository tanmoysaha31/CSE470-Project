// const hamBurger = document.querySelector(".toggle-btn");

// hamBurger.addEventListener("click", function () {
//   document.querySelector("#sidebar").classList.toggle("expand");
// });


document.addEventListener('DOMContentLoaded', function() {
    const hamBurger = document.querySelector(".toggle-btn");
    
    if (hamBurger) {
        hamBurger.addEventListener("click", function () {
            document.querySelector("#sidebar").classList.toggle("expand");
        });
    }
});