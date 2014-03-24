ItemLayer = require './itemlayer'
WallLayer = require './walllayer'
AreaLayer = require './arealayer'
{loadJSONPAssets} = require './jsonploader'



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

  buildPlan: (plan) ->
    @destroyData()

    for area in plan.areas
      @areaLayer.drawArea area
    for wall in plan.walls
      @wallLayer.addWall wall.a, wall.b, wall.thickness
    @wallLayer.drawWalls()
    for i in plan.items
      @itemLayer.addItem i.x, i.y, i.width, i.height,
        i.rotation, i.type, i.assetID
    
    loadJSONPAssets plan.assets, => @itemLayer.feedItemsAssets()

  destroyData: ->
    @wallLayer.clear()
    @areaLayer.clear()
    @itemLayer.children = []
