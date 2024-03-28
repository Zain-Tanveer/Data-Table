import { products } from "./utils/data.js";

class DataTable {
  // constructor
  constructor() {
    this.filteredProducts = products;
    this.checkboxProducts = [];
    this.sortDirection = 1; // Sort direction: 1 for ascending, -1 for descending
    this.sortColumn = ""; // Column to sort

    const tableEl = document.getElementById("data-table");
    const tableBody = document.getElementById("table-body");

    this.renderTable();

    let prevSortable;

    // event listeners

    // for data sorting by clicking headers
    tableEl.querySelectorAll("th.sortable").forEach((th) => {
      th.addEventListener("click", (e) => {
        const sortableEl_id = Object.values(th.dataset)[0];
        this.handleSort(sortableEl_id);

        const upArrow = th.querySelector(".arrow-up");
        const downArrow = th.querySelector(".arrow-down");

        if (prevSortable) {
          prevSortable.style.opacity = 0.5;
        }

        if (this.sortDirection === 1) {
          upArrow.style.opacity = 1;
          downArrow.style.opacity = 0.5;
          prevSortable = upArrow;
        } else {
          upArrow.style.opacity = 0.5;
          downArrow.style.opacity = 1;
          prevSortable = downArrow;
        }
      });
    });

    // for select box to select a row
    tableBody.querySelectorAll(".selectBox").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const product_id = checkbox.getAttribute("data-id").split("-")[1];
        console.log(typeof product_id);
        if (checkbox.checked) {
          this.checkboxProducts.push(
            this.filteredProducts.find(
              (product) => product.id === parseInt(product_id)
            )
          );
          console.log(this.checkboxProducts);
          this.renderSelectProducts();
        } else {
          this.checkboxProducts = this.checkboxProducts.filter(
            (product) => product.id !== parseInt(product_id)
          );
          this.renderSelectProducts();
        }
      });
    });

    // for filtering data
    const searchEl = document.getElementById("search-text");
    const filterOptionsEl = document.getElementById("filter-options");
    searchEl.addEventListener("keyup", () => {
      const filterBy = filterOptionsEl.value;
      const searchValue = searchEl.value;

      if (searchValue !== "") {
        const filterProducts = this.filteredProducts.filter((product) => {
          if (typeof product[filterBy] === "string") {
            return product[filterBy]
              .toLowerCase()
              .includes(searchValue.toLowerCase());
          } else {
            return product[filterBy].toString().includes(searchValue);
          }
        });

        this.renderTable(filterProducts);
      } else {
        this.renderTable();
      }
    });

    filterOptionsEl.addEventListener("change", () => {
      searchEl.value = "";
    });
  }

  // function for rendering table
  renderTable(products = this.filteredProducts) {
    const tbodyEl = document.getElementById("table-body");
    tbodyEl.innerHTML = "";

    for (let [index, product] of products.entries()) {
      const tr = document.createElement("tr");
      const checkboxEl = DataTable.#createCheckbox(product.id);

      tr.appendChild(checkboxEl);

      for (let key in product) {
        const td = document.createElement("td");
        td.textContent = product[key];

        if (key === "title") {
          td.classList.add("title");
        }
        if (key === "description") {
          td.classList.add("description");
        }

        tr.appendChild(td);
      }

      let actionsTd;

      if (
        index > this.filteredProducts.length - 4 &&
        this.filteredProducts.length > 6
      ) {
        actionsTd = DataTable.#createActions(true);
      } else {
        actionsTd = DataTable.#createActions();
      }

      tr.appendChild(actionsTd);

      tbodyEl.appendChild(tr);
    }
  }

  renderSelectProducts() {
    const selectedProductsDiv = document.getElementById("selected-products");
    selectedProductsDiv.innerHTML = "";
    this.checkboxProducts.forEach((product) => {
      selectedProductsDiv.innerHTML += `<p class="selected-product">${product.id} , ${product.name} , ${product.title}</p>`;
    });
  }

  // handle sorting
  handleSort(column) {
    if (column === this.sortColumn) {
      this.sortDirection = -this.sortDirection;
    } else {
      this.sortColumn = column;
      this.sortDirection = -1;
    }

    this.filteredProducts.sort((a, b) => {
      let valueA = a[column];
      let valueB = b[column];

      if (typeof valueA === "string") {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      if (valueA < valueB) {
        return -this.sortDirection;
      }
      if (valueA > valueB) {
        return this.sortDirection;
      }

      return 0;
    });

    this.renderTable();
  }

  // function for creating the checkbox td
  static #createCheckbox(data_id) {
    const td = document.createElement("td");
    td.classList.add("fixed-column");

    const inputEl = document.createElement("input");
    inputEl.setAttribute("type", "checkbox");
    inputEl.classList.add("selectBox");
    inputEl.setAttribute("data-id", `selectbox-${data_id}`);

    td.appendChild(inputEl);

    return td;
  }

  // function for creating actions dropdown
  static #createActions(bottomEl = false) {
    const td = document.createElement("td");
    td.classList.add("actions");

    const dropdownDiv = document.createElement("div");
    dropdownDiv.classList.add("dropdown");

    const buttonEl = document.createElement("button");
    buttonEl.classList.add("dropdownButton");
    const buttonI = document.createElement("i");
    buttonI.classList.add("fa", "fa-ellipsis-v", "dropIcon");
    buttonEl.appendChild(buttonI);

    const dropdownContentDiv = document.createElement("div");
    dropdownContentDiv.classList.add("dropdown-content");

    const vendorAnchor = DataTable.#createActionAnchors(
      "Add Vendor",
      "vendor",
      ["fa", "fa-user-plus", "vendorIcon"]
    );
    const addAnchor = DataTable.#createActionAnchors(
      "Add Product",
      "addProduct",
      ["fa", "fa-plus", "addIcon"]
    );
    const editAnchor = DataTable.#createActionAnchors(
      "Edit Product",
      "editProduct",
      ["fa", "fa-edit", "editIcon"]
    );

    dropdownContentDiv.appendChild(vendorAnchor);
    dropdownContentDiv.appendChild(addAnchor);
    dropdownContentDiv.appendChild(editAnchor);

    if (bottomEl) {
      dropdownDiv.classList.add("dropdown-bottom");
      buttonEl.classList.add("dropdownButton-bottom");
      dropdownContentDiv.classList.add("dropdown-content-bottom");
    }

    dropdownDiv.appendChild(buttonEl);
    dropdownDiv.appendChild(dropdownContentDiv);

    td.appendChild(dropdownDiv);
    return td;
  }

  // function for creating anchor elements of dropdown-content
  static #createActionAnchors(text, className, iconClasses = []) {
    const anchorEl = document.createElement("a");
    anchorEl.classList.add(className);

    const spanEl = document.createElement("span");
    spanEl.textContent = text;

    const anchorI = document.createElement("i");
    anchorI.classList.add(...iconClasses);

    anchorEl.appendChild(spanEl);
    anchorEl.appendChild(anchorI);

    return anchorEl;
  }
}

new DataTable();
