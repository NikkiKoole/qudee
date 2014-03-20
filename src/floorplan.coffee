ItemLayer = require './itemlayer'
WallLayer = require './walllayer'
AreaLayer = require './arealayer'

module.exports = class Floorplan extends PIXI.Stage
  instance = null
  @get : ->
    instance ?= new Floorplan()

  constructor: ->
    super(0x000000)
    @backgroundColor = '#000000'

    @wallLayer = new WallLayer()
    @areaLayer = new AreaLayer()
    @itemLayer = new ItemLayer()

    @addChild @areaLayer
    @addChild @wallLayer
    @addChild @itemLayer
    
  tintItems: (color) ->
    @itemLayer.tintItems(color)

  destroyData: ->
    @wallLayer.clear()
    @areaLayer.clear()
    @itemLayer.children = []

  feedItemsAssets : =>
    @itemLayer.feedItemsAssets()

  addItem: (x, y, width, height, rotation, type, assetID) ->
    @itemLayer.addItem(x, y, width, height, rotation, type, assetID)

  addWall: (a, b, thickness) ->
    @wallLayer.addWall(a, b, thickness)

  drawWalls: ->
    @wallLayer.drawWalls()

  drawArea : (area) ->
    @areaLayer.drawArea(area)

