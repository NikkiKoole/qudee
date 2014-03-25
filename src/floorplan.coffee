ItemLayer = require './itemlayer'
WallLayer = require './walllayer'
WallGraph = require './wallgraph'
AreaLayer = require './arealayer'
{loadJSONPAssets} = require './jsonploader'



module.exports = class Floorplan extends PIXI.Stage
  instance = null
  @get : ->
    instance ?= new Floorplan()

  constructor: ->
    super(0x000000)
    @backgroundColor = '#000000'
    @plan = null
    @wallLayer = new WallLayer()
    @areaLayer = new AreaLayer()
    @itemLayer = new ItemLayer()

#    @addChild @areaLayer
#    @addChild @wallLayer.container
    @addChild @itemLayer

 # renderPlan :(plan, graphics, x, y, scaleX, scaleY) ->
 #   AreaLayer.render(plan.graphics, x, y, scaleX, scaleY)
    
      
  render: (graphics, x, y, scaleX, scaleY)->
    #AreaLayer.render(@plan.areas, graphics, x, y, scaleX, scaleY)
    AreaLayer.render(@plan.areas, graphics, x, y, scaleX, scaleY)
    #@wallLayer.render(graphics, x, y, scaleX, scaleY)
    WallLayer.render(@plan.corners,graphics, x, y, scaleX, scaleY)
    
  buildPlan: (plan) ->
    @plan = plan
    @destroyData()

    #for area in plan.areas
    #  @areaLayer.addArea area

    graph = new WallGraph()
    for wall in plan.walls
      #@wallLayer.addWall wall.a, wall.b, wall.thickness
      graph.addWall wall.a, wall.b, wall.thickness
    plan.corners = graph.getCorners()
    
  # @wallLayer.render(@wallLayer.container)
#    for i in plan.items
#      @itemLayer.addItem i.x, i.y, i.width, i.height,
#        i.rotation, i.type, i.assetID
    
#    loadJSONPAssets plan.assets, => @itemLayer.feedItemsAssets()
  #drawWalls(transform)
  destroyData: ->
    @wallLayer.clear()
    @areaLayer.clear()
    @itemLayer.children = []
