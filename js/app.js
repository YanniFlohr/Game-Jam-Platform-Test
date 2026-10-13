(function(){

  "use strict";


  /* =========================================================
     CONFIG
  ========================================================= */

  var M = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  var ORDER = {
    live: 0,
    up: 1,
    end: 2
  };


  /* =========================================================
     HELPERS
  ========================================================= */

  var $ = function(id){
    return document.getElementById(id);
  };


  var col = function(h){
    return "hsl(" + h + " 70% 88%)";
  };


  var date = function(value){
    return new Date(value + "T00:00:00Z");
  };


  var formatDate = function(value){

    var d = date(value);

    return M[d.getUTCMonth()] + " " + d.getUTCDate();

  };


  var formatFullDate = function(value){

    var d = date(value);

    return M[d.getUTCMonth()] + " " +
      d.getUTCDate() + ", " +
      d.getUTCFullYear();

  };


  var escapeHTML = function(value){

    return String(value)
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");

  };


  /* =========================================================
     STATUS
  ========================================================= */

  function updateStatuses(){

    var now = Date.now();

    J.forEach(function(j){

      var start = date(j.a);

      var end = new Date(j.z + "T18:00:00Z");

      j.end = end.toISOString();

      if(now < start){

        j.s = "up";

      }
      else if(now < end){

        j.s = "live";

      }
      else{

        j.s = "end";

      }

      if(j.s === "up"){

        j.when = "Starts " + formatDate(j.a);

      }
      else if(j.s === "live"){

        j.when = "Ends " + formatDate(j.z);

      }
      else{

        j.when = "Ended " + formatDate(j.z);

      }

    });


    J.sort(function(a,b){

      if(ORDER[a.s] !== ORDER[b.s]){

        return ORDER[a.s] - ORDER[b.s];

      }

      if(a.s === "up"){

        return date(a.a) - date(b.a);

      }

      return date(b.z) - date(a.z);

    });

  }


  updateStatuses();


  /* =========================================================
     STATE
  ========================================================= */

  var cur = new URLSearchParams(location.search).get("jam") || "all";

  var tab = "Entries";

  var filter = "all";

  var commandIndex = 0;

  var favourites = JSON.parse(
    localStorage.getItem("nanogram-jam-favourites") || "[]"
  );


  /* =========================================================
     DOM
  ========================================================= */

  var pg = $("pg");

  var navEl = $("nav");

  var dlg = $("dlg");

  var dc = $("dc");

  var commandDialog = $("commandDialog");

  var commandInput = $("commandInput");

  var commandResults = $("commandResults");

  var toasts = $("toasts");


  /* =========================================================
     LABELS
  ========================================================= */

  var LBL = {
    live: "Live now",
    up: "Upcoming",
    end: "Past"
  };


  /* =========================================================
     HOME
  ========================================================= */

  function home(){

    return {

      id: "all",

      n: "All games",

      s: "home",

      h: 260,

      l: "N",

      d: "Every game made on Nanogram, from jams and beyond.",

      g: G.map(function(x,i){
        return i;
      })

    };

  }


  /* =========================================================
     FAVOURITES
  ========================================================= */

  function isFavourite(id){

    return favourites.indexOf(id) !== -1;

  }


  function toggleFavourite(id){

    var index = favourites.indexOf(id);

    if(index === -1){

      favourites.push(id);

      toast("Added to favourites", "★");

    }
    else{

      favourites.splice(index,1);

      toast("Removed from favourites", "☆");

    }

    localStorage.setItem(
      "nanogram-jam-favourites",
      JSON.stringify(favourites)
    );

    nav();

    page();

  }


  /* =========================================================
     TOAST
  ========================================================= */

  function toast(message, icon){

    var el = document.createElement("div");

    el.className = "toast";

    el.innerHTML =
      '<span class="toast-icon">' +
      (icon || "✓") +
      '</span>' +
      '<span>' +
      escapeHTML(message) +
      '</span>';

    toasts.appendChild(el);

    requestAnimationFrame(function(){

      el.classList.add("show");

    });

    setTimeout(function(){

      el.classList.remove("show");

      setTimeout(function(){

        el.remove();

      },220);

    },2400);

  }


  /* =========================================================
     NAVIGATION
  ========================================================= */

  function navigate(id, push){

    cur = id;

    tab = "Entries";

    if(push !== false){

      var url =
        id === "all"
          ? location.pathname
          : location.pathname + "?jam=" + encodeURIComponent(id);

      history.pushState(
        {jam:id},
        "",
        url
      );

    }

    nav();

    page();

    closeMobileMenu();

  }


  window.addEventListener("popstate", function(){

    cur =
      new URLSearchParams(location.search).get("jam") ||
      "all";

    nav();

    page();

  });


  /* =========================================================
     NAV
  ========================================================= */

  function nav(){

    var q = ($("q")?.value || "").toLowerCase();

    var h = "";


    function item(j, sub){

      var fav = j.id !== "all" && isFavourite(j.id);

      return (

        '<button class="item ' +
        (cur === j.id ? "selected" : "") +
        '" data-id="' +
        j.id +
        '" aria-current="' +
        (cur === j.id) +
        '">' +

          '<span class="ic" style="background:' +
          col(j.h) +
          '">' +
          j.l +
          '</span>' +

          '<span class="tx">' +

            '<strong>' +
            escapeHTML(j.n) +
            '</strong>' +

            '<small>' +
            escapeHTML(sub) +
            '</small>' +

          '</span>' +

          (fav
            ? '<span class="fav-mini">★</span>'
            : '') +

          (j.s === "live"
            ? '<span class="dot" title="Live"></span>'
            : '') +

        '</button>'

      );

    }


    h += item(
      home(),
      "Browse everything"
    );


    ["live","up","end"].forEach(function(status){

      var items = J.filter(function(j){

        return j.s === status &&
          (
            !q ||
            j.n.toLowerCase().includes(q) ||
            j.d.toLowerCase().includes(q)
          );

      });


      if(items.length){

        h +=
          '<div class="grp">' +
          LBL[status] +
          ' <span>' +
          items.length +
          '</span>' +
          '</div>';


        items.forEach(function(j){

          h += item(j,j.when);

        });

      }

    });


    navEl.innerHTML = h;

  }


  /* =========================================================
     COUNTDOWN
  ========================================================= */

  function countdown(j){

    var remaining =
      Math.max(
        0,
        new Date(j.end) - Date.now()
      );


    if(remaining <= 0){

      return "Ended";

    }


    var totalSeconds =
      Math.floor(remaining / 1000);


    var days =
      Math.floor(totalSeconds / 86400);


    var hours =
      Math.floor((totalSeconds % 86400) / 3600);


    var minutes =
      Math.floor((totalSeconds % 3600) / 60);


    var seconds =
      totalSeconds % 60;


    if(days > 0){

      return days + "d " +
        String(hours).padStart(2,"0") + "h " +
        String(minutes).padStart(2,"0") + "m";

    }


    return String(hours).padStart(2,"0") + ":" +
      String(minutes).padStart(2,"0") + ":" +
      String(seconds).padStart(2,"0");

  }


  /* =========================================================
     GAME CARD
  ========================================================= */

  function gameCard(g,index){

    return (

      '<button class="g" data-g="' +
      index +
      '" style="--delay:' +
      ((index % 8) * 45) +
      'ms">' +

        '<div class="tl" style="background:' +
        col(g[2]) +
        '">' +

          '<span>' +
          escapeHTML(g[0][0]) +
          '</span>' +

          '<span class="card-arrow">↗</span>' +

        '</div>' +

        '<strong>' +
        escapeHTML(g[0]) +
        '</strong>' +

        '<small>' +
        escapeHTML(g[1]) +
        ' · by ' +
        escapeHTML(g[3]) +
        '</small>' +

      '</button>'

    );

  }


  /* =========================================================
     FEATURED HOME
  ========================================================= */

  function homeHero(){

    var live = J.filter(function(j){
      return j.s === "live";
    })[0];


    var upcoming = J.filter(function(j){
      return j.s === "up";
    })[0];


    var featured = live || upcoming;


    if(!featured){

      return "";

    }


    return (

      '<section class="hero-card" style="--hero:' +
      featured.h +
      '">' +

        '<div class="hero-copy">' +

          '<div class="eyebrow">' +

            '<span class="live-symbol"></span>' +

            (featured.s === "live"
              ? "LIVE JAM"
              : "UP NEXT") +

          '</div>' +

          '<h2>' +
          escapeHTML(featured.n) +
          '</h2>' +

          '<p>' +
          escapeHTML(featured.d) +
          '</p>' +

          '<div class="hero-actions">' +

            '<button class="btn dark" data-open-jam="' +
            featured.id +
            '">' +

              (featured.s === "live"
                ? "Join the jam"
                : "View jam") +

              '' +

            '</button>' +

            '<button class="hero-link" data-share="' +
            featured.id +
            '">' +

              "Share" +

            '</button>' +

          '</div>' +

        '</div>' +

        '<div class="hero-art">' +

          '<div class="hero-letter">' +
          featured.l +
          '</div>' +

          '<div class="hero-ring ring-one"></div>' +
          '<div class="hero-ring ring-two"></div>' +

        '</div>' +

      '</section>'

    );

  }


  /* =========================================================
     HOME PAGE
  ========================================================= */

  function renderHome(){

    var allGames = G.map(function(g,i){
      return {g:g,i:i};
    });


    var search =
      (
        $("q")?.value ||
        ""
      ).toLowerCase().trim();


    if(search){

      allGames = allGames.filter(function(x){

        return (
          x.g[0].toLowerCase().includes(search) ||
          x.g[1].toLowerCase().includes(search) ||
          x.g[3].toLowerCase().includes(search) ||
          x.g[4].toLowerCase().includes(search)
        );

      });

    }


    var liveCount = J.filter(function(j){
      return j.s === "live";
    }).length;


    var upcomingCount = J.filter(function(j){
      return j.s === "up";
    }).length;


    var h =

      '<div class="home-heading">' +

        '<div>' +

          '<div class="eyebrow">NANOGRAM COMMUNITY</div>' +

          '<h1>Build something.<br><span>Ship it.</span></h1>' +

          '<p class="lead">' +
          "Game jams made for making games, " +
          "not filling out spreadsheets." +
          '</p>' +

        '</div>' +

        '<div class="home-stat">' +

          '<strong>' +
          G.length +
          '</strong>' +

          '<span>games made</span>' +

        '</div>' +

      '</div>' +

      homeHero();


    h +=

      '<div class="section-heading">' +

        '<div>' +

          '<h2>Jams</h2>' +

          '<p>Find something to build.</p>' +

        '</div>' +

        '<div class="filter-row">' +

          ["all","live","up","end"].map(function(x){

            var label =
              x === "all"
                ? "All"
                : LBL[x];

            return (

              '<button class="filter ' +
              (filter === x ? "active" : "") +
              '" data-filter="' +
              x +
              '">' +

              label +

              '</button>'

            );

          }).join("") +

        '</div>' +

      '</div>';


    var jams = J.filter(function(j){

      if(filter === "all"){
        return true;
      }

      return j.s === filter;

    });


    if(search){

      jams = jams.filter(function(j){

        return (
          j.n.toLowerCase().includes(search) ||
          j.d.toLowerCase().includes(search) ||
          j.tags.join(" ").toLowerCase().includes(search)
        );

      });

    }


    h += '<div class="jam-grid">';


    if(!jams.length){

      h +=
        '<div class="empty wide">' +
          '<div class="empty-icon">⌕</div>' +
          '<h3>No jams found</h3>' +
          '<p>Try a different search or filter.</p>' +
        '</div>';

    }
    else{

      jams.forEach(function(j,index){

        h +=

          '<button class="jam-card" ' +
          'data-open-jam="' +
          j.id +
          '" ' +
          'style="--jam:' +
          j.h +
          ';--delay:' +
          (index * 55) +
          'ms">' +

            '<div class="jam-cover">' +

              '<span class="jam-letter">' +
              j.l +
              '</span>' +

              '<span class="jam-status ' +
              j.s +
              '">' +

                '<span></span>' +
                LBL[j.s] +

              '</span>' +

              '<span class="jam-arrow">↗</span>' +

            '</div>' +

            '<div class="jam-info">' +

              '<strong>' +
              escapeHTML(j.n) +
              '</strong>' +

              '<p>' +
              escapeHTML(j.d) +
              '</p>' +

              '<div class="jam-meta">' +

                '<span>' +
                (
                  j.s === "live"
                    ? countdown(j)
                    : j.when
                ) +
                '</span>' +

                '<span>' +
                j.ppl +
                ' joined' +
                '</span>' +

              '</div>' +

            '</div>' +

          '</button>';

      });

    }


    h += '</div>';


    h +=

      '<div class="section-heading games-heading">' +

        '<div>' +

          '<h2>Latest games</h2>' +

          '<p>Things people actually made.</p>' +

        '</div>' +

        '<span class="count-label">' +
        allGames.length +
        ' games' +
        '</span>' +

      '</div>';


    h += '<div class="grid">';


    allGames.forEach(function(x,index){

      h += gameCard(
        x.g,
        x.i
      );

    });


    h += '</div>';


    pg.innerHTML = h;

  }


  /* =========================================================
     JAM PAGE
  ========================================================= */

  function renderJam(j){

    var games = j.g.map(function(i){
      return G[i];
    });


    var h =

      '<div class="jam-page" style="--jam:' +
      j.h +
      '">' +

        '<div class="jam-top">' +

          '<button class="back" data-home>' +
            '← <span>All jams</span>' +
          '</button>' +

          '<button class="favourite ' +
          (isFavourite(j.id) ? "active" : "") +
          '" data-favourite="' +
          j.id +
          '">' +

            (isFavourite(j.id) ? "★" : "☆") +

            '<span>' +
            (isFavourite(j.id)
              ? "Saved"
              : "Save") +
            '</span>' +

          '</button>' +

        '</div>' +


        '<div class="jam-big-cover">' +

          '<div class="big-letter">' +
          j.l +
          '</div>' +

          '<div class="cover-noise"></div>' +

          '<div class="cover-orbit"></div>' +

        '</div>' +


        '<div class="jam-title-row">' +

          '<div>' +

            '<div class="eyebrow">' +

              '<span class="live-symbol ' +
              j.s +
              '"></span>' +

              LBL[j.s] +

            '</div>' +

            '<h1>' +
            escapeHTML(j.n) +
            '</h1>' +

            '<div class="by">' +
              '<span>Hosted by <b>Nanogram</b></span>' +
            '</div>' +

          '</div>' +

          '<button class="share-btn" data-share="' +
          j.id +
          '">' +

            'Share' +

          '</button>' +

        '</div>' +


        '<p class="lead jam-lead">' +
        escapeHTML(j.d) +
        '</p>';


    if(j.tags && j.tags.length){

      h +=

        '<div class="tags">' +

          j.tags.map(function(tag){

            return '<span>' +
              escapeHTML(tag) +
              '</span>';

          }).join("") +

        '</div>';

    }


    h += '<div class="acts">';


    if(j.s === "live"){

      h +=

        '<a class="btn dark" href="' +
        DISCORD +
        '" target="_blank" rel="noopener">' +

          'Join this jam' +

        '</a>' +

        '<a class="btn itch" href="' +
        ITCH +
        '" target="_blank" rel="noopener">' +

          'Submit on itch' +

        '</a>';

    }
    else if(j.s === "up"){

      h +=

        '<a class="btn dark" href="' +
        DISCORD +
        '" target="_blank" rel="noopener">' +

          'Get notified' +

        '</a>';

    }
    else{

      h +=

        '<a class="btn itch" href="' +
        ITCH +
        '" target="_blank" rel="noopener">' +

          'See results on itch' +

        '</a>';

    }


    h +=

      '<a class="btn ghost" href="' +
      IOS +
      '" target="_blank" rel="noopener">' +

        'Get Nanogram' +

      '</a>' +

      '</div>';


    h +=

      '<div class="stats">' +

        '<div>' +
          '<strong data-count="' +
          parseInt(j.ppl.replace(/,/g,""),10) +
          '">0</strong>' +
          '<span>joined</span>' +
        '</div>' +

        '<div>' +
          '<strong>' +
          games.length +
          '</strong>' +
          '<span>entries</span>' +
        '</div>' +

        '<div class="countdown-stat">' +

          '<strong>' +
          (j.s === "live"
            ? countdown(j)
            : j.when) +
          '</strong>' +

          '<span>' +
          (j.s === "live"
            ? "until submissions close"
            : "deadline") +
          '</span>' +

        '</div>' +

      '</div>';


    h +=

      '<div class="tabs">' +

        '<button class="tab ' +
        (tab === "Entries" ? "active" : "") +
        '" data-t="Entries">' +

          'Entries' +

          '<span>' +
          games.length +
          '</span>' +

        '</button>' +

        '<button class="tab ' +
        (tab === "About" ? "active" : "") +
        '" data-t="About">' +

          'About' +

        '</button>' +

      '</div>';


    if(tab === "Entries"){

      h +=

        '<div class="section-heading compact">' +

          '<div>' +
            '<h2>Entries</h2>' +
            '<p>Games made for this jam.</p>' +
          '</div>' +

        '</div>';


      if(games.length){

        h += '<div class="grid">';

        games.forEach(function(game){

          h += gameCard(
            game,
            G.indexOf(game)
          );

        });

        h += '</div>';

      }
      else{

        h +=

          '<div class="empty">' +

            '<div class="empty-icon">✦</div>' +

            '<h3>No entries yet</h3>' +

            '<p>Entries open when the jam starts.</p>' +

            '<a class="btn dark" href="' +
            DISCORD +
            '" target="_blank" rel="noopener">' +

              'Get notified' +

            '</a>' +

          '</div>';

      }

    }
    else{

      h +=

        '<div class="about-panel">' +

          '<div>' +

            '<div class="about-icon">✦</div>' +

            '<h2>How it works</h2>' +

            '<p>' +
            escapeHTML(j.d) +
            '</p>' +

          '</div>' +

          '<ol class="rules">' +

            j.rules.map(function(rule){

              return '<li>' +
                '<span></span>' +
                '<p>' +
                escapeHTML(rule) +
                '</p>' +
              '</li>';

            }).join("") +

          '</ol>' +

          '<div class="deadline">' +

            '<span>JAM WINDOW</span>' +

            '<strong>' +
            formatFullDate(j.a) +
            ' — ' +
            formatFullDate(j.z) +
            '</strong>' +

          '</div>' +

        '</div>';

    }


    h += '</div>';


    pg.innerHTML = h;


    animateCounters();

  }


  /* =========================================================
     PAGE
  ========================================================= */

  function page(){

    updateStatuses();


    var j =
      cur === "all"
        ? home()
        : J.find(function(x){
            return x.id === cur;
          });


    if(!j){

      cur = "all";

      navigate("all",false);

      return;

    }


    document.title =
      j.n === "All games"
        ? "Nanogram Jams"
        : j.n + " | Nanogram Jams";


    pg.classList.remove("page-enter");

    void pg.offsetWidth;

    pg.classList.add("page-enter");


    if(j.s === "home"){

      renderHome();

    }
    else{

      renderJam(j);

    }


    window.requestAnimationFrame(function(){

      pg.classList.add("ready");

    });


    var main = document.querySelector("main");

    if(main){

      main.scrollTop = 0;

    }

  }


  /* =========================================================
     COUNTERS
  ========================================================= */

  function animateCounters(){

    document.querySelectorAll("[data-count]").forEach(function(el){

      var target =
        parseInt(el.dataset.count,10) || 0;

      var duration = 850;

      var start = performance.now();


      function tick(now){

        var progress =
          Math.min(
            1,
            (now - start) / duration
          );


        var eased =
          1 - Math.pow(1 - progress,3);


        var value =
          Math.floor(target * eased);


        el.textContent =
          value.toLocaleString();


        if(progress < 1){

          requestAnimationFrame(tick);

        }
        else{

          el.textContent =
            target.toLocaleString();

        }

      }


      requestAnimationFrame(tick);

    });

  }


  /* =========================================================
     SEARCH
  ========================================================= */

  function allSearchResults(q){

    q = q.toLowerCase().trim();

    if(!q){

      return [];

    }


    var results = [];


    J.forEach(function(j){

      if(
        j.n.toLowerCase().includes(q) ||
        j.d.toLowerCase().includes(q) ||
        j.tags.join(" ").toLowerCase().includes(q)
      ){

        results.push({
          type:"jam",
          id:j.id,
          title:j.n,
          subtitle:LBL[j.s] + " · " + j.when,
          letter:j.l,
          hue:j.h
        });

      }

    });


    G.forEach(function(g,i){

      if(
        g[0].toLowerCase().includes(q) ||
        g[1].toLowerCase().includes(q) ||
        g[3].toLowerCase().includes(q) ||
        g[4].toLowerCase().includes(q)
      ){

        results.push({
          type:"game",
          id:i,
          title:g[0],
          subtitle:g[1] + " · by " + g[3],
          letter:g[0][0],
          hue:g[2]
        });

      }

    });


    return results.slice(0,12);

  }


  function renderCommand(){

    var results =
      allSearchResults(commandInput.value);


    commandIndex =
      Math.min(
        commandIndex,
        Math.max(0,results.length - 1)
      );


    if(!results.length){

      commandResults.innerHTML =

        '<div class="command-empty">' +

          '<span>⌕</span>' +

          (
            commandInput.value
              ? "No results found"
              : "Start typing to search"
          ) +

        '</div>';

      return;

    }


    commandResults.innerHTML = results.map(function(r,index){

      return (

        '<button class="command-result ' +
        (index === commandIndex ? "active" : "") +
        '" data-command-type="' +
        r.type +
        '" data-command-id="' +
        r.id +
        '">' +

          '<span class="command-letter" style="background:' +
          col(r.hue) +
          '">' +

            escapeHTML(r.letter) +

          '</span>' +

          '<span>' +

            '<strong>' +
            escapeHTML(r.title) +
            '</strong>' +

            '<small>' +
            escapeHTML(r.subtitle) +
            '</small>' +

          '</span>' +

          '<span class="command-arrow">↵</span>' +

        '</button>'

      );

    }).join("");

  }


  function openCommand(){

    commandDialog.showModal();

    commandInput.value = "";

    commandIndex = 0;

    renderCommand();

    setTimeout(function(){

      commandInput.focus();

    },50);

  }


  /* =========================================================
     SHARE
  ========================================================= */

  function shareJam(id){

    var j = J.find(function(x){
      return x.id === id;
    });


    if(!j){

      return;

    }


    var url =
      location.origin +
      location.pathname +
      "?jam=" +
      encodeURIComponent(id);


    if(navigator.share){

      navigator.share({

        title:j.n + " | Nanogram Jams",

        text:j.d,

        url:url

      }).catch(function(){});

    }
    else if(navigator.clipboard){

      navigator.clipboard.writeText(url);

      toast(
        "Jam link copied",
        "↗"
      );

    }
    else{

      toast(
        "Copy this page URL to share it",
        "↗"
      );

    }

  }


  /* =========================================================
     GAME MODAL
  ========================================================= */

  function openGame(index){

    var x = G[index];


    if(!x){

      return;

    }


    dc.innerHTML =

      '<div class="game-modal-cover" style="background:' +
      col(x[2]) +
      '">' +

        '<span>' +
        escapeHTML(x[0][0]) +
        '</span>' +

      '</div>' +

      '<div class="in">' +

        '<div class="modal-type">' +
        escapeHTML(x[1]) +
        '</div>' +

        '<h3>' +
        escapeHTML(x[0]) +
        '</h3>' +

        '<p>' +
        escapeHTML(x[4]) +
        '</p>' +

        '<div class="creator">' +

          '<span>Created by</span>' +

          '<strong>' +
          escapeHTML(x[3]) +
          '</strong>' +

        '</div>' +

        '<div class="row">' +

          '<a class="btn dark" href="' +
          IOS +
          '" target="_blank" rel="noopener">' +

            'Play on iOS' +

          '</a>' +

          '<a class="btn ghost" href="' +
          AND +
          '" target="_blank" rel="noopener">' +

            'Android' +

          '</a>' +

          '<button class="btn ghost" data-close-dialog>' +
            'Close' +
          '</button>' +

        '</div>' +

      '</div>';


    dlg.showModal();

  }


  /* =========================================================
     MOBILE MENU
  ========================================================= */

  function openMobileMenu(){

    $("sidebar").classList.add("mobile-open");

  }


  function closeMobileMenu(){

    var sidebar = $("sidebar");

    if(sidebar){

      sidebar.classList.remove("mobile-open");

    }

  }


  /* =========================================================
     THEME
  ========================================================= */

  function currentTheme(){

    return localStorage.getItem("nanogram-theme") || "system";

  }


  function setTheme(theme){

    if(theme === "system"){

      document.documentElement.removeAttribute("data-theme");

    }
    else{

      document.documentElement.setAttribute(
        "data-theme",
        theme
      );

    }


    localStorage.setItem(
      "nanogram-theme",
      theme
    );


    updateThemeButton();

  }


  function updateThemeButton(){

    var theme = currentTheme();


    var icon = {
      system:"◐",
      light:"☀",
      dark:"☾"
    }[theme];


    var text = {
      system:"System",
      light:"Light",
      dark:"Dark"
    }[theme];


    $("themeIcon").textContent = icon;

    $("themeText").textContent = text;

  }


  function cycleTheme(){

    var current = currentTheme();

    var next =
      current === "system"
        ? "light"
        : current === "light"
          ? "dark"
          : "system";


    setTheme(next);

    toast(
      "Theme: " + next,
      "◐"
    );

  }


  setTheme(currentTheme());


  /* =========================================================
     EVENTS — NAV
  ========================================================= */

  navEl.addEventListener("click",function(e){

    var button =
      e.target.closest(".item");


    if(!button){

      return;

    }


    navigate(
      button.dataset.id
    );

  });


  /* =========================================================
     EVENTS — PAGE
  ========================================================= */

  pg.addEventListener("click",function(e){

    var jam =
      e.target.closest("[data-open-jam]");


    if(jam){

      navigate(
        jam.dataset.openJam
      );

      return;

    }


    var homeButton =
      e.target.closest("[data-home]");


    if(homeButton){

      navigate("all");

      return;

    }


    var favourite =
      e.target.closest("[data-favourite]");


    if(favourite){

      toggleFavourite(
        favourite.dataset.favourite
      );

      return;

    }


    var share =
      e.target.closest("[data-share]");


    if(share){

      shareJam(
        share.dataset.share
      );

      return;

    }


    var filterButton =
      e.target.closest("[data-filter]");


    if(filterButton){

      filter =
        filterButton.dataset.filter;

      page();

      return;

    }


    var tabButton =
      e.target.closest("[data-t]");


    if(tabButton){

      tab =
        tabButton.dataset.t;

      page();

      return;

    }


    var game =
      e.target.closest("[data-g]");


    if(game){

      openGame(
        parseInt(game.dataset.g,10)
      );

      return;

    }

  });


  /* =========================================================
     SIDEBAR SEARCH
  ========================================================= */

  var oldSearch = $("q");


  if(oldSearch){

    oldSearch.addEventListener("input",function(){

      if(cur === "all"){

        page();

      }

      nav();

    });

  }


  /* =========================================================
     SEARCH BUTTON
  ========================================================= */

  $("searchTrigger").addEventListener(
    "click",
    openCommand
  );


  $("mobileSearch").addEventListener(
    "click",
    openCommand
  );


  $("themeBtn").addEventListener(
    "click",
    cycleTheme
  );


  /* =========================================================
     COMMAND EVENTS
  ========================================================= */

  commandInput.addEventListener(
    "input",
    function(){

      commandIndex = 0;

      renderCommand();

    }
  );


  commandInput.addEventListener(
    "keydown",
    function(e){

      var results =
        allSearchResults(
          commandInput.value
        );


      if(e.key === "ArrowDown"){

        e.preventDefault();

        if(results.length){

          commandIndex =
            (commandIndex + 1) %
            results.length;

          renderCommand();

        }

      }


      if(e.key === "ArrowUp"){

        e.preventDefault();

        if(results.length){

          commandIndex =
            (commandIndex - 1 + results.length) %
            results.length;

          renderCommand();

        }

      }


      if(e.key === "Enter"){

        e.preventDefault();

        if(results[commandIndex]){

          var r = results[commandIndex];

          commandDialog.close();


          if(r.type === "jam"){

            navigate(r.id);

          }
          else{

            openGame(r.id);

          }

        }

      }

    }
  );


  commandResults.addEventListener(
    "click",
    function(e){

      var result =
        e.target.closest(".command-result");


      if(!result){

        return;

      }


      commandDialog.close();


      if(result.dataset.commandType === "jam"){

        navigate(
          result.dataset.commandId
        );

      }
      else{

        openGame(
          parseInt(
            result.dataset.commandId,
            10
          )
        );

      }

    }
  );


  /* =========================================================
     ESCAPE
  ========================================================= */

  document.addEventListener(
    "keydown",
    function(e){

      if(
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === "k"
      ){

        e.preventDefault();

        if(!commandDialog.open){

          openCommand();

        }

      }


      if(e.key === "Escape"){

        closeMobileMenu();

      }

    }
  );


  /* =========================================================
     DIALOGS
  ========================================================= */

  dlg.addEventListener(
    "click",
    function(e){

      if(e.target === dlg){

        dlg.close();

      }


      if(
        e.target.closest("[data-close-dialog]")
      ){

        dlg.close();

      }

    }
  );


  commandDialog.addEventListener(
    "click",
    function(e){

      if(e.target === commandDialog){

        commandDialog.close();

      }

    }
  );


  /* =========================================================
     MOBILE MENU
  ========================================================= */

  $("mobileMenu").addEventListener(
    "click",
    function(){

      $("sidebar").classList.toggle(
        "mobile-open"
      );

    }
  );


  /* =========================================================
     LIVE CLOCK
  ========================================================= */

  setInterval(function(){

    updateStatuses();

    document.querySelectorAll(
      ".jam-card"
    ).forEach(function(card){

      var id =
        card.dataset.openJam;


      var j =
        J.find(function(x){
          return x.id === id;
        });


      if(
        j &&
        j.s === "live"
      ){

        var meta =
          card.querySelector(".jam-meta span");


        if(meta){

          meta.textContent =
            countdown(j);

        }

      }

    });


    document.querySelectorAll(
      ".countdown-stat strong"
    ).forEach(function(el){

      if(cur !== "all"){

        var j =
          J.find(function(x){
            return x.id === cur;
          });


        if(j && j.s === "live"){

          el.textContent =
            countdown(j);

        }

      }

    });

  },1000);


  /* =========================================================
     INITIAL RENDER
  ========================================================= */

  window.NG = {
    refresh: function(){ updateStatuses(); nav(); page(); },
    navigate: navigate,
    toast: toast,
    cur: function(){ return cur; }
  };


  nav();

  page();


})();
