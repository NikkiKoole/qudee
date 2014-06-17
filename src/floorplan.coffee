ItemLayer = require './itemlayer'
WallLayer = require './walllayer'
WallGraph = require './wallgraph'
AreaLayer = require './arealayer'
{loadJSONPAssets} = require './jsonploader'

module.exports = class Floorplan
    instance = null
    @get : ->
        instance ?= new Floorplan()

    constructor: ->
        @container = new PIXI.DisplayObjectContainer()
        @areas = new AreaLayer()
        @walls = new WallLayer()
        @items = new ItemLayer()
        @container.addChild @areas
        @container.addChild @walls
        @container.addChild @items
        
        #console.log @container
        # these 3 layers are displayObjectContainers.
        # walls and areas are of type Graphic and items of type DOC.
        # 
    transform: (x, y, scale) ->
        @container.position = {x:x, y:y}
        @container.scale = {x:scale, y:scale}
        
    render: ( x, y, scale) ->
        @areas.render(@plan.areas)
        @walls.render(@plan.corners, @plan.curvedWalls)
        @items.render(@plan.items)
        @container.position = {x:x, y:y}
        @container.scale = {x:scale, y:scale}

    buildPlan: (plan) ->
        @plan = plan
        graph = new WallGraph()
        for wall in plan.walls
            graph.addWall wall.a, wall.b, wall.thickness
        plan.corners = graph.getCorners()
        loadJSONPAssets plan.assets, => @items.addSpritesToItems()
        @plan
