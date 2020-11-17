//  spreads the console operator.
const { log, clear, dir } = console;
// DATA CLASS
class MenuItem {
  // Function to make IDs do not panic about this one it makes random numbers.
  static uuidv4() {
    return "xxxxxxxx-xxxx-xxxx-xxx-xxxxxxxxxxxx".replace(/[x]/g, function (c) {
      let r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // builds the object using the data passed to the object
  constructor(data) {
    const { name, address, telephone, email, contacts = [] } = data;

    this._id = MenuItem.uuidv4();
    this.name = name;
    this.address = address;
    this.telephone = telephone;
    this.email = email;
    this.contacts = contacts;
  }
}

// APPLICATION CLASS
class Menu {
  #items = []; // Now a private field, so you can't tamper with it from outside this class
  constructor(itemsDataArray = []) {
    if (!Array.isArray(itemsDataArray)) {
      throw new Error(
        `Items must be an array. Received ${itemsDataArray} (${typeof itemsDataArray})`
      );
    }
    // loop through the array that gets passed as an argument and for every item inside, create a new instance of the "MenuItem" class.
    for (const itemData of itemsDataArray) {
      this.#items.push(new MenuItem(itemData));
    }
  }

  // GET an item record's INDEX (by id)
  getItemIndex(id) {
    if (typeof id === "undefined") {
      throw new Error(`An id must be provided to getItemIndex`);
    }
    if (typeof id !== "string") {
      throw new Error(
        `The id provided to getItemIndex must be a string. Received ${id}(${typeof id})`
      );
    }
    const index = this.#items.findIndex((item) => {
      return item._id === id;
    });

    if (!~index) {
      log(`Item with _id of ${id} not found`);
    }
    return index;
  }

  // Uses the id to pull up the contact's details
  getItem(id) {
    const index = this.getItemIndex(id);
    if (!~index) {
      // ~ is a bitwise operator, here it turns -1 into 0. It's just a short-cut
      return null; // so null is returned if the record is not found
    }
    // if you do find the index
    const targetItem = this.#items[index];
    return { ...targetItem }; // return a copy, so it can't be affected outside
  }

  // GET ALL items
  getAllItems() {
    return this.#items.slice(); // return a copy, so it can't be affected outside
  }

  // CREATE an item
  addItem(itemData) {
    // Check if data provided
    if (!itemData) {
      throw new Error(`No data provided to addItem: received ${itemData}`);
    }

    // Create a new item
    const newItem = new MenuItem(itemData);

    // push it into our internal array
    this.#items.push(newItem);

    // Return the finished product for reference
    return { ...newItem };
  }

  // UPDATE an item
  updateItem(id, updates = {}) {
    // Check id is correct
    if (!id) {
      throw new Error(
        "An id of the item you want to change must be provided to updateItem"
      );
    }
    if (typeof id !== "string") {
      throw new Error(`id must be a string. Received ${id}(${typeof id})`);
    }

    // Get old item
    const targetItemIndex = this.getItemIndex(id);
    const targetItem = this.#items[targetItemIndex];

    // Notify if not found (This should not happen, hence the error rather than just returning...)
    if (!targetItem) {
      throw new Error(`Item not found`);
    }

    // Create a new Item to validate
    const updatedItem = new MenuItem({ ...targetItem, ...updates });

    // Remove the old and insert the new
    // qw could do this.#items[targetIndex] = updatedItem and it would be faster, BUT for practice...
    this.#items.splice(targetItemIndex, 1, updatedItem);

    return { ...updatedItem }; // before returning the new item
  }

  // DELETE an item
  removeItem(id) {
    if (!id) {
      throw new Error(`No id provided to removeItem: received ${id}`);
    }
    const index = this.getItemIndex(id);
    if (!~index) {
      return null; // throw err
    }
    this.#items.splice(index, 1);

    return [...this.#items];
  }
  removeAllItems() {
    this.#items = [];
  }
}

const rawData = [
  {
    name: "Acer.com",
    address: "76 John Street London",
    telephone: "01234666333",
    email: "acer@acer.com",
    contacts: "Jon Smith",
  },
  {
    name: "Sprint.com",
    address: "777 Manchester Road Leeds",
    telephone: "04443666777",
    email: "alice@sprint.com",
    contacts: "Virginie Charter",
  },
  {
    name: "Marker.com",
    address: "45 South Wales Road Bristol",
    telephone: "06543888777",
    email: "mary@marker.com",
    contacts: "Marius Lucius",
  },
];

// The above ^^ would be imported from another file. It is the raw programming. Now let's hook it up to the DOM

const menu = new Menu(rawData);
log("menu", menu);

// launching the "app" by creating the parent class

const mountNode = document.getElementById("listMount");
const itemForm = document.forms["itemForm"];

const noItemsHTML = "<p>No items to display</p>";

function render(items = menu.getAllItems(), domTargetNode = mountNode) {
  if (!items.length) {
    return (domTargetNode.innerHTML = noItemsHTML);
  }

  const list = document.createElement("ul");

  for (const item of items) {
    const li = document.createElement("li");
    li.classList.add("list-group-item");
    li.innerHTML = `
    <span class="name">${item.name} ${""}</span><span class="price">${
      item.email
    }
    </span>
    <div class="controls">
      <button class="btn btn-warning update" data-id="${
        item._id
      }"><span class="sr-only">Edit</span><i class="far fa-edit"></i></button>
      <button class="btn btn-danger delete" data-id="${
        item._id
      }"><span class="sr-only">Delete</span><i class="far fa-trash-alt"></i></button>
    </div>`;
    list.append(li);
  }
  mountNode.innerHTML = "";
  mountNode.append(list);
}
// calling the function that was just written
render();
// calls the function below
updateUIMode();
// switches between update and add mode on the form
function updateUIMode(selector = ".action-type", text = "Add") {
  const nodes = document.querySelectorAll(selector);
  console.log("nodes", nodes, selector);
  for (const node of nodes) {
    node.textContent = text;
  }
}
// DOM things
mountNode.addEventListener("click", (e) => {
  const { target } = e;
  if (!target) return;
  const btn = target.closest("button");
  if (!btn) return;

  const id = btn.dataset.id;

  const wasDeleteClick = btn.matches(".delete");
  const wasUpdateClick = btn.matches(".update");

  if (wasDeleteClick) {
    console.log(`id for deletion: ${id}`);
    menu.removeItem(id);
    const item = target.closest("li");
    const list = item.parentElement;

    item.remove();

    if (!list.children.length) {
      render();
    }
  } else if (wasUpdateClick) {
    console.log(`id for update: ${id}`);
    console.log("item", menu.getItem(id));
    populate(itemForm, menu.getItem(id));
    updateUIMode(undefined, "Update");
  }
});

itemForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = serialize(itemForm);
  data.contacts = data.contacts.split(",").map((item) => item.trim());
  if (data._id) {
    console.log("updating", data);
    // data.contacts = data.contacts.split(",").forEach((item) => item.trim());
    menu.updateItem(data._id, data);
    updateUIMode(); // Reset UI
  } else {
    console.log("add data", data);
    delete data._id;
    // data.contacts = data.contacts.split(",").forEach((item) => item.trim());
    menu.addItem(data);
  }
  // itemForm.reset();
  clearForm(itemForm);
  render();
});

/*************************************************************
 * UTILITIES
 **************************************************************/

/**
 * Populate form fields from a JSON object.
 *
 * @param form object The form element containing your input fields.
 * @param data object that has the data in
 */
// if edit is pressed populate the add form and switch mode to edit
function populate(form, data) {
  // walk the object
  for (const key in data) {
    // if this is a system property then bail...
    if (!data.hasOwnProperty(key)) {
      continue;
    }

    // get key/value for inputs
    let name = key;
    let value = data[key];

    // Make any bad values an empty string
    if (!value && typeof value !== "number") {
      value = "";
    }

    // try to find element in the form
    const element = form.elements[name];

    // If we can't then bail
    if (!element) {
      continue;
    }
    // NO CHECKBOXES UNUSED ATM
    // see what type an element is to handle the process differently
    const type = element.type || element[0].type;

    switch (type) {
      case "checkbox": {
        // Here, value is an array of values to be spread across the checkboxes that make up this input. It's the value of the input as a whole, NOT the value of one checkbox.
        const values = Array.isArray(value) ? value : [value];

        for (let j = 0, len = element.length; j < len; j += 1) {
          const thisCheckbox = element[j];
          if (values.includes(thisCheckbox.value)) {
            thisCheckbox.checked = true;
          }
        }
        break;
      }
      case "select-multiple": {
        const values = Array.isArray(value) ? value : [value];

        for (let k = 0, len = element.options.length; k < len; k += 1) {
          const thisOption = element.options[k];
          if (values.includes(thisOption.value)) {
            thisOption.selected = true;
          }
        }
        break;
      }
      // case "select":
      // case "select-one":
      //   element.value = value.toString() || value;
      //   break;

      // case "date":
      //   element.value = new Date(value).toISOString().split("T")[0];
      //   break;

      // text boxes
      default:
        // Special line to cope with tags being an array
        if (Array.isArray(value)) {
          value = value.join(", ");
        }
        element.value = value;
        break;
    }
  }
}
// not used
function serialize(form) {
  // get most things
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  // Get full values for checkboxes & multi-selects
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const fullData = formData.getAll(key);
      if (fullData.length > 1) {
        data[key] = fullData;
      }
    }
  }
  console.log("data", data);
  return data;
}

function clearForm(form) {
  form.reset();
  const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
  for (const input of hiddenInputs) {
    input.value = "";
  }
}

// // You can create objects alone
// const firstItem = new MenuItem({});

// console.log("firstItem", firstItem);

// // Or you can create a menu with objects in it
// const rawData = [
//   {
//     name: "thing",
//     price: 200
//   },
//   {
//     name: "thing2",
//     price: 550
//   }
// ];

// const firstMenu = new Menu(rawData);

// // CREATE
// const added = firstMenu.addItem({
//   name: "spag bol"
// });

// // READ
// console.log(firstMenu.getAllItems());

// // UPDATE
// firstMenu.updateItem(added._id, { name: "spag bol2" });

// // DELETE
// firstMenu.removeItem(added._id);

// console.log(firstMenu.getAllItems());
