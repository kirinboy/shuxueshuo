/**
 * 百度统计（全站共用）。在百度后台「统计代码」里复制 hm.js? 后面的站点 id，填到下方。
 * 留空则不请求 hm.js，便于本地或未上线时不产生无效请求。
 */
(function () {
  var SITE_ID = 'caeda9ab4e372f3ac3d961654945b0f5';

  if (!SITE_ID) return;

  window._hmt = window._hmt || [];
  var hm = document.createElement('script');
  hm.async = true;
  hm.src = 'https://hm.baidu.com/hm.js?' + SITE_ID;
  var first = document.getElementsByTagName('script')[0];
  if (first && first.parentNode) {
    first.parentNode.insertBefore(hm, first);
  } else {
    document.head.appendChild(hm);
  }
})();
