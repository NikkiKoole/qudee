WallGraph = require './wallgraph'

module.exports = class Floorplan extends PIXI.Stage
  instance = null
  @get : ->
    instance ?= new Floorplan()
  constructor: ->
    super(0x000000)
    @backgroundColor = '#000000'
    @wallColor = '#ffffff'
    @areaColor = '#444444'
    @assetColor ='#ffffff'
    @container = new PIXI.Graphics()
    @wallContainer = new PIXI.Graphics()
    @wallContainer.tint = @wallColor.replace('#', '0x')
    @areaContainer = new PIXI.Graphics()
    @areaContainer.tint = @areaColor.replace('#', '0x')
    @assetContainer = new PIXI.DisplayObjectContainer()
    @tintAssets @assetColor

    @.addChild @container
    @.addChild @areaContainer
    @.addChild @wallContainer
    @.addChild @assetContainer
    @wallGraph = new WallGraph()
    
  tintAssets: (tint) ->
    for child in @assetContainer.children
      child.tint =  @assetColor.replace('#', '0x')
      console.log child.tint

  destroyData: ->
    @wallGraph = new WallGraph()
    @container.clear()
    @wallContainer.clear()
    @areaContainer.clear()
    

  addWall: (a, b, thickness) ->
    @wallGraph.addWall(a, b, thickness)

  drawWalls: ->
    @wallContainer.lineStyle 0, 0xffffff
    for corner in @wallGraph.getCorners()
      for edge1 in corner.edges
        for edge2 in corner.edges
          if edge1 isnt edge2
            # now draw 2 connected lines 
            # 1) from  the other end of edge1 to corner
            # 2) from corner to the other end of edge2
            # to save on state changes I test to see if I need to set lineStyle
            @wallContainer.moveTo(edge1.getOtherCorner(corner).x, edge1.getOtherCorner(corner).y)
            @_setLineThickness edge1.thickness
            @wallContainer.lineTo(corner.x, corner.y)

            @_setLineThickness edge2.thickness
            @wallContainer.lineTo(edge2.getOtherCorner(corner).x, edge2.getOtherCorner(corner).y)

  _setLineThickness : (thickness) ->
    if @lastThickness isnt thickness
      @lastThickness = thickness
      @wallContainer.lineStyle @lastThickness, 0xffffff

  drawArea : (area) ->
    @areaContainer.beginFill 0xffffff
    @areaContainer.lineStyle 0, 0xffffff
    for p in area
      @areaContainer.lineTo(p.x, p.y)
    @areaContainer.endFill()

