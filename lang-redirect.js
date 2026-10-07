/* Anciens liens ?lang=fr / ?lang=es -> versions statiques /fr/ et /es/ */
(function () {
  var m = /[?&]lang=(fr|es)\b/.exec(location.search);
  if (!m) return;
  var f = /(legal|privacy)(\.html)?$/.exec(location.pathname);
  location.replace('/' + m[1] + '/' + (f ? f[1] : '') + location.hash);
})();
