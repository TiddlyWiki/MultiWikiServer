//https://html.spec.whatwg.org/dev/indices.html
const tables = Array.from(document.getElementsByTagName("table"))
tables.forEach(e => {
  if(e.querySelector("caption")?.innerText.startsWith("List of elements")) {
    e.querySelectorAll("tbody > tr").forEach(tr => {
      const cells = [];
      for(const td of tr.children) {
        let res = "";
        for(const e of td.childNodes) {
          if(e.nodeType === e.ELEMENT_NODE) res += `{@linkcode ${e.innerText}}`
          else if(e.nodeType === e.TEXT_NODE) res += e.textContent.split("\n").map(e => e.trim()).join(" ");
        }
        cells.push(res.trim());
      }
      console.log(cells.join(" | "));
    });
  }
});

tables.forEach(e => {
  if(e.querySelector("caption")?.innerText.startsWith("List of attributes")) {
    e.querySelectorAll("tbody > tr").forEach(tr => {
      const cells = [];
      for(const td of tr.children) {
        let res = "";
        for(const e of td.childNodes) {
          if(e.nodeType === e.ELEMENT_NODE) res += `{@linkcode ${e.innerText}}`
          else if(e.nodeType === e.TEXT_NODE) res += e.textContent.split("\n").map(e => e.trim()).join(" ");
        }
        cells.push(res.trim());
      }
      console.log(cells.join(" | "));
    });
  }
});
