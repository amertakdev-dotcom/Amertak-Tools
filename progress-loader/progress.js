const loader = document.getElementById("loader")
const text = document.getElementById("range_label")
const range = document.getElementById('range');

range.addEventListener("animationend", () => {
    loader.classList.toggle('endloader');
});