document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const ordersButton = document.getElementById("ordersButton")
  const modal = document.getElementById("ordersModal")
  const closeBtn = document.getElementById("closeOrders")
  const ordersContainer = document.querySelector("#ordersModal .mt-6")

  console.log("Скрипт замовлень завантажено")

  // Pagination state
  let currentPage = 0
  const itemsPerPage = 3 // Показуємо менше замовлень на сторінці, оскільки вони більші
  let orders = []
  let totalPages = 0

  // Modal Controls
  if (ordersButton) {
    ordersButton.addEventListener("click", (event) => {
      event.preventDefault()
      console.log("Кнопка замовлень натиснута")

      // Перевіряємо, чи авторизований користувач
      fetch("/api/check-auth")
        .then((response) => response.json())
        .then((data) => {
          if (data.authenticated) {
            // Користувач авторизований, отримуємо і відображаємо замовлення
            fetchOrders()
            if (modal) {
              modal.classList.remove("hidden", "scale-0")
              console.log("Модальне вікно замовлень відкрито")
            }
          } else {
            // Користувач не авторизований, показуємо повідомлення
            showNotification("Для перегляду замовлень необхідно зареєструватися або увійти в акаунт", "bg-red-600")

            // Відкриваємо модальне вікно реєстрації
            const registerModal = document.getElementById("registerModal")
            if (registerModal) {
              registerModal.classList.remove("hidden", "scale-0")
            }
          }
        })
        .catch((error) => {
          console.error("Помилка при перевірці авторизації:", error)
          showNotification("Сталася помилка при перевірці авторизації", "bg-red-600")
        })
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

  // Отримуємо замовлення з сервера
  function fetchOrders() {
    // Показуємо індикатор завантаження
    ordersContainer.innerHTML = `
      <div class="flex justify-center items-center h-[200px]">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-600"></div>
      </div>
    `

    fetch("/api/get-orders")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          orders = data.orders
          currentPage = 0 // Скидаємо на першу сторінку при отриманні нових замовлень
          displayOrders()
        } else {
          showNotification(data.message || "Помилка при отриманні замовлень", "bg-red-600")
          ordersContainer.innerHTML = '<p class="text-gray-300 text-lg">Не вдалося завантажити замовлення.</p>'
        }
      })
      .catch((error) => {
        console.error("Помилка при отриманні замовлень:", error)
        showNotification("Сталася помилка при отриманні замовлень", "bg-red-600")
        ordersContainer.innerHTML = '<p class="text-gray-300 text-lg">Не вдалося завантажити замовлення.</p>'
      })
  }

  // Відображаємо замовлення з пагінацією
  function displayOrders() {
    if (!ordersContainer) return

    if (!orders || orders.length === 0) {
      ordersContainer.innerHTML = '<p class="text-gray-300 text-lg">У вас поки немає замовлень.</p>'
      return
    }

    // Пагінація
    totalPages = Math.ceil(orders.length / itemsPerPage)
    const start = currentPage * itemsPerPage
    const end = start + itemsPerPage
    const displayedOrders = orders.slice(start, end)

    let ordersHTML = ""

    displayedOrders.forEach((order) => {
      // Форматуємо дату
      const orderDate = new Date(order.created_at)
      const formattedDate = orderDate.toLocaleDateString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })

      // Створюємо картку замовлення
      ordersHTML += `
        <div class="order-item border-b border-gray-600 pb-4 mb-4">
          <div class="flex justify-between items-center mb-2">
            <p class="text-lg font-semibold">Замовлення #${order.id}</p>
            <span class="text-gray-400">${formattedDate}</span>
          </div>
          <div class="mb-2">
            <p class="text-gray-400 mb-1">Склад замовлення:</p>
            <div class="pl-4 border-l-2 border-lime-600">
              ${formatOrderItems(order.items_list)}
            </div>
          </div>
          <div class="flex justify-between items-center">
            <p class="text-gray-300">Статус: <span class="${getStatusClass(order.status)}">${getStatusText(order.status)}</span></p>
            <p class="font-semibold">${order.total_amount} грн</p>
          </div>
        </div>
      `
    })

    // Додаємо пагінацію, якщо є більше однієї сторінки
    if (totalPages > 1) {
      ordersHTML += `
        <div class="flex justify-center items-center gap-4 mt-4">
          <button id="prevOrderPage" class="px-3 py-1 bg-gray-700 rounded-lg ${currentPage === 0 ? "opacity-50 cursor-not-allowed" : ""}">←</button>
          <span id="orderPageInfo">${currentPage + 1} / ${totalPages}</span>
          <button id="nextOrderPage" class="px-3 py-1 bg-gray-700 rounded-lg ${currentPage === totalPages - 1 ? "opacity-50 cursor-not-allowed" : ""}">→</button>
        </div>
      `
    }

    ordersContainer.innerHTML = ordersHTML

    // Додаємо обробники для кнопок пагінації
    if (totalPages > 1) {
      const prevPageBtn = document.getElementById("prevOrderPage")
      const nextPageBtn = document.getElementById("nextOrderPage")

      if (prevPageBtn) {
        prevPageBtn.addEventListener("click", () => {
          if (currentPage > 0) {
            currentPage--
            displayOrders()
          }
        })
      }

      if (nextPageBtn) {
        nextPageBtn.addEventListener("click", () => {
          if (currentPage < totalPages - 1) {
            currentPage++
            displayOrders()
          }
        })
      }
    }
  }

  // Допоміжна функція для форматування списку товарів
  function formatOrderItems(itemsList) {
    // Розділяємо список товарів по комах і створюємо елементи списку
    return itemsList
      .split(", ")
      .map((item) => `<div class="py-1">${item}</div>`)
      .join("")
  }

  // Допоміжна функція для отримання тексту статусу
  function getStatusText(status) {
    switch (status) {
      case "pending":
        return "В обробці"
      case "confirmed":
        return "Підтверджено"
      case "delivered":
        return "Доставлено"
      case "cancelled":
        return "Скасовано"
      default:
        return "Невідомо"
    }
  }

  // Допоміжна функція для отримання класу статусу
  function getStatusClass(status) {
    switch (status) {
      case "pending":
        return "text-yellow-500"
      case "confirmed":
        return "text-blue-500"
      case "delivered":
        return "text-lime-500"
      case "cancelled":
        return "text-red-500"
      default:
        return "text-gray-400"
    }
  }

  // Функція для відображення повідомлень (використовуємо ту ж, що і в basket.js)
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