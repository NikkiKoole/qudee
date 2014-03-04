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
    this.assetContainer = new PIXI.DisplayObjectContainer();
    this.tintAssets(this.assetColor);
    this.addChild(this.container);
    this.addChild(this.areaContainer);
    this.addChild(this.wallContainer);
    this.addChild(this.assetContainer);
    this.wallGraph = new WallGraph();
  }

  Floorplan.prototype.tintAssets = function(tint) {
    var child, _i, _len, _ref, _results;
    _ref = this.assetContainer.children;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      child.tint = this.assetColor.replace('#', '0x');
      _results.push(console.log(child.tint));
    }
    return _results;
  };

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
    return scene.tintAssets(value);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9uaWtraWtvb2xlL0Rlc2t0b3AvcXVkZWUvc3JjL2Zsb29ycGxhbi5jb2ZmZWUiLCIvVXNlcnMvbmlra2lrb29sZS9EZXNrdG9wL3F1ZGVlL3NyYy9pbXBvcnRlci5jb2ZmZWUiLCIvVXNlcnMvbmlra2lrb29sZS9EZXNrdG9wL3F1ZGVlL3NyYy9qc29ucGxvYWRlci5jb2ZmZWUiLCIvVXNlcnMvbmlra2lrb29sZS9EZXNrdG9wL3F1ZGVlL3NyYy9tYWluLmNvZmZlZSIsIi9Vc2Vycy9uaWtraWtvb2xlL0Rlc2t0b3AvcXVkZWUvc3JjL3V0aWxzLmNvZmZlZSIsIi9Vc2Vycy9uaWtraWtvb2xlL0Rlc2t0b3AvcXVkZWUvc3JjL3dhbGxncmFwaC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLG9CQUFBO0VBQUE7aVNBQUE7O0FBQUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxhQUFSLENBQVosQ0FBQTs7QUFBQSxNQUVNLENBQUMsT0FBUCxHQUF1QjtBQUNyQixNQUFBLFFBQUE7O0FBQUEsOEJBQUEsQ0FBQTs7QUFBQSxFQUFBLFFBQUEsR0FBVyxJQUFYLENBQUE7O0FBQUEsRUFDQSxTQUFDLENBQUEsR0FBRCxHQUFPLFNBQUEsR0FBQTs4QkFDTCxXQUFBLFdBQWdCLElBQUEsU0FBQSxDQUFBLEVBRFg7RUFBQSxDQURQLENBQUE7O0FBR2EsRUFBQSxtQkFBQSxHQUFBO0FBQ1gsSUFBQSwyQ0FBTSxRQUFOLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLGVBQUQsR0FBbUIsU0FEbkIsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxTQUZiLENBQUE7QUFBQSxJQUdBLElBQUMs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RixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJXYWxsR3JhcGggPSByZXF1aXJlICcuL3dhbGxncmFwaCdcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBGbG9vcnBsYW4gZXh0ZW5kcyBQSVhJLlN0YWdlXG4gIGluc3RhbmNlID0gbnVsbFxuICBAZ2V0IDogLT5cbiAgICBpbnN0YW5jZSA/PSBuZXcgRmxvb3JwbGFuKClcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXIoMHgwMDAwMDApXG4gICAgQGJhY2tncm91bmRDb2xvciA9ICcjMDAwMDAwJ1xuICAgIEB3YWxsQ29sb3IgPSAnI2ZmZmZmZidcbiAgICBAYXJlYUNvbG9yID0gJyM0NDQ0NDQnXG4gICAgQGFzc2V0Q29sb3IgPScjZmZmZmZmJ1xuICAgIEBjb250YWluZXIgPSBuZXcgUElYSS5HcmFwaGljcygpXG4gICAgQHdhbGxDb250YWluZXIgPSBuZXcgUElYSS5HcmFwaGljcygpXG4gICAgQHdhbGxDb250YWluZXIudGludCA9IEB3YWxsQ29sb3IucmVwbGFjZSgnIycsICcweCcpXG4gICAgQGFyZWFDb250YWluZXIgPSBuZXcgUElYSS5HcmFwaGljcygpXG4gICAgQGFyZWFDb250YWluZXIudGludCA9IEBhcmVhQ29sb3IucmVwbGFjZSgnIycsICcweCcpXG4gICAgQGFzc2V0Q29udGFpbmVyID0gbmV3IFBJWEkuRGlzcGxheU9iamVjdENvbnRhaW5lcigpXG4gICAgQHRpbnRBc3NldHMgQGFzc2V0Q29sb3JcblxuICAgIEAuYWRkQ2hpbGQgQGNvbnRhaW5lclxuICAgIEAuYWRkQ2hpbGQgQGFyZWFDb250YWluZXJcbiAgICBALmFkZENoaWxkIEB3YWxsQ29udGFpbmVyXG4gICAgQC5hZGRDaGlsZCBAYXNzZXRDb250YWluZXJcbiAgICBAd2FsbEdyYXBoID0gbmV3IFdhbGxHcmFwaCgpXG4gICAgXG4gIHRpbnRBc3NldHM6ICh0aW50KSAtPlxuICAgIGZvciBjaGlsZCBpbiBAYXNzZXRDb250YWluZXIuY2hpbGRyZW5cbiAgICAgIGNoaWxkLnRpbnQgPSAgQGFzc2V0Q29sb3IucmVwbGFjZSgnIycsICcweCcpXG4gICAgICBjb25zb2xlLmxvZyBjaGlsZC50aW50XG5cbiAgZGVzdHJveURhdGE6IC0+XG4gICAgQHdhbGxHcmFwaCA9IG5ldyBXYWxsR3JhcGgoKVxuICAgIEBjb250YWluZXIuY2xlYXIoKVxuICAgIEB3YWxsQ29udGFpbmVyLmNsZWFyKClcbiAgICBAYXJlYUNvbnRhaW5lci5jbGVhcigpXG4gICAgXG5cbiAgYWRkV2FsbDogKGEsIGIsIHRoaWNrbmVzcykgLT5cbiAgICBAd2FsbEdyYXBoLmFkZFdhbGwoYSwgYiwgdGhpY2tuZXNzKVxuXG4gIGRyYXdXYWxsczogLT5cbiAgICBAd2FsbENvbnRhaW5lci5saW5lU3R5bGUgMCwgMHhmZmZmZmZcbiAgICBmb3IgY29ybmVyIGluIEB3YWxsR3JhcGguZ2V0Q29ybmVycygpXG4gICAgICBmb3IgZWRnZTEgaW4gY29ybmVyLmVkZ2VzXG4gICAgICAgIGZvciBlZGdlMiBpbiBjb3JuZXIuZWRnZXNcbiAgICAgICAgICBpZiBlZGdlMSBpc250IGVkZ2UyXG4gICAgICAgICAgICAjIG5vdyBkcmF3IDIgY29ubmVjdGVkIGxpbmVzIFxuICAgICAgICAgICAgIyAxKSBmcm9tICB0aGUgb3RoZXIgZW5kIG9mIGVkZ2UxIHRvIGNvcm5lclxuICAgICAgICAgICAgIyAyKSBmcm9tIGNvcm5lciB0byB0aGUgb3RoZXIgZW5kIG9mIGVkZ2UyXG4gICAgICAgICAgICAjIHRvIHNhdmUgb24gc3RhdGUgY2hhbmdlcyBJIHRlc3QgdG8gc2VlIGlmIEkgbmVlZCB0byBzZXQgbGluZVN0eWxlXG4gICAgICAgICAgICBAd2FsbENvbnRhaW5lci5tb3ZlVG8oZWRnZTEuZ2V0T3RoZXJDb3JuZXIoY29ybmVyKS54LCBlZGdlMS5nZXRPdGhlckNvcm5lcihjb3JuZXIpLnkpXG4gICAgICAgICAgICBAX3NldExpbmVUaGlja25lc3MgZWRnZTEudGhpY2tuZXNzXG4gICAgICAgICAgICBAd2FsbENvbnRhaW5lci5saW5lVG8oY29ybmVyLngsIGNvcm5lci55KVxuXG4gICAgICAgICAgICBAX3NldExpbmVUaGlja25lc3MgZWRnZTIudGhpY2tuZXNzXG4gICAgICAgICAgICBAd2FsbENvbnRhaW5lci5saW5lVG8oZWRnZTIuZ2V0T3RoZXJDb3JuZXIoY29ybmVyKS54LCBlZGdlMi5nZXRPdGhlckNvcm5lcihjb3JuZXIpLnkpXG5cbiAgX3NldExpbmVUaGlja25lc3MgOiAodGhpY2tuZXNzKSAtPlxuICAgIGlmIEBsYXN0VGhpY2tuZXNzIGlzbnQgdGhpY2tuZXNzXG4gICAgICBAbGFzdFRoaWNrbmVzcyA9IHRoaWNrbmVzc1xuICAgICAgQHdhbGxDb250YWluZXIubGluZVN0eWxlIEBsYXN0VGhpY2tuZXNzLCAweGZmZmZmZlxuXG4gICNhcmVhIHNob3VsZCBiZSBpbnB1dCBpbiBmb3JtIFxuICAjW3t4LHl9LHt4LHl9XVxuICBkcmF3QXJlYSA6IChhcmVhKSAtPlxuICAgIEBhcmVhQ29udGFpbmVyLmJlZ2luRmlsbCAweGZmZmZmZlxuICAgIEBhcmVhQ29udGFpbmVyLmxpbmVTdHlsZSAwLCAweGZmZmZmZlxuICAgIGZvciBwIGluIGFyZWFcbiAgICAgIEBhcmVhQ29udGFpbmVyLmxpbmVUbyhwLngsIHAueSlcbiAgICAgICNjb25zb2xlLmxvZyBwXG4gICAgQGFyZWFDb250YWluZXIuZW5kRmlsbCgpXG5cbiIsIkZsb29ycGxhbiA9IHJlcXVpcmUgJy4vZmxvb3JwbGFuJ1xue2xvYWRKU09OUEFzc2V0c30gPSByZXF1aXJlICcuL2pzb25wbG9hZGVyJ1xue2NyZWF0ZUltYWdlfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbk1ZREVDT19RVUVSWSA9IFwiaHR0cDovL215ZGVjbzNkLmNvbS93cy9zZWFyY2gvcHJvZHVjdD9kYj1jb21wb25lbnQmZGlzcGxheT1yZW5kZXJzJmRpc3BsYXk9c3VyZmFjZV9oZWlnaHQmZGlzcGxheT1ib3VuZGluZ19ib3gmZGlzcGxheT13YWxsX21vdW50ZWQmZGlzcGxheT1sZXZlbCZkaXNwbGF5PW1vZGVsXCJcbkNETiA9ICdodHRwOi8vY2RuLmZsb29ycGxhbm5lci5jb20vYXNzZXRzLydcblxubW9kdWxlLmV4cG9ydHMubG9hZEZsb29yUGxhbiA9ICh1cmwpIC0+XG4gIHhtbGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICB4bWxodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XG4gICAgaWYgeG1saHR0cC5yZWFkeVN0YXRlID09IDQgYW5kIHhtbGh0dHAuc3RhdHVzID09IDIwMFxuICAgICAgaWYgZW5kc1dpdGggdXJsLCAnLnhtbCdcbiAgICAgICAgcGFyc2VTdHJpbmcgeG1saHR0cC5yZXNwb25zZVRleHQsIChlcnIsIHJlc3VsdCkgLT5cbiAgICAgICAgICBjb25zdHJ1Y3RGbG9vcnBsYW5Gcm9tRk1MIHJlc3VsdFxuICAgICAgZWxzZSBpZiBlbmRzV2l0aCB1cmwsICcuanNvbidcbiAgICAgICAgY29uc3RydWN0Rmxvb3JwbGFuRnJvbVJTIEpTT04ucGFyc2UgeG1saHR0cC5yZXNwb25zZVRleHRcbiAgICAgICAgXG4gIHhtbGh0dHAub3BlbihcIkdFVFwiLHVybCwgZmFsc2UpXG4gIHhtbGh0dHAuc2VuZCgpXG5cbmdldEpTT04gPSAocXVlcnksIGNhbGxiYWNrKSAtPlxuICB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cbiAgICBpZiB4aHIucmVhZHlTdGF0ZSBpcyA0IGFuZCB4aHIuc3RhdHVzIGlzIDIwMFxuICAgICAgb2JqID0gSlNPTi5wYXJzZSB4aHIucmVzcG9uc2VUZXh0XG4gICAgICBjYWxsYmFjayBvYmpcbiAgeGhyLm9wZW4gJ0dFVCcsIHF1ZXJ5LCB0cnVlXG4gIHhoci5zZW5kKClcblxuXG5jb25zdHJ1Y3RRdWVyeSA9IChjb21wb25lbnRzKSAtPlxuICBxdWVyeSA9IE1ZREVDT19RVUVSWVxuICBpZiB0eXBlb2YgY29tcG9uZW50cyBpcyAnb2JqZWN0J1xuICAgIGZvciBjIGluIGNvbXBvbmVudHNcbiAgICAgIHF1ZXJ5ICs9IFwiJmlkPVwiICsgYy5jb21wb25lbnRfaWRcbiAgZWxzZSBxdWVyeSArPSBcIiZpZD1cIiArIGNvbXBvbmVudHNcbiAgcXVlcnlcblxuXG5cbmNvbnN0cnVjdEZsb29ycGxhbkZyb21SUyA9IChycykgLT5cbiAgc2NlbmUgPSBGbG9vcnBsYW4uZ2V0KClcbiAgc2NlbmUuZGVzdHJveURhdGEoKVxuICAgXG4gIHBsYW4gPSBycy5tb2RlbC5wbGFuXG4gIGZvciBrLHdhbGwgb2YgcGxhbi53YWxsc1xuICAgIHRoaWNrbmVzcyA9IHdhbGwudGhpY2tuZXNzXG4gICAgYSA9IHBsYW4ucG9pbnRzW3dhbGwuaW5kaWNlc1swXV1cbiAgICBiID0gcGxhbi5wb2ludHNbd2FsbC5pbmRpY2VzWzFdXVxuICAgIHNjZW5lLmFkZFdhbGwge3g6cGFyc2VJbnQoYVswXSksIHk6cGFyc2VJbnQoYVsxXSotMSl9LFxuICAgICAgICAgICAgICAgICAge3g6cGFyc2VJbnQoYlswXSksIHk6cGFyc2VJbnQoYlsxXSotMSl9LCB0aGlja25lc3MrMlxuXG4gIHNjZW5lLmRyYXdXYWxscygpXG4gIFxuICBmb3IgayxhcmVhIG9mIHBsYW4uYXJlYXNcbiAgICBhcnIgPSBbXVxuICAgIGZvciBwSW5kZXggaW4gYXJlYS5pbmRpY2VzXG4gICAgICBwID0gcGxhbi5wb2ludHNbcEluZGV4XVxuICAgICAgYXJyLnB1c2gge3g6cFswXSwgeTpwWzFdKi0xfVxuICAgIHNjZW5lLmRyYXdBcmVhIGFyclxuICAgIFxuXG4gIHF1ZXJ5ID0gY29uc3RydWN0UXVlcnkgcnMubW9kZWwuY29tcG9uZW50c1xuXG4gIG9uUlNBc3NldHNMb2FkZWQgPSAoKSA9PlxuICAgICNjb25zb2xlLmxvZyBQSVhJLlRleHR1cmVDYWNoZVxuICAgIGZvciBrLHYgb2YgUElYSS5UZXh0dXJlQ2FjaGVcbiAgICAgIGNvbnNvbGUubG9nIGssdlxuICAgICAgc3ByaXRlID0gIG5ldyBQSVhJLlNwcml0ZS5mcm9tSW1hZ2UodilcbiAgICAgIGlmIHNwcml0ZSB0aGVuIGNvbnNvbGUubG9nIHNwcml0ZVxuICAgICAgY29uc29sZS5sb2cgc2NlbmVcbiAgICAgIHNjZW5lLmFzc2V0Q29udGFpbmVyLmFkZENoaWxkKHNwcml0ZSlcblxuICBnZXRKU09OIHF1ZXJ5LCAoZGF0YSkgLT4gXG4gICAgdXJscyA9IFtdXG4gICAgZm9yIGssIHYgb2YgZGF0YS5wcm9kdWN0cyB3aGVuIHYgaXNudCBudWxsXG4gICAgICB1cmxzLnB1c2ggdi5yZW5kZXJzWzBdLnRvcFxuICAgIGxvYWRlciA9IG5ldyBQSVhJLkFzc2V0TG9hZGVyKHVybHMsIHRydWUpXG4gICAgbG9hZGVyLm9uQ29tcGxldGUgPSBvblJTQXNzZXRzTG9hZGVkXG4gICAgbG9hZGVyLmxvYWQoKVxuXG4gIFxuXG5jb25zdHJ1Y3RGbG9vcnBsYW5Gcm9tRk1MID0gKGZtbCkgLT5cbiAgTVVMVElQTElFUiA9IDEwMCAjdG8gZ28gZnJvbSBGTUwgdW5pdHMgdG8gc2NyZWVuIHVuaXRzIFxuICBzY2VuZSA9IEZsb29ycGxhbi5nZXQoKVxuICBzY2VuZS5kZXN0cm95RGF0YSgpXG4gIHJvb3QgPSBudWxsXG4gIGlmIGZtbC5oYXNPd25Qcm9wZXJ0eSAnZGVzaWduJyAjIHRoZSBub3JtYWwgb25lXG4gICAgcm9vdCA9IGZtbC5kZXNpZ25cbiAgZWxzZSBpZiBmbWwuaGFzT3duUHJvcGVydHkgJ3Byb2plY3QnICMgdGhlIHBvcnRhbCBvbmVcbiAgICByb290ID0gZm1sLnByb2plY3QuZmxvb3JzWzBdLmZsb29yWzBdLmRlc2lnbnNbMF0uZGVzaWduWzBdXG4gIGVsc2UgXG4gICAgY29uc29sZS5sb2cgJ3Vua25vd24nLCBmbWxcbiAgXG4gIGxpbmVzID0gcm9vdC5saW5lc1swXS5saW5lXG4gIGFyZWFzID0gcm9vdC5hcmVhc1swXS5hcmVhXG4gIGFzc2V0cyA9IHJvb3QuYXNzZXRzWzBdLmFzc2V0XG5cbiAgZm9yIGFyZWEgaW4gYXJlYXNcbiAgICBvdXRQb2ludHMgPSBbXVxuICAgIHByZVBvaW50cyA9IGFyZWEucG9pbnRzWzBdLnNwbGl0KFwiLFwiKVxuICAgIGZvciBwb2ludCBpbiBwcmVQb2ludHNcbiAgICAgIFt4MSwgeTEsIHoxLCB4MiwgeTIsIHoyXSA9IHBvaW50LnNwbGl0KFwiIFwiKVxuICAgICAgb3V0UG9pbnRzLnB1c2gge3g6eDEgKiBNVUxUSVBMSUVSLCB5OnkxICogTVVMVElQTElFUn1cbiAgICAgIG91dFBvaW50cy5wdXNoIHt4OngyICogTVVMVElQTElFUiwgeTp5MiAqIE1VTFRJUExJRVJ9XG4gICAgc2NlbmUuZHJhd0FyZWEgb3V0UG9pbnRzXG5cbiAgZm9yIGxpbmUgaW4gbGluZXNcbiAgICBpZiBsaW5lLnR5cGVbMF0gaXMgJ2RlZmF1bHRfd2FsbCcjJ25vcm1hbF93YWxsJ1xuICAgICAgW3gxLCB5MSwgejEsIHgyLCB5MiwgejJdID0gbGluZS5wb2ludHNbMF0uc3BsaXQoXCIgXCIpXG4gICAgICBhID0ge3g6cGFyc2VJbnQoeDEgKiBNVUxUSVBMSUVSKSwgeTpwYXJzZUludCh5MSAqIE1VTFRJUExJRVIpfVxuICAgICAgYiA9IHt4OnBhcnNlSW50KHgyICogTVVMVElQTElFUiksIHk6cGFyc2VJbnQoeTIgKiBNVUxUSVBMSUVSKX1cbiAgICAgIHNjZW5lLmFkZFdhbGwgYSwgYiwgbGluZS50aGlja25lc3NbMF0gKiBNVUxUSVBMSUVSXG4gICAgZWxzZVxuICAgICAgY29uc29sZS5sb2cgXCIje2xpbmUudHlwZVswXX0gbm90IGRyYXduLlwiIFxuICBhc3NldFVSTFMgPSBbXVxuICBmb3IgYXNzZXQgaW4gYXNzZXRzXG4gICAgaWYgZW5kc1dpdGggYXNzZXQudXJsMmRbMF0sICdmbHonIFxuICAgICAgdXJsID0gQ0ROK2Fzc2V0LnVybDJkWzBdLnJlcGxhY2UoJ2Zsei8nLCdqc29ucC8nKS5yZXBsYWNlKCcuZmx6JywnLmpzb25wJylcbiAgICAgIGFzc2V0VVJMUy5wdXNoIHVybFxuICAgIGVsc2VcbiAgICAgIGNvbnNvbGUubG9nIFwibm90IGhhbmRsaW5nIGZpbGUgI3thc3NldC51cmwyZFswXX0geWV0XCJcbiAgbG9hZEpTT05QQXNzZXRzIGFzc2V0VVJMU1xuICBzY2VuZS5kcmF3V2FsbHMoKVxuXG5cblxuICBjb25zb2xlLmxvZyBcImxpbmVzOiAje2xpbmVzLmxlbmd0aH0sIGFyZWFzOiAje2FyZWFzLmxlbmd0aH1cIlxuXG5lbmRzV2l0aD0oc3RyLCBzdWZmaXgpIC0+XG4gICAgc3RyLmluZGV4T2Yoc3VmZml4LCBzdHIubGVuZ3RoIC0gc3VmZml4Lmxlbmd0aCkgaXNudCAtMVxuXG4iLCJcbndpbmRvd1sncmVjZWl2ZV9hc3NldCddID0gKGFzc2V0KSAtPlxuXG5GbG9vcnBsYW4gPSByZXF1aXJlICcuL2Zsb29ycGxhbidcbntjcmVhdGVJbWFnZSwgY2hhbmdlQ29sSW5VcmksIG1hc2tGbGlwfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cblxubG9hZEFzc2V0ID0gKHVybCwgZXJyb3IsIHN1Y2NlcykgLT5cbiAgJC5hamF4XG4gICAgdXJsOiB1cmxcbiAgICBkYXRhVHlwZTogJ2pzb25wJ1xuICAgIGpzb25wQ2FsbGJhY2s6ICdyZWNlaXZlX2Fzc2V0J1xuICAgIGpzb25wOiAnY2FsbGJhY2snXG4gICAgZXJyb3I6IGVycm9yXG4gICAgc3VjY2Vzczogc3VjY2VzXG5cblxubW9kdWxlLmV4cG9ydHMubG9hZEpTT05QQXNzZXRzID0gKHVybEFycmF5KSAtPlxuICAjIGxvYWRzIGFsbCB1cmxzIGluIHVybEFycmF5IHNlcXVlbnRpYWxseSBhbmQgYnkgd2FpdGluZyBmb3IgdGhlaXIgdHVybi5cbiBcbiAgdXJsID0gbnVsbCAgIyB0aGUgY3VycmVudCB1cmwgdGhhdCdzIGJlZW4gbG9hZGVkLlxuICBkZWxheSA9IChtcywgZnVuYykgLT4gc2V0VGltZW91dCBmdW5jLCBtc1xuXG4gIGVycm9yID0gKGRhdGEpIC0+IFxuICAgIGNvbnNvbGUubG9nICdlcnJvcicsZGF0YVxuICAgIGFkdmFuY2VMb2FkZXIoZmFsc2UpXG4gIHN1Y2NlcyA9IChkYXRhKSAtPiBcbiAgICBzY2VuZSA9IEZsb29ycGxhbi5nZXQoKVxuICAgIGlmIGRhdGEudW5kZXJcbiAgICAgIGNyZWF0ZUltYWdlIGRhdGEudW5kZXIsIHVybCwgJy51bmRlcicgXG4gICAgICBzcHJpdGUgPSAgbmV3IFBJWEkuU3ByaXRlLmZyb21JbWFnZSh1cmwrJy51bmRlcicpXG4gICAgICBzY2VuZS5hc3NldENvbnRhaW5lci5hZGRDaGlsZChzcHJpdGUpXG4gICAgaWYgZGF0YS5jb2xvclxuICAgICAgbmV3ZGF0YSA9IGRhdGEuY29sb3IgI21hc2tGbGlwIGRhdGEuY29sb3IgXG4gICAgICBjcmVhdGVJbWFnZSBuZXdkYXRhLCB1cmwsICcuY29sb3InIFxuICAgICAgc3ByaXRlID0gIG5ldyBQSVhJLlNwcml0ZS5mcm9tSW1hZ2UodXJsKycuY29sb3InKVxuICAgICAgI3Nwcml0ZS5wb3NpdGlvbi54ID0gTWF0aC5yYW5kb20oKSo4MDBcbiAgICAgIHNjZW5lLmFzc2V0Q29udGFpbmVyLmFkZENoaWxkKHNwcml0ZSlcbiAgICAgIGNvbnNvbGUubG9nICdkYXRhLmNvbG9yJ1xuICAgIGlmIGRhdGEub3ZlciBcbiAgICAgIGNyZWF0ZUltYWdlIGRhdGEub3ZlciwgdXJsLCAnLm92ZXInIFxuICAgICAgc3ByaXRlID0gIG5ldyBQSVhJLlNwcml0ZS5mcm9tSW1hZ2UodXJsKycub3ZlcicpXG4gICAgICBzY2VuZS5hc3NldENvbnRhaW5lci5hZGRDaGlsZChzcHJpdGUpXG4gICAgYWR2YW5jZUxvYWRlcih0cnVlKVxuICBcbiAgYWR2YW5jZUxvYWRlciA9IChoYWRTdWNjZXMpIC0+XG4gICAgY29uc29sZS5sb2cgJ2xvYWRlciBhZHZhbmNpbmcnXG4gICAgaWYgdXJsQXJyYXkubGVuZ3RoID4gMFxuICAgICAgdXJsID0gdXJsQXJyYXkucG9wKClcbiAgICAgIGlmIGhhZFN1Y2NlcyB0aGVuIGxvYWRBc3NldCB1cmwsIGVycm9yLCBzdWNjZXMgXG4gIFxuICBhZHZhbmNlTG9hZGVyKHRydWUpXG5cbiIsIkZsb29ycGxhbiA9IHJlcXVpcmUgJy4vZmxvb3JwbGFuJ1xue2xvYWRGbG9vclBsYW59ID0gcmVxdWlyZSAnLi9pbXBvcnRlcicgXG5cbmhhbmRsZUZpbGVTZWxlY3QgPSAoZXZlbnQpIC0+XG4gIGxvYWRGbG9vclBsYW4gJ2RhdGEvJyArIGV2ZW50LnRhcmdldC5maWxlc1swXS5uYW1lXG5cbmluaXQgPSAtPlxuICBzdGF0cyA9IG5ldyBTdGF0cygpXG4gIHN0YXRzLnNldE1vZGUoMClcbiAgc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcbiAgc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5yaWdodCA9ICczMDBweCdcbiAgc3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4J1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHN0YXRzLmRvbUVsZW1lbnQpXG4gIFxuICBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKVxuICBpbnB1dC50eXBlID0gXCJmaWxlXCJcbiAgaW5wdXQuaWQgPSBcImZpbGVzXCJcbiAgaW5wdXQubmFtZSA9IFwiZmlsZXNbXVwiXG4gIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGhhbmRsZUZpbGVTZWxlY3QsIGZhbHNlKVxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkIGlucHV0XG4gIG91dHB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ291dHB1dCcpXG4gIG91dHB1dC5pZCA9IFwibGlzdFwiXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQgb3V0cHV0XG4gIFxuICByZW5kZXJlciA9IFBJWEkuYXV0b0RldGVjdFJlbmRlcmVyIDIwNDgsIDIwNDgsIG51bGwsIGZhbHNlLCB0cnVlXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQgcmVuZGVyZXIudmlld1xuXG4gIGd1aSA9IG5ldyBkYXQuR1VJKClcbiAgc2NlbmUgPSBGbG9vcnBsYW4uZ2V0KClcbiBcbiAgZ3VpLmFkZENvbG9yKHNjZW5lLCAnYmFja2dyb3VuZENvbG9yJykub25DaGFuZ2UgKHZhbHVlKSAtPiBcbiAgICBzY2VuZS5zZXRCYWNrZ3JvdW5kQ29sb3IgdmFsdWUucmVwbGFjZSgnIycsICcweCcpXG4gIGd1aS5hZGRDb2xvcihzY2VuZSwgJ3dhbGxDb2xvcicpLm9uQ2hhbmdlICh2YWx1ZSkgLT4gXG4gICAgc2NlbmUud2FsbENvbnRhaW5lci50aW50ID0gdmFsdWUucmVwbGFjZSgnIycsICcweCcpXG4gIGd1aS5hZGRDb2xvcihzY2VuZSwgJ2FyZWFDb2xvcicpLm9uQ2hhbmdlICh2YWx1ZSkgLT4gXG4gICAgc2NlbmUuYXJlYUNvbnRhaW5lci50aW50ID0gdmFsdWUucmVwbGFjZSgnIycsICcweCcpXG4gIGd1aS5hZGRDb2xvcihzY2VuZSwgJ2Fzc2V0Q29sb3InKS5vbkNoYW5nZSAodmFsdWUpIC0+IFxuICAgIHNjZW5lLnRpbnRBc3NldHMgdmFsdWVcbiAgbG9hZEZsb29yUGxhbiAnZGF0YS9yaWprc2dlYm91d2VuZGllbnN0LnhtbCdcblxuXG4gIFxuICBhbmltYXRlID0gKCkgLT4gXG4gICAgc3RhdHMuYmVnaW4oKVxuICAgIHJlcXVlc3RBbmltRnJhbWUoYW5pbWF0ZSlcbiAgICByZW5kZXJlci5yZW5kZXIoRmxvb3JwbGFuLmdldCgpKVxuICAgIHN0YXRzLmVuZCgpXG5cbiAgcmVxdWVzdEFuaW1GcmFtZSggYW5pbWF0ZSApXG5cblxuXG53aW5kb3cub25sb2FkID0gLT5cbiAgaW5pdCgpXG5cbiIsIm1vZHVsZS5leHBvcnRzLmNyZWF0ZUltYWdlID0gKHNyYywgdXJsLCBwb3N0Zml4KSAtPlxuICBpbWFnZSA9IG5ldyBJbWFnZSgpXG4gIGltYWdlLnNyYyA9IHNyY1xuICBiYXNlVGV4dHVyZSA9IG5ldyBQSVhJLkJhc2VUZXh0dXJlIGltYWdlXG4gIHRleHR1cmUgPSBuZXcgUElYSS5UZXh0dXJlIGJhc2VUZXh0dXJlXG4gIFBJWEkuVGV4dHVyZS5hZGRUZXh0dXJlVG9DYWNoZSB0ZXh0dXJlLHVybCArIHBvc3RmaXhcblxubW9kdWxlLmV4cG9ydHMubWFza0ZsaXAgPSAoZGF0YSkgLT5cbiAgIyAtIHdoaXRlIHNob3VsZCBiZWNvbWUgdHJhbnNwYXJlbnRcbiAgIyAtIGJsYWNrIHNob3VsZCBiZWNvbWUgd2hpdGVcbiAgXG4gIHdoaXRlU3RyaW5nID0gJyNmZmZmZmYnXG4gIGJsYWNrU3RyaW5nID0gJyMwMDAwMDAnXG4gIHdoaXRlID0gaGV4VG9SR0Iod2hpdGVTdHJpbmcpXG4gIGJsYWNrID0gaGV4VG9SR0IoYmxhY2tTdHJpbmcpXG5cbiAgIyBjcmVhdGUgZmFrZSBpbWFnZSB0byBjYWxjdWxhdGUgaGVpZ2h0IC8gd2lkdGhcbiAgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKVxuICBpbWcuc3JjID0gZGF0YVxuICBpbWcuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCJcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCBpbWdcbiAgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKVxuICBjYW52YXMud2lkdGggPSBpbWcub2Zmc2V0V2lkdGhcbiAgY2FudmFzLmhlaWdodCA9IGltZy5vZmZzZXRIZWlnaHRcbiAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKVxuICBjdHguZHJhd0ltYWdlIGltZywgMCwgMFxuICBcbiAgIyByZW1vdmUgaW1hZ2VcbiAgaW1nLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQgaW1nXG4gIFxuICAjIGRvIGFjdHVhbCBjb2xvciByZXBsYWNlbWVudFxuICBpbWFnZURhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodClcbiAgZGF0YSA9IGltYWdlRGF0YS5kYXRhXG4gIHIgPSB1bmRlZmluZWRcbiAgZyA9IHVuZGVmaW5lZFxuICBiID0gdW5kZWZpbmVkXG4gIHggPSAwXG4gIGxlbiA9IGRhdGEubGVuZ3RoXG4gIHdoaWxlIHggPCBsZW5cbiAgICByID0gZGF0YVt4XVxuICAgIGcgPSBkYXRhW3ggKyAxXVxuICAgIGIgPSBkYXRhW3ggKyAyXVxuICAgIGlmIChyIGlzIHdoaXRlLnIpIGFuZCAoZyBpcyB3aGl0ZS5nKSBhbmQgKGIgaXMgd2hpdGUuYilcbiAgICAgICNtYWtpbmcgd2hpdGUgdHJhbnNwYXJlbnRcbiAgICAgIGRhdGFbeCArIDNdID0gMFxuICAgIGlmIChyIGlzIGJsYWNrLnIpIGFuZCAoZyBpcyBibGFjay5nKSBhbmQgKGIgaXMgYmxhY2suYilcbiAgICAgICNtYWtpbmcgYmxhY2sgd2hpdGVcbiAgICAgIGRhdGFbeF0gPSB3aGl0ZS5yXG4gICAgICBkYXRhW3ggKyAxXSA9IHdoaXRlLmdcbiAgICAgIGRhdGFbeCArIDJdID0gd2hpdGUuYlxuICAgIHggKz0gNFxuICBjdHgucHV0SW1hZ2VEYXRhIGltYWdlRGF0YSwgMCwgMFxuICBvdXREYXRhID0gY2FudmFzLnRvRGF0YVVSTCgpXG4gIGNvbnNvbGUubG9nIFwiZmxpcFwiXG4gIG91dERhdGFcblxubW9kdWxlLmV4cG9ydHMuY2hhbmdlQ29sSW5VcmkgPSAoZGF0YSwgY29sZnJvbSwgY29sdG8sIHRvVHJhbnNwYXJhbnQpIC0+XG4gIFxuICAjIGNyZWF0ZSBmYWtlIGltYWdlIHRvIGNhbGN1bGF0ZSBoZWlnaHQgLyB3aWR0aFxuICBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpXG4gIGltZy5zcmMgPSBkYXRhXG4gIGltZy5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIlxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkIGltZ1xuICBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpXG4gIGNhbnZhcy53aWR0aCA9IGltZy5vZmZzZXRXaWR0aFxuICBjYW52YXMuaGVpZ2h0ID0gaW1nLm9mZnNldEhlaWdodFxuICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpXG4gIGN0eC5kcmF3SW1hZ2UgaW1nLCAwLCAwXG4gIFxuICAjIHJlbW92ZSBpbWFnZVxuICBpbWcucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCBpbWdcbiAgXG4gICMgZG8gYWN0dWFsIGNvbG9yIHJlcGxhY2VtZW50XG4gIGltYWdlRGF0YSA9IGN0eC5nZXRJbWFnZURhdGEoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KVxuICBkYXRhID0gaW1hZ2VEYXRhLmRhdGFcbiAgcmdiZnJvbSA9IGhleFRvUkdCKGNvbGZyb20pXG4gIHJnYnRvID0gaGV4VG9SR0IoY29sdG8pXG4gIHIgPSB1bmRlZmluZWRcbiAgZyA9IHVuZGVmaW5lZFxuICBiID0gdW5kZWZpbmVkXG4gIHggPSAwXG4gIGxlbiA9IGRhdGEubGVuZ3RoXG4gIHdoaWxlIHggPCBsZW5cbiAgICByID0gZGF0YVt4XVxuICAgIGcgPSBkYXRhW3ggKyAxXVxuICAgIGIgPSBkYXRhW3ggKyAyXVxuICAgIGlmIChyIGlzIHJnYmZyb20ucikgYW5kIChnIGlzIHJnYmZyb20uZykgYW5kIChiIGlzIHJnYmZyb20uYilcbiAgICAgIGRhdGFbeF0gPSByZ2J0by5yXG4gICAgICBkYXRhW3ggKyAxXSA9IHJnYnRvLmdcbiAgICAgIGRhdGFbeCArIDJdID0gcmdidG8uYlxuICAgICAgaWYgdG9UcmFuc3BhcmFudCB0aGVuIGRhdGFbeCArIDNdID0gMFxuICAgIHggKz0gNFxuICBjdHgucHV0SW1hZ2VEYXRhIGltYWdlRGF0YSwgMCwgMFxuICBjYW52YXMudG9EYXRhVVJMKClcbiAgXG5oZXhUb1JHQiA9IChoZXhTdHIpIC0+XG4gIGNvbCA9IHt9XG4gIGNvbC5yID0gcGFyc2VJbnQoaGV4U3RyLnN1YnN0cigxLCAyKSwgMTYpXG4gIGNvbC5nID0gcGFyc2VJbnQoaGV4U3RyLnN1YnN0cigzLCAyKSwgMTYpXG4gIGNvbC5iID0gcGFyc2VJbnQoaGV4U3RyLnN1YnN0cig1LCAyKSwgMTYpXG4gIGNvbFxuIiwiXG5jbGFzcyBXYWxsQ29ybmVyXG4gIGNvbnN0cnVjdG9yOiAoQHgsIEB5KS0+XG4gICAgQGVkZ2VzID0gW11cbiAgYWRkRWRnZSA6IChlZGdlKSAtPlxuICAgIEBlZGdlcy5wdXNoIGVkZ2VcbiAgZ2V0QWRqYWNlbnQ6IChmcm9tRWRnZSkgLT5cbiAgICAoZWRnZSBmb3IgZWRnZSBpbiBAZWRnZXMgd2hlbiBmcm9tRWRnZSBpc250IGVkZ2UpXG5cbmNsYXNzIFdhbGxFZGdlXG4gIGNvbnN0cnVjdG9yIDogKEBjb3JuZXIxLCBAY29ybmVyMiwgQHRoaWNrbmVzcykgLT5cbiAgZ2V0T3RoZXJDb3JuZXIgOiAoY29ybmVyKSAtPlxuICAgIGlmIGNvcm5lci54IGlzIEBjb3JuZXIxLnggYW5kIGNvcm5lci55IGlzIEBjb3JuZXIxLnkgdGhlbiByZXR1cm4gQGNvcm5lcjJcbiAgICBpZiBjb3JuZXIueCBpcyBAY29ybmVyMi54IGFuZCBjb3JuZXIueSBpcyBAY29ybmVyMi55IHRoZW4gcmV0dXJuIEBjb3JuZXIxXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFdhbGxHcmFwaFxuICBjb25zdHJ1Y3RvciA6IC0+XG4gICAgQF9jb3JuZXJNYXAgPSB7fVxuXG4gIGdldENvcm5lcnMgOiAtPlxuICAgIHYgZm9yIGssIHYgb2YgQF9jb3JuZXJNYXBcblxuICBhZGRXYWxsOiAocDEsIHAyLCB0aGlja25lc3MpIC0+XG4gICAgY29ybmVyMSA9IEBfYWRkQ29ybmVyKHAxLngsIHAxLnkpXG4gICAgY29ybmVyMiA9IEBfYWRkQ29ybmVyKHAyLngsIHAyLnkpXG4gICAgZWRnZSA9IG5ldyBXYWxsRWRnZShjb3JuZXIxLCBjb3JuZXIyLCB0aGlja25lc3MpXG4gICAgY29ybmVyMS5hZGRFZGdlIGVkZ2VcbiAgICBjb3JuZXIyLmFkZEVkZ2UgZWRnZVxuXG4gIF9hZGRDb3JuZXI6ICh4LCB5KSAtPlxuICAgIGlmIEBfY29ybmVyTWFwW1wiI3t4fSwje3l9XCJdXG4gICAgICByZXR1cm4gQF9jb3JuZXJNYXBbXCIje3h9LCN7eX1cIl1cbiAgICBlbHNlXG4gICAgICBAX2Nvcm5lck1hcFtcIiN7eH0sI3t5fVwiXSA9IG5ldyBXYWxsQ29ybmVyKHgseSlcbiAgICAgIHJldHVybiBAX2Nvcm5lck1hcFtcIiN7eH0sI3t5fVwiXSBcblxuXG4iXX0=
