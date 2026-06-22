/* Fazenda da Cascata: navegação, galerias e lightbox */
(function () {
  "use strict";

  /* ---------- Menu mobile ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var aberto = nav.classList.toggle("aberto");
      toggle.setAttribute("aria-expanded", aberto ? "true" : "false");
    });
  }

  /* ---------- Renderização das galerias ---------- */
  var container = document.getElementById("galerias-container");
  if (container && window.GALERIAS) {
    var indice = document.getElementById("galerias-indice");
    window.GALERIAS.forEach(function (g) {
      if (!g.itens || !g.itens.length) return;

      if (indice) {
        var link = document.createElement("a");
        link.href = "#tema-" + g.tema;
        link.textContent = g.label + " (" + g.itens.length + ")";
        indice.appendChild(link);
      }

      var sec = document.createElement("section");
      sec.className = "galeria-tema";
      sec.id = "tema-" + g.tema;

      var cab = document.createElement("div");
      cab.className = "galeria-cabecalho";
      var h2 = document.createElement("h2");
      h2.textContent = g.label;
      var cont = document.createElement("span");
      cont.className = "contagem";
      cont.textContent = g.itens.length + " itens";
      cab.appendChild(h2);
      cab.appendChild(cont);

      var grid = document.createElement("div");
      grid.className = "galeria-grid";
      grid.setAttribute("data-lb-group", g.tema);

      g.itens.forEach(function (it) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "galeria-item";
        btn.setAttribute("data-lb", "");
        btn.setAttribute("data-tipo", it.tipo);
        btn.setAttribute("data-full", it.full);
        btn.setAttribute("data-caption", it.caption || g.label);
        if (it.poster) btn.setAttribute("data-poster", it.poster);

        var img = document.createElement("img");
        img.src = it.thumb;
        img.loading = "lazy";
        img.alt = it.caption || g.label;
        btn.appendChild(img);

        if (it.tipo === "video") {
          var play = document.createElement("span");
          play.className = "play";
          var bolha = document.createElement("span");
          play.appendChild(bolha);
          btn.appendChild(play);
        }
        grid.appendChild(btn);
      });

      sec.appendChild(cab);
      sec.appendChild(grid);
      container.appendChild(sec);
    });
  }

  /* ---------- Lightbox ---------- */
  var overlay = document.createElement("div");
  overlay.className = "lightbox";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.innerHTML =
    '<button class="lb-btn lb-fechar" aria-label="Fechar">&times;</button>' +
    '<button class="lb-btn lb-ant" aria-label="Anterior">&#8249;</button>' +
    '<button class="lb-btn lb-prox" aria-label="Próximo">&#8250;</button>' +
    '<div class="lightbox-midia"></div>' +
    '<div class="lightbox-legenda"></div>';
  document.body.appendChild(overlay);

  var midia = overlay.querySelector(".lightbox-midia");
  var legenda = overlay.querySelector(".lightbox-legenda");
  var btnFechar = overlay.querySelector(".lb-fechar");
  var btnAnt = overlay.querySelector(".lb-ant");
  var btnProx = overlay.querySelector(".lb-prox");

  var grupoAtual = [];
  var indiceAtual = 0;
  var ultimoFoco = null;

  function montaItem(el) {
    return {
      tipo: el.getAttribute("data-tipo"),
      full: el.getAttribute("data-full"),
      poster: el.getAttribute("data-poster"),
      caption: el.getAttribute("data-caption") || ""
    };
  }

  function mostra(i) {
    if (i < 0) i = grupoAtual.length - 1;
    if (i >= grupoAtual.length) i = 0;
    indiceAtual = i;
    var item = grupoAtual[i];
    midia.innerHTML = "";
    if (item.tipo === "video") {
      var v = document.createElement("video");
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      if (item.poster) v.poster = item.poster;
      var s = document.createElement("source");
      s.src = item.full;
      s.type = "video/mp4";
      v.appendChild(s);
      midia.appendChild(v);
    } else {
      var img = document.createElement("img");
      img.src = item.full;
      img.alt = item.caption;
      midia.appendChild(img);
    }
    legenda.textContent = item.caption;
    var unico = grupoAtual.length < 2;
    btnAnt.style.display = unico ? "none" : "flex";
    btnProx.style.display = unico ? "none" : "flex";
  }

  function abre(el) {
    var grupoNome = el.closest("[data-lb-group]");
    var seletor = grupoNome
      ? '[data-lb-group="' + grupoNome.getAttribute("data-lb-group") + '"] [data-lb]'
      : "[data-lb]";
    var nodes = Array.prototype.slice.call(document.querySelectorAll(seletor));
    grupoAtual = nodes.map(montaItem);
    var idx = nodes.indexOf(el);
    ultimoFoco = el;
    overlay.classList.add("aberto");
    document.body.style.overflow = "hidden";
    mostra(idx < 0 ? 0 : idx);
    btnFechar.focus();
  }

  function fecha() {
    overlay.classList.remove("aberto");
    midia.innerHTML = "";
    document.body.style.overflow = "";
    if (ultimoFoco) ultimoFoco.focus();
  }

  document.addEventListener("click", function (e) {
    var alvo = e.target.closest("[data-lb]");
    if (alvo) {
      e.preventDefault();
      abre(alvo);
    }
  });

  btnFechar.addEventListener("click", fecha);
  btnAnt.addEventListener("click", function () { mostra(indiceAtual - 1); });
  btnProx.addEventListener("click", function () { mostra(indiceAtual + 1); });
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) fecha();
  });
  document.addEventListener("keydown", function (e) {
    if (!overlay.classList.contains("aberto")) return;
    if (e.key === "Escape") fecha();
    else if (e.key === "ArrowLeft") mostra(indiceAtual - 1);
    else if (e.key === "ArrowRight") mostra(indiceAtual + 1);
  });
})();
