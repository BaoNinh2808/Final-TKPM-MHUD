const rightBelowToast = document.getElementById("right-below-toast");
function showRightBelowToast(message) {
    rightBelowToast.querySelector(".toast-body").innerText = message;
    const toast = new bootstrap.Toast(rightBelowToast);
    toast.show();
}