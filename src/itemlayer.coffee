removeAll = (container) ->
    for i in [container.children.length .. 0]
        if container.children[i]
            container.removeChild container.children[i]
    return
  
module.exports = class ItemLayer
    @offscreen = new PIXI.DisplayObjectContainer()
  
    @addItems: (items) ->
        removeAll(ItemLayer.offscreen)
        for item in items
            sprite = new PIXI.DisplayObjectContainer()
            #graphics = new PIXI.Graphics()
            #graphics.beginFill 0xff00ff
            #graphics.drawRect 0,0,item.width,item.height
            #sprite.addChild graphics
            sprite.assetID = item.assetID
            sprite.graphicsSize = {width:item.width, height:item.height}
            sprite.position.x = item.x
            sprite.originalX = item.x
            sprite.position.y = item.y
            sprite.originalY = item.y
            sprite.pivot.x = item.width / 2
            sprite.pivot.y = item.height / 2
            sprite.rotation = item.rotation / 57.2957795
            ItemLayer.offscreen.addChild sprite
        return
    
    @render: (items, graphics, x, y, scale, color) ->
        # will not work with drawing graphics, instead will just
        # move some items in offscreen and return a masked displayObject
        for child in ItemLayer.offscreen.children
            child.position.x = (child.originalX + x)*scale
            child.position.y = (child.originalY + y)*scale
            child.scale.x = scale
            child.scale.y = scale
            for part in child.children
                if part.isTintable
                  part.tint = color

        graphics.addChild(ItemLayer.offscreen)
        graphics

@addSpritesToItems: ->
    _addSprite = (key, newParent, asset, color) ->
        sprite = new PIXI.Sprite.fromImage(key)
        scaleX = (newParent.graphicsSize.width + asset.margin * 2) / sprite.texture.width
        scaleY = (newParent.graphicsSize.height + asset.margin * 2) / sprite.texture.height
        sprite.position.x = -asset.margin
        sprite.position.y = -asset.margin
        sprite.scale.x = scaleX
        sprite.scale.y = scaleY
        if color
            sprite.tint = color.replace('#','0x')
            sprite.isTintable = true
        newParent.addChild sprite
        return
    for child in ItemLayer.offscreen.children
        asset = window.fpAssets[child.assetID]
        color =  asset?.default_color
        if asset?.under then _addSprite asset.id+'.under', child, asset
        if asset?.color then _addSprite asset.id+'.shape', child, asset, color
        if asset?.over then _addSprite asset.id+'.over', child, asset
    return
