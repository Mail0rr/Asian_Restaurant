document.addEventListener("DOMContentLoaded", () => {
  // Обробники для модальних вікон
  const registerButton = document.getElementById("registerButton")
  const closeRegister = document.getElementById("closeRegister")
  const closeLogin = document.getElementById("closeLogin")
  const openLogin = document.getElementById("openLogin")
  const openRegister = document.getElementById("openRegister")
  const registerModal = document.getElementById("registerModal")
  const loginModal = document.getElementById("loginModal")

  // Відкриття модального вікна реєстрації
  if (registerButton) {
    registerButton.addEventListener("click", () => {
      registerModal.classList.remove("hidden", "scale-0")
    })
  }

  // Закриття модального вікна реєстрації
  if (closeRegister) {
    closeRegister.addEventListener("click", () => {
      registerModal.classList.add("hidden", "scale-0")
    })
  }

  // Закриття модального вікна входу
  if (closeLogin) {
    closeLogin.addEventListener("click", () => {
      loginModal.classList.add("hidden", "scale-0")
    })
  }

  // Перехід від реєстрації до входу
  if (openLogin) {
    openLogin.addEventListener("click", () => {
      registerModal.classList.add("hidden", "scale-0")
      loginModal.classList.remove("hidden", "scale-0")
    })
  }

  // Перехід від входу до реєстрації
  if (openRegister) {
    openRegister.addEventListener("click", () => {
      loginModal.classList.add("hidden", "scale-0")
      registerModal.classList.remove("hidden", "scale-0")
    })
  }

  // Обробка телефонного номера
  const phoneContainer = document.getElementById("phoneContainer")
  const phonePlaceholder = document.getElementById("phonePlaceholder")
  const phoneInput = document.getElementById("phoneInput")

  if (phonePlaceholder && phoneInput) {
    phonePlaceholder.addEventListener("click", () => {
      phonePlaceholder.classList.add("hidden")
      phoneInput.classList.remove("hidden")
      phoneInput.focus()
      phoneInput.value = "+380 "
    })

    phoneInput.addEventListener("input", () => {
      let numbers = phoneInput.value.replace(/\D/g, "")
      if (numbers.startsWith("380")) {
        numbers = numbers.slice(3)
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
        event.preventDefault()
      }
    })

    phoneInput.addEventListener("blur", () => {
      if (phoneInput.value === "+380 " || phoneInput.value === "") {
        phoneInput.classList.add("hidden")
        phonePlaceholder.classList.remove("hidden")
      }
    })
  }

  // Обробка відправки форми реєстрації через AJAX
  const registerForm = document.getElementById("registerForm")
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault() // Запобігаємо стандартній відправці форми

      // Збираємо дані форми
      const formData = new FormData(this)
      const userData = {
        username: formData.get("username"),
        phone: formData.get("phone"),
        password: formData.get("password"),
      }

      // Відправляємо дані на сервер через fetch API
      fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Якщо успішно, оновлюємо UI для авторизованого користувача
            updateAuthUI(true)

            // Закриваємо модальне вікно реєстрації
            registerModal.classList.add("hidden", "scale-0")

            // Показуємо повідомлення про успішну реєстрацію та автоматичний вхід
            alert("Реєстрація успішна! Ви автоматично увійшли в систему.")

            // Перенаправляємо на головну сторінку
            window.location.href = data.redirect
          } else {
            // Якщо помилка, показуємо повідомлення
            alert(data.message || "Помилка при реєстрації")
          }
        })
        .catch((error) => {
          console.error("Помилка:", error)
          alert("Сталася помилка при відправці форми")
        })
    })
  }

  // Обробка відправки форми входу через AJAX
  const loginForm = document.getElementById("loginForm")
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault()

      const formData = new FormData(this)
      const userData = {
        username: formData.get("username"),
        password: formData.get("password"),
      }

      fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Оновлюємо UI після успішного входу
            updateAuthUI(true)

            // Закриваємо модальне вікно
            loginModal.classList.add("hidden", "scale-0")

            // Показуємо повідомлення про успішний вхід
            alert("Вхід виконано успішно!")

            // Перенаправляємо на головну сторінку
            window.location.href = data.redirect
          } else {
            alert(data.message || "Помилка при вході")
          }
        })
        .catch((error) => {
          console.error("Помилка:", error)
          alert("Сталася помилка при відправці форми")
        })
    })
  }

  // Перевіряємо статус авторизації при завантаженні сторінки
  const authElement = document.querySelector("nav ul li:first-child a")
  if (authElement && authElement.textContent.trim().includes("LOG OUT")) {
    // Якщо є, значить користувач авторизований
    updateAuthUI(true)
  } else {
    updateAuthUI(false)
  }
})

// Оновлена функція для оновлення інтерфейсу після входу/виходу
function updateAuthUI(isLoggedIn) {
  const authElement = document.querySelector("nav ul li:first-child a")
  if (!authElement) return

  if (isLoggedIn) {
    authElement.innerHTML = `
      <img src="/static/images/logout.png" alt="logout" class="w-7 h-7">
      LOG OUT
    `
    authElement.href = "/logout"
    authElement.id = "" // Видаляємо id, щоб не спрацьовував обробник registerButton
    authElement.className = "flex items-center gap-2 text-xl hover:text-yellow-400"

    // Видаляємо обробник події, якщо він був
    authElement.removeEventListener("click", showRegisterModal)
  } else {
    authElement.innerHTML = `
      <img src="/static/images/login.png" alt="login" class="w-7 h-7">
      LOG IN
    `
    authElement.id = "registerButton"
    authElement.href = "#"
    authElement.className = "flex items-center gap-2 text-xl hover:text-yellow-400"

    // Додаємо обробник для кнопки реєстрації
    authElement.addEventListener("click", showRegisterModal)
  }

  // Кнопка замовлень завжди видна, але для неавторизованих користувачів
  // буде показуватися повідомлення при натисканні
  const ordersButton = document.getElementById("ordersButton")
  if (ordersButton) {
    ordersButton.classList.remove("hidden")
  }
}

// Функція для показу модального вікна реєстрації
function showRegisterModal() {
  const registerModal = document.getElementById("registerModal")
  if (registerModal) {
    registerModal.classList.remove("hidden", "scale-0")
  }
}