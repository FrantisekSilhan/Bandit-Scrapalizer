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
      div.style.justifyContent = "flex-end";
      div.style.alignItems = "center";
      item.addEventListener("mouseenter", async (event) => {
        event.stopPropagation();
        const supplyInfo = item.querySelector(".ml-1.lh-1.mt-1.font-weight-bold.green200--text");
        if (supplyInfo && supplyInfo.innerText.includes("%")) return;

        const itemName = item.querySelector(".name").innerText;
        const itemScrapPrice = item.querySelector("div.price .lh-1.font-weight-bold").innerText.replace(/,/g, '');
  
        const response = await fetch(`https://db.rust.xdd.moe/api/item?item=${encodeURIComponent(itemName)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
  
        let itemPrice = 0;
  
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            itemPrice = data.data.sell_price;
          }
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
          return;
        }

        const steamPriceWithoutFee = Math.floor(((itemPrice / 100) / 1.15 + (itemPrice <= 15 ? 0 : 0.01)) * 100) / 100;
        const percentage = Math.round((steamPriceWithoutFee / itemScrapPrice) * 100);

        infoElement.innerText = `(${percentage}%) $${steamPriceWithoutFee}`
  
        div.appendChild(infoElement);

        const supplyInfoClone = supplyInfo.cloneNode(true);
        supplyInfo.style.setProperty("color", "white", "important");
        supplyInfo.style.backgroundColor = "black";
        supplyInfo.style.padding = "4px";
        supplyInfo.style.fontSize = "12px";
        supplyInfo.innerText = `(${percentage}%)`;
        supplyInfo.parentNode.appendChild(supplyInfoClone);
      });
      return div;
    };

    const infoElement = document.createElement("div");
    item.style.position = "relative";
    infoElement.style.position = "absolute";
    infoElement.style.inset = "0";
    infoElement.style.pointerEvents = "none";
    infoElement.style.zIndex = "9999";
    infoElement.style.border = "1px solid lightblue";
    item.appendChild(infoElement);

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
