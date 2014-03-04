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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9uaWtraWtvb2xlL0Rlc2t0b3AvcXVkZWUvc3JjL2Zsb29ycGxhbi5jb2ZmZWUiLCIvVXNlcnMvbmlra2lrb29sZS9EZXNrdG9wL3F1ZGVlL3NyYy9pbXBvcnRlci5jb2ZmZWUiLCIvVXNlcnMvbmlra2lrb29sZS9EZXNrdG9wL3F1ZGVlL3NyYy9qc29ucGxvYWRlci5jb2ZmZWUiLCIvVXNlcnMvbmlra2lrb29sZS9EZXNrdG9wL3F1ZGVlL3NyYy9tYWluLmNvZmZlZSIsIi9Vc2Vycy9uaWtraWtvb2xlL0Rlc2t0b3AvcXVkZWUvc3JjL3V0aWxzLmNvZmZlZSIsIi9Vc2Vycy9uaWtraWtvb2xlL0Rlc2t0b3AvcXVkZWUvc3JjL3dhbGxncmFwaC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLG9CQUFBO0VBQUE7aVNBQUE7O0FBQUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxhQUFSLENBQVosQ0FBQTs7QUFBQSxNQUVNLENBQUMsT0FBUCxHQUF1QjtBQUNyQixNQUFBLFFBQUE7O0FBQUEsOEJBQUEsQ0FBQTs7QUFBQSxFQUFBLFFBQUEsR0FBVyxJQUFYLENBQUE7O0FBQUEsRUFDQSxTQUFDLENBQUEsR0FBRCxHQUFPLFNBQUEsR0FBQTs4QkFDTCxXQUFBLFdBQWdCLElBQUEsU0FBQSxDQUFBLEVBRFg7RUFBQSxDQURQLENBQUE7O0FBR2EsRUFBQSxtQkFBQSxHQUFBO0FBQ1gsSUFBQSwyQ0FBTSxRQUFOLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLGVBQUQsR0FBbUIsU0FEbkIsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxTQUZiLENBQUE7QUFBQSxJQUdBLElBQUMs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LENBQUE7O21CQUFBOztJQWZGLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIldhbGxHcmFwaCA9IHJlcXVpcmUgJy4vd2FsbGdyYXBoJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEZsb29ycGxhbiBleHRlbmRzIFBJWEkuU3RhZ2VcbiAgaW5zdGFuY2UgPSBudWxsXG4gIEBnZXQgOiAtPlxuICAgIGluc3RhbmNlID89IG5ldyBGbG9vcnBsYW4oKVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlcigweDAwMDAwMClcbiAgICBAYmFja2dyb3VuZENvbG9yID0gJyMwMDAwMDAnXG4gICAgQHdhbGxDb2xvciA9ICcjZmZmZmZmJ1xuICAgIEBhcmVhQ29sb3IgPSAnIzQ0NDQ0NCdcbiAgICBAYXNzZXRDb2xvciA9JyNmZmZmZmYnXG4gICAgQGNvbnRhaW5lciA9IG5ldyBQSVhJLkdyYXBoaWNzKClcbiAgICBAd2FsbENvbnRhaW5lciA9IG5ldyBQSVhJLkdyYXBoaWNzKClcbiAgICBAd2FsbENvbnRhaW5lci50aW50ID0gQHdhbGxDb2xvci5yZXBsYWNlKCcjJywgJzB4JylcbiAgICBAYXJlYUNvbnRhaW5lciA9IG5ldyBQSVhJLkdyYXBoaWNzKClcbiAgICBAYXJlYUNvbnRhaW5lci50aW50ID0gQGFyZWFDb2xvci5yZXBsYWNlKCcjJywgJzB4JylcbiAgICBAYXNzZXRDb250YWluZXIgPSBuZXcgUElYSS5EaXNwbGF5T2JqZWN0Q29udGFpbmVyKClcbiAgICBAdGludEFzc2V0cyBAYXNzZXRDb2xvclxuXG4gICAgQC5hZGRDaGlsZCBAY29udGFpbmVyXG4gICAgQC5hZGRDaGlsZCBAYXJlYUNvbnRhaW5lclxuICAgIEAuYWRkQ2hpbGQgQHdhbGxDb250YWluZXJcbiAgICBALmFkZENoaWxkIEBhc3NldENvbnRhaW5lclxuICAgIEB3YWxsR3JhcGggPSBuZXcgV2FsbEdyYXBoKClcbiAgICBcbiAgdGludEFzc2V0czogKHRpbnQpIC0+XG4gICAgZm9yIGNoaWxkIGluIEBhc3NldENvbnRhaW5lci5jaGlsZHJlblxuICAgICAgY2hpbGQudGludCA9ICBAYXNzZXRDb2xvci5yZXBsYWNlKCcjJywgJzB4JylcbiAgICAgIGNvbnNvbGUubG9nIGNoaWxkLnRpbnRcblxuICBkZXN0cm95RGF0YTogLT5cbiAgICBAd2FsbEdyYXBoID0gbmV3IFdhbGxHcmFwaCgpXG4gICAgQGNvbnRhaW5lci5jbGVhcigpXG4gICAgQHdhbGxDb250YWluZXIuY2xlYXIoKVxuICAgIEBhcmVhQ29udGFpbmVyLmNsZWFyKClcbiAgICBcblxuICBhZGRXYWxsOiAoYSwgYiwgdGhpY2tuZXNzKSAtPlxuICAgIEB3YWxsR3JhcGguYWRkV2FsbChhLCBiLCB0aGlja25lc3MpXG5cbiAgZHJhd1dhbGxzOiAtPlxuICAgIEB3YWxsQ29udGFpbmVyLmxpbmVTdHlsZSAwLCAweGZmZmZmZlxuICAgIGZvciBjb3JuZXIgaW4gQHdhbGxHcmFwaC5nZXRDb3JuZXJzKClcbiAgICAgIGZvciBlZGdlMSBpbiBjb3JuZXIuZWRnZXNcbiAgICAgICAgZm9yIGVkZ2UyIGluIGNvcm5lci5lZGdlc1xuICAgICAgICAgIGlmIGVkZ2UxIGlzbnQgZWRnZTJcbiAgICAgICAgICAgICMgbm93IGRyYXcgMiBjb25uZWN0ZWQgbGluZXMgXG4gICAgICAgICAgICAjIDEpIGZyb20gIHRoZSBvdGhlciBlbmQgb2YgZWRnZTEgdG8gY29ybmVyXG4gICAgICAgICAgICAjIDIpIGZyb20gY29ybmVyIHRvIHRoZSBvdGhlciBlbmQgb2YgZWRnZTJcbiAgICAgICAgICAgICMgdG8gc2F2ZSBvbiBzdGF0ZSBjaGFuZ2VzIEkgdGVzdCB0byBzZWUgaWYgSSBuZWVkIHRvIHNldCBsaW5lU3R5bGVcbiAgICAgICAgICAgIEB3YWxsQ29udGFpbmVyLm1vdmVUbyhlZGdlMS5nZXRPdGhlckNvcm5lcihjb3JuZXIpLngsIGVkZ2UxLmdldE90aGVyQ29ybmVyKGNvcm5lcikueSlcbiAgICAgICAgICAgIEBfc2V0TGluZVRoaWNrbmVzcyBlZGdlMS50aGlja25lc3NcbiAgICAgICAgICAgIEB3YWxsQ29udGFpbmVyLmxpbmVUbyhjb3JuZXIueCwgY29ybmVyLnkpXG5cbiAgICAgICAgICAgIEBfc2V0TGluZVRoaWNrbmVzcyBlZGdlMi50aGlja25lc3NcbiAgICAgICAgICAgIEB3YWxsQ29udGFpbmVyLmxpbmVUbyhlZGdlMi5nZXRPdGhlckNvcm5lcihjb3JuZXIpLngsIGVkZ2UyLmdldE90aGVyQ29ybmVyKGNvcm5lcikueSlcblxuICBfc2V0TGluZVRoaWNrbmVzcyA6ICh0aGlja25lc3MpIC0+XG4gICAgaWYgQGxhc3RUaGlja25lc3MgaXNudCB0aGlja25lc3NcbiAgICAgIEBsYXN0VGhpY2tuZXNzID0gdGhpY2tuZXNzXG4gICAgICBAd2FsbENvbnRhaW5lci5saW5lU3R5bGUgQGxhc3RUaGlja25lc3MsIDB4ZmZmZmZmXG5cbiAgI2FyZWEgc2hvdWxkIGJlIGlucHV0IGluIGZvcm0gXG4gICNbe3gseX0se3gseX1dXG4gIGRyYXdBcmVhIDogKGFyZWEpIC0+XG4gICAgQGFyZWFDb250YWluZXIuYmVnaW5GaWxsIDB4ZmZmZmZmXG4gICAgQGFyZWFDb250YWluZXIubGluZVN0eWxlIDAsIDB4ZmZmZmZmXG4gICAgZm9yIHAgaW4gYXJlYVxuICAgICAgQGFyZWFDb250YWluZXIubGluZVRvKHAueCwgcC55KVxuICAgICAgI2NvbnNvbGUubG9nIHBcbiAgICBAYXJlYUNvbnRhaW5lci5lbmRGaWxsKClcblxuIiwiRmxvb3JwbGFuID0gcmVxdWlyZSAnLi9mbG9vcnBsYW4nXG57bG9hZEpTT05QQXNzZXRzfSA9IHJlcXVpcmUgJy4vanNvbnBsb2FkZXInXG57Y3JlYXRlSW1hZ2V9ID0gcmVxdWlyZSAnLi91dGlscydcblxuTVlERUNPX1FVRVJZID0gXCJodHRwOi8vbXlkZWNvM2QuY29tL3dzL3NlYXJjaC9wcm9kdWN0P2RiPWNvbXBvbmVudCZkaXNwbGF5PXJlbmRlcnMmZGlzcGxheT1zdXJmYWNlX2hlaWdodCZkaXNwbGF5PWJvdW5kaW5nX2JveCZkaXNwbGF5PXdhbGxfbW91bnRlZCZkaXNwbGF5PWxldmVsJmRpc3BsYXk9bW9kZWxcIlxuQ0ROID0gJ2h0dHA6Ly9jZG4uZmxvb3JwbGFubmVyLmNvbS9hc3NldHMvJ1xuXG5tb2R1bGUuZXhwb3J0cy5sb2FkRmxvb3JQbGFuID0gKHVybCkgLT5cbiAgeG1saHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gIHhtbGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cbiAgICBpZiB4bWxodHRwLnJlYWR5U3RhdGUgPT0gNCBhbmQgeG1saHR0cC5zdGF0dXMgPT0gMjAwXG4gICAgICBpZiBlbmRzV2l0aCB1cmwsICcueG1sJ1xuICAgICAgICBwYXJzZVN0cmluZyB4bWxodHRwLnJlc3BvbnNlVGV4dCwgKGVyciwgcmVzdWx0KSAtPlxuICAgICAgICAgIGNvbnN0cnVjdEZsb29ycGxhbkZyb21GTUwgcmVzdWx0XG4gICAgICBlbHNlIGlmIGVuZHNXaXRoIHVybCwgJy5qc29uJ1xuICAgICAgICBjb25zdHJ1Y3RGbG9vcnBsYW5Gcm9tUlMgSlNPTi5wYXJzZSB4bWxodHRwLnJlc3BvbnNlVGV4dFxuICAgICAgICBcbiAgeG1saHR0cC5vcGVuKFwiR0VUXCIsdXJsLCBmYWxzZSlcbiAgeG1saHR0cC5zZW5kKClcblxuZ2V0SlNPTiA9IChxdWVyeSwgY2FsbGJhY2spIC0+XG4gIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAtPlxuICAgIGlmIHhoci5yZWFkeVN0YXRlIGlzIDQgYW5kIHhoci5zdGF0dXMgaXMgMjAwXG4gICAgICBvYmogPSBKU09OLnBhcnNlIHhoci5yZXNwb25zZVRleHRcbiAgICAgIGNhbGxiYWNrIG9ialxuICB4aHIub3BlbiAnR0VUJywgcXVlcnksIHRydWVcbiAgeGhyLnNlbmQoKVxuXG5cbmNvbnN0cnVjdFF1ZXJ5ID0gKGNvbXBvbmVudHMpIC0+XG4gIHF1ZXJ5ID0gTVlERUNPX1FVRVJZXG4gIGlmIHR5cGVvZiBjb21wb25lbnRzIGlzICdvYmplY3QnXG4gICAgZm9yIGMgaW4gY29tcG9uZW50c1xuICAgICAgcXVlcnkgKz0gXCImaWQ9XCIgKyBjLmNvbXBvbmVudF9pZFxuICBlbHNlIHF1ZXJ5ICs9IFwiJmlkPVwiICsgY29tcG9uZW50c1xuICBxdWVyeVxuXG5cblxuY29uc3RydWN0Rmxvb3JwbGFuRnJvbVJTID0gKHJzKSAtPlxuICBzY2VuZSA9IEZsb29ycGxhbi5nZXQoKVxuICBzY2VuZS5kZXN0cm95RGF0YSgpXG4gICBcbiAgcGxhbiA9IHJzLm1vZGVsLnBsYW5cbiAgZm9yIGssd2FsbCBvZiBwbGFuLndhbGxzXG4gICAgdGhpY2tuZXNzID0gd2FsbC50aGlja25lc3NcbiAgICBhID0gcGxhbi5wb2ludHNbd2FsbC5pbmRpY2VzWzBdXVxuICAgIGIgPSBwbGFuLnBvaW50c1t3YWxsLmluZGljZXNbMV1dXG4gICAgc2NlbmUuYWRkV2FsbCB7eDpwYXJzZUludChhWzBdKSwgeTpwYXJzZUludChhWzFdKi0xKX0sXG4gICAgICAgICAgICAgICAgICB7eDpwYXJzZUludChiWzBdKSwgeTpwYXJzZUludChiWzFdKi0xKX0sIHRoaWNrbmVzcysyXG5cbiAgc2NlbmUuZHJhd1dhbGxzKClcbiAgXG4gIGZvciBrLGFyZWEgb2YgcGxhbi5hcmVhc1xuICAgIGFyciA9IFtdXG4gICAgZm9yIHBJbmRleCBpbiBhcmVhLmluZGljZXNcbiAgICAgIHAgPSBwbGFuLnBvaW50c1twSW5kZXhdXG4gICAgICBhcnIucHVzaCB7eDpwWzBdLCB5OnBbMV0qLTF9XG4gICAgc2NlbmUuZHJhd0FyZWEgYXJyXG4gICAgXG5cbiAgcXVlcnkgPSBjb25zdHJ1Y3RRdWVyeSBycy5tb2RlbC5jb21wb25lbnRzXG5cbiAgb25SU0Fzc2V0c0xvYWRlZCA9ICgpID0+XG4gICAgI2NvbnNvbGUubG9nIFBJWEkuVGV4dHVyZUNhY2hlXG4gICAgZm9yIGssdiBvZiBQSVhJLlRleHR1cmVDYWNoZVxuICAgICAgY29uc29sZS5sb2cgayx2XG4gICAgICBzcHJpdGUgPSAgbmV3IFBJWEkuU3ByaXRlLmZyb21JbWFnZSh2KVxuICAgICAgaWYgc3ByaXRlIHRoZW4gY29uc29sZS5sb2cgc3ByaXRlXG4gICAgICBjb25zb2xlLmxvZyBzY2VuZVxuICAgICAgc2NlbmUuYXNzZXRDb250YWluZXIuYWRkQ2hpbGQoc3ByaXRlKVxuXG4gIGdldEpTT04gcXVlcnksIChkYXRhKSAtPiBcbiAgICB1cmxzID0gW11cbiAgICBmb3IgaywgdiBvZiBkYXRhLnByb2R1Y3RzIHdoZW4gdiBpc250IG51bGxcbiAgICAgIHVybHMucHVzaCB2LnJlbmRlcnNbMF0udG9wXG4gICAgbG9hZGVyID0gbmV3IFBJWEkuQXNzZXRMb2FkZXIodXJscywgdHJ1ZSlcbiAgICBsb2FkZXIub25Db21wbGV0ZSA9IG9uUlNBc3NldHNMb2FkZWRcbiAgICBsb2FkZXIubG9hZCgpXG5cbiAgXG5cbmNvbnN0cnVjdEZsb29ycGxhbkZyb21GTUwgPSAoZm1sKSAtPlxuICBNVUxUSVBMSUVSID0gMTAwICN0byBnbyBmcm9tIEZNTCB1bml0cyB0byBzY3JlZW4gdW5pdHMgXG4gIHNjZW5lID0gRmxvb3JwbGFuLmdldCgpXG4gIHNjZW5lLmRlc3Ryb3lEYXRhKClcbiAgcm9vdCA9IG51bGxcbiAgaWYgZm1sLmhhc093blByb3BlcnR5ICdkZXNpZ24nICMgdGhlIG5vcm1hbCBvbmVcbiAgICByb290ID0gZm1sLmRlc2lnblxuICBlbHNlIGlmIGZtbC5oYXNPd25Qcm9wZXJ0eSAncHJvamVjdCcgIyB0aGUgcG9ydGFsIG9uZVxuICAgIHJvb3QgPSBmbWwucHJvamVjdC5mbG9vcnNbMF0uZmxvb3JbMF0uZGVzaWduc1swXS5kZXNpZ25bMF1cbiAgZWxzZSBcbiAgICBjb25zb2xlLmxvZyAndW5rbm93bicsIGZtbFxuICBcbiAgbGluZXMgPSByb290LmxpbmVzWzBdLmxpbmVcbiAgYXJlYXMgPSByb290LmFyZWFzWzBdLmFyZWFcbiAgYXNzZXRzID0gcm9vdC5hc3NldHNbMF0uYXNzZXRcblxuICBmb3IgYXJlYSBpbiBhcmVhc1xuICAgIG91dFBvaW50cyA9IFtdXG4gICAgcHJlUG9pbnRzID0gYXJlYS5wb2ludHNbMF0uc3BsaXQoXCIsXCIpXG4gICAgZm9yIHBvaW50IGluIHByZVBvaW50c1xuICAgICAgW3gxLCB5MSwgejEsIHgyLCB5MiwgejJdID0gcG9pbnQuc3BsaXQoXCIgXCIpXG4gICAgICBvdXRQb2ludHMucHVzaCB7eDp4MSAqIE1VTFRJUExJRVIsIHk6eTEgKiBNVUxUSVBMSUVSfVxuICAgICAgb3V0UG9pbnRzLnB1c2gge3g6eDIgKiBNVUxUSVBMSUVSLCB5OnkyICogTVVMVElQTElFUn1cbiAgICBzY2VuZS5kcmF3QXJlYSBvdXRQb2ludHNcblxuICBmb3IgbGluZSBpbiBsaW5lc1xuICAgIGlmIGxpbmUudHlwZVswXSBpcyAnZGVmYXVsdF93YWxsJyMnbm9ybWFsX3dhbGwnXG4gICAgICBbeDEsIHkxLCB6MSwgeDIsIHkyLCB6Ml0gPSBsaW5lLnBvaW50c1swXS5zcGxpdChcIiBcIilcbiAgICAgIGEgPSB7eDpwYXJzZUludCh4MSAqIE1VTFRJUExJRVIpLCB5OnBhcnNlSW50KHkxICogTVVMVElQTElFUil9XG4gICAgICBiID0ge3g6cGFyc2VJbnQoeDIgKiBNVUxUSVBMSUVSKSwgeTpwYXJzZUludCh5MiAqIE1VTFRJUExJRVIpfVxuICAgICAgc2NlbmUuYWRkV2FsbCBhLCBiLCBsaW5lLnRoaWNrbmVzc1swXSAqIE1VTFRJUExJRVJcbiAgICBlbHNlXG4gICAgICBjb25zb2xlLmxvZyBcIiN7bGluZS50eXBlWzBdfSBub3QgZHJhd24uXCIgXG4gIGFzc2V0VVJMUyA9IFtdXG4gIGZvciBhc3NldCBpbiBhc3NldHNcbiAgICBpZiBlbmRzV2l0aCBhc3NldC51cmwyZFswXSwgJ2ZseicgXG4gICAgICB1cmwgPSBDRE4rYXNzZXQudXJsMmRbMF0ucmVwbGFjZSgnZmx6LycsJ2pzb25wLycpLnJlcGxhY2UoJy5mbHonLCcuanNvbnAnKVxuICAgICAgYXNzZXRVUkxTLnB1c2ggdXJsXG4gICAgZWxzZVxuICAgICAgY29uc29sZS5sb2cgXCJub3QgaGFuZGxpbmcgZmlsZSAje2Fzc2V0LnVybDJkWzBdfSB5ZXRcIlxuICBsb2FkSlNPTlBBc3NldHMgYXNzZXRVUkxTXG4gIHNjZW5lLmRyYXdXYWxscygpXG5cblxuXG4gIGNvbnNvbGUubG9nIFwibGluZXM6ICN7bGluZXMubGVuZ3RofSwgYXJlYXM6ICN7YXJlYXMubGVuZ3RofVwiXG5cbmVuZHNXaXRoPShzdHIsIHN1ZmZpeCkgLT5cbiAgICBzdHIuaW5kZXhPZihzdWZmaXgsIHN0ci5sZW5ndGggLSBzdWZmaXgubGVuZ3RoKSBpc250IC0xXG5cbiIsIlxud2luZG93WydyZWNlaXZlX2Fzc2V0J10gPSAoYXNzZXQpIC0+XG5cbkZsb29ycGxhbiA9IHJlcXVpcmUgJy4vZmxvb3JwbGFuJ1xue2NyZWF0ZUltYWdlLCBjaGFuZ2VDb2xJblVyaSwgbWFza0ZsaXB9ID0gcmVxdWlyZSAnLi91dGlscydcblxuXG5sb2FkQXNzZXQgPSAodXJsLCBlcnJvciwgc3VjY2VzKSAtPlxuICAkLmFqYXhcbiAgICB1cmw6IHVybFxuICAgIGRhdGFUeXBlOiAnanNvbnAnXG4gICAganNvbnBDYWxsYmFjazogJ3JlY2VpdmVfYXNzZXQnXG4gICAganNvbnA6ICdjYWxsYmFjaydcbiAgICBlcnJvcjogZXJyb3JcbiAgICBzdWNjZXNzOiBzdWNjZXNcblxuXG5tb2R1bGUuZXhwb3J0cy5sb2FkSlNPTlBBc3NldHMgPSAodXJsQXJyYXkpIC0+XG4gICMgbG9hZHMgYWxsIHVybHMgaW4gdXJsQXJyYXkgc2VxdWVudGlhbGx5IGFuZCBieSB3YWl0aW5nIGZvciB0aGVpciB0dXJuLlxuIFxuICB1cmwgPSBudWxsICAjIHRoZSBjdXJyZW50IHVybCB0aGF0J3MgYmVlbiBsb2FkZWQuXG4gIGRlbGF5ID0gKG1zLCBmdW5jKSAtPiBzZXRUaW1lb3V0IGZ1bmMsIG1zXG5cbiAgZXJyb3IgPSAoZGF0YSkgLT4gXG4gICAgY29uc29sZS5sb2cgJ2Vycm9yJyxkYXRhXG4gICAgYWR2YW5jZUxvYWRlcihmYWxzZSlcbiAgc3VjY2VzID0gKGRhdGEpIC0+IFxuICAgIHNjZW5lID0gRmxvb3JwbGFuLmdldCgpXG4gICAgaWYgZGF0YS51bmRlclxuICAgICAgY3JlYXRlSW1hZ2UgZGF0YS51bmRlciwgdXJsLCAnLnVuZGVyJyBcbiAgICAgIHNwcml0ZSA9ICBuZXcgUElYSS5TcHJpdGUuZnJvbUltYWdlKHVybCsnLnVuZGVyJylcbiAgICAgIHNjZW5lLmFzc2V0Q29udGFpbmVyLmFkZENoaWxkKHNwcml0ZSlcbiAgICBpZiBkYXRhLmNvbG9yXG4gICAgICAjbmV3ZGF0YSA9IGRhdGEuY29sb3IgI21hc2tGbGlwIGRhdGEuY29sb3IgXG4gICAgICAjIFRPRE8gOiB0aGlzIG1hc2tGbGlwIGZ1bmN0aW9uIHNob3VsZCBiZSBmaW5pc2hlZCBiZWZvcmUgY29udGludWluZy5cbiAgICAgICMgYXRtIGl0IG1lc3NlcyB1cCB0aGUgZG9tIGJlY2F1c2UgaXQncyBjcmVhdGluZyB0byBtYW55IGNhbnZhc3Nlcy5cbiAgICAgICMgaSAqdGhpbmsqIGkgbmVlZCBzb21lIHByb21pc2VzIHRvIGhhbmRsZSBpdCBqdXN0bHlcbiAgICAgIG5ld2RhdGEgPSBtYXNrRmxpcCBkYXRhLmNvbG9yIFxuICAgICAgY3JlYXRlSW1hZ2UgbmV3ZGF0YSwgdXJsLCAnLmNvbG9yJyBcbiAgICAgIHNwcml0ZSA9ICBuZXcgUElYSS5TcHJpdGUuZnJvbUltYWdlKHVybCsnLmNvbG9yJylcbiAgICAgICNzcHJpdGUucG9zaXRpb24ueCA9IE1hdGgucmFuZG9tKCkqODAwXG4gICAgICBzY2VuZS5hc3NldENvbnRhaW5lci5hZGRDaGlsZChzcHJpdGUpXG4gICAgICBjb25zb2xlLmxvZyAnZGF0YS5jb2xvcidcbiAgICBpZiBkYXRhLm92ZXIgXG4gICAgICBjcmVhdGVJbWFnZSBkYXRhLm92ZXIsIHVybCwgJy5vdmVyJyBcbiAgICAgIHNwcml0ZSA9ICBuZXcgUElYSS5TcHJpdGUuZnJvbUltYWdlKHVybCsnLm92ZXInKVxuICAgICAgc2NlbmUuYXNzZXRDb250YWluZXIuYWRkQ2hpbGQoc3ByaXRlKVxuICAgIGFkdmFuY2VMb2FkZXIodHJ1ZSlcbiAgXG4gIGFkdmFuY2VMb2FkZXIgPSAoaGFkU3VjY2VzKSAtPlxuICAgIGNvbnNvbGUubG9nICdsb2FkZXIgYWR2YW5jaW5nJ1xuICAgIGlmIHVybEFycmF5Lmxlbmd0aCA+IDBcbiAgICAgIHVybCA9IHVybEFycmF5LnBvcCgpXG4gICAgICBpZiBoYWRTdWNjZXMgdGhlbiBsb2FkQXNzZXQgdXJsLCBlcnJvciwgc3VjY2VzIFxuICBcbiAgYWR2YW5jZUxvYWRlcih0cnVlKVxuXG4iLCJGbG9vcnBsYW4gPSByZXF1aXJlICcuL2Zsb29ycGxhbidcbntsb2FkRmxvb3JQbGFufSA9IHJlcXVpcmUgJy4vaW1wb3J0ZXInIFxuXG5oYW5kbGVGaWxlU2VsZWN0ID0gKGV2ZW50KSAtPlxuICBsb2FkRmxvb3JQbGFuICdkYXRhLycgKyBldmVudC50YXJnZXQuZmlsZXNbMF0ubmFtZVxuXG5pbml0ID0gLT5cbiAgc3RhdHMgPSBuZXcgU3RhdHMoKVxuICBzdGF0cy5zZXRNb2RlKDApXG4gIHN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG4gIHN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucmlnaHQgPSAnMzAwcHgnXG4gIHN0YXRzLmRvbUVsZW1lbnQuc3R5bGUudG9wID0gJzBweCdcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzdGF0cy5kb21FbGVtZW50KVxuICBcbiAgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIilcbiAgaW5wdXQudHlwZSA9IFwiZmlsZVwiXG4gIGlucHV0LmlkID0gXCJmaWxlc1wiXG4gIGlucHV0Lm5hbWUgPSBcImZpbGVzW11cIlxuICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBoYW5kbGVGaWxlU2VsZWN0LCBmYWxzZSlcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCBpbnB1dFxuICBvdXRwdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvdXRwdXQnKVxuICBvdXRwdXQuaWQgPSBcImxpc3RcIlxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkIG91dHB1dFxuICBcbiAgcmVuZGVyZXIgPSBQSVhJLmF1dG9EZXRlY3RSZW5kZXJlciAyMDQ4LCAyMDQ4LCBudWxsLCBmYWxzZSwgdHJ1ZVxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkIHJlbmRlcmVyLnZpZXdcblxuICBndWkgPSBuZXcgZGF0LkdVSSgpXG4gIHNjZW5lID0gRmxvb3JwbGFuLmdldCgpXG4gXG4gIGd1aS5hZGRDb2xvcihzY2VuZSwgJ2JhY2tncm91bmRDb2xvcicpLm9uQ2hhbmdlICh2YWx1ZSkgLT4gXG4gICAgc2NlbmUuc2V0QmFja2dyb3VuZENvbG9yIHZhbHVlLnJlcGxhY2UoJyMnLCAnMHgnKVxuICBndWkuYWRkQ29sb3Ioc2NlbmUsICd3YWxsQ29sb3InKS5vbkNoYW5nZSAodmFsdWUpIC0+IFxuICAgIHNjZW5lLndhbGxDb250YWluZXIudGludCA9IHZhbHVlLnJlcGxhY2UoJyMnLCAnMHgnKVxuICBndWkuYWRkQ29sb3Ioc2NlbmUsICdhcmVhQ29sb3InKS5vbkNoYW5nZSAodmFsdWUpIC0+IFxuICAgIHNjZW5lLmFyZWFDb250YWluZXIudGludCA9IHZhbHVlLnJlcGxhY2UoJyMnLCAnMHgnKVxuICBndWkuYWRkQ29sb3Ioc2NlbmUsICdhc3NldENvbG9yJykub25DaGFuZ2UgKHZhbHVlKSAtPiBcbiAgICBzY2VuZS50aW50QXNzZXRzIHZhbHVlXG4gIGxvYWRGbG9vclBsYW4gJ2RhdGEvcmlqa3NnZWJvdXdlbmRpZW5zdC54bWwnXG5cblxuICBcbiAgYW5pbWF0ZSA9ICgpIC0+IFxuICAgIHN0YXRzLmJlZ2luKClcbiAgICByZXF1ZXN0QW5pbUZyYW1lKGFuaW1hdGUpXG4gICAgcmVuZGVyZXIucmVuZGVyKEZsb29ycGxhbi5nZXQoKSlcbiAgICBzdGF0cy5lbmQoKVxuXG4gIHJlcXVlc3RBbmltRnJhbWUoIGFuaW1hdGUgKVxuXG5cblxud2luZG93Lm9ubG9hZCA9IC0+XG4gIGluaXQoKVxuXG4iLCJtb2R1bGUuZXhwb3J0cy5jcmVhdGVJbWFnZSA9IChzcmMsIHVybCwgcG9zdGZpeCkgLT5cbiAgaW1hZ2UgPSBuZXcgSW1hZ2UoKVxuICBpbWFnZS5zcmMgPSBzcmNcbiAgYmFzZVRleHR1cmUgPSBuZXcgUElYSS5CYXNlVGV4dHVyZSBpbWFnZVxuICB0ZXh0dXJlID0gbmV3IFBJWEkuVGV4dHVyZSBiYXNlVGV4dHVyZVxuICBQSVhJLlRleHR1cmUuYWRkVGV4dHVyZVRvQ2FjaGUgdGV4dHVyZSx1cmwgKyBwb3N0Zml4XG5cbm1vZHVsZS5leHBvcnRzLm1hc2tGbGlwID0gKGRhdGEpIC0+XG4gICMgLSB3aGl0ZSBzaG91bGQgYmVjb21lIHRyYW5zcGFyZW50XG4gICMgLSBibGFjayBzaG91bGQgYmVjb21lIHdoaXRlXG4gIFxuICB3aGl0ZVN0cmluZyA9ICcjZmZmZmZmJ1xuICBibGFja1N0cmluZyA9ICcjMDAwMDAwJ1xuICB3aGl0ZSA9IGhleFRvUkdCKHdoaXRlU3RyaW5nKVxuICBibGFjayA9IGhleFRvUkdCKGJsYWNrU3RyaW5nKVxuXG4gICMgY3JlYXRlIGZha2UgaW1hZ2UgdG8gY2FsY3VsYXRlIGhlaWdodCAvIHdpZHRoXG4gIGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIilcbiAgaW1nLnNyYyA9IGRhdGFcbiAgaW1nLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQgaW1nXG4gIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIilcbiAgY2FudmFzLndpZHRoID0gaW1nLm9mZnNldFdpZHRoXG4gIGNhbnZhcy5oZWlnaHQgPSBpbWcub2Zmc2V0SGVpZ2h0XG4gIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIilcbiAgY3R4LmRyYXdJbWFnZSBpbWcsIDAsIDBcbiAgXG4gICMgcmVtb3ZlIGltYWdlXG4gIGltZy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkIGltZ1xuICBcbiAgIyBkbyBhY3R1YWwgY29sb3IgcmVwbGFjZW1lbnRcbiAgaW1hZ2VEYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpXG4gIGRhdGEgPSBpbWFnZURhdGEuZGF0YVxuICByID0gdW5kZWZpbmVkXG4gIGcgPSB1bmRlZmluZWRcbiAgYiA9IHVuZGVmaW5lZFxuICB4ID0gMFxuICBsZW4gPSBkYXRhLmxlbmd0aFxuICB3aGlsZSB4IDwgbGVuXG4gICAgciA9IGRhdGFbeF1cbiAgICBnID0gZGF0YVt4ICsgMV1cbiAgICBiID0gZGF0YVt4ICsgMl1cbiAgICBpZiAociBpcyB3aGl0ZS5yKSBhbmQgKGcgaXMgd2hpdGUuZykgYW5kIChiIGlzIHdoaXRlLmIpXG4gICAgICAjbWFraW5nIHdoaXRlIHRyYW5zcGFyZW50XG4gICAgICBkYXRhW3ggKyAzXSA9IDBcbiAgICBpZiAociBpcyBibGFjay5yKSBhbmQgKGcgaXMgYmxhY2suZykgYW5kIChiIGlzIGJsYWNrLmIpXG4gICAgICAjbWFraW5nIGJsYWNrIHdoaXRlXG4gICAgICBkYXRhW3hdID0gd2hpdGUuclxuICAgICAgZGF0YVt4ICsgMV0gPSB3aGl0ZS5nXG4gICAgICBkYXRhW3ggKyAyXSA9IHdoaXRlLmJcbiAgICB4ICs9IDRcbiAgY3R4LnB1dEltYWdlRGF0YSBpbWFnZURhdGEsIDAsIDBcbiAgb3V0RGF0YSA9IGNhbnZhcy50b0RhdGFVUkwoKVxuICBjb25zb2xlLmxvZyBcImZsaXBcIlxuICBvdXREYXRhXG5cbm1vZHVsZS5leHBvcnRzLmNoYW5nZUNvbEluVXJpID0gKGRhdGEsIGNvbGZyb20sIGNvbHRvLCB0b1RyYW5zcGFyYW50KSAtPlxuICBcbiAgIyBjcmVhdGUgZmFrZSBpbWFnZSB0byBjYWxjdWxhdGUgaGVpZ2h0IC8gd2lkdGhcbiAgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKVxuICBpbWcuc3JjID0gZGF0YVxuICBpbWcuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCJcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCBpbWdcbiAgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKVxuICBjYW52YXMud2lkdGggPSBpbWcub2Zmc2V0V2lkdGhcbiAgY2FudmFzLmhlaWdodCA9IGltZy5vZmZzZXRIZWlnaHRcbiAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKVxuICBjdHguZHJhd0ltYWdlIGltZywgMCwgMFxuICBcbiAgIyByZW1vdmUgaW1hZ2VcbiAgaW1nLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQgaW1nXG4gIFxuICAjIGRvIGFjdHVhbCBjb2xvciByZXBsYWNlbWVudFxuICBpbWFnZURhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodClcbiAgZGF0YSA9IGltYWdlRGF0YS5kYXRhXG4gIHJnYmZyb20gPSBoZXhUb1JHQihjb2xmcm9tKVxuICByZ2J0byA9IGhleFRvUkdCKGNvbHRvKVxuICByID0gdW5kZWZpbmVkXG4gIGcgPSB1bmRlZmluZWRcbiAgYiA9IHVuZGVmaW5lZFxuICB4ID0gMFxuICBsZW4gPSBkYXRhLmxlbmd0aFxuICB3aGlsZSB4IDwgbGVuXG4gICAgciA9IGRhdGFbeF1cbiAgICBnID0gZGF0YVt4ICsgMV1cbiAgICBiID0gZGF0YVt4ICsgMl1cbiAgICBpZiAociBpcyByZ2Jmcm9tLnIpIGFuZCAoZyBpcyByZ2Jmcm9tLmcpIGFuZCAoYiBpcyByZ2Jmcm9tLmIpXG4gICAgICBkYXRhW3hdID0gcmdidG8uclxuICAgICAgZGF0YVt4ICsgMV0gPSByZ2J0by5nXG4gICAgICBkYXRhW3ggKyAyXSA9IHJnYnRvLmJcbiAgICAgIGlmIHRvVHJhbnNwYXJhbnQgdGhlbiBkYXRhW3ggKyAzXSA9IDBcbiAgICB4ICs9IDRcbiAgY3R4LnB1dEltYWdlRGF0YSBpbWFnZURhdGEsIDAsIDBcbiAgY2FudmFzLnRvRGF0YVVSTCgpXG4gIFxuaGV4VG9SR0IgPSAoaGV4U3RyKSAtPlxuICBjb2wgPSB7fVxuICBjb2wuciA9IHBhcnNlSW50KGhleFN0ci5zdWJzdHIoMSwgMiksIDE2KVxuICBjb2wuZyA9IHBhcnNlSW50KGhleFN0ci5zdWJzdHIoMywgMiksIDE2KVxuICBjb2wuYiA9IHBhcnNlSW50KGhleFN0ci5zdWJzdHIoNSwgMiksIDE2KVxuICBjb2xcbiIsIlxuY2xhc3MgV2FsbENvcm5lclxuICBjb25zdHJ1Y3RvcjogKEB4LCBAeSktPlxuICAgIEBlZGdlcyA9IFtdXG4gIGFkZEVkZ2UgOiAoZWRnZSkgLT5cbiAgICBAZWRnZXMucHVzaCBlZGdlXG4gIGdldEFkamFjZW50OiAoZnJvbUVkZ2UpIC0+XG4gICAgKGVkZ2UgZm9yIGVkZ2UgaW4gQGVkZ2VzIHdoZW4gZnJvbUVkZ2UgaXNudCBlZGdlKVxuXG5jbGFzcyBXYWxsRWRnZVxuICBjb25zdHJ1Y3RvciA6IChAY29ybmVyMSwgQGNvcm5lcjIsIEB0aGlja25lc3MpIC0+XG4gIGdldE90aGVyQ29ybmVyIDogKGNvcm5lcikgLT5cbiAgICBpZiBjb3JuZXIueCBpcyBAY29ybmVyMS54IGFuZCBjb3JuZXIueSBpcyBAY29ybmVyMS55IHRoZW4gcmV0dXJuIEBjb3JuZXIyXG4gICAgaWYgY29ybmVyLnggaXMgQGNvcm5lcjIueCBhbmQgY29ybmVyLnkgaXMgQGNvcm5lcjIueSB0aGVuIHJldHVybiBAY29ybmVyMVxuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBXYWxsR3JhcGhcbiAgY29uc3RydWN0b3IgOiAtPlxuICAgIEBfY29ybmVyTWFwID0ge31cblxuICBnZXRDb3JuZXJzIDogLT5cbiAgICB2IGZvciBrLCB2IG9mIEBfY29ybmVyTWFwXG5cbiAgYWRkV2FsbDogKHAxLCBwMiwgdGhpY2tuZXNzKSAtPlxuICAgIGNvcm5lcjEgPSBAX2FkZENvcm5lcihwMS54LCBwMS55KVxuICAgIGNvcm5lcjIgPSBAX2FkZENvcm5lcihwMi54LCBwMi55KVxuICAgIGVkZ2UgPSBuZXcgV2FsbEVkZ2UoY29ybmVyMSwgY29ybmVyMiwgdGhpY2tuZXNzKVxuICAgIGNvcm5lcjEuYWRkRWRnZSBlZGdlXG4gICAgY29ybmVyMi5hZGRFZGdlIGVkZ2VcblxuICBfYWRkQ29ybmVyOiAoeCwgeSkgLT5cbiAgICBpZiBAX2Nvcm5lck1hcFtcIiN7eH0sI3t5fVwiXVxuICAgICAgcmV0dXJuIEBfY29ybmVyTWFwW1wiI3t4fSwje3l9XCJdXG4gICAgZWxzZVxuICAgICAgQF9jb3JuZXJNYXBbXCIje3h9LCN7eX1cIl0gPSBuZXcgV2FsbENvcm5lcih4LHkpXG4gICAgICByZXR1cm4gQF9jb3JuZXJNYXBbXCIje3h9LCN7eX1cIl0gXG5cblxuIl19
