/* Keep BibleProject header and footer links inside this sandbox. */
(function () {
  var root = document.documentElement.getAttribute("data-sandbox-root") || "./";
  var routes = {
  "/videos/collections/how-to-read-the-bible": "videos/collections/how-to-read-the-bible/",
  "/podcasts/shows/the-bible-project-podcast": "podcasts/",
  "/videos/collections/old-testament": "videos/collections/old-testament/",
  "/videos/collections/new-testament": "videos/collections/new-testament/",
  "/collections/spirit-of-god": "collections/spirit-of-god/",
  "/reading-plans": "reading-plans/",
  "/collections": "collections/",
  "/classroom": "classroom/",
  "/downloads": "downloads/",
  "/podcasts": "podcasts/",
  "/articles": "articles/",
  "/videos": "videos/",
  "/guides": "guides/",
  "/about": "about/",
  "/give": "give/",
  "/app": "app/",
  "/": "./"
};

  function normalizePath(path) {
    if (!path) return "/";
    path = path.split("?")[0].split("#")[0];
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
    return path || "/";
  }

  function destination(href) {
    if (!href) return null;
    var raw = href.trim();
    if (!raw || raw.charAt(0) === "#" || raw.indexOf("mailto:") === 0 || raw.indexOf("tel:") === 0) return null;
    var absolute = raw.charAt(0) === "/" || raw.indexOf("https://bibleproject.com") === 0 || raw.indexOf("https://www.bibleproject.com") === 0 || raw.indexOf("http://bibleproject.com") === 0;
    if (!absolute) return null;
    var url;
    try { url = new URL(raw, "https://bibleproject.com"); }
    catch (e) { return null; }
    var host = url.hostname.replace(/^www\./, "");
    if (host !== "bibleproject.com") return null;
    var path = normalizePath(url.pathname);
    var tail = url.search + url.hash;
    if (Object.prototype.hasOwnProperty.call(routes, path)) {
      return root + routes[path] + tail;
    }
    return "https://bibleproject.com" + url.pathname + tail;
  }

  document.addEventListener("click", function (event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var nodes = event.composedPath();
    var anchor = null;
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i] && nodes[i].tagName === "A") { anchor = nodes[i]; break; }
    }
    if (!anchor || anchor.target === "_blank") return;
    var next = destination(anchor.getAttribute("href") || "");
    if (!next) return;
    event.preventDefault();
    window.location.href = next;
  }, true);
})();
