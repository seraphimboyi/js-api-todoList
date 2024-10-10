const apiUrl = "https://todoo.5xcamp.us";

document.addEventListener("DOMContentLoaded", () => {
  // 獲取 DOM 元素
  const addTodoInput = document.getElementById("new-todo-input");
  const addTodoButton = document.getElementById("add-todo-btn");

  // 當按鈕被點擊時新增待辦事項
  addTodoButton.addEventListener("click", () => {
    const todoContent = addTodoInput.value.trim(); // 獲取輸入框的值並去除前後空白

    if (todoContent) {
      addTodo(todoContent); // 調用 addTodo 函數新增待辦事項
      addTodoInput.value = ""; // 清空輸入框
    } else {
      alert("請輸入待辦事項內容！"); // 如果輸入框為空，提示用戶
    }
  });

  // 新增待辦事項函數
  function addTodo(todo) {
    axios
      .post(`${apiUrl}/todos`, {
        todo: {
          content: todo,
        },
      })
      .then((res) => {
        console.log(res);
        // 在成功新增待辦事項後，你可以在這裡調用函數更新 UI，例如重新獲取待辦事項列表
        getTodo(); // 獲取最新的待辦事項
      })
      .catch((err) => {
        console.error(err.response);
        alert(`新增待辦事項失敗：${err.response.data.error}`);
      });
  }
});

function logout() {
  localStorage.removeItem("Authorization");
  delete axios.defaults.headers.common["Authorization"];
  alert("登出成功！");
  // window.location.href = "https://seraphimboyi.github.io/js-api-todoList/";
  window.location.href = "../index.html";
}

function signUp(email, nickname, password) {
  axios
    .post(`${apiUrl}/users`, {
      user: {
        email: email,
        nickname: nickname,
        password: password,
      },
    })
    .then((res) => {
      alert(`${res.data.message}`);
      console.log(res);
    })
    .catch((error) => {
      console.error("註冊失敗：", error.response);
      alert(`註冊失敗：${error.response.data.error}`);
    });
}
function login(email, password) {
  axios
    .post(`${apiUrl}/users/sign_in`, {
      user: {
        email: email,
        password: password,
      },
    })
    .then((res) => {
      const token = res.headers.authorization;
      axios.defaults.headers.common["Authorization"] = token;
      localStorage.setItem("Authorization", token);
      localStorage.setItem("nickname", res.data.nickname);
      alert("登入成功!");

      // 更新顯示的暱稱
      updateNickname(res.data.nickname);

      signUpForm.classList.add("none");
      loginForm.classList.add("none");
      document.querySelector(".todoList").classList.remove("none");
      getTodo();
    })
    .catch((error) => {
      console.error("登入失敗：", error.response);
      alert(`登入失敗：${error.response.data.message}`);
    });
}

// 更新顯示的暱稱
function updateNickname(nickname) {
  const headerLi = document.querySelector(".header-li"); // 獲取 header-li 元素
  if (headerLi) {
    headerLi.textContent = `${nickname}的代辦`; // 更新內容
  }
}

function getTodo() {
  axios
    .get(`${apiUrl}/todos`)
    .then((res) => {
      const todos = res.data.todos;
      const todoList = document.getElementById("todo-list");
      const emptyContent = document.querySelector(".empty-content");
      const checklistContainer = document.querySelector(".checklist-container");
      todoList.innerHTML = "";

      // 檢查是否有待辦事項，如果沒有則顯示 empty-content，否則隱藏
      if (todos.length === 0) {
        emptyContent.classList.remove("none"); // 顯示 empty-content
        checklistContainer.classList.add("none");
      } else {
        emptyContent.classList.add("none"); // 隱藏 empty-content
        checklistContainer.classList.remove("none");
      }

      // 渲染待辦事項到列表
      todos.forEach((todo) => {
        const li = document.createElement("li");
        li.className = "todo-item";

        li.innerHTML = `
          <div class="todo-item-left">
            <input type="checkbox" class="checkbox" id="task-${todo.id}" ${
          todo.completed_at ? "checked" : ""
        } />
            <label for="task-${todo.id}" class="custom-checkbox">
              <span class="text">${todo.content}</span>
            </label>
          </div>
          <a href="#" class="delete-btn" data-id="${todo.id}">
            <img src="./img/delete.png" alt="Delete Icon" />
          </a>
        `;
        todoList.appendChild(li); // 將新生成的 li 元素添加到列表中

        // 添加 checkbox 的事件監聽器
        const checkbox = li.querySelector(".checkbox");
        checkbox.addEventListener("change", () => {
          toggleTodo(todo.id);

          const text = li.querySelector(".text");
          if (checkbox.checked) {
            text.classList.add("completed");
          } else {
            text.classList.remove("completed");
          }
        });

        if (todo.completed_at) {
          const text = li.querySelector(".text");
          text.classList.add("completed");
        }
      });

      // 計算未完成的待辦事項數量
      const incompleteCount = todos.filter((todo) => !todo.completed_at).length; // 根據 completed_at 判斷未完成的項目
      // 更新待辦項目數量顯示
      document.querySelector(
        ".todo-count"
      ).textContent = `${incompleteCount} 個待完成項目`;
    })
    .catch((err) => console.log(err));
}

// 計算未完成項目數量並更新顯示的函數
function updateTodoCount() {
  // 獲取所有的 checkbox 元素
  const checkboxes = document.querySelectorAll(".checkbox");

  // 計算未打勾（未完成）的項目數量
  let incompleteCount = 0;
  checkboxes.forEach((checkbox) => {
    if (!checkbox.checked) {
      incompleteCount++;
    }
  });

  // 更新待辦項目數量
  document.querySelector(
    ".todo-count"
  ).textContent = `${incompleteCount} 個待完成項目`;
}
// 當 DOM 加載完成後，獲取所有的刪除按鈕並添加事件監聽器
document.addEventListener("DOMContentLoaded", () => {
  getTodo(); // 獲取待辦事項
  // 檢查 localStorage 中的 nickname 並更新 UI
  const nickname = localStorage.getItem("nickname");
  if (nickname) {
    updateNickname(nickname); // 更新顯示的暱稱
  }

  // 監聽待辦事項列表的點擊事件
  document.getElementById("todo-list").addEventListener("click", (event) => {
    if (event.target.closest(".delete-btn")) {
      const todoId = event.target.closest(".delete-btn").dataset.id; // 獲取待辦事項的 ID
      deleteTodo(todoId); // 調用刪除函數
    }
  });
});

// 刪除待辦事項的函數
function deleteTodo(todoId) {
  axios
    .delete(`${apiUrl}/todos/${todoId}`)
    .then((res) => {
      alert("待辦事項已刪除！");
      getTodo();
    })
    .catch((err) => console.log(err.response));
}

function toggleTodo(todoId) {
  axios
    .patch(`${apiUrl}/todos/${todoId}/toggle`, {})
    .then((res) => {
      console.log(res);
      updateTodoCount(); // 在切換狀態後更新待辦事項數量
    })
    .catch((err) => console.log(err.response));
}

// 監聽清除已完成項目按鈕的點擊事件
document.addEventListener("DOMContentLoaded", () => {
  const clearCompletedButton = document.querySelector(".clear-completed");

  clearCompletedButton.addEventListener("click", async () => {
    const checkboxes = document.querySelectorAll(".checkbox");

    // 將所有已勾選的待辦項目變成未完成
    for (const checkbox of checkboxes) {
      if (checkbox.checked) {
        const todoId = checkbox.id.split("-")[1]; // 獲取待辦項目的 ID
        await uncheckTodo(todoId);
      }
    }
    getTodo(); // 所有請求完成後，重新獲取待辦事項
  });
});

// 將已勾選的待辦事項設置為未完成的函數
async function uncheckTodo(todoId) {
  try {
    await axios.patch(`${apiUrl}/todos/${todoId}/toggle`, {});
  } catch (err) {
    console.log(err.response);
  }
}
