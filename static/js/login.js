document.getElementById("registerButton").addEventListener("click", () => {
  document.getElementById("registerModal").classList.remove("hidden", "scale-0")
})

document.getElementById("closeRegister").addEventListener("click", () => {
  document.getElementById("registerModal").classList.add("hidden", "scale-0")
})

document.getElementById("closeLogin").addEventListener("click", () => {
  document.getElementById("loginModal").classList.add("hidden", "scale-0")
})

document.getElementById("openRegister").addEventListener("click", () => {
  document.getElementById("loginModal").classList.add("hidden", "scale-0")
  document.getElementById("registerModal").classList.remove("hidden", "scale-0")
})

