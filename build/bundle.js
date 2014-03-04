(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Floorplan, WallGraph,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

WallGraph = require('./wallgraph');

module.exports = Floorplan = (function(_super) {
  var instance;

  __extends(Floorplan, _super);

  instance = null;

  Floorplan.get = function() {
    return instance != null ? instance : instance = new Floorplan();
  };

  function Floorplan() {
    Floorplan.__super__.constructor.call(this, 0x000000);
    this.backgroundColor = '#000000';
    this.wallColor = '#ffffff';
    this.areaColor = '#444444';
    this.assetColor = '#ffffff';
    this.container = new PIXI.Graphics();
    this.wallContainer = new PIXI.Graphics();
    this.wallContainer.tint = this.wallColor.replace('#', '0x');
    this.areaContainer = new PIXI.Graphics();
    this.areaContainer.tint = this.areaColor.replace('#', '0x');
    this.assetContainer = new PIXI.SpriteBatch();
    this.assetContainer.tint = this.assetColor.replace('#', '0x');
    this.addChild(this.container);
    this.addChild(this.areaContainer);
    this.addChild(this.wallContainer);
    this.addChild(this.assetContainer);
    this.wallGraph = new WallGraph();
  }

  Floorplan.prototype.destroyData = function() {
    this.wallGraph = new WallGraph();
    this.container.clear();
    this.wallContainer.clear();
    return this.areaContainer.clear();
  };

  Floorplan.prototype.addWall = function(a, b, thickness) {
    return this.wallGraph.addWall(a, b, thickness);
  };

  Floorplan.prototype.drawWalls = function() {
    var corner, edge1, edge2, _i, _len, _ref, _results;
    this.wallContainer.lineStyle(0, 0xffffff);
    _ref = this.wallGraph.getCorners();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      corner = _ref[_i];
      _results.push((function() {
        var _j, _len1, _ref1, _results1;
        _ref1 = corner.edges;
        _results1 = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          edge1 = _ref1[_j];
          _results1.push((function() {
            var _k, _len2, _ref2, _results2;
            _ref2 = corner.edges;
            _results2 = [];
            for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
              edge2 = _ref2[_k];
              if (edge1 !== edge2) {
                this.wallContainer.moveTo(edge1.getOtherCorner(corner).x, edge1.getOtherCorner(corner).y);
                this._setLineThickness(edge1.thickness);
                this.wallContainer.lineTo(corner.x, corner.y);
                this._setLineThickness(edge2.thickness);
                _results2.push(this.wallContainer.lineTo(edge2.getOtherCorner(corner).x, edge2.getOtherCorner(corner).y));
              } else {
                _results2.push(void 0);
              }
            }
            return _results2;
          }).call(this));
        }
        return _results1;
      }).call(this));
    }
    return _results;
  };

  Floorplan.prototype._setLineThickness = function(thickness) {
    if (this.lastThickness !== thickness) {
      this.lastThickness = thickness;
      return this.wallContainer.lineStyle(this.lastThickness, 0xffffff);
    }
  };

  Floorplan.prototype.drawArea = function(area) {
    var p, _i, _len;
    this.areaContainer.beginFill(0xffffff);
    this.areaContainer.lineStyle(0, 0xffffff);
    for (_i = 0, _len = area.length; _i < _len; _i++) {
      p = area[_i];
      this.areaContainer.lineTo(p.x, p.y);
    }
    return this.areaContainer.endFill();
  };

  return Floorplan;

})(PIXI.Stage);


},{"./wallgraph":6}],2:[function(require,module,exports){
var CDN, Floorplan, MYDECO_QUERY, constructFloorplanFromFML, constructFloorplanFromRS, constructQuery, createImage, endsWith, getJSON, loadJSONPAssets;

Floorplan = require('./floorplan');

loadJSONPAssets = require('./jsonploader').loadJSONPAssets;

createImage = require('./utils').createImage;

MYDECO_QUERY = "http://mydeco3d.com/ws/search/product?db=component&display=renders&display=surface_height&display=bounding_box&display=wall_mounted&display=level&display=model";

CDN = 'http://cdn.floorplanner.com/assets/';

module.exports.loadFloorPlan = function(url) {
  var xmlhttp;
  xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
      if (endsWith(url, '.xml')) {
        return parseString(xmlhttp.responseText, function(err, result) {
          return constructFloorplanFromFML(result);
        });
      } else if (endsWith(url, '.json')) {
        return constructFloorplanFromRS(JSON.parse(xmlhttp.responseText));
      }
    }
  };
  xmlhttp.open("GET", url, false);
  return xmlhttp.send();
};

getJSON = function(query, callback) {
  var xhr;
  xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    var obj;
    if (xhr.readyState === 4 && xhr.status === 200) {
      obj = JSON.parse(xhr.responseText);
      return callback(obj);
    }
  };
  xhr.open('GET', query, true);
  return xhr.send();
};

constructQuery = function(components) {
  var c, query, _i, _len;
  query = MYDECO_QUERY;
  if (typeof components === 'object') {
    for (_i = 0, _len = components.length; _i < _len; _i++) {
      c = components[_i];
      query += "&id=" + c.component_id;
    }
  } else {
    query += "&id=" + components;
  }
  return query;
};

constructFloorplanFromRS = function(rs) {
  var a, area, arr, b, k, onRSAssetsLoaded, p, pIndex, plan, query, scene, thickness, wall, _i, _len, _ref, _ref1, _ref2;
  scene = Floorplan.get();
  scene.destroyData();
  plan = rs.model.plan;
  _ref = plan.walls;
  for (k in _ref) {
    wall = _ref[k];
    thickness = wall.thickness;
    a = plan.points[wall.indices[0]];
    b = plan.points[wall.indices[1]];
    scene.addWall({
      x: parseInt(a[0]),
      y: parseInt(a[1] * -1)
    }, {
      x: parseInt(b[0]),
      y: parseInt(b[1] * -1)
    }, thickness + 2);
  }
  scene.drawWalls();
  _ref1 = plan.areas;
  for (k in _ref1) {
    area = _ref1[k];
    arr = [];
    _ref2 = area.indices;
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      pIndex = _ref2[_i];
      p = plan.points[pIndex];
      arr.push({
        x: p[0],
        y: p[1] * -1
      });
    }
    scene.drawArea(arr);
  }
  query = constructQuery(rs.model.components);
  onRSAssetsLoaded = (function(_this) {
    return function() {
      var sprite, v, _ref3, _results;
      _ref3 = PIXI.TextureCache;
      _results = [];
      for (k in _ref3) {
        v = _ref3[k];
        console.log(k, v);
        sprite = new PIXI.Sprite.fromImage(v);
        if (sprite) {
          console.log(sprite);
        }
        console.log(scene);
        _results.push(scene.assetContainer.addChild(sprite));
      }
      return _results;
    };
  })(this);
  return getJSON(query, function(data) {
    var loader, urls, v, _ref3;
    urls = [];
    _ref3 = data.products;
    for (k in _ref3) {
      v = _ref3[k];
      if (v !== null) {
        urls.push(v.renders[0].top);
      }
    }
    loader = new PIXI.AssetLoader(urls, true);
    loader.onComplete = onRSAssetsLoaded;
    return loader.load();
  });
};

constructFloorplanFromFML = function(fml) {
  var MULTIPLIER, a, area, areas, asset, assetURLS, assets, b, line, lines, outPoints, point, prePoints, root, scene, url, x1, x2, y1, y2, z1, z2, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1;
  MULTIPLIER = 100;
  scene = Floorplan.get();
  scene.destroyData();
  root = null;
  if (fml.hasOwnProperty('design')) {
    root = fml.design;
  } else if (fml.hasOwnProperty('project')) {
    root = fml.project.floors[0].floor[0].designs[0].design[0];
  } else {
    console.log('unknown', fml);
  }
  lines = root.lines[0].line;
  areas = root.areas[0].area;
  assets = root.assets[0].asset;
  for (_i = 0, _len = areas.length; _i < _len; _i++) {
    area = areas[_i];
    outPoints = [];
    prePoints = area.points[0].split(",");
    for (_j = 0, _len1 = prePoints.length; _j < _len1; _j++) {
      point = prePoints[_j];
      _ref = point.split(" "), x1 = _ref[0], y1 = _ref[1], z1 = _ref[2], x2 = _ref[3], y2 = _ref[4], z2 = _ref[5];
      outPoints.push({
        x: x1 * MULTIPLIER,
        y: y1 * MULTIPLIER
      });
      outPoints.push({
        x: x2 * MULTIPLIER,
        y: y2 * MULTIPLIER
      });
    }
    scene.drawArea(outPoints);
  }
  for (_k = 0, _len2 = lines.length; _k < _len2; _k++) {
    line = lines[_k];
    if (line.type[0] === 'default_wall') {
      _ref1 = line.points[0].split(" "), x1 = _ref1[0], y1 = _ref1[1], z1 = _ref1[2], x2 = _ref1[3], y2 = _ref1[4], z2 = _ref1[5];
      a = {
        x: parseInt(x1 * MULTIPLIER),
        y: parseInt(y1 * MULTIPLIER)
      };
      b = {
        x: parseInt(x2 * MULTIPLIER),
        y: parseInt(y2 * MULTIPLIER)
      };
      scene.addWall(a, b, line.thickness[0] * MULTIPLIER);
    } else {
      console.log("" + line.type[0] + " not drawn.");
    }
  }
  assetURLS = [];
  for (_l = 0, _len3 = assets.length; _l < _len3; _l++) {
    asset = assets[_l];
    if (endsWith(asset.url2d[0], 'flz')) {
      url = CDN + asset.url2d[0].replace('flz/', 'jsonp/').replace('.flz', '.jsonp');
      assetURLS.push(url);
    } else {
      console.log("not handling file " + asset.url2d[0] + " yet");
    }
  }
  loadJSONPAssets(assetURLS);
  scene.drawWalls();
  return console.log("lines: " + lines.length + ", areas: " + areas.length);
};

endsWith = function(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
};


},{"./floorplan":1,"./jsonploader":3,"./utils":5}],3:[function(require,module,exports){
var Floorplan, changeColInUri, createImage, loadAsset, maskFlip, _ref;

window['receive_asset'] = function(asset) {};

Floorplan = require('./floorplan');

_ref = require('./utils'), createImage = _ref.createImage, changeColInUri = _ref.changeColInUri, maskFlip = _ref.maskFlip;

loadAsset = function(url, error, succes) {
  return $.ajax({
    url: url,
    dataType: 'jsonp',
    jsonpCallback: 'receive_asset',
    jsonp: 'callback',
    error: error,
    success: succes
  });
};

module.exports.loadJSONPAssets = function(urlArray) {
  var advanceLoader, delay, error, succes, url;
  url = null;
  delay = function(ms, func) {
    return setTimeout(func, ms);
  };
  error = function(data) {
    console.log('error', data);
    return advanceLoader(false);
  };
  succes = function(data) {
    var newdata, scene, sprite;
    scene = Floorplan.get();
    if (data.under) {
      createImage(data.under, url, '.under');
      sprite = new PIXI.Sprite.fromImage(url + '.under');
      scene.assetContainer.addChild(sprite);
    }
    if (data.color) {
      newdata = data.color;
      createImage(newdata, url, '.color');
      sprite = new PIXI.Sprite.fromImage(url + '.color');
      scene.assetContainer.addChild(sprite);
      console.log('data.color');
    }
    if (data.over) {
      createImage(data.over, url, '.over');
      sprite = new PIXI.Sprite.fromImage(url + '.over');
      scene.assetContainer.addChild(sprite);
    }
    return advanceLoader(true);
  };
  advanceLoader = function(hadSucces) {
    console.log('loader advancing');
    if (urlArray.length > 0) {
      url = urlArray.pop();
      if (hadSucces) {
        return loadAsset(url, error, succes);
      }
    }
  };
  return advanceLoader(true);
};


},{"./floorplan":1,"./utils":5}],4:[function(require,module,exports){
var Floorplan, handleFileSelect, init, loadFloorPlan;

Floorplan = require('./floorplan');

loadFloorPlan = require('./importer').loadFloorPlan;

handleFileSelect = function(event) {
  return loadFloorPlan('data/' + event.target.files[0].name);
};

init = function() {
  var animate, gui, input, output, renderer, scene, stats;
  stats = new Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.right = '300px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);
  input = document.createElement("input");
  input.type = "file";
  input.id = "files";
  input.name = "files[]";
  input.addEventListener('change', handleFileSelect, false);
  document.body.appendChild(input);
  output = document.createElement('output');
  output.id = "list";
  document.body.appendChild(output);
  renderer = PIXI.autoDetectRenderer(2048, 2048, null, false, true);
  document.body.appendChild(renderer.view);
  gui = new dat.GUI();
  scene = Floorplan.get();
  gui.addColor(scene, 'backgroundColor').onChange(function(value) {
    return scene.setBackgroundColor(value.replace('#', '0x'));
  });
  gui.addColor(scene, 'wallColor').onChange(function(value) {
    return scene.wallContainer.tint = value.replace('#', '0x');
  });
  gui.addColor(scene, 'areaColor').onChange(function(value) {
    return scene.areaContainer.tint = value.replace('#', '0x');
  });
  gui.addColor(scene, 'assetColor').onChange(function(value) {
    var child, _i, _len, _ref, _results;
    _ref = scene.assetContainer.children;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      _results.push(child.tint = value);
    }
    return _results;
  });
  loadFloorPlan('data/rijksgebouwendienst.xml');
  animate = function() {
    stats.begin();
    requestAnimFrame(animate);
    renderer.render(Floorplan.get());
    return stats.end();
  };
  return requestAnimFrame(animate);
};

window.onload = function() {
  return init();
};


},{"./floorplan":1,"./importer":2}],5:[function(require,module,exports){
var hexToRGB;

module.exports.createImage = function(src, url, postfix) {
  var baseTexture, image, texture;
  image = new Image();
  image.src = src;
  baseTexture = new PIXI.BaseTexture(image);
  texture = new PIXI.Texture(baseTexture);
  return PIXI.Texture.addTextureToCache(texture, url + postfix);
};

module.exports.maskFlip = function(data) {
  var b, black, blackString, canvas, ctx, g, imageData, img, len, outData, r, white, whiteString, x;
  whiteString = '#ffffff';
  blackString = '#000000';
  white = hexToRGB(whiteString);
  black = hexToRGB(blackString);
  img = document.createElement("img");
  img.src = data;
  img.style.visibility = "hidden";
  document.body.appendChild(img);
  canvas = document.createElement("canvas");
  canvas.width = img.offsetWidth;
  canvas.height = img.offsetHeight;
  ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  img.parentNode.removeChild(img);
  imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  data = imageData.data;
  r = void 0;
  g = void 0;
  b = void 0;
  x = 0;
  len = data.length;
  while (x < len) {
    r = data[x];
    g = data[x + 1];
    b = data[x + 2];
    if ((r === white.r) && (g === white.g) && (b === white.b)) {
      data[x + 3] = 0;
    }
    if ((r === black.r) && (g === black.g) && (b === black.b)) {
      data[x] = white.r;
      data[x + 1] = white.g;
      data[x + 2] = white.b;
    }
    x += 4;
  }
  ctx.putImageData(imageData, 0, 0);
  outData = canvas.toDataURL();
  console.log("flip");
  return outData;
};

module.exports.changeColInUri = function(data, colfrom, colto, toTransparant) {
  var b, canvas, ctx, g, imageData, img, len, r, rgbfrom, rgbto, x;
  img = document.createElement("img");
  img.src = data;
  img.style.visibility = "hidden";
  document.body.appendChild(img);
  canvas = document.createElement("canvas");
  canvas.width = img.offsetWidth;
  canvas.height = img.offsetHeight;
  ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  img.parentNode.removeChild(img);
  imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  data = imageData.data;
  rgbfrom = hexToRGB(colfrom);
  rgbto = hexToRGB(colto);
  r = void 0;
  g = void 0;
  b = void 0;
  x = 0;
  len = data.length;
  while (x < len) {
    r = data[x];
    g = data[x + 1];
    b = data[x + 2];
    if ((r === rgbfrom.r) && (g === rgbfrom.g) && (b === rgbfrom.b)) {
      data[x] = rgbto.r;
      data[x + 1] = rgbto.g;
      data[x + 2] = rgbto.b;
      if (toTransparant) {
        data[x + 3] = 0;
      }
    }
    x += 4;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
};

hexToRGB = function(hexStr) {
  var col;
  col = {};
  col.r = parseInt(hexStr.substr(1, 2), 16);
  col.g = parseInt(hexStr.substr(3, 2), 16);
  col.b = parseInt(hexStr.substr(5, 2), 16);
  return col;
};


},{}],6:[function(require,module,exports){
var WallCorner, WallEdge, WallGraph;

WallCorner = (function() {
  function WallCorner(x, y) {
    this.x = x;
    this.y = y;
    this.edges = [];
  }

  WallCorner.prototype.addEdge = function(edge) {
    return this.edges.push(edge);
  };

  WallCorner.prototype.getAdjacent = function(fromEdge) {
    var edge, _i, _len, _ref, _results;
    _ref = this.edges;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      edge = _ref[_i];
      if (fromEdge !== edge) {
        _results.push(edge);
      }
    }
    return _results;
  };

  return WallCorner;

})();

WallEdge = (function() {
  function WallEdge(corner1, corner2, thickness) {
    this.corner1 = corner1;
    this.corner2 = corner2;
    this.thickness = thickness;
  }

  WallEdge.prototype.getOtherCorner = function(corner) {
    if (corner.x === this.corner1.x && corner.y === this.corner1.y) {
      return this.corner2;
    }
    if (corner.x === this.corner2.x && corner.y === this.corner2.y) {
      return this.corner1;
    }
  };

  return WallEdge;

})();

module.exports = WallGraph = (function() {
  function WallGraph() {
    this._cornerMap = {};
  }

  WallGraph.prototype.getCorners = function() {
    var k, v, _ref, _results;
    _ref = this._cornerMap;
    _results = [];
    for (k in _ref) {
      v = _ref[k];
      _results.push(v);
    }
    return _results;
  };

  WallGraph.prototype.addWall = function(p1, p2, thickness) {
    var corner1, corner2, edge;
    corner1 = this._addCorner(p1.x, p1.y);
    corner2 = this._addCorner(p2.x, p2.y);
    edge = new WallEdge(corner1, corner2, thickness);
    corner1.addEdge(edge);
    return corner2.addEdge(edge);
  };

  WallGraph.prototype._addCorner = function(x, y) {
    if (this._cornerMap["" + x + "," + y]) {
      return this._cornerMap["" + x + "," + y];
    } else {
      this._cornerMap["" + x + "," + y] = new WallCorner(x, y);
      return this._cornerMap["" + x + "," + y];
    }
  };

  return WallGraph;

})();


},{}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9uaWtraWtvb2xlL0Rlc2t0b3AvcXVkZWUvc3JjL2Zsb29ycGxhbi5jb2ZmZWUiLCIvVXNlcnMvbmlra2lrb29sZS9EZXNrdG9wL3F1ZGVlL3NyYy9pbXBvcnRlci5jb2ZmZWUiLCIvVXNlcnMvbmlra2lrb29sZS9EZXNrdG9wL3F1ZGVlL3NyYy9qc29ucGxvYWRlci5jb2ZmZWUiLCIvVXNlcnMvbmlra2lrb29sZS9EZXNrdG9wL3F1ZGVlL3NyYy9tYWluLmNvZmZlZSIsIi9Vc2Vycy9uaWtraWtvb2xlL0Rlc2t0b3AvcXVkZWUvc3JjL3V0aWxzLmNvZmZlZSIsIi9Vc2Vycy9uaWtraWtvb2xlL0Rlc2t0b3AvcXVkZWUvc3JjL3dhbGxncmFwaC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLG9CQUFBO0VBQUE7aVNBQUE7O0FBQUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxhQUFSLENBQVosQ0FBQTs7QUFBQSxNQUVNLENBQUMsT0FBUCxHQUF1QjtBQUNyQixNQUFBLFFBQUE7O0FBQUEsOEJBQUEsQ0FBQTs7QUFBQSxFQUFBLFFBQUEsR0FBVyxJQUFYLENBQUE7O0FBQUEsRUFDQSxTQUFDLENBQUEsR0FBRCxHQUFPLFNBQUEsR0FBQTs4QkFDTCxXQUFBLFdBQWdCLElBQUEsU0FBQSxDQUFBLEVBRFg7RUFBQSxDQURQLENBQUE7O0FBR2EsRUFBQSxtQkFBQSxHQUFBO0FBQ1gsSUFBQSwyQ0FBTSxRQUFOLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLGVBQUQsR0FBbUIsU0FEbkIsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxTQUZiLENBQUE7QUFBQSxJQUdBLElBQUMs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LFVBQUQsQ0FBWSxFQUFFLENBQUMsQ0FBZixFQUFrQixFQUFFLENBQUMsQ0FBckIsQ0FBVixDQUFBO0FBQUEsSUFDQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFVBQUQsQ0FBWSxFQUFFLENBQUMsQ0FBZixFQUFrQixFQUFFLENBQUMsQ0FBckIsQ0FEVixDQUFBO0FBQUEsSUFFQSxJQUFBLEdBQVcsSUFBQSxRQUFBLENBQVMsT0FBVCxFQUFrQixPQUFsQixFQUEyQixTQUEzQixDQUZYLENBQUE7QUFBQSxJQUdBLE9BQU8sQ0FBQyxPQUFSLENBQWdCLElBQWhCLENBSEEsQ0FBQTtXQUlBLE9BQU8sQ0FBQyxPQUFSLENBQWdCLElBQWhCLEVBTE87RUFBQSxDQU5ULENBQUE7O0FBQUEsc0JBYUEsVUFBQSxHQUFZLFNBQUMsQ0FBRCxFQUFJLENBQUosR0FBQTtBQUNWLElBQUEsSUFBRyxJQUFDLENBQUEsVUFBVyxDQUFBLEVBQUEsR0FBRSxDQUFGLEdBQUssR0FBTCxHQUFPLENBQVAsQ0FBZjtBQUNFLGFBQU8sSUFBQyxDQUFBLFVBQVcsQ0FBQSxFQUFBLEdBQUUsQ0FBRixHQUFLLEdBQUwsR0FBTyxDQUFQLENBQW5CLENBREY7S0FBQSxNQUFBO0FBR0UsTUFBQSxJQUFDLENBQUEsVUFBVyxDQUFBLEVBQUEsR0FBRSxDQUFGLEdBQUssR0FBTCxHQUFPLENBQVAsQ0FBWixHQUErQixJQUFBLFVBQUEsQ0FBVyxDQUFYLEVBQWEsQ0FBYixDQUEvQixDQUFBO0FBQ0EsYUFBTyxJQUFDLENBQUEsVUFBVyxDQUFBLEVBQUEsR0FBRSxDQUFGLEdBQUssR0FBTCxHQUFPLENBQVAsQ0FBbkIsQ0FKRjtLQURVO0VBQUEsQ0FiWixDQUFBOzttQkFBQTs7SUFmRixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJXYWxsR3JhcGggPSByZXF1aXJlICcuL3dhbGxncmFwaCdcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBGbG9vcnBsYW4gZXh0ZW5kcyBQSVhJLlN0YWdlXG4gIGluc3RhbmNlID0gbnVsbFxuICBAZ2V0IDogLT5cbiAgICBpbnN0YW5jZSA/PSBuZXcgRmxvb3JwbGFuKClcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXIoMHgwMDAwMDApXG4gICAgQGJhY2tncm91bmRDb2xvciA9ICcjMDAwMDAwJ1xuICAgIEB3YWxsQ29sb3IgPSAnI2ZmZmZmZidcbiAgICBAYXJlYUNvbG9yID0gJyM0NDQ0NDQnXG4gICAgQGFzc2V0Q29sb3IgPScjZmZmZmZmJ1xuICAgIEBjb250YWluZXIgPSBuZXcgUElYSS5HcmFwaGljcygpXG4gICAgQHdhbGxDb250YWluZXIgPSBuZXcgUElYSS5HcmFwaGljcygpXG4gICAgQHdhbGxDb250YWluZXIudGludCA9IEB3YWxsQ29sb3IucmVwbGFjZSgnIycsICcweCcpXG4gICAgQGFyZWFDb250YWluZXIgPSBuZXcgUElYSS5HcmFwaGljcygpXG4gICAgQGFyZWFDb250YWluZXIudGludCA9IEBhcmVhQ29sb3IucmVwbGFjZSgnIycsICcweCcpXG4gICAgQGFzc2V0Q29udGFpbmVyID0gbmV3IFBJWEkuU3ByaXRlQmF0Y2goKVxuICAgIEBhc3NldENvbnRhaW5lci50aW50ID0gQGFzc2V0Q29sb3IucmVwbGFjZSgnIycsICcweCcpXG4gICAgXG4gICAgQC5hZGRDaGlsZCBAY29udGFpbmVyXG4gICAgQC5hZGRDaGlsZCBAYXJlYUNvbnRhaW5lclxuICAgIEAuYWRkQ2hpbGQgQHdhbGxDb250YWluZXJcbiAgICBALmFkZENoaWxkIEBhc3NldENvbnRhaW5lclxuICAgIEB3YWxsR3JhcGggPSBuZXcgV2FsbEdyYXBoKClcbiAgICBcbiAgICBcbiAgZGVzdHJveURhdGE6IC0+XG4gICAgQHdhbGxHcmFwaCA9IG5ldyBXYWxsR3JhcGgoKVxuICAgIEBjb250YWluZXIuY2xlYXIoKVxuICAgIEB3YWxsQ29udGFpbmVyLmNsZWFyKClcbiAgICBAYXJlYUNvbnRhaW5lci5jbGVhcigpXG4gICAgXG5cbiAgYWRkV2FsbDogKGEsIGIsIHRoaWNrbmVzcykgLT5cbiAgICBAd2FsbEdyYXBoLmFkZFdhbGwoYSwgYiwgdGhpY2tuZXNzKVxuXG4gIGRyYXdXYWxsczogLT5cbiAgICBAd2FsbENvbnRhaW5lci5saW5lU3R5bGUgMCwgMHhmZmZmZmZcbiAgICBmb3IgY29ybmVyIGluIEB3YWxsR3JhcGguZ2V0Q29ybmVycygpXG4gICAgICBmb3IgZWRnZTEgaW4gY29ybmVyLmVkZ2VzXG4gICAgICAgIGZvciBlZGdlMiBpbiBjb3JuZXIuZWRnZXNcbiAgICAgICAgICBpZiBlZGdlMSBpc250IGVkZ2UyXG4gICAgICAgICAgICAjIG5vdyBkcmF3IDIgY29ubmVjdGVkIGxpbmVzIFxuICAgICAgICAgICAgIyAxKSBmcm9tICB0aGUgb3RoZXIgZW5kIG9mIGVkZ2UxIHRvIGNvcm5lclxuICAgICAgICAgICAgIyAyKSBmcm9tIGNvcm5lciB0byB0aGUgb3RoZXIgZW5kIG9mIGVkZ2UyXG4gICAgICAgICAgICAjIHRvIHNhdmUgb24gc3RhdGUgY2hhbmdlcyBJIHRlc3QgdG8gc2VlIGlmIEkgbmVlZCB0byBzZXQgbGluZVN0eWxlXG4gICAgICAgICAgICBAd2FsbENvbnRhaW5lci5tb3ZlVG8oZWRnZTEuZ2V0T3RoZXJDb3JuZXIoY29ybmVyKS54LCBlZGdlMS5nZXRPdGhlckNvcm5lcihjb3JuZXIpLnkpXG4gICAgICAgICAgICBAX3NldExpbmVUaGlja25lc3MgZWRnZTEudGhpY2tuZXNzXG4gICAgICAgICAgICBAd2FsbENvbnRhaW5lci5saW5lVG8oY29ybmVyLngsIGNvcm5lci55KVxuXG4gICAgICAgICAgICBAX3NldExpbmVUaGlja25lc3MgZWRnZTIudGhpY2tuZXNzXG4gICAgICAgICAgICBAd2FsbENvbnRhaW5lci5saW5lVG8oZWRnZTIuZ2V0T3RoZXJDb3JuZXIoY29ybmVyKS54LCBlZGdlMi5nZXRPdGhlckNvcm5lcihjb3JuZXIpLnkpXG5cbiAgX3NldExpbmVUaGlja25lc3MgOiAodGhpY2tuZXNzKSAtPlxuICAgIGlmIEBsYXN0VGhpY2tuZXNzIGlzbnQgdGhpY2tuZXNzXG4gICAgICBAbGFzdFRoaWNrbmVzcyA9IHRoaWNrbmVzc1xuICAgICAgQHdhbGxDb250YWluZXIubGluZVN0eWxlIEBsYXN0VGhpY2tuZXNzLCAweGZmZmZmZlxuXG4gICNhcmVhIHNob3VsZCBiZSBpbnB1dCBpbiBmb3JtIFxuICAjW3t4LHl9LHt4LHl9XVxuICBkcmF3QXJlYSA6IChhcmVhKSAtPlxuICAgIEBhcmVhQ29udGFpbmVyLmJlZ2luRmlsbCAweGZmZmZmZlxuICAgIEBhcmVhQ29udGFpbmVyLmxpbmVTdHlsZSAwLCAweGZmZmZmZlxuICAgIGZvciBwIGluIGFyZWFcbiAgICAgIEBhcmVhQ29udGFpbmVyLmxpbmVUbyhwLngsIHAueSlcbiAgICAgICNjb25zb2xlLmxvZyBwXG4gICAgQGFyZWFDb250YWluZXIuZW5kRmlsbCgpXG5cbiIsIkZsb29ycGxhbiA9IHJlcXVpcmUgJy4vZmxvb3JwbGFuJ1xue2xvYWRKU09OUEFzc2V0c30gPSByZXF1aXJlICcuL2pzb25wbG9hZGVyJ1xue2NyZWF0ZUltYWdlfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbk1ZREVDT19RVUVSWSA9IFwiaHR0cDovL215ZGVjbzNkLmNvbS93cy9zZWFyY2gvcHJvZHVjdD9kYj1jb21wb25lbnQmZGlzcGxheT1yZW5kZXJzJmRpc3BsYXk9c3VyZmFjZV9oZWlnaHQmZGlzcGxheT1ib3VuZGluZ19ib3gmZGlzcGxheT13YWxsX21vdW50ZWQmZGlzcGxheT1sZXZlbCZkaXNwbGF5PW1vZGVsXCJcbkNETiA9ICdodHRwOi8vY2RuLmZsb29ycGxhbm5lci5jb20vYXNzZXRzLydcblxubW9kdWxlLmV4cG9ydHMubG9hZEZsb29yUGxhbiA9ICh1cmwpIC0+XG4gIHhtbGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICB4bWxodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XG4gICAgaWYgeG1saHR0cC5yZWFkeVN0YXRlID09IDQgYW5kIHhtbGh0dHAuc3RhdHVzID09IDIwMFxuICAgICAgaWYgZW5kc1dpdGggdXJsLCAnLnhtbCdcbiAgICAgICAgcGFyc2VTdHJpbmcgeG1saHR0cC5yZXNwb25zZVRleHQsIChlcnIsIHJlc3VsdCkgLT5cbiAgICAgICAgICBjb25zdHJ1Y3RGbG9vcnBsYW5Gcm9tRk1MIHJlc3VsdFxuICAgICAgZWxzZSBpZiBlbmRzV2l0aCB1cmwsICcuanNvbidcbiAgICAgICAgY29uc3RydWN0Rmxvb3JwbGFuRnJvbVJTIEpTT04ucGFyc2UgeG1saHR0cC5yZXNwb25zZVRleHRcbiAgICAgICAgXG4gIHhtbGh0dHAub3BlbihcIkdFVFwiLHVybCwgZmFsc2UpXG4gIHhtbGh0dHAuc2VuZCgpXG5cbmdldEpTT04gPSAocXVlcnksIGNhbGxiYWNrKSAtPlxuICB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cbiAgICBpZiB4aHIucmVhZHlTdGF0ZSBpcyA0IGFuZCB4aHIuc3RhdHVzIGlzIDIwMFxuICAgICAgb2JqID0gSlNPTi5wYXJzZSB4aHIucmVzcG9uc2VUZXh0XG4gICAgICBjYWxsYmFjayBvYmpcbiAgeGhyLm9wZW4gJ0dFVCcsIHF1ZXJ5LCB0cnVlXG4gIHhoci5zZW5kKClcblxuXG5jb25zdHJ1Y3RRdWVyeSA9IChjb21wb25lbnRzKSAtPlxuICBxdWVyeSA9IE1ZREVDT19RVUVSWVxuICBpZiB0eXBlb2YgY29tcG9uZW50cyBpcyAnb2JqZWN0J1xuICAgIGZvciBjIGluIGNvbXBvbmVudHNcbiAgICAgIHF1ZXJ5ICs9IFwiJmlkPVwiICsgYy5jb21wb25lbnRfaWRcbiAgZWxzZSBxdWVyeSArPSBcIiZpZD1cIiArIGNvbXBvbmVudHNcbiAgcXVlcnlcblxuXG5cbmNvbnN0cnVjdEZsb29ycGxhbkZyb21SUyA9IChycykgLT5cbiAgc2NlbmUgPSBGbG9vcnBsYW4uZ2V0KClcbiAgc2NlbmUuZGVzdHJveURhdGEoKVxuICAgXG4gIHBsYW4gPSBycy5tb2RlbC5wbGFuXG4gIGZvciBrLHdhbGwgb2YgcGxhbi53YWxsc1xuICAgIHRoaWNrbmVzcyA9IHdhbGwudGhpY2tuZXNzXG4gICAgYSA9IHBsYW4ucG9pbnRzW3dhbGwuaW5kaWNlc1swXV1cbiAgICBiID0gcGxhbi5wb2ludHNbd2FsbC5pbmRpY2VzWzFdXVxuICAgIHNjZW5lLmFkZFdhbGwge3g6cGFyc2VJbnQoYVswXSksIHk6cGFyc2VJbnQoYVsxXSotMSl9LFxuICAgICAgICAgICAgICAgICAge3g6cGFyc2VJbnQoYlswXSksIHk6cGFyc2VJbnQoYlsxXSotMSl9LCB0aGlja25lc3MrMlxuXG4gIHNjZW5lLmRyYXdXYWxscygpXG4gIFxuICBmb3IgayxhcmVhIG9mIHBsYW4uYXJlYXNcbiAgICBhcnIgPSBbXVxuICAgIGZvciBwSW5kZXggaW4gYXJlYS5pbmRpY2VzXG4gICAgICBwID0gcGxhbi5wb2ludHNbcEluZGV4XVxuICAgICAgYXJyLnB1c2gge3g6cFswXSwgeTpwWzFdKi0xfVxuICAgIHNjZW5lLmRyYXdBcmVhIGFyclxuICAgIFxuXG4gIHF1ZXJ5ID0gY29uc3RydWN0UXVlcnkgcnMubW9kZWwuY29tcG9uZW50c1xuXG4gIG9uUlNBc3NldHNMb2FkZWQgPSAoKSA9PlxuICAgICNjb25zb2xlLmxvZyBQSVhJLlRleHR1cmVDYWNoZVxuICAgIGZvciBrLHYgb2YgUElYSS5UZXh0dXJlQ2FjaGVcbiAgICAgIGNvbnNvbGUubG9nIGssdlxuICAgICAgc3ByaXRlID0gIG5ldyBQSVhJLlNwcml0ZS5mcm9tSW1hZ2UodilcbiAgICAgIGlmIHNwcml0ZSB0aGVuIGNvbnNvbGUubG9nIHNwcml0ZVxuICAgICAgY29uc29sZS5sb2cgc2NlbmVcbiAgICAgIHNjZW5lLmFzc2V0Q29udGFpbmVyLmFkZENoaWxkKHNwcml0ZSlcblxuICBnZXRKU09OIHF1ZXJ5LCAoZGF0YSkgLT4gXG4gICAgdXJscyA9IFtdXG4gICAgZm9yIGssIHYgb2YgZGF0YS5wcm9kdWN0cyB3aGVuIHYgaXNudCBudWxsXG4gICAgICB1cmxzLnB1c2ggdi5yZW5kZXJzWzBdLnRvcFxuICAgIGxvYWRlciA9IG5ldyBQSVhJLkFzc2V0TG9hZGVyKHVybHMsIHRydWUpXG4gICAgbG9hZGVyLm9uQ29tcGxldGUgPSBvblJTQXNzZXRzTG9hZGVkXG4gICAgbG9hZGVyLmxvYWQoKVxuXG4gIFxuXG5jb25zdHJ1Y3RGbG9vcnBsYW5Gcm9tRk1MID0gKGZtbCkgLT5cbiAgTVVMVElQTElFUiA9IDEwMCAjdG8gZ28gZnJvbSBGTUwgdW5pdHMgdG8gc2NyZWVuIHVuaXRzIFxuICBzY2VuZSA9IEZsb29ycGxhbi5nZXQoKVxuICBzY2VuZS5kZXN0cm95RGF0YSgpXG4gIHJvb3QgPSBudWxsXG4gIGlmIGZtbC5oYXNPd25Qcm9wZXJ0eSAnZGVzaWduJyAjIHRoZSBub3JtYWwgb25lXG4gICAgcm9vdCA9IGZtbC5kZXNpZ25cbiAgZWxzZSBpZiBmbWwuaGFzT3duUHJvcGVydHkgJ3Byb2plY3QnICMgdGhlIHBvcnRhbCBvbmVcbiAgICByb290ID0gZm1sLnByb2plY3QuZmxvb3JzWzBdLmZsb29yWzBdLmRlc2lnbnNbMF0uZGVzaWduWzBdXG4gIGVsc2UgXG4gICAgY29uc29sZS5sb2cgJ3Vua25vd24nLCBmbWxcbiAgXG4gIGxpbmVzID0gcm9vdC5saW5lc1swXS5saW5lXG4gIGFyZWFzID0gcm9vdC5hcmVhc1swXS5hcmVhXG4gIGFzc2V0cyA9IHJvb3QuYXNzZXRzWzBdLmFzc2V0XG5cbiAgZm9yIGFyZWEgaW4gYXJlYXNcbiAgICBvdXRQb2ludHMgPSBbXVxuICAgIHByZVBvaW50cyA9IGFyZWEucG9pbnRzWzBdLnNwbGl0KFwiLFwiKVxuICAgIGZvciBwb2ludCBpbiBwcmVQb2ludHNcbiAgICAgIFt4MSwgeTEsIHoxLCB4MiwgeTIsIHoyXSA9IHBvaW50LnNwbGl0KFwiIFwiKVxuICAgICAgb3V0UG9pbnRzLnB1c2gge3g6eDEgKiBNVUxUSVBMSUVSLCB5OnkxICogTVVMVElQTElFUn1cbiAgICAgIG91dFBvaW50cy5wdXNoIHt4OngyICogTVVMVElQTElFUiwgeTp5MiAqIE1VTFRJUExJRVJ9XG4gICAgc2NlbmUuZHJhd0FyZWEgb3V0UG9pbnRzXG5cbiAgZm9yIGxpbmUgaW4gbGluZXNcbiAgICBpZiBsaW5lLnR5cGVbMF0gaXMgJ2RlZmF1bHRfd2FsbCcjJ25vcm1hbF93YWxsJ1xuICAgICAgW3gxLCB5MSwgejEsIHgyLCB5MiwgejJdID0gbGluZS5wb2ludHNbMF0uc3BsaXQoXCIgXCIpXG4gICAgICBhID0ge3g6cGFyc2VJbnQoeDEgKiBNVUxUSVBMSUVSKSwgeTpwYXJzZUludCh5MSAqIE1VTFRJUExJRVIpfVxuICAgICAgYiA9IHt4OnBhcnNlSW50KHgyICogTVVMVElQTElFUiksIHk6cGFyc2VJbnQoeTIgKiBNVUxUSVBMSUVSKX1cbiAgICAgIHNjZW5lLmFkZFdhbGwgYSwgYiwgbGluZS50aGlja25lc3NbMF0gKiBNVUxUSVBMSUVSXG4gICAgZWxzZVxuICAgICAgY29uc29sZS5sb2cgXCIje2xpbmUudHlwZVswXX0gbm90IGRyYXduLlwiIFxuICBhc3NldFVSTFMgPSBbXVxuICBmb3IgYXNzZXQgaW4gYXNzZXRzXG4gICAgaWYgZW5kc1dpdGggYXNzZXQudXJsMmRbMF0sICdmbHonIFxuICAgICAgdXJsID0gQ0ROK2Fzc2V0LnVybDJkWzBdLnJlcGxhY2UoJ2Zsei8nLCdqc29ucC8nKS5yZXBsYWNlKCcuZmx6JywnLmpzb25wJylcbiAgICAgIGFzc2V0VVJMUy5wdXNoIHVybFxuICAgIGVsc2VcbiAgICAgIGNvbnNvbGUubG9nIFwibm90IGhhbmRsaW5nIGZpbGUgI3thc3NldC51cmwyZFswXX0geWV0XCJcbiAgbG9hZEpTT05QQXNzZXRzIGFzc2V0VVJMU1xuICBzY2VuZS5kcmF3V2FsbHMoKVxuXG5cblxuICBjb25zb2xlLmxvZyBcImxpbmVzOiAje2xpbmVzLmxlbmd0aH0sIGFyZWFzOiAje2FyZWFzLmxlbmd0aH1cIlxuXG5lbmRzV2l0aD0oc3RyLCBzdWZmaXgpIC0+XG4gICAgc3RyLmluZGV4T2Yoc3VmZml4LCBzdHIubGVuZ3RoIC0gc3VmZml4Lmxlbmd0aCkgaXNudCAtMVxuXG4iLCJcbndpbmRvd1sncmVjZWl2ZV9hc3NldCddID0gKGFzc2V0KSAtPlxuXG5GbG9vcnBsYW4gPSByZXF1aXJlICcuL2Zsb29ycGxhbidcbntjcmVhdGVJbWFnZSwgY2hhbmdlQ29sSW5VcmksIG1hc2tGbGlwfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cblxubG9hZEFzc2V0ID0gKHVybCwgZXJyb3IsIHN1Y2NlcykgLT5cbiAgJC5hamF4XG4gICAgdXJsOiB1cmxcbiAgICBkYXRhVHlwZTogJ2pzb25wJ1xuICAgIGpzb25wQ2FsbGJhY2s6ICdyZWNlaXZlX2Fzc2V0J1xuICAgIGpzb25wOiAnY2FsbGJhY2snXG4gICAgZXJyb3I6IGVycm9yXG4gICAgc3VjY2Vzczogc3VjY2VzXG5cblxubW9kdWxlLmV4cG9ydHMubG9hZEpTT05QQXNzZXRzID0gKHVybEFycmF5KSAtPlxuICAjIGxvYWRzIGFsbCB1cmxzIGluIHVybEFycmF5IHNlcXVlbnRpYWxseSBhbmQgYnkgd2FpdGluZyBmb3IgdGhlaXIgdHVybi5cbiBcbiAgdXJsID0gbnVsbCAgIyB0aGUgY3VycmVudCB1cmwgdGhhdCdzIGJlZW4gbG9hZGVkLlxuICBkZWxheSA9IChtcywgZnVuYykgLT4gc2V0VGltZW91dCBmdW5jLCBtc1xuXG4gIGVycm9yID0gKGRhdGEpIC0+IFxuICAgIGNvbnNvbGUubG9nICdlcnJvcicsZGF0YVxuICAgIGFkdmFuY2VMb2FkZXIoZmFsc2UpXG4gIHN1Y2NlcyA9IChkYXRhKSAtPiBcbiAgICBzY2VuZSA9IEZsb29ycGxhbi5nZXQoKVxuICAgIGlmIGRhdGEudW5kZXJcbiAgICAgIGNyZWF0ZUltYWdlIGRhdGEudW5kZXIsIHVybCwgJy51bmRlcicgXG4gICAgICBzcHJpdGUgPSAgbmV3IFBJWEkuU3ByaXRlLmZyb21JbWFnZSh1cmwrJy51bmRlcicpXG4gICAgICBzY2VuZS5hc3NldENvbnRhaW5lci5hZGRDaGlsZChzcHJpdGUpXG4gICAgaWYgZGF0YS5jb2xvclxuICAgICAgbmV3ZGF0YSA9IGRhdGEuY29sb3IgI21hc2tGbGlwIGRhdGEuY29sb3IgXG4gICAgICBjcmVhdGVJbWFnZSBuZXdkYXRhLCB1cmwsICcuY29sb3InIFxuICAgICAgc3ByaXRlID0gIG5ldyBQSVhJLlNwcml0ZS5mcm9tSW1hZ2UodXJsKycuY29sb3InKVxuICAgICAgI3Nwcml0ZS5wb3NpdGlvbi54ID0gTWF0aC5yYW5kb20oKSo4MDBcbiAgICAgIHNjZW5lLmFzc2V0Q29udGFpbmVyLmFkZENoaWxkKHNwcml0ZSlcbiAgICAgIGNvbnNvbGUubG9nICdkYXRhLmNvbG9yJ1xuICAgIGlmIGRhdGEub3ZlciBcbiAgICAgIGNyZWF0ZUltYWdlIGRhdGEub3ZlciwgdXJsLCAnLm92ZXInIFxuICAgICAgc3ByaXRlID0gIG5ldyBQSVhJLlNwcml0ZS5mcm9tSW1hZ2UodXJsKycub3ZlcicpXG4gICAgICBzY2VuZS5hc3NldENvbnRhaW5lci5hZGRDaGlsZChzcHJpdGUpXG4gICAgYWR2YW5jZUxvYWRlcih0cnVlKVxuICBcbiAgYWR2YW5jZUxvYWRlciA9IChoYWRTdWNjZXMpIC0+XG4gICAgY29uc29sZS5sb2cgJ2xvYWRlciBhZHZhbmNpbmcnXG4gICAgaWYgdXJsQXJyYXkubGVuZ3RoID4gMFxuICAgICAgdXJsID0gdXJsQXJyYXkucG9wKClcbiAgICAgIGlmIGhhZFN1Y2NlcyB0aGVuIGxvYWRBc3NldCB1cmwsIGVycm9yLCBzdWNjZXMgXG4gIFxuICBhZHZhbmNlTG9hZGVyKHRydWUpXG5cbiIsIkZsb29ycGxhbiA9IHJlcXVpcmUgJy4vZmxvb3JwbGFuJ1xue2xvYWRGbG9vclBsYW59ID0gcmVxdWlyZSAnLi9pbXBvcnRlcicgXG5cbmhhbmRsZUZpbGVTZWxlY3QgPSAoZXZlbnQpIC0+XG4gIGxvYWRGbG9vclBsYW4gJ2RhdGEvJyArIGV2ZW50LnRhcmdldC5maWxlc1swXS5uYW1lXG5cbmluaXQgPSAtPlxuICBzdGF0cyA9IG5ldyBTdGF0cygpXG4gIHN0YXRzLnNldE1vZGUoMClcbiAgc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcbiAgc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5yaWdodCA9ICczMDBweCdcbiAgc3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4J1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHN0YXRzLmRvbUVsZW1lbnQpXG4gIFxuICBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKVxuICBpbnB1dC50eXBlID0gXCJmaWxlXCJcbiAgaW5wdXQuaWQgPSBcImZpbGVzXCJcbiAgaW5wdXQubmFtZSA9IFwiZmlsZXNbXVwiXG4gIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGhhbmRsZUZpbGVTZWxlY3QsIGZhbHNlKVxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkIGlucHV0XG4gIG91dHB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ291dHB1dCcpXG4gIG91dHB1dC5pZCA9IFwibGlzdFwiXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQgb3V0cHV0XG4gIFxuICByZW5kZXJlciA9IFBJWEkuYXV0b0RldGVjdFJlbmRlcmVyIDIwNDgsIDIwNDgsIG51bGwsIGZhbHNlLCB0cnVlXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQgcmVuZGVyZXIudmlld1xuXG4gIGd1aSA9IG5ldyBkYXQuR1VJKClcbiAgc2NlbmUgPSBGbG9vcnBsYW4uZ2V0KClcbiBcbiAgZ3VpLmFkZENvbG9yKHNjZW5lLCAnYmFja2dyb3VuZENvbG9yJykub25DaGFuZ2UgKHZhbHVlKSAtPiBcbiAgICBzY2VuZS5zZXRCYWNrZ3JvdW5kQ29sb3IgdmFsdWUucmVwbGFjZSgnIycsICcweCcpXG4gIGd1aS5hZGRDb2xvcihzY2VuZSwgJ3dhbGxDb2xvcicpLm9uQ2hhbmdlICh2YWx1ZSkgLT4gXG4gICAgc2NlbmUud2FsbENvbnRhaW5lci50aW50ID0gdmFsdWUucmVwbGFjZSgnIycsICcweCcpXG4gIGd1aS5hZGRDb2xvcihzY2VuZSwgJ2FyZWFDb2xvcicpLm9uQ2hhbmdlICh2YWx1ZSkgLT4gXG4gICAgc2NlbmUuYXJlYUNvbnRhaW5lci50aW50ID0gdmFsdWUucmVwbGFjZSgnIycsICcweCcpXG4gIGd1aS5hZGRDb2xvcihzY2VuZSwgJ2Fzc2V0Q29sb3InKS5vbkNoYW5nZSAodmFsdWUpIC0+IFxuICAgIGZvciBjaGlsZCBpbiBzY2VuZS5hc3NldENvbnRhaW5lci5jaGlsZHJlblxuICAgICAgY2hpbGQudGludCA9IHZhbHVlIy5yZXBsYWNlKCcjJywgJzB4JylcbiAgI2xvYWRGbG9vclBsYW4gJ2RhdGEvUlNfTGFrZS5qc29uJ1xuICBsb2FkRmxvb3JQbGFuICdkYXRhL3JpamtzZ2Vib3V3ZW5kaWVuc3QueG1sJ1xuXG5cbiAgXG4gIGFuaW1hdGUgPSAoKSAtPiBcbiAgICBzdGF0cy5iZWdpbigpXG4gICAgcmVxdWVzdEFuaW1GcmFtZShhbmltYXRlKVxuICAgIHJlbmRlcmVyLnJlbmRlcihGbG9vcnBsYW4uZ2V0KCkpXG4gICAgc3RhdHMuZW5kKClcblxuICByZXF1ZXN0QW5pbUZyYW1lKCBhbmltYXRlIClcblxuXG5cbndpbmRvdy5vbmxvYWQgPSAtPlxuICBpbml0KClcblxuIiwibW9kdWxlLmV4cG9ydHMuY3JlYXRlSW1hZ2UgPSAoc3JjLCB1cmwsIHBvc3RmaXgpIC0+XG4gIGltYWdlID0gbmV3IEltYWdlKClcbiAgaW1hZ2Uuc3JjID0gc3JjXG4gIGJhc2VUZXh0dXJlID0gbmV3IFBJWEkuQmFzZVRleHR1cmUgaW1hZ2VcbiAgdGV4dHVyZSA9IG5ldyBQSVhJLlRleHR1cmUgYmFzZVRleHR1cmVcbiAgUElYSS5UZXh0dXJlLmFkZFRleHR1cmVUb0NhY2hlIHRleHR1cmUsdXJsICsgcG9zdGZpeFxuXG5tb2R1bGUuZXhwb3J0cy5tYXNrRmxpcCA9IChkYXRhKSAtPlxuICAjIC0gd2hpdGUgc2hvdWxkIGJlY29tZSB0cmFuc3BhcmVudFxuICAjIC0gYmxhY2sgc2hvdWxkIGJlY29tZSB3aGl0ZVxuICBcbiAgd2hpdGVTdHJpbmcgPSAnI2ZmZmZmZidcbiAgYmxhY2tTdHJpbmcgPSAnIzAwMDAwMCdcbiAgd2hpdGUgPSBoZXhUb1JHQih3aGl0ZVN0cmluZylcbiAgYmxhY2sgPSBoZXhUb1JHQihibGFja1N0cmluZylcblxuICAjIGNyZWF0ZSBmYWtlIGltYWdlIHRvIGNhbGN1bGF0ZSBoZWlnaHQgLyB3aWR0aFxuICBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpXG4gIGltZy5zcmMgPSBkYXRhXG4gIGltZy5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIlxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkIGltZ1xuICBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpXG4gIGNhbnZhcy53aWR0aCA9IGltZy5vZmZzZXRXaWR0aFxuICBjYW52YXMuaGVpZ2h0ID0gaW1nLm9mZnNldEhlaWdodFxuICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpXG4gIGN0eC5kcmF3SW1hZ2UgaW1nLCAwLCAwXG4gIFxuICAjIHJlbW92ZSBpbWFnZVxuICBpbWcucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCBpbWdcbiAgXG4gICMgZG8gYWN0dWFsIGNvbG9yIHJlcGxhY2VtZW50XG4gIGltYWdlRGF0YSA9IGN0eC5nZXRJbWFnZURhdGEoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KVxuICBkYXRhID0gaW1hZ2VEYXRhLmRhdGFcbiAgciA9IHVuZGVmaW5lZFxuICBnID0gdW5kZWZpbmVkXG4gIGIgPSB1bmRlZmluZWRcbiAgeCA9IDBcbiAgbGVuID0gZGF0YS5sZW5ndGhcbiAgd2hpbGUgeCA8IGxlblxuICAgIHIgPSBkYXRhW3hdXG4gICAgZyA9IGRhdGFbeCArIDFdXG4gICAgYiA9IGRhdGFbeCArIDJdXG4gICAgaWYgKHIgaXMgd2hpdGUucikgYW5kIChnIGlzIHdoaXRlLmcpIGFuZCAoYiBpcyB3aGl0ZS5iKVxuICAgICAgI21ha2luZyB3aGl0ZSB0cmFuc3BhcmVudFxuICAgICAgZGF0YVt4ICsgM10gPSAwXG4gICAgaWYgKHIgaXMgYmxhY2sucikgYW5kIChnIGlzIGJsYWNrLmcpIGFuZCAoYiBpcyBibGFjay5iKVxuICAgICAgI21ha2luZyBibGFjayB3aGl0ZVxuICAgICAgZGF0YVt4XSA9IHdoaXRlLnJcbiAgICAgIGRhdGFbeCArIDFdID0gd2hpdGUuZ1xuICAgICAgZGF0YVt4ICsgMl0gPSB3aGl0ZS5iXG4gICAgeCArPSA0XG4gIGN0eC5wdXRJbWFnZURhdGEgaW1hZ2VEYXRhLCAwLCAwXG4gIG91dERhdGEgPSBjYW52YXMudG9EYXRhVVJMKClcbiAgY29uc29sZS5sb2cgXCJmbGlwXCJcbiAgb3V0RGF0YVxuXG5tb2R1bGUuZXhwb3J0cy5jaGFuZ2VDb2xJblVyaSA9IChkYXRhLCBjb2xmcm9tLCBjb2x0bywgdG9UcmFuc3BhcmFudCkgLT5cbiAgXG4gICMgY3JlYXRlIGZha2UgaW1hZ2UgdG8gY2FsY3VsYXRlIGhlaWdodCAvIHdpZHRoXG4gIGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIilcbiAgaW1nLnNyYyA9IGRhdGFcbiAgaW1nLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQgaW1nXG4gIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIilcbiAgY2FudmFzLndpZHRoID0gaW1nLm9mZnNldFdpZHRoXG4gIGNhbnZhcy5oZWlnaHQgPSBpbWcub2Zmc2V0SGVpZ2h0XG4gIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIilcbiAgY3R4LmRyYXdJbWFnZSBpbWcsIDAsIDBcbiAgXG4gICMgcmVtb3ZlIGltYWdlXG4gIGltZy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkIGltZ1xuICBcbiAgIyBkbyBhY3R1YWwgY29sb3IgcmVwbGFjZW1lbnRcbiAgaW1hZ2VEYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpXG4gIGRhdGEgPSBpbWFnZURhdGEuZGF0YVxuICByZ2Jmcm9tID0gaGV4VG9SR0IoY29sZnJvbSlcbiAgcmdidG8gPSBoZXhUb1JHQihjb2x0bylcbiAgciA9IHVuZGVmaW5lZFxuICBnID0gdW5kZWZpbmVkXG4gIGIgPSB1bmRlZmluZWRcbiAgeCA9IDBcbiAgbGVuID0gZGF0YS5sZW5ndGhcbiAgd2hpbGUgeCA8IGxlblxuICAgIHIgPSBkYXRhW3hdXG4gICAgZyA9IGRhdGFbeCArIDFdXG4gICAgYiA9IGRhdGFbeCArIDJdXG4gICAgaWYgKHIgaXMgcmdiZnJvbS5yKSBhbmQgKGcgaXMgcmdiZnJvbS5nKSBhbmQgKGIgaXMgcmdiZnJvbS5iKVxuICAgICAgZGF0YVt4XSA9IHJnYnRvLnJcbiAgICAgIGRhdGFbeCArIDFdID0gcmdidG8uZ1xuICAgICAgZGF0YVt4ICsgMl0gPSByZ2J0by5iXG4gICAgICBpZiB0b1RyYW5zcGFyYW50IHRoZW4gZGF0YVt4ICsgM10gPSAwXG4gICAgeCArPSA0XG4gIGN0eC5wdXRJbWFnZURhdGEgaW1hZ2VEYXRhLCAwLCAwXG4gIGNhbnZhcy50b0RhdGFVUkwoKVxuICBcbmhleFRvUkdCID0gKGhleFN0cikgLT5cbiAgY29sID0ge31cbiAgY29sLnIgPSBwYXJzZUludChoZXhTdHIuc3Vic3RyKDEsIDIpLCAxNilcbiAgY29sLmcgPSBwYXJzZUludChoZXhTdHIuc3Vic3RyKDMsIDIpLCAxNilcbiAgY29sLmIgPSBwYXJzZUludChoZXhTdHIuc3Vic3RyKDUsIDIpLCAxNilcbiAgY29sXG4iLCJcbmNsYXNzIFdhbGxDb3JuZXJcbiAgY29uc3RydWN0b3I6IChAeCwgQHkpLT5cbiAgICBAZWRnZXMgPSBbXVxuICBhZGRFZGdlIDogKGVkZ2UpIC0+XG4gICAgQGVkZ2VzLnB1c2ggZWRnZVxuICBnZXRBZGphY2VudDogKGZyb21FZGdlKSAtPlxuICAgIChlZGdlIGZvciBlZGdlIGluIEBlZGdlcyB3aGVuIGZyb21FZGdlIGlzbnQgZWRnZSlcblxuY2xhc3MgV2FsbEVkZ2VcbiAgY29uc3RydWN0b3IgOiAoQGNvcm5lcjEsIEBjb3JuZXIyLCBAdGhpY2tuZXNzKSAtPlxuICBnZXRPdGhlckNvcm5lciA6IChjb3JuZXIpIC0+XG4gICAgaWYgY29ybmVyLnggaXMgQGNvcm5lcjEueCBhbmQgY29ybmVyLnkgaXMgQGNvcm5lcjEueSB0aGVuIHJldHVybiBAY29ybmVyMlxuICAgIGlmIGNvcm5lci54IGlzIEBjb3JuZXIyLnggYW5kIGNvcm5lci55IGlzIEBjb3JuZXIyLnkgdGhlbiByZXR1cm4gQGNvcm5lcjFcbiAgICBcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgV2FsbEdyYXBoXG4gIGNvbnN0cnVjdG9yIDogLT5cbiAgICBAX2Nvcm5lck1hcCA9IHt9XG5cbiAgZ2V0Q29ybmVycyA6IC0+XG4gICAgdiBmb3IgaywgdiBvZiBAX2Nvcm5lck1hcFxuXG4gIGFkZFdhbGw6IChwMSwgcDIsIHRoaWNrbmVzcykgLT5cbiAgICBjb3JuZXIxID0gQF9hZGRDb3JuZXIocDEueCwgcDEueSlcbiAgICBjb3JuZXIyID0gQF9hZGRDb3JuZXIocDIueCwgcDIueSlcbiAgICBlZGdlID0gbmV3IFdhbGxFZGdlKGNvcm5lcjEsIGNvcm5lcjIsIHRoaWNrbmVzcylcbiAgICBjb3JuZXIxLmFkZEVkZ2UgZWRnZVxuICAgIGNvcm5lcjIuYWRkRWRnZSBlZGdlXG5cbiAgX2FkZENvcm5lcjogKHgsIHkpIC0+XG4gICAgaWYgQF9jb3JuZXJNYXBbXCIje3h9LCN7eX1cIl1cbiAgICAgIHJldHVybiBAX2Nvcm5lck1hcFtcIiN7eH0sI3t5fVwiXVxuICAgIGVsc2VcbiAgICAgIEBfY29ybmVyTWFwW1wiI3t4fSwje3l9XCJdID0gbmV3IFdhbGxDb3JuZXIoeCx5KVxuICAgICAgcmV0dXJuIEBfY29ybmVyTWFwW1wiI3t4fSwje3l9XCJdIFxuXG5cbiJdfQ==
