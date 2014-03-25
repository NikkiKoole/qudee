ItemLayer = require './itemlayer'
WallLayer = require './walllayer'
WallGraph = require './wallgraph'
AreaLayer = require './arealayer'
{loadJSONPAssets} = require './jsonploader'

module.exports = class Floorplan
  instance = null
  @get : ->
    instance ?= new Floorplan()
      
  render: (graphics, x, y, scale)->
    AreaLayer.render(@plan.areas, graphics, x, y, scale, 0x00ffff)
    WallLayer.render(@plan.corners, graphics, x, y, scale, 0x00ff00)
    ItemLayer.render(@plan.items, graphics, x, y, scale, 0xaa0000)

  buildPlan: (plan) ->
    @plan = plan
    graph = new WallGraph()
    for wall in plan.walls
      graph.addWall wall.a, wall.b, wall.thickness
    plan.corners = graph.getCorners()
    ItemLayer.addItems(plan.items)

    loadJSONPAssets plan.assets, -> ItemLayer.addSpritesToItems()
    @plan
