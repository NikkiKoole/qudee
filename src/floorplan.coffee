WallGraph = require './wallgraph'

#class ItemLayer extends PIXI.DisplayObjectContainer


class WallLayer extends PIXI.Graphics
  constructor: ->
    super()
    @clear()
    
  clear: ->
    super()
    @wallGraph = new WallGraph()
      
  addWall: (a, b, thickness) ->
    @wallGraph.addWall(a, b, thickness)

  drawWalls: ->
    @lineStyle 0, 0xffffff
    for corner in @wallGraph.getCorners()
      for edge1 in corner.edges
        for edge2 in corner.edges
          if edge1 isnt edge2
            # now draw 2 connected lines
            # 1) from  the other end of edge1 to corner
            # 2) from corner to the other end of edge2
            # to save on state changes I test to see if I need to set lineStyle
            @moveTo(edge1.getOther(corner).x, edge1.getOther(corner).y)
            @_setLineThickness edge1.thickness
            @lineTo(corner.x, corner.y)
            @_setLineThickness edge2.thickness
            @lineTo(edge2.getOther(corner).x, edge2.getOther(corner).y)

  _setLineThickness : (thickness) ->
    if @lastThickness isnt thickness
      @lastThickness = thickness
      @lineStyle @lastThickness, 0xffffff



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

    @wallContainer = new WallLayer()
    @wallContainer.tint = @wallColor.replace('#', '0x')
    @areaContainer = new PIXI.Graphics()
    @areaContainer.tint = @areaColor.replace('#', '0x')
    @assetContainer = new PIXI.DisplayObjectContainer()
    @tintAssets @assetColor

    # @.addChild @container
    @.addChild @areaContainer
    @.addChild @wallContainer
    @.addChild @assetContainer

    
  tintAssets: (tint) ->
    for child in @assetContainer.children
      child.tint =  @assetColor.replace('#', '0x')

  destroyData: =>
    @wallContainer.clear()
    @areaContainer.clear()
    @assetContainer.children = []

  feedItemsAssets: =>
    # this function is called when all assets are loaded and constructed.
    # now give your items some assets.

    _addSprite = (key, newParent, asset, color) ->
      sprite = new PIXI.Sprite.fromImage(key)
      scaleX = (newParent.graphicsSize.width + asset.margin * 2) /
        sprite.texture.width
      scaleY = (newParent.graphicsSize.height + asset.margin * 2) /
        sprite.texture.height
      sprite.position.x = -asset.margin
      sprite.position.y = -asset.margin
      sprite.scale.x = scaleX
      sprite.scale.y = scaleY
      if color
        sprite.tint = color.replace('#','0x')
      newParent.addChild sprite

    for child in @assetContainer.children
      asset = window.fpAssets[child.assetID]
      color =  asset?.default_color
      #make under sprite and put it in this child
      if asset?.under then _addSprite asset.id+'.under', child, asset
      if asset?.color then _addSprite asset.id+'.shape', child, asset, color
      if asset?.over then _addSprite asset.id+'.over', child, asset
        
  addItem: (x, y, width, height, rotation, type, assetID) ->
    #create a sprite containing a rect
    # do some special width/height changing on type

    sprite = new PIXI.DisplayObjectContainer()
    sprite.assetID = assetID
    sprite.graphicsSize = {width:width, height:height}
    sprite.position.x = x
    sprite.position.y = y
    sprite.pivot.x = width/2
    sprite.pivot.y = height/2
    sprite.rotation = rotation / 57.2957795
    @assetContainer.addChild sprite

  addWall: (a, b, thickness) ->
    @wallContainer.addWall(a, b, thickness)

  drawWalls: ->
    @wallContainer.drawWalls()

  drawArea : (area) ->
    @areaContainer.beginFill 0xffffff
    @areaContainer.lineStyle 0, 0xffffff
    for p in area
      @areaContainer.lineTo(p.x, p.y)
    @areaContainer.endFill()

