(function(jQuery) {
  var $, Collapser, JSONFormatter;
  JSONFormatter = (function() {
    function JSONFormatter() {}

    JSONFormatter.prototype.htmlEncode = function(html) {
      if (html !== null) {
        return html.toString().replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      } else {
        return '';
      }
    };

    JSONFormatter.prototype.jsString = function(s) {
      s = JSON.stringify(s).slice(1, -1);
      return this.htmlEncode(s);
    };

    JSONFormatter.prototype.decorateWithSpan = function(value, className) {
      return "<span class=\"" + className + "\">" + (this.htmlEncode(value)) + "</span>";
    };

    JSONFormatter.prototype.valueToHTML = function(value, keychain, level) {
      var valueType;
      if (keychain == null) {
        keychain = '';
      }
      if (level == null) {
        level = 0;
      }
      valueType = Object.prototype.toString.call(value).match(/\s(.+)]/)[1].toLowerCase();
      return this["" + valueType + "ToHTML"].call(this, value, keychain, level);
    };

    JSONFormatter.prototype.nullToHTML = function(value) {
      return this.decorateWithSpan('null', 'null');
    };

    JSONFormatter.prototype.numberToHTML = function(value) {
      return this.decorateWithSpan(value, 'num');
    };

    JSONFormatter.prototype.stringToHTML = function(value) {
      if (/^(http|https|file):\/\/[^\s]+$/i.test(value)) {
        return "<a href=\"" + (this.htmlEncode(value)) + "\"><span class=\"q\">\"</span>" + (this.jsString(value)) + "<span class=\"q\">\"</span></a>";
      } else {
        return "<span class=\"string\">\"" + (this.jsString(value)) + "\"</span>";
      }
    };

    JSONFormatter.prototype.booleanToHTML = function(value) {
      return this.decorateWithSpan(value, 'bool');
    };

    JSONFormatter.prototype.arrayToHTML = function(array, keychain, level) {
      var collapsible, hasContents, id, index, numProps, output, value, _i, _len;
      if (keychain == null) {
        keychain = '';
      }
      if (level == null) {
        level = 0;
      }
      hasContents = false;
      output = '';
      numProps = array.length;
      for (index = _i = 0, _len = array.length; _i < _len; index = ++_i) {
        value = array[index];
        hasContents = true;
        output += '<li>' + this.valueToHTML(value, "" + keychain + "[" + index + "]", level + 1);
        if (numProps > 1) {
          output += ',';
        }
        output += '</li>';
        numProps--;
      }
      if (hasContents) {
        if (keychain !== '') {
          id = " id=\"jsonview" + keychain + "\"";
          collapsible = ' collapsible';
        } else {
          id = collapsible = '';
        }
        return "<span class=\"collapser\"></span>[<ul" + id + " class=\"array level" + level + collapsible + "\">" + output + "</ul>]";
      } else {
        return '[ ]';
      }
    };

    JSONFormatter.prototype.objectToHTML = function(object, keychain, level) {
      var collapsible, hasContents, id, numProps, output, prop, value;
      if (keychain == null) {
        keychain = '';
      }
      if (level == null) {
        level = 0;
      }
      hasContents = false;
      output = '';
      numProps = 0;
      for (prop in object) {
        numProps++;
      }
      for (prop in object) {
        value = object[prop];
        hasContents = true;
        output += "<li><span class=\"prop\"><span class=\"q\">\"</span>" + (this.jsString(prop)) + "<span class=\"q\">\"</span></span>: " + (this.valueToHTML(value, "" + keychain + "[" + prop + "]", level + 1));
        if (numProps > 1) {
          output += ',';
        }
        output += '</li>';
        numProps--;
      }
      if (hasContents) {
        if (keychain !== '') {
          id = " id=\"jsonview" + keychain + "\"";
          collapsible = ' collapsible';
        } else {
          id = collapsible = '';
        }
        return "<span class=\"collapser\"></span>{<ul" + id + " class=\"obj level" + level + collapsible + "\">" + output + "</ul>}";
      } else {
        return '{ }';
      }
    };

    JSONFormatter.prototype.jsonToHTML = function(json) {
      return "<div class=\"jsonview\">" + (this.valueToHTML(json)) + "</div>";
    };

    return JSONFormatter;

  })();
  (typeof module !== "undefined" && module !== null) && (module.exports = new JSONFormatter);
  Collapser = (function() {
    function Collapser(item, collapsed) {
      var collapser;
      collapser = document.createElement('div');
      collapser.className = 'collapser';
      collapser.innerHTML = collapsed ? '+' : '-';
      collapser.addEventListener('click', ((function(_this) {
        return function(event) {
          return _this.collapse(event.target);
        };
      })(this)), false);
      item.insertBefore(collapser, item.firstChild);
      if (collapsed) {
        this.collapse(collapser);
      }
    }

    Collapser.prototype.collapse = function(collapser) {
      var ellipsis, target;
      target = collapser.parentNode.getElementsByClassName('collapsible');
      if (!target.length) {
        return;
      }
      target = target[0];
      if (target.style.display === 'none') {
        ellipsis = target.parentNode.getElementsByClassName('ellipsis')[0];
        target.parentNode.removeChild(ellipsis);
        target.style.display = '';
        return collapser.innerHTML = '-';
      } else {
        target.style.display = 'none';
        ellipsis = document.createElement('span');
        ellipsis.className = 'ellipsis';
        ellipsis.innerHTML = ' &hellip; ';
        target.parentNode.insertBefore(ellipsis, target);
        return collapser.innerHTML = '+';
      }
    };

    return Collapser;

  })();
  (typeof module !== "undefined" && module !== null) && (module.exports = Collapser);
  $ = jQuery;
  return $.fn.JSONView = function() {
    var METHODS, args, defaultOptions, formatter, json, method, options, outputDoc;
    METHODS = {
      collapse: 'hide',
      expand: 'show',
      toggle: 'toggle'
    };
    args = arguments;
    if (METHODS[args[0]] != null) {
      method = METHODS[args[0]];
      return this.each(function() {
        var $this, keychain, level;
        $this = $(this);
        if (args[1] != null) {
          if (Object.prototype.toString.call(args[1]) === '[object Number]') {
            level = args[1];
            return $this.find(".jsonview .level" + level)[method]();
          } else {
            keychain = args[1];
            return $this.find(".jsonview #jsonview" + keychain)[method]();
          }
        } else {
          return $this.find('.jsonview > ul > li > .collapsible')[method]();
        }
      });
    } else {
      json = args[0];
      options = args[1] || {};
      defaultOptions = {
        collapsed: false
      };
      options = $.extend(defaultOptions, options);
      formatter = new JSONFormatter;
      if (Object.prototype.toString.call(json) === '[object String]') {
        json = JSON.parse(json);
      }
      outputDoc = formatter.jsonToHTML(json);
      return this.each(function() {
        var $this, item, items, _i, _len, _results;
        $this = $(this);
        $this.html(outputDoc);
        items = $this[0].getElementsByClassName('collapsible');
        _results = [];
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          if (item.parentNode.nodeName === 'LI') {
            _results.push(new Collapser(item.parentNode, options.collapsed));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
    }
  };
})(jQuery);
