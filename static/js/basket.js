document.addEventListener("DOMContentLoaded", () => {
  const cashPayment = document.getElementById("cashPayment")
  const cardPayment = document.getElementById("cardPayment")

  if (cashPayment && cardPayment) {
    // Переконаємося, що при завантаженні сторінки вибрано правильний метод
    if (cashPayment.checked) {
      document.querySelector('label[for="cashPayment"]').classList.add("border-yellow-400")
    } else if (cardPayment.checked) {
      document.querySelector('label[for="cardPayment"]').classList.add("border-yellow-400")
    }

    // Додаємо анімацію при виборі
    cashPayment.addEventListener("change", () => {
      if (cashPayment.checked) {
        document.querySelector('label[for="cashPayment"]').classList.add("border-yellow-400")
        document.querySelector('label[for="cardPayment"]').classList.remove("border-yellow-400")
      }
    })

    cardPayment.addEventListener("change", () => {
      if (cardPayment.checked) {
        document.querySelector('label[for="cardPayment"]').classList.add("border-yellow-400")
        document.querySelector('label[for="cashPayment"]').classList.remove("border-yellow-400")
      }
    })
  }
  // DOM Elements
  const basketButton = document.getElementById("basketButton")
  const modal = document.getElementById("basketModal")
  const closeBtn = document.getElementById("closeBasket")
  const cartContent = document.getElementById("cartContent")
  const orderContent = document.getElementById("orderContent")
  const cartItems = document.getElementById("cartItems")
  const cartTotal = document.getElementById("cartTotal")
  const orderTotal = document.getElementById("orderTotal")
  const clearCartButton = document.getElementById("clearCart")
  const proceedToOrderButton = document.getElementById("proceedToOrder")
  const backToCartButton = document.getElementById("backToCart")
  const orderForm = document.getElementById("orderForm")
  const cartTab = document.querySelector(".cart-tab")
  const orderTab = document.querySelector(".order-tab")
  const pagination = document.getElementById("cartPagination")
  const prevPageBtn = document.getElementById("prevPage")
  const nextPageBtn = document.getElementById("nextPage")
  const pageInfo = document.getElementById("pageInfo")

  console.log("Скрипт кошика завантажено")

  // Pagination state
  let currentPage = 0
  const itemsPerPage = 4

  // Modal Controls
  if (basketButton) {
    basketButton.addEventListener("click", (event) => {
      event.preventDefault()
      console.log("Кнопка кошика натиснута")
      updateCartDisplay()
      if (modal) {
        modal.classList.remove("hidden", "scale-0")
        modal.classList.add("flex", "scale-100")
        console.log("Модальне вікно відкрито")

        // Якщо активна вкладка оформлення, заповнюємо форму даними користувача
        if (orderContent && !orderContent.classList.contains("hidden")) {
          fillOrderFormWithUserData()
        }
      }
    })
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      console.log("Кнопка закриття натиснута")
      if (modal) {
        modal.classList.add("scale-0")
        setTimeout(() => {
          modal.classList.add("hidden")
        }, 200)
      }
    })
  }

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.classList.add("scale-0")
        setTimeout(() => {
          modal.classList.add("hidden")
        }, 200)
      }
    })
  }

  // Tab Controls
  if (cartTab) {
    cartTab.addEventListener("click", () => {
      switchTab("cart")
    })
  }

  if (orderTab) {
    orderTab.addEventListener("click", () => {
      switchTab("order")
    })
  }

  // Оновимо обробник кнопки "Оформити замовлення"
  if (proceedToOrderButton) {
    proceedToOrderButton.addEventListener("click", () => {
      // Перевіряємо, чи авторизований користувач
      fetch("/api/check-auth")
        .then((response) => response.json())
        .then((data) => {
          if (data.authenticated) {
            // Якщо користувач авторизований, переходимо до оформлення замовлення
            switchTab("order")
            fillOrderFormWithUserData()
          } else {
            // Якщо користувач не авторизований, показуємо повідомлення
            showNotification("Для оформлення замовлення необхідно увійти в акаунт", "bg-red-600")

            // Закриваємо модальне вікно кошика
            modal.classList.add("scale-0")
            setTimeout(() => {
              modal.classList.add("hidden")

              // Відкриваємо модальне вікно входу
              const loginModal = document.getElementById("loginModal")
              if (loginModal) {
                loginModal.classList.remove("hidden", "scale-0")
              }
            }, 200)
          }
        })
        .catch((error) => {
          console.error("Помилка при перевірці авторизації:", error)
          showNotification("Сталася помилка при перевірці авторизації", "bg-red-600")
        })
    })
  }

  if (backToCartButton) {
    backToCartButton.addEventListener("click", () => {
      switchTab("cart")
    })
  }

  function switchTab(tab) {
    if (tab === "cart") {
      cartTab.classList.add("active")
      orderTab.classList.remove("active")
      cartContent.classList.add("active")
      cartContent.classList.remove("hidden")
      orderContent.classList.add("hidden")
      orderContent.classList.remove("active")
    } else {
      cartTab.classList.remove("active")
      orderTab.classList.add("active")
      cartContent.classList.remove("active")
      cartContent.classList.add("hidden")
      orderContent.classList.remove("hidden")
      orderContent.classList.add("active")
      updateOrderSummary()
    }
  }

  // Cart Functions
  function getCart() {
    try {
      const cartData = localStorage.getItem("cart")
      return cartData ? JSON.parse(cartData) : []
    } catch (error) {
      console.error("Помилка при отриманні кошика:", error)
      return []
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem("cart", JSON.stringify(cart))
    } catch (error) {
      console.error("Помилка при збереженні кошика:", error)
      showNotification("Помилка при збереженні кошика", "bg-red-600")
    }
  }

  function updateCartDisplay() {
    if (!cartItems) return

    const cart = getCart()
    console.log("Поточний кошик:", cart)

    if (!cart || cart.length === 0) {
      cartItems.innerHTML = '<p class="text-gray-300 text-lg">Ваш кошик порожній.</p>'
      if (pagination) pagination.classList.add("hidden")
      updateTotals(0)
      return
    }

    // Pagination
    const totalPages = Math.ceil(cart.length / itemsPerPage)
    const start = currentPage * itemsPerPage
    const end = start + itemsPerPage
    const displayedItems = cart.slice(start, end)

    let cartHTML = '<div class="space-y-4">'

    displayedItems.forEach((item, index) => {
      const actualIndex = start + index
      const itemTotal = item.price * item.quantity

      cartHTML += `
                <div class="flex items-center justify-between border-b border-gray-700 pb-4">
                    <div class="flex items-center">
                        <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-md mr-4">
                        <div>
                            <h3 class="font-semibold">${item.name}</h3>
                            <p class="text-gray-400">${item.price} грн × ${item.quantity}</p>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <div class="flex items-center mr-4 bg-gray-700 rounded-lg">
                            <button class="decrease-quantity px-2 py-1 hover:bg-gray-600 rounded-l-lg" data-index="${actualIndex}">−</button>
                            <span class="px-3 py-1">${item.quantity}</span>
                            <button class="increase-quantity px-2 py-1 hover:bg-gray-600 rounded-r-lg" data-index="${actualIndex}">+</button>
                        </div>
                        <span class="text-lg font-semibold mr-4">${itemTotal} грн</span>
                        <button class="remove-item text-red-500 hover:text-red-400" data-index="${actualIndex}">✕</button>
                    </div>
                </div>
            `
    })

    cartHTML += "</div>"

    cartItems.innerHTML = cartHTML

    // Update pagination
    if (pagination) {
      if (totalPages > 1) {
        pagination.classList.remove("hidden")
        if (pageInfo) pageInfo.textContent = `${currentPage + 1} / ${totalPages}`
        if (prevPageBtn) prevPageBtn.disabled = currentPage === 0
        if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages - 1
      } else {
        pagination.classList.add("hidden")
      }
    }

    updateTotals(calculateTotal(cart))
    attachCartEventHandlers()
  }

  function updateTotals(total) {
    if (cartTotal) cartTotal.textContent = `${total} грн`
    if (orderTotal) orderTotal.textContent = `${total} грн`
  }

  function calculateTotal(cart) {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  function updateOrderSummary() {
    const summaryContainer = document.getElementById("orderSummary")
    if (!summaryContainer) return

    const cart = getCart()

    if (!cart || cart.length === 0) {
      summaryContainer.innerHTML = '<p class="text-gray-300">Кошик порожній</p>'
      return
    }

    let summaryHTML = ""
    cart.forEach((item) => {
      summaryHTML += `
                <div class="flex justify-between items-center py-2 border-b border-gray-700">
                    <span>${item.name} × ${item.quantity}</span>
                    <span>${item.price * item.quantity} грн</span>
                </div>
            `
    })

    summaryContainer.innerHTML = summaryHTML
  }

  function attachCartEventHandlers() {
    if (!cartItems) return

    // Обробники для кнопок видалення
    const removeButtons = cartItems.querySelectorAll(".remove-item")
    removeButtons.forEach((button) => {
      button.addEventListener("click", function () {
        try {
          const index = Number.parseInt(this.getAttribute("data-index") || "0")
          removeFromCart(index)
        } catch (error) {
          console.error("Помилка при видаленні товару:", error)
          showNotification("Помилка при видаленні товару", "bg-red-600")
        }
      })
    })

    // Обробники для кнопок зміни кількості
    const increaseButtons = cartItems.querySelectorAll(".increase-quantity")
    increaseButtons.forEach((button) => {
      button.addEventListener("click", function () {
        try {
          const index = Number.parseInt(this.getAttribute("data-index") || "0")
          updateQuantity(index, 1)
        } catch (error) {
          console.error("Помилка при збільшенні кількості:", error)
          showNotification("Помилка при зміні кількості", "bg-red-600")
        }
      })
    })

    const decreaseButtons = cartItems.querySelectorAll(".decrease-quantity")
    decreaseButtons.forEach((button) => {
      button.addEventListener("click", function () {
        try {
          const index = Number.parseInt(this.getAttribute("data-index") || "0")
          updateQuantity(index, -1)
        } catch (error) {
          console.error("Помилка при зменшенні кількості:", error)
          showNotification("Помилка при зміні кількості", "bg-red-600")
        }
      })
    })
  }

  // Pagination Controls
  if (prevPageBtn) {
    prevPageBtn.addEventListener("click", () => {
      if (currentPage > 0) {
        currentPage--
        updateCartDisplay()
      }
    })
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener("click", () => {
      const cart = getCart()
      const totalPages = Math.ceil(cart.length / itemsPerPage)
      if (currentPage < totalPages - 1) {
        currentPage++
        updateCartDisplay()
      }
    })
  }

  // Cart Item Management
  function removeFromCart(index) {
    try {
      const cart = getCart()
      if (index >= 0 && index < cart.length) {
        cart.splice(index, 1)
        saveCart(cart)
        updateCartDisplay()
        showNotification("Товар видалено з кошика", "bg-lime-600")
      }
    } catch (error) {
      console.error("Помилка при видаленні з кошика:", error)
      showNotification("Помилка при видаленні товару", "bg-red-600")
    }
  }

  function updateQuantity(index, change) {
    try {
      const cart = getCart()
      if (index >= 0 && index < cart.length) {
        cart[index].quantity += change
        if (cart[index].quantity < 1) {
          cart.splice(index, 1)
          showNotification("Товар видалено з кошика", "bg-lime-600")
        } else {
          showNotification("Кількість змінено", "bg-lime-600")
        }
        saveCart(cart)
        updateCartDisplay()
      }
    } catch (error) {
      console.error("Помилка при зміні кількості:", error)
      showNotification("Помилка при зміні кількості", "bg-red-600")
    }
  }

  // Clear Cart
  if (clearCartButton) {
    clearCartButton.addEventListener("click", (event) => {
      event.preventDefault()
      try {
        localStorage.removeItem("cart")
        updateCartDisplay()
        showNotification("Кошик очищено", "bg-lime-600")
      } catch (error) {
        console.error("Помилка при очищенні кошика:", error)
        showNotification("Помилка при очищенні кошика", "bg-red-600")
      }
    })
  }

  // Функція для автоматичного заповнення форми замовлення даними користувача
  function fillOrderFormWithUserData() {
    // Перевіряємо, чи авторизований користувач
    fetch("/api/check-auth")
      .then((response) => response.json())
      .then((data) => {
        if (data.authenticated) {
          // Заповнюємо ім'я користувача
          const nameInput = document.getElementById("orderName")
          if (nameInput) {
            nameInput.value = data.username
          }

          // Заповнюємо номер телефону і робимо його доступним для редагування
          const phoneInput = document.getElementById("phoneInputOrder")
          const phonePlaceholder = document.getElementById("phonePlaceholderOrder")

          if (phoneInput && phonePlaceholder && data.phone) {
            phonePlaceholder.classList.add("hidden")
            phoneInput.classList.remove("hidden")
            phoneInput.value = data.phone
            phoneInput.readOnly = false // Робимо поле доступним для редагування
            phoneInput.classList.remove("bg-gray-600") // Прибираємо візуальне відображення недоступності

            // Додаємо підказку про те, що номер телефону можна змінити
            let phoneHint = document.getElementById("phoneHint")
            if (!phoneHint) {
              phoneHint = document.createElement("div")
              phoneHint.id = "phoneHint"
              phoneHint.className = "text-gray-400 text-sm mt-1"
              phoneInput.parentNode.appendChild(phoneHint)
            }

            phoneHint.textContent = "Ви можете змінити номер телефону"
          }
        }
      })
      .catch((error) => {
        console.error("Помилка при отриманні даних користувача:", error)
      })
  }

  // Order Form Submission
  if (orderForm) {
    orderForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      try {
        const name = document.getElementById("orderName").value
        const address = document.getElementById("orderAddress").value

        // Отримуємо номер телефону з поля вводу
        const phoneInput = document.getElementById("phoneInputOrder")
        const phone = phoneInput ? phoneInput.value : ""

        // Check if payment method is selected
        const paymentMethodElement = document.querySelector('input[name="paymentMethod"]:checked')
        if (!paymentMethodElement) {
          showNotification("Виберіть спосіб оплати", "bg-red-600")
          return
        }
        const paymentMethod = paymentMethodElement.value

        const cart = getCart()

        if (!name || !address) {
          showNotification("Заповніть усі поля", "bg-red-600")
          return
        }

        if (!cart || cart.length === 0) {
          showNotification("Ваш кошик порожній", "bg-red-600")
          return
        }

        // Формуємо список товарів для відображення
        const itemsList = cart.map((item) => `${item.name} (${item.quantity} шт.)`).join(", ")

        // Відправляємо замовлення на сервер
        const response = await fetch("/api/place-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            phone, // Додаємо номер телефону в запит
            address,
            payment_method: paymentMethod,
            cart_items: cart,
            items_list: itemsList,
          }),
        })

        const data = await response.json()

        if (data.success) {
          localStorage.removeItem("cart")
          showNotification("Замовлення успішно оформлено", "bg-lime-600")

          // Закриваємо модальне вікно через 2 секунди
          setTimeout(() => {
            modal.classList.add("scale-0")
            setTimeout(() => {
              modal.classList.add("hidden")
            }, 200)
          }, 2000)
        } else {
          // Обробка різних помилок
          if (data.message === "auth_required") {
            // Користувач не авторизований
            showNotification("Для оформлення замовлення необхідно увійти в акаунт", "bg-red-600")

            // Закриваємо модальне вікно кошика
            modal.classList.add("scale-0")
            setTimeout(() => {
              modal.classList.add("hidden")

              // Відкриваємо модальне вікно входу
              const loginModal = document.getElementById("loginModal")
              if (loginModal) {
                loginModal.classList.remove("hidden", "scale-0")
              }
            }, 200)
          } else {
            showNotification(data.message || "Помилка при оформленні замовлення", "bg-red-600")
          }
        }
      } catch (error) {
        console.error("Помилка при оформленні замовлення:", error)
        showNotification("Сталася помилка при оформленні замовлення", "bg-red-600")
      }
    })
  }

  // Add to cart functionality
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("bg-lime-600") && event.target.textContent.trim() === "Додати до кошика") {
      event.preventDefault()
      console.log("Кнопка додавання до кошика натиснута")

      try {
        const path = window.location.pathname
        let itemType = ""
        let itemId = 0
        let itemName = ""
        let itemPrice = 0
        let itemImage = ""

        // Отримуємо дані про товар
        const nameElement = document.querySelector("h1")
        const priceElement = document.querySelector(".text-red-400")
        const imageElement = document.querySelector(".max-w-6xl img")

        if (nameElement && priceElement && imageElement) {
          itemName = nameElement.textContent || ""

          // Безпечне вилучення ціни
          const priceText = priceElement.textContent || ""
          const priceMatch = priceText.match(/(\d+)/)
          if (priceMatch && priceMatch[1]) {
            itemPrice = Number.parseInt(priceMatch[1])
          }

          itemImage = imageElement.src

          // Визначаємо тип і ID товару з URL
          if (path.includes("/dish/")) {
            itemType = "dish"
          } else if (path.includes("/drink/")) {
            itemType = "drink"
          } else if (path.includes("/dessert/")) {
            itemType = "dessert"
          }

          // Безпечне вилучення ID
          const idMatch = path.match(/\/(\d+)\/?$/)
          if (idMatch && idMatch[1]) {
            itemId = Number.parseInt(idMatch[1])
          }

          console.log("Додаємо товар:", {
            type: itemType,
            id: itemId,
            name: itemName,
            price: itemPrice,
            image: itemImage,
          })

          if (itemName && itemPrice > 0 && itemImage && itemType && itemId > 0) {
            const cart = getCart()

            // Перевіряємо, чи є вже такий товар у кошику
            const existingItemIndex = cart.findIndex((item) => item.type === itemType && item.id === itemId)

            if (existingItemIndex !== -1) {
              // Якщо товар вже є, збільшуємо кількість
              cart[existingItemIndex].quantity += 1
              showNotification(`${itemName} (${cart[existingItemIndex].quantity} шт) у кошику`, "bg-lime-600")
            } else {
              // Якщо товару немає, додаємо новий
              cart.push({
                type: itemType,
                id: itemId,
                name: itemName,
                price: itemPrice,
                image: itemImage,
                quantity: 1,
              })
              showNotification(`${itemName} додано до кошика`, "bg-lime-600")
            }

            saveCart(cart)
          } else {
            console.error("Невірні дані товару:", {
              type: itemType,
              id: itemId,
              name: itemName,
              price: itemPrice,
              image: itemImage,
            })
            showNotification("Помилка при додаванні товару: невірні дані", "bg-red-600")
          }
        } else {
          console.error("Не вдалося знайти елементи товару на сторінці")
          showNotification("Помилка при додаванні товару", "bg-red-600")
        }
      } catch (error) {
        console.error("Помилка при додаванні товару:", error)
        showNotification("Помилка при додаванні товару", "bg-red-600")
      }
    }
  })

  // Notification function
  function showNotification(message, bgColor) {
    console.log("Показуємо повідомлення:", message)

    const notification = document.createElement("div")

    notification.classList.add(
      "fixed",
      "top-6",
      "left-1/2",
      "transform",
      "-translate-x-1/2",
      bgColor,
      "text-white",
      "py-4",
      "px-8",
      "rounded-lg",
      "shadow-xl",
      "text-xl",
      "font-semibold",
      "z-50",
      "transition-opacity",
      "opacity-0",
      "duration-500",
    )
    notification.innerText = message

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.classList.remove("opacity-0")
      notification.classList.add("opacity-100")
    }, 10)

    setTimeout(() => {
      notification.classList.remove("opacity-100")
      notification.classList.add("opacity-0")
      setTimeout(() => {
        notification.remove()
      }, 500)
    }, 3000)
  }
})

document.addEventListener("DOMContentLoaded", () => {
  const phoneContainer = document.getElementById("phoneContainerOrder")
  const phonePlaceholder = document.getElementById("phonePlaceholderOrder")
  const phoneInput = document.getElementById("phoneInputOrder")

  if (phoneContainer && phonePlaceholder && phoneInput) {
    phonePlaceholder.addEventListener("click", () => {
      phonePlaceholder.classList.add("hidden")
      phoneInput.classList.remove("hidden")
      phoneInput.focus()
      phoneInput.value = "+380 " // Дефолтний префікс
    })

    phoneInput.addEventListener("input", () => {
      let numbers = phoneInput.value.replace(/\D/g, "") // Видаляємо все, крім цифр
      if (numbers.startsWith("380")) {
        numbers = numbers.slice(3) // Прибираємо 380, оскільки воно вже є
      } else if (!numbers.startsWith("380")) {
        numbers = numbers.slice(0) // Залишаємо як є
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
        event.preventDefault() // Блокуємо видалення "+380 "
      }
    })

    phoneInput.addEventListener("blur", () => {
      if (phoneInput.value === "+380 " || phoneInput.value === "") {
        phoneInput.classList.add("hidden")
        phonePlaceholder.classList.remove("hidden")
      }
    })
  }
})