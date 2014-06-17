module.exports = class ItemLayer extends PIXI.DisplayObjectContainer
    constructor: ->
        super()

    setInteraction: (item) ->
        item.click = -> console.log 'assetID of clicked:',item.assetID
    
    render: (items) ->
        for item in items
            console.log 'item here'
            sprite = new PIXI.DisplayObjectContainer()
            sprite.assetID = item.assetID
            #sprite.interactive = true
            #@setInteraction sprite
            #sprite.click = @onItemClick item
            #console.log sprite.assetID
            sprite.graphicsSize = {width:item.width, height:item.height}
            sprite.position.x = item.x
            #sprite.originalX = item.x
            sprite.position.y = item.y
            #sprite.originalY = item.y
            sprite.pivot.x = item.width / 2
            sprite.pivot.y = item.height / 2
            sprite.rotation = item.rotation / 57.2957795
            @addChild sprite
        return
      

    addSpritesToItems: ->
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
            
        for child in @children
            asset = window.fpAssets[child.assetID]
            color =  asset?.default_color
            if asset?.under then _addSprite asset.id+'.under', child, asset
            if asset?.color then _addSprite asset.id+'.shape', child, asset, color
            if asset?.over then _addSprite asset.id+'.over', child, asset
        return
