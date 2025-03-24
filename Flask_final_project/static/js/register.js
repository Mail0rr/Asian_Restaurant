document.getElementById("registerButton").addEventListener("click", () => {
  document.getElementById("registerModal").classList.remove("hidden", "scale-0")
})

document.getElementById("closeRegister").addEventListener("click", () => {
  document.getElementById("registerModal").classList.add("hidden", "scale-0")
})

document.addEventListener("DOMContentLoaded", () => {
  const phoneContainer = document.getElementById("phoneContainer")
  const phonePlaceholder = document.getElementById("phonePlaceholder")
  const phoneInput = document.getElementById("phoneInput")

  phonePlaceholder.addEventListener("click", () => {
    phonePlaceholder.classList.add("hidden")
    phoneInput.classList.remove("hidden")
    phoneInput.focus()
    phoneInput.value = "+380 " // Дефолтный префикс
  })

  phoneInput.addEventListener("input", () => {
    let numbers = phoneInput.value.replace(/\D/g, "") // Удаляем всё, кроме цифр
    if (numbers.startsWith("380")) {
      numbers = numbers.slice(3) // Убираем 380, так как оно уже есть
    } else {
      numbers = ""
    }

    let formattedNumber = "+380 "

    if (numbers.length > 0) formattedNumber += `(${numbers.slice(0, 2)}`
    if (numbers.length >= 2) formattedNumber += `) ${numbers.slice(2, 5)}`
    if (numbers.length >= 5) formattedNumber += ` ${numbers.slice(5, 7)}`
    if (numbers.length >= 7) formattedNumber += ` ${numbers.slice(7, 9)}`

    phoneInput.value = formattedNumber.trim()
  })

  phoneInput.addEventListener("keydown", (event) => {
    if (event.key === "Backspace" && phoneInput.value.length <= 5) {
      event.preventDefault() // Блокируем удаление "+380 "
    }
  })

  phoneInput.addEventListener("blur", () => {
    if (phoneInput.value === "+380 " || phoneInput.value === "") {
      phoneInput.classList.add("hidden")
      phonePlaceholder.classList.remove("hidden")
    }
  })
})

document.getElementById("registerButton").addEventListener("click", () => {
  document.getElementById("registerModal").classList.remove("hidden", "scale-0")
})

document.getElementById("closeRegister").addEventListener("click", () => {
  document.getElementById("registerModal").classList.add("hidden", "scale-0")
})

document.getElementById("closeLogin").addEventListener("click", () => {
  document.getElementById("loginModal").classList.add("hidden", "scale-0")
})

document.getElementById("openLogin").addEventListener("click", () => {
  document.getElementById("registerModal").classList.add("hidden", "scale-0")
  document.getElementById("loginModal").classList.remove("hidden", "scale-0")
})

document.getElementById("openRegister").addEventListener("click", () => {
  document.getElementById("loginModal").classList.add("hidden", "scale-0")
  document.getElementById("registerModal").classList.remove("hidden", "scale-0")
})

