let items = Array.from(document.querySelectorAll(".item"));
addItems(items);

const observerConfig = { childList: true, subtree: true };

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "childList") {
      const addedItems = Array.from(mutation.addedNodes)
        .filter((node) => node.nodeType === Node.ELEMENT_NODE && node.classList.contains("item"));
      if (addedItems.length > 0) {
        items = items.concat(Array.from(addedItems));
        addItems(items);
      }
    }
  });
});
observer.observe(document.body, observerConfig);

function reloadItems() {
  items = items.concat(Array.from(document.querySelectorAll(".item")).filter((item) => !items.includes(item)));
  addItems(items);
}

const reloadButton = document.createElement("button");
reloadButton.innerHTML = "Reload Scrapalizer";
reloadButton.style.backgroundColor = "lightblue";
reloadButton.style.color = "black";
reloadButton.style.fontWeight = "bold";
reloadButton.style.font = "open-sans";
reloadButton.style.borderRadius = "5px";
reloadButton.style.position = "fixed";
reloadButton.style.bottom = "10px";
reloadButton.style.right = "10px";
reloadButton.style.zIndex = "9999";
reloadButton.style.padding = "5px";
reloadButton.addEventListener("click", reloadItems);
document.body.appendChild(reloadButton);

function addItems(items) {
  items.forEach((item) => {
    if (item.querySelector(".scrapalizer-info")) return;

    const addListeners = () => {
      const div = document.createElement("div");
      div.classList.add("scrapalizer-info");
      div.style.display = "flex";
      div.style.justifyContent = "space-between";
      div.style.alignItems = "center";
      const button = document.createElement("button");
      div.appendChild(button);
      button.innerHTML = "Sc";
      button.style.backgroundColor = "lightblue";
      button.style.color = "black";
      button.style.fontWeight = "bold";
      button.style.borderRadius = "5px";
      button.addEventListener("click", async (event) => {
        event.stopPropagation();
        const itemName = item.querySelector(".name").innerText;
        const itemScrapPrice = item.querySelector("div.price .lh-1.font-weight-bold").innerText.replace(/,/g, '');
        button.style.backgroundColor = "red";
  
        const response = await fetch(`https://rust.xdd.moe/api/item?item=${itemName}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
  
        let itemPrice = 0;
  
        if (response.ok) {
          const data = await response.json();
          itemPrice = data.price;
        }
  
        let infoElement = div.querySelector("p");
  
        if (!infoElement) {
          infoElement = document.createElement("p");
          infoElement.style.color = "lightblue";
          infoElement.style.fontWeight = "bold";
          infoElement.style.margin = "0";
          infoElement.style.fontSize = "12px";
        }
  
        if (itemPrice === 0) {
          infoElement.innerText = "N/A";
          div.appendChild(infoElement);
          button.style.backgroundColor = "lightblue";
          return;
        }

        const steamPriceWithoutFee = Math.floor(((itemPrice / 100) / 1.15 + (itemPrice <= 15 ? 0 : 0.01)) * 100) / 100;

        infoElement.innerText = `(${Math.round((steamPriceWithoutFee / itemScrapPrice) * 100)}%) $${steamPriceWithoutFee}`
  
        div.appendChild(infoElement);
        button.style.backgroundColor = "lightblue";

      });
      return div;
    }

    let meta = item.querySelector(".meta");
    if (!meta) {
      const timeout = setTimeout(() => {
        meta = item.querySelector(".meta");
        if (meta) {
          meta.appendChild(addListeners());
          meta.style.justifyContent = "flex-end";
          clearTimeout(timeout);
        }
      }, 100);
    } else {
      meta.appendChild(addListeners());
      meta.style.justifyContent = "flex-end";
    }
  });
}
