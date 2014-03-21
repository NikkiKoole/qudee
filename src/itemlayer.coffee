
module.exports = class ItemLayer extends PIXI.DisplayObjectContainer
  constructor: ->
    super()
    @color = '#ffffff'
    @tint = @color.replace('#', '0x')
          
  addItem: (x, y, width, height, rotation, type, assetID) ->
    console.log 'adding'
    sprite = new PIXI.DisplayObjectContainer()
    sprite.assetID = assetID
    sprite.graphicsSize = {width:width, height:height}
    sprite.position.x = x
    sprite.position.y = y
    sprite.pivot.x = width/2
    sprite.pivot.y = height/2
    sprite.rotation = rotation / 57.2957795
    @addChild sprite

  tintItems: (color) ->
    @color = color
    for child in @children
      for part in child.children
        if part.isTintable
          part.tint = color.replace('#','0x')
          
  feedItemsAssets: ->
    console.log 'HIYA'
    # this function is called when all assets are loaded and constructed.
    # now give your world items some (layered) assets from the cache.

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
        sprite.isTintable = true
      newParent.addChild sprite
    console.log @children.length
    for child in @children
      asset = window.fpAssets[child.assetID]
      color =  asset?.default_color
      if asset?.under then _addSprite asset.id+'.under', child, asset
      if asset?.color then _addSprite asset.id+'.shape', child, asset, color
      if asset?.over then _addSprite asset.id+'.over', child, asset
