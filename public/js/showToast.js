const rightBelowToast = document.getElementById("right-below-toast");
function showRightBelowToast(message) {
    rightBelowToast.querySelector(".toast-body").innerHTML = message;
    const toast = new bootstrap.Toast(rightBelowToast);
    toast.show();
}