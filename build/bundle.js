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
      newdata = maskFlip(data.color);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9uaWtraWtvb2xlL0Rlc2t0b3AvcXVkZWUvc3JjL2Zsb29ycGxhbi5jb2ZmZWUiLCIvVXNlcnMvbmlra2lrb29sZS9EZXNrdG9wL3F1ZGVlL3NyYy9pbXBvcnRlci5jb2ZmZWUiLCIvVXNlcnMvbmlra2lrb29sZS9EZXNrdG9wL3F1ZGVlL3NyYy9qc29ucGxvYWRlci5jb2ZmZWUiLCIvVXNlcnMvbmlra2lrb29sZS9EZXNrdG9wL3F1ZGVlL3NyYy9tYWluLmNvZmZlZSIsIi9Vc2Vycy9uaWtraWtvb2xlL0Rlc2t0b3AvcXVkZWUvc3JjL3V0aWxzLmNvZmZlZSIsIi9Vc2Vycy9uaWtraWtvb2xlL0Rlc2t0b3AvcXVkZWUvc3JjL3dhbGxncmFwaC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLG9CQUFBO0VBQUE7aVNBQUE7O0FBQUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxhQUFSLENBQVosQ0FBQTs7QUFBQSxNQUVNLENBQUMsT0FBUCxHQUF1QjtBQUNyQixNQUFBLFFBQUE7O0FBQUEsOEJBQUEsQ0FBQTs7QUFBQSxFQUFBLFFBQUEsR0FBVyxJQUFYLENBQUE7O0FBQUEsRUFDQSxTQUFDLENBQUEsR0FBRCxHQUFPLFNBQUEsR0FBQTs4QkFDTCxXQUFBLFdBQWdCLElBQUEsU0FBQSxDQUFBLEVBRFg7RUFBQSxDQURQLENBQUE7O0FBR2EsRUFBQSxtQkFBQSxHQUFBO0FBQ1gsSUFBQSwyQ0FBTSxRQUFOLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLGVBQUQsR0FBbUIsU0FEbkIsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxTQUZiLENBQUE7QUFBQSxJQUdBLElBQUMs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QUFBOzttQkFBQTs7SUFmRixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJXYWxsR3JhcGggPSByZXF1aXJlICcuL3dhbGxncmFwaCdcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBGbG9vcnBsYW4gZXh0ZW5kcyBQSVhJLlN0YWdlXG4gIGluc3RhbmNlID0gbnVsbFxuICBAZ2V0IDogLT5cbiAgICBpbnN0YW5jZSA/PSBuZXcgRmxvb3JwbGFuKClcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXIoMHgwMDAwMDApXG4gICAgQGJhY2tncm91bmRDb2xvciA9ICcjMDAwMDAwJ1xuICAgIEB3YWxsQ29sb3IgPSAnI2ZmZmZmZidcbiAgICBAYXJlYUNvbG9yID0gJyM0NDQ0NDQnXG4gICAgQGFzc2V0Q29sb3IgPScjZmZmZmZmJ1xuICAgIEBjb250YWluZXIgPSBuZXcgUElYSS5HcmFwaGljcygpXG4gICAgQHdhbGxDb250YWluZXIgPSBuZXcgUElYSS5HcmFwaGljcygpXG4gICAgQHdhbGxDb250YWluZXIudGludCA9IEB3YWxsQ29sb3IucmVwbGFjZSgnIycsICcweCcpXG4gICAgQGFyZWFDb250YWluZXIgPSBuZXcgUElYSS5HcmFwaGljcygpXG4gICAgQGFyZWFDb250YWluZXIudGludCA9IEBhcmVhQ29sb3IucmVwbGFjZSgnIycsICcweCcpXG4gICAgQGFzc2V0Q29udGFpbmVyID0gbmV3IFBJWEkuRGlzcGxheU9iamVjdENvbnRhaW5lcigpXG4gICAgQHRpbnRBc3NldHMgQGFzc2V0Q29sb3JcblxuICAgIEAuYWRkQ2hpbGQgQGNvbnRhaW5lclxuICAgIEAuYWRkQ2hpbGQgQGFyZWFDb250YWluZXJcbiAgICBALmFkZENoaWxkIEB3YWxsQ29udGFpbmVyXG4gICAgQC5hZGRDaGlsZCBAYXNzZXRDb250YWluZXJcbiAgICBAd2FsbEdyYXBoID0gbmV3IFdhbGxHcmFwaCgpXG4gICAgXG4gIHRpbnRBc3NldHM6ICh0aW50KSAtPlxuICAgIGZvciBjaGlsZCBpbiBAYXNzZXRDb250YWluZXIuY2hpbGRyZW5cbiAgICAgIGNoaWxkLnRpbnQgPSAgQGFzc2V0Q29sb3IucmVwbGFjZSgnIycsICcweCcpXG4gICAgICBjb25zb2xlLmxvZyBjaGlsZC50aW50XG5cbiAgZGVzdHJveURhdGE6IC0+XG4gICAgQHdhbGxHcmFwaCA9IG5ldyBXYWxsR3JhcGgoKVxuICAgIEBjb250YWluZXIuY2xlYXIoKVxuICAgIEB3YWxsQ29udGFpbmVyLmNsZWFyKClcbiAgICBAYXJlYUNvbnRhaW5lci5jbGVhcigpXG4gICAgXG5cbiAgYWRkV2FsbDogKGEsIGIsIHRoaWNrbmVzcykgLT5cbiAgICBAd2FsbEdyYXBoLmFkZFdhbGwoYSwgYiwgdGhpY2tuZXNzKVxuXG4gIGRyYXdXYWxsczogLT5cbiAgICBAd2FsbENvbnRhaW5lci5saW5lU3R5bGUgMCwgMHhmZmZmZmZcbiAgICBmb3IgY29ybmVyIGluIEB3YWxsR3JhcGguZ2V0Q29ybmVycygpXG4gICAgICBmb3IgZWRnZTEgaW4gY29ybmVyLmVkZ2VzXG4gICAgICAgIGZvciBlZGdlMiBpbiBjb3JuZXIuZWRnZXNcbiAgICAgICAgICBpZiBlZGdlMSBpc250IGVkZ2UyXG4gICAgICAgICAgICAjIG5vdyBkcmF3IDIgY29ubmVjdGVkIGxpbmVzIFxuICAgICAgICAgICAgIyAxKSBmcm9tICB0aGUgb3RoZXIgZW5kIG9mIGVkZ2UxIHRvIGNvcm5lclxuICAgICAgICAgICAgIyAyKSBmcm9tIGNvcm5lciB0byB0aGUgb3RoZXIgZW5kIG9mIGVkZ2UyXG4gICAgICAgICAgICAjIHRvIHNhdmUgb24gc3RhdGUgY2hhbmdlcyBJIHRlc3QgdG8gc2VlIGlmIEkgbmVlZCB0byBzZXQgbGluZVN0eWxlXG4gICAgICAgICAgICBAd2FsbENvbnRhaW5lci5tb3ZlVG8oZWRnZTEuZ2V0T3RoZXJDb3JuZXIoY29ybmVyKS54LCBlZGdlMS5nZXRPdGhlckNvcm5lcihjb3JuZXIpLnkpXG4gICAgICAgICAgICBAX3NldExpbmVUaGlja25lc3MgZWRnZTEudGhpY2tuZXNzXG4gICAgICAgICAgICBAd2FsbENvbnRhaW5lci5saW5lVG8oY29ybmVyLngsIGNvcm5lci55KVxuXG4gICAgICAgICAgICBAX3NldExpbmVUaGlja25lc3MgZWRnZTIudGhpY2tuZXNzXG4gICAgICAgICAgICBAd2FsbENvbnRhaW5lci5saW5lVG8oZWRnZTIuZ2V0T3RoZXJDb3JuZXIoY29ybmVyKS54LCBlZGdlMi5nZXRPdGhlckNvcm5lcihjb3JuZXIpLnkpXG5cbiAgX3NldExpbmVUaGlja25lc3MgOiAodGhpY2tuZXNzKSAtPlxuICAgIGlmIEBsYXN0VGhpY2tuZXNzIGlzbnQgdGhpY2tuZXNzXG4gICAgICBAbGFzdFRoaWNrbmVzcyA9IHRoaWNrbmVzc1xuICAgICAgQHdhbGxDb250YWluZXIubGluZVN0eWxlIEBsYXN0VGhpY2tuZXNzLCAweGZmZmZmZlxuXG4gIGRyYXdBcmVhIDogKGFyZWEpIC0+XG4gICAgQGFyZWFDb250YWluZXIuYmVnaW5GaWxsIDB4ZmZmZmZmXG4gICAgQGFyZWFDb250YWluZXIubGluZVN0eWxlIDAsIDB4ZmZmZmZmXG4gICAgZm9yIHAgaW4gYXJlYVxuICAgICAgQGFyZWFDb250YWluZXIubGluZVRvKHAueCwgcC55KVxuICAgIEBhcmVhQ29udGFpbmVyLmVuZEZpbGwoKVxuXG4iLCJGbG9vcnBsYW4gPSByZXF1aXJlICcuL2Zsb29ycGxhbidcbntsb2FkSlNPTlBBc3NldHN9ID0gcmVxdWlyZSAnLi9qc29ucGxvYWRlcidcbntjcmVhdGVJbWFnZX0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5NWURFQ09fUVVFUlkgPSBcImh0dHA6Ly9teWRlY28zZC5jb20vd3Mvc2VhcmNoL3Byb2R1Y3Q/ZGI9Y29tcG9uZW50JmRpc3BsYXk9cmVuZGVycyZkaXNwbGF5PXN1cmZhY2VfaGVpZ2h0JmRpc3BsYXk9Ym91bmRpbmdfYm94JmRpc3BsYXk9d2FsbF9tb3VudGVkJmRpc3BsYXk9bGV2ZWwmZGlzcGxheT1tb2RlbFwiXG5DRE4gPSAnaHR0cDovL2Nkbi5mbG9vcnBsYW5uZXIuY29tL2Fzc2V0cy8nXG5cbm1vZHVsZS5leHBvcnRzLmxvYWRGbG9vclBsYW4gPSAodXJsKSAtPlxuICB4bWxodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgeG1saHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxuICAgIGlmIHhtbGh0dHAucmVhZHlTdGF0ZSA9PSA0IGFuZCB4bWxodHRwLnN0YXR1cyA9PSAyMDBcbiAgICAgIGlmIGVuZHNXaXRoIHVybCwgJy54bWwnXG4gICAgICAgIHBhcnNlU3RyaW5nIHhtbGh0dHAucmVzcG9uc2VUZXh0LCAoZXJyLCByZXN1bHQpIC0+XG4gICAgICAgICAgY29uc3RydWN0Rmxvb3JwbGFuRnJvbUZNTCByZXN1bHRcbiAgICAgIGVsc2UgaWYgZW5kc1dpdGggdXJsLCAnLmpzb24nXG4gICAgICAgIGNvbnN0cnVjdEZsb29ycGxhbkZyb21SUyBKU09OLnBhcnNlIHhtbGh0dHAucmVzcG9uc2VUZXh0XG4gICAgICAgIFxuICB4bWxodHRwLm9wZW4oXCJHRVRcIix1cmwsIGZhbHNlKVxuICB4bWxodHRwLnNlbmQoKVxuXG5nZXRKU09OID0gKHF1ZXJ5LCBjYWxsYmFjaykgLT5cbiAgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IC0+XG4gICAgaWYgeGhyLnJlYWR5U3RhdGUgaXMgNCBhbmQgeGhyLnN0YXR1cyBpcyAyMDBcbiAgICAgIG9iaiA9IEpTT04ucGFyc2UgeGhyLnJlc3BvbnNlVGV4dFxuICAgICAgY2FsbGJhY2sgb2JqXG4gIHhoci5vcGVuICdHRVQnLCBxdWVyeSwgdHJ1ZVxuICB4aHIuc2VuZCgpXG5cblxuY29uc3RydWN0UXVlcnkgPSAoY29tcG9uZW50cykgLT5cbiAgcXVlcnkgPSBNWURFQ09fUVVFUllcbiAgaWYgdHlwZW9mIGNvbXBvbmVudHMgaXMgJ29iamVjdCdcbiAgICBmb3IgYyBpbiBjb21wb25lbnRzXG4gICAgICBxdWVyeSArPSBcIiZpZD1cIiArIGMuY29tcG9uZW50X2lkXG4gIGVsc2UgcXVlcnkgKz0gXCImaWQ9XCIgKyBjb21wb25lbnRzXG4gIHF1ZXJ5XG5cblxuXG5jb25zdHJ1Y3RGbG9vcnBsYW5Gcm9tUlMgPSAocnMpIC0+XG4gIHNjZW5lID0gRmxvb3JwbGFuLmdldCgpXG4gIHNjZW5lLmRlc3Ryb3lEYXRhKClcbiAgIFxuICBwbGFuID0gcnMubW9kZWwucGxhblxuICBmb3Igayx3YWxsIG9mIHBsYW4ud2FsbHNcbiAgICB0aGlja25lc3MgPSB3YWxsLnRoaWNrbmVzc1xuICAgIGEgPSBwbGFuLnBvaW50c1t3YWxsLmluZGljZXNbMF1dXG4gICAgYiA9IHBsYW4ucG9pbnRzW3dhbGwuaW5kaWNlc1sxXV1cbiAgICBzY2VuZS5hZGRXYWxsIHt4OnBhcnNlSW50KGFbMF0pLCB5OnBhcnNlSW50KGFbMV0qLTEpfSxcbiAgICAgICAgICAgICAgICAgIHt4OnBhcnNlSW50KGJbMF0pLCB5OnBhcnNlSW50KGJbMV0qLTEpfSwgdGhpY2tuZXNzKzJcblxuICBzY2VuZS5kcmF3V2FsbHMoKVxuICBcbiAgZm9yIGssYXJlYSBvZiBwbGFuLmFyZWFzXG4gICAgYXJyID0gW11cbiAgICBmb3IgcEluZGV4IGluIGFyZWEuaW5kaWNlc1xuICAgICAgcCA9IHBsYW4ucG9pbnRzW3BJbmRleF1cbiAgICAgIGFyci5wdXNoIHt4OnBbMF0sIHk6cFsxXSotMX1cbiAgICBzY2VuZS5kcmF3QXJlYSBhcnJcbiAgICBcblxuICBxdWVyeSA9IGNvbnN0cnVjdFF1ZXJ5IHJzLm1vZGVsLmNvbXBvbmVudHNcblxuICBvblJTQXNzZXRzTG9hZGVkID0gKCkgPT5cbiAgICBmb3Igayx2IG9mIFBJWEkuVGV4dHVyZUNhY2hlXG4gICAgICBjb25zb2xlLmxvZyBrLHZcbiAgICAgIHNwcml0ZSA9ICBuZXcgUElYSS5TcHJpdGUuZnJvbUltYWdlKHYpXG4gICAgICBpZiBzcHJpdGUgdGhlbiBjb25zb2xlLmxvZyBzcHJpdGVcbiAgICAgIGNvbnNvbGUubG9nIHNjZW5lXG4gICAgICBzY2VuZS5hc3NldENvbnRhaW5lci5hZGRDaGlsZChzcHJpdGUpXG5cbiAgZ2V0SlNPTiBxdWVyeSwgKGRhdGEpIC0+IFxuICAgIHVybHMgPSBbXVxuICAgIGZvciBrLCB2IG9mIGRhdGEucHJvZHVjdHMgd2hlbiB2IGlzbnQgbnVsbFxuICAgICAgdXJscy5wdXNoIHYucmVuZGVyc1swXS50b3BcbiAgICBsb2FkZXIgPSBuZXcgUElYSS5Bc3NldExvYWRlcih1cmxzLCB0cnVlKVxuICAgIGxvYWRlci5vbkNvbXBsZXRlID0gb25SU0Fzc2V0c0xvYWRlZFxuICAgIGxvYWRlci5sb2FkKClcblxuICBcblxuY29uc3RydWN0Rmxvb3JwbGFuRnJvbUZNTCA9IChmbWwpIC0+XG4gIE1VTFRJUExJRVIgPSAxMDAgXG4gIHNjZW5lID0gRmxvb3JwbGFuLmdldCgpXG4gIHNjZW5lLmRlc3Ryb3lEYXRhKClcbiAgcm9vdCA9IG51bGxcbiAgaWYgZm1sLmhhc093blByb3BlcnR5ICdkZXNpZ24nICMgdGhlIG5vcm1hbCBvbmVcbiAgICByb290ID0gZm1sLmRlc2lnblxuICBlbHNlIGlmIGZtbC5oYXNPd25Qcm9wZXJ0eSAncHJvamVjdCcgIyB0aGUgcG9ydGFsIG9uZVxuICAgIHJvb3QgPSBmbWwucHJvamVjdC5mbG9vcnNbMF0uZmxvb3JbMF0uZGVzaWduc1swXS5kZXNpZ25bMF1cbiAgZWxzZSBcbiAgICBjb25zb2xlLmxvZyAndW5rbm93bicsIGZtbFxuICBcbiAgbGluZXMgPSByb290LmxpbmVzWzBdLmxpbmVcbiAgYXJlYXMgPSByb290LmFyZWFzWzBdLmFyZWFcbiAgYXNzZXRzID0gcm9vdC5hc3NldHNbMF0uYXNzZXRcblxuICBmb3IgYXJlYSBpbiBhcmVhc1xuICAgIG91dFBvaW50cyA9IFtdXG4gICAgcHJlUG9pbnRzID0gYXJlYS5wb2ludHNbMF0uc3BsaXQoXCIsXCIpXG4gICAgZm9yIHBvaW50IGluIHByZVBvaW50c1xuICAgICAgW3gxLCB5MSwgejEsIHgyLCB5MiwgejJdID0gcG9pbnQuc3BsaXQoXCIgXCIpXG4gICAgICBvdXRQb2ludHMucHVzaCB7eDp4MSAqIE1VTFRJUExJRVIsIHk6eTEgKiBNVUxUSVBMSUVSfVxuICAgICAgb3V0UG9pbnRzLnB1c2gge3g6eDIgKiBNVUxUSVBMSUVSLCB5OnkyICogTVVMVElQTElFUn1cbiAgICBzY2VuZS5kcmF3QXJlYSBvdXRQb2ludHNcblxuICBmb3IgbGluZSBpbiBsaW5lc1xuICAgIGlmIGxpbmUudHlwZVswXSBpcyAnZGVmYXVsdF93YWxsJyMnbm9ybWFsX3dhbGwnXG4gICAgICBbeDEsIHkxLCB6MSwgeDIsIHkyLCB6Ml0gPSBsaW5lLnBvaW50c1swXS5zcGxpdChcIiBcIilcbiAgICAgIGEgPSB7eDpwYXJzZUludCh4MSAqIE1VTFRJUExJRVIpLCB5OnBhcnNlSW50KHkxICogTVVMVElQTElFUil9XG4gICAgICBiID0ge3g6cGFyc2VJbnQoeDIgKiBNVUxUSVBMSUVSKSwgeTpwYXJzZUludCh5MiAqIE1VTFRJUExJRVIpfVxuICAgICAgc2NlbmUuYWRkV2FsbCBhLCBiLCBsaW5lLnRoaWNrbmVzc1swXSAqIE1VTFRJUExJRVJcbiAgICBlbHNlXG4gICAgICBjb25zb2xlLmxvZyBcIiN7bGluZS50eXBlWzBdfSBub3QgZHJhd24uXCIgXG4gIGFzc2V0VVJMUyA9IFtdXG4gIGZvciBhc3NldCBpbiBhc3NldHNcbiAgICBpZiBlbmRzV2l0aCBhc3NldC51cmwyZFswXSwgJ2ZseicgXG4gICAgICB1cmwgPSBDRE4rYXNzZXQudXJsMmRbMF0ucmVwbGFjZSgnZmx6LycsJ2pzb25wLycpLnJlcGxhY2UoJy5mbHonLCcuanNvbnAnKVxuICAgICAgYXNzZXRVUkxTLnB1c2ggdXJsXG4gICAgZWxzZVxuICAgICAgY29uc29sZS5sb2cgXCJub3QgaGFuZGxpbmcgZmlsZSAje2Fzc2V0LnVybDJkWzBdfSB5ZXRcIlxuICBsb2FkSlNPTlBBc3NldHMgYXNzZXRVUkxTXG4gIHNjZW5lLmRyYXdXYWxscygpXG5cblxuXG4gIGNvbnNvbGUubG9nIFwibGluZXM6ICN7bGluZXMubGVuZ3RofSwgYXJlYXM6ICN7YXJlYXMubGVuZ3RofVwiXG5cbmVuZHNXaXRoPShzdHIsIHN1ZmZpeCkgLT5cbiAgICBzdHIuaW5kZXhPZihzdWZmaXgsIHN0ci5sZW5ndGggLSBzdWZmaXgubGVuZ3RoKSBpc250IC0xXG5cbiIsIlxud2luZG93WydyZWNlaXZlX2Fzc2V0J10gPSAoYXNzZXQpIC0+XG5cbkZsb29ycGxhbiA9IHJlcXVpcmUgJy4vZmxvb3JwbGFuJ1xue2NyZWF0ZUltYWdlLCBjaGFuZ2VDb2xJblVyaSwgbWFza0ZsaXB9ID0gcmVxdWlyZSAnLi91dGlscydcblxuXG5sb2FkQXNzZXQgPSAodXJsLCBlcnJvciwgc3VjY2VzKSAtPlxuICAkLmFqYXhcbiAgICB1cmw6IHVybFxuICAgIGRhdGFUeXBlOiAnanNvbnAnXG4gICAganNvbnBDYWxsYmFjazogJ3JlY2VpdmVfYXNzZXQnXG4gICAganNvbnA6ICdjYWxsYmFjaydcbiAgICBlcnJvcjogZXJyb3JcbiAgICBzdWNjZXNzOiBzdWNjZXNcblxuXG5tb2R1bGUuZXhwb3J0cy5sb2FkSlNPTlBBc3NldHMgPSAodXJsQXJyYXkpIC0+XG4gICMgbG9hZHMgYWxsIHVybHMgaW4gdXJsQXJyYXkgc2VxdWVudGlhbGx5IGFuZCBieSB3YWl0aW5nIGZvciB0aGVpciB0dXJuLlxuICAjIHRoZXJlIGlzIGEgYmlnIGlzc3VlIHdpdGggY2FudmFzIGNyZWF0aW9uIGhpZGluZyBpbiBoZXJlLCBJJ2xsIG5lZWQgcHJvbWlzZXMgdG8gZml4IGl0IEkgdGhpbmsuXG4gIFxuICB1cmwgPSBudWxsICAjIHRoZSBjdXJyZW50IHVybCB0aGF0J3MgYmVlbiBsb2FkZWQuXG4gIGRlbGF5ID0gKG1zLCBmdW5jKSAtPiBzZXRUaW1lb3V0IGZ1bmMsIG1zXG5cbiAgZXJyb3IgPSAoZGF0YSkgLT4gXG4gICAgY29uc29sZS5sb2cgJ2Vycm9yJyxkYXRhXG4gICAgYWR2YW5jZUxvYWRlcihmYWxzZSlcbiAgc3VjY2VzID0gKGRhdGEpIC0+IFxuICAgIHNjZW5lID0gRmxvb3JwbGFuLmdldCgpXG4gICAgaWYgZGF0YS51bmRlclxuICAgICAgY3JlYXRlSW1hZ2UgZGF0YS51bmRlciwgdXJsLCAnLnVuZGVyJyBcbiAgICAgIHNwcml0ZSA9ICBuZXcgUElYSS5TcHJpdGUuZnJvbUltYWdlKHVybCsnLnVuZGVyJylcbiAgICAgIHNjZW5lLmFzc2V0Q29udGFpbmVyLmFkZENoaWxkKHNwcml0ZSlcbiAgICBpZiBkYXRhLmNvbG9yXG4gICAgICAjbmV3ZGF0YSA9IGRhdGEuY29sb3IgI3VzZSB0aGUgbm9uIGNoYW5nZWQgY29sb3Igc2hhcGUgaWYgbWFza0ZsaXAga2VlcHMgbWVzc2luZyB1cCB0aGUgRE9NXG4gICAgICBuZXdkYXRhID0gbWFza0ZsaXAgZGF0YS5jb2xvciBcbiAgICAgIGNyZWF0ZUltYWdlIG5ld2RhdGEsIHVybCwgJy5jb2xvcicgXG4gICAgICBzcHJpdGUgPSAgbmV3IFBJWEkuU3ByaXRlLmZyb21JbWFnZSh1cmwrJy5jb2xvcicpXG4gICAgICBzY2VuZS5hc3NldENvbnRhaW5lci5hZGRDaGlsZChzcHJpdGUpXG4gICAgICBjb25zb2xlLmxvZyAnZGF0YS5jb2xvcidcbiAgICBpZiBkYXRhLm92ZXIgXG4gICAgICBjcmVhdGVJbWFnZSBkYXRhLm92ZXIsIHVybCwgJy5vdmVyJyBcbiAgICAgIHNwcml0ZSA9ICBuZXcgUElYSS5TcHJpdGUuZnJvbUltYWdlKHVybCsnLm92ZXInKVxuICAgICAgc2NlbmUuYXNzZXRDb250YWluZXIuYWRkQ2hpbGQoc3ByaXRlKVxuICAgIGFkdmFuY2VMb2FkZXIodHJ1ZSlcbiAgXG4gIGFkdmFuY2VMb2FkZXIgPSAoaGFkU3VjY2VzKSAtPlxuICAgIGNvbnNvbGUubG9nICdsb2FkZXIgYWR2YW5jaW5nJ1xuICAgIGlmIHVybEFycmF5Lmxlbmd0aCA+IDBcbiAgICAgIHVybCA9IHVybEFycmF5LnBvcCgpXG4gICAgICBpZiBoYWRTdWNjZXMgdGhlbiBsb2FkQXNzZXQgdXJsLCBlcnJvciwgc3VjY2VzIFxuICBcbiAgYWR2YW5jZUxvYWRlcih0cnVlKVxuXG4iLCJGbG9vcnBsYW4gPSByZXF1aXJlICcuL2Zsb29ycGxhbidcbntsb2FkRmxvb3JQbGFufSA9IHJlcXVpcmUgJy4vaW1wb3J0ZXInIFxuXG5oYW5kbGVGaWxlU2VsZWN0ID0gKGV2ZW50KSAtPlxuICBsb2FkRmxvb3JQbGFuICdkYXRhLycgKyBldmVudC50YXJnZXQuZmlsZXNbMF0ubmFtZVxuXG5cbmluaXQgPSAtPlxuICBzdGF0cyA9IG5ldyBTdGF0cygpXG4gIHN0YXRzLnNldE1vZGUoMClcbiAgc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcbiAgc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5yaWdodCA9ICczMDBweCdcbiAgc3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4J1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHN0YXRzLmRvbUVsZW1lbnQpXG4gIFxuICBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKVxuICBpbnB1dC50eXBlID0gXCJmaWxlXCJcbiAgaW5wdXQuaWQgPSBcImZpbGVzXCJcbiAgaW5wdXQubmFtZSA9IFwiZmlsZXNbXVwiXG4gIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGhhbmRsZUZpbGVTZWxlY3QsIGZhbHNlKVxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkIGlucHV0XG4gIG91dHB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ291dHB1dCcpXG4gIG91dHB1dC5pZCA9IFwibGlzdFwiXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQgb3V0cHV0XG4gIFxuICByZW5kZXJlciA9IFBJWEkuYXV0b0RldGVjdFJlbmRlcmVyIDIwNDgsIDIwNDgsIG51bGwsIGZhbHNlLCB0cnVlXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQgcmVuZGVyZXIudmlld1xuXG4gIGd1aSA9IG5ldyBkYXQuR1VJKClcbiAgc2NlbmUgPSBGbG9vcnBsYW4uZ2V0KClcbiBcbiAgZ3VpLmFkZENvbG9yKHNjZW5lLCAnYmFja2dyb3VuZENvbG9yJykub25DaGFuZ2UgKHZhbHVlKSAtPiBcbiAgICBzY2VuZS5zZXRCYWNrZ3JvdW5kQ29sb3IgdmFsdWUucmVwbGFjZSgnIycsICcweCcpXG4gIGd1aS5hZGRDb2xvcihzY2VuZSwgJ3dhbGxDb2xvcicpLm9uQ2hhbmdlICh2YWx1ZSkgLT4gXG4gICAgc2NlbmUud2FsbENvbnRhaW5lci50aW50ID0gdmFsdWUucmVwbGFjZSgnIycsICcweCcpXG4gIGd1aS5hZGRDb2xvcihzY2VuZSwgJ2FyZWFDb2xvcicpLm9uQ2hhbmdlICh2YWx1ZSkgLT4gXG4gICAgc2NlbmUuYXJlYUNvbnRhaW5lci50aW50ID0gdmFsdWUucmVwbGFjZSgnIycsICcweCcpXG4gIGd1aS5hZGRDb2xvcihzY2VuZSwgJ2Fzc2V0Q29sb3InKS5vbkNoYW5nZSAodmFsdWUpIC0+IFxuICAgIHNjZW5lLnRpbnRBc3NldHMgdmFsdWVcbiAgbG9hZEZsb29yUGxhbiAnZGF0YS9yaWprc2dlYm91d2VuZGllbnN0LnhtbCdcbiAgXG4gIGFuaW1hdGUgPSAoKSAtPiBcbiAgICBzdGF0cy5iZWdpbigpXG4gICAgcmVxdWVzdEFuaW1GcmFtZShhbmltYXRlKVxuICAgIHJlbmRlcmVyLnJlbmRlcihGbG9vcnBsYW4uZ2V0KCkpXG4gICAgc3RhdHMuZW5kKClcblxuICByZXF1ZXN0QW5pbUZyYW1lKCBhbmltYXRlIClcblxud2luZG93Lm9ubG9hZCA9IC0+XG4gIGluaXQoKVxuXG4iLCJtb2R1bGUuZXhwb3J0cy5jcmVhdGVJbWFnZSA9IChzcmMsIHVybCwgcG9zdGZpeCkgLT5cbiAgaW1hZ2UgPSBuZXcgSW1hZ2UoKVxuICBpbWFnZS5zcmMgPSBzcmNcbiAgYmFzZVRleHR1cmUgPSBuZXcgUElYSS5CYXNlVGV4dHVyZSBpbWFnZVxuICB0ZXh0dXJlID0gbmV3IFBJWEkuVGV4dHVyZSBiYXNlVGV4dHVyZVxuICBQSVhJLlRleHR1cmUuYWRkVGV4dHVyZVRvQ2FjaGUgdGV4dHVyZSx1cmwgKyBwb3N0Zml4XG5cbm1vZHVsZS5leHBvcnRzLm1hc2tGbGlwID0gKGRhdGEpIC0+XG4gICMgLSB3aGl0ZSBzaG91bGQgYmVjb21lIHRyYW5zcGFyZW50XG4gICMgLSBibGFjayBzaG91bGQgYmVjb21lIHdoaXRlXG4gIFxuICB3aGl0ZVN0cmluZyA9ICcjZmZmZmZmJ1xuICBibGFja1N0cmluZyA9ICcjMDAwMDAwJ1xuICB3aGl0ZSA9IGhleFRvUkdCKHdoaXRlU3RyaW5nKVxuICBibGFjayA9IGhleFRvUkdCKGJsYWNrU3RyaW5nKVxuXG4gICMgY3JlYXRlIGZha2UgaW1hZ2UgdG8gY2FsY3VsYXRlIGhlaWdodCAvIHdpZHRoXG4gIGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIilcbiAgaW1nLnNyYyA9IGRhdGFcbiAgaW1nLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQgaW1nXG4gIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIilcbiAgY2FudmFzLndpZHRoID0gaW1nLm9mZnNldFdpZHRoXG4gIGNhbnZhcy5oZWlnaHQgPSBpbWcub2Zmc2V0SGVpZ2h0XG4gIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIilcbiAgY3R4LmRyYXdJbWFnZSBpbWcsIDAsIDBcbiAgXG4gICMgcmVtb3ZlIGltYWdlXG4gIGltZy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkIGltZ1xuICBcbiAgIyBkbyBhY3R1YWwgY29sb3IgcmVwbGFjZW1lbnRcbiAgaW1hZ2VEYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpXG4gIGRhdGEgPSBpbWFnZURhdGEuZGF0YVxuICByID0gdW5kZWZpbmVkXG4gIGcgPSB1bmRlZmluZWRcbiAgYiA9IHVuZGVmaW5lZFxuICB4ID0gMFxuICBsZW4gPSBkYXRhLmxlbmd0aFxuICB3aGlsZSB4IDwgbGVuXG4gICAgciA9IGRhdGFbeF1cbiAgICBnID0gZGF0YVt4ICsgMV1cbiAgICBiID0gZGF0YVt4ICsgMl1cbiAgICBpZiAociBpcyB3aGl0ZS5yKSBhbmQgKGcgaXMgd2hpdGUuZykgYW5kIChiIGlzIHdoaXRlLmIpXG4gICAgICAjbWFraW5nIHdoaXRlIHRyYW5zcGFyZW50XG4gICAgICBkYXRhW3ggKyAzXSA9IDBcbiAgICBpZiAociBpcyBibGFjay5yKSBhbmQgKGcgaXMgYmxhY2suZykgYW5kIChiIGlzIGJsYWNrLmIpXG4gICAgICAjbWFraW5nIGJsYWNrIHdoaXRlXG4gICAgICBkYXRhW3hdID0gd2hpdGUuclxuICAgICAgZGF0YVt4ICsgMV0gPSB3aGl0ZS5nXG4gICAgICBkYXRhW3ggKyAyXSA9IHdoaXRlLmJcbiAgICB4ICs9IDRcbiAgY3R4LnB1dEltYWdlRGF0YSBpbWFnZURhdGEsIDAsIDBcbiAgb3V0RGF0YSA9IGNhbnZhcy50b0RhdGFVUkwoKVxuICBjb25zb2xlLmxvZyBcImZsaXBcIlxuICBvdXREYXRhXG5cbm1vZHVsZS5leHBvcnRzLmNoYW5nZUNvbEluVXJpID0gKGRhdGEsIGNvbGZyb20sIGNvbHRvLCB0b1RyYW5zcGFyYW50KSAtPlxuICBcbiAgIyBjcmVhdGUgZmFrZSBpbWFnZSB0byBjYWxjdWxhdGUgaGVpZ2h0IC8gd2lkdGhcbiAgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKVxuICBpbWcuc3JjID0gZGF0YVxuICBpbWcuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCJcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCBpbWdcbiAgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKVxuICBjYW52YXMud2lkdGggPSBpbWcub2Zmc2V0V2lkdGhcbiAgY2FudmFzLmhlaWdodCA9IGltZy5vZmZzZXRIZWlnaHRcbiAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKVxuICBjdHguZHJhd0ltYWdlIGltZywgMCwgMFxuICBcbiAgIyByZW1vdmUgaW1hZ2VcbiAgaW1nLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQgaW1nXG4gIFxuICAjIGRvIGFjdHVhbCBjb2xvciByZXBsYWNlbWVudFxuICBpbWFnZURhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodClcbiAgZGF0YSA9IGltYWdlRGF0YS5kYXRhXG4gIHJnYmZyb20gPSBoZXhUb1JHQihjb2xmcm9tKVxuICByZ2J0byA9IGhleFRvUkdCKGNvbHRvKVxuICByID0gdW5kZWZpbmVkXG4gIGcgPSB1bmRlZmluZWRcbiAgYiA9IHVuZGVmaW5lZFxuICB4ID0gMFxuICBsZW4gPSBkYXRhLmxlbmd0aFxuICB3aGlsZSB4IDwgbGVuXG4gICAgciA9IGRhdGFbeF1cbiAgICBnID0gZGF0YVt4ICsgMV1cbiAgICBiID0gZGF0YVt4ICsgMl1cbiAgICBpZiAociBpcyByZ2Jmcm9tLnIpIGFuZCAoZyBpcyByZ2Jmcm9tLmcpIGFuZCAoYiBpcyByZ2Jmcm9tLmIpXG4gICAgICBkYXRhW3hdID0gcmdidG8uclxuICAgICAgZGF0YVt4ICsgMV0gPSByZ2J0by5nXG4gICAgICBkYXRhW3ggKyAyXSA9IHJnYnRvLmJcbiAgICAgIGlmIHRvVHJhbnNwYXJhbnQgdGhlbiBkYXRhW3ggKyAzXSA9IDBcbiAgICB4ICs9IDRcbiAgY3R4LnB1dEltYWdlRGF0YSBpbWFnZURhdGEsIDAsIDBcbiAgY2FudmFzLnRvRGF0YVVSTCgpXG4gIFxuaGV4VG9SR0IgPSAoaGV4U3RyKSAtPlxuICBjb2wgPSB7fVxuICBjb2wuciA9IHBhcnNlSW50KGhleFN0ci5zdWJzdHIoMSwgMiksIDE2KVxuICBjb2wuZyA9IHBhcnNlSW50KGhleFN0ci5zdWJzdHIoMywgMiksIDE2KVxuICBjb2wuYiA9IHBhcnNlSW50KGhleFN0ci5zdWJzdHIoNSwgMiksIDE2KVxuICBjb2xcbiIsIlxuY2xhc3MgV2FsbENvcm5lclxuICBjb25zdHJ1Y3RvcjogKEB4LCBAeSktPlxuICAgIEBlZGdlcyA9IFtdXG4gIGFkZEVkZ2UgOiAoZWRnZSkgLT5cbiAgICBAZWRnZXMucHVzaCBlZGdlXG4gIGdldEFkamFjZW50OiAoZnJvbUVkZ2UpIC0+XG4gICAgKGVkZ2UgZm9yIGVkZ2UgaW4gQGVkZ2VzIHdoZW4gZnJvbUVkZ2UgaXNudCBlZGdlKVxuXG5jbGFzcyBXYWxsRWRnZVxuICBjb25zdHJ1Y3RvciA6IChAY29ybmVyMSwgQGNvcm5lcjIsIEB0aGlja25lc3MpIC0+XG4gIGdldE90aGVyQ29ybmVyIDogKGNvcm5lcikgLT5cbiAgICBpZiBjb3JuZXIueCBpcyBAY29ybmVyMS54IGFuZCBjb3JuZXIueSBpcyBAY29ybmVyMS55IHRoZW4gcmV0dXJuIEBjb3JuZXIyXG4gICAgaWYgY29ybmVyLnggaXMgQGNvcm5lcjIueCBhbmQgY29ybmVyLnkgaXMgQGNvcm5lcjIueSB0aGVuIHJldHVybiBAY29ybmVyMVxuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBXYWxsR3JhcGhcbiAgY29uc3RydWN0b3IgOiAtPlxuICAgIEBfY29ybmVyTWFwID0ge31cblxuICBnZXRDb3JuZXJzIDogLT5cbiAgICB2IGZvciBrLCB2IG9mIEBfY29ybmVyTWFwXG5cbiAgYWRkV2FsbDogKHAxLCBwMiwgdGhpY2tuZXNzKSAtPlxuICAgIGNvcm5lcjEgPSBAX2FkZENvcm5lcihwMS54LCBwMS55KVxuICAgIGNvcm5lcjIgPSBAX2FkZENvcm5lcihwMi54LCBwMi55KVxuICAgIGVkZ2UgPSBuZXcgV2FsbEVkZ2UoY29ybmVyMSwgY29ybmVyMiwgdGhpY2tuZXNzKVxuICAgIGNvcm5lcjEuYWRkRWRnZSBlZGdlXG4gICAgY29ybmVyMi5hZGRFZGdlIGVkZ2VcblxuICBfYWRkQ29ybmVyOiAoeCwgeSkgLT5cbiAgICBpZiBAX2Nvcm5lck1hcFtcIiN7eH0sI3t5fVwiXVxuICAgICAgcmV0dXJuIEBfY29ybmVyTWFwW1wiI3t4fSwje3l9XCJdXG4gICAgZWxzZVxuICAgICAgQF9jb3JuZXJNYXBbXCIje3h9LCN7eX1cIl0gPSBuZXcgV2FsbENvcm5lcih4LHkpXG4gICAgICByZXR1cm4gQF9jb3JuZXJNYXBbXCIje3h9LCN7eX1cIl0gXG5cblxuIl19
